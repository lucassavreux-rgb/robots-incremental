/**
 * =====================================================
 * UPGRADES.JS - Gestion des Upgrades
 * =====================================================
 * Achat et affichage des upgrades globales
 */

/**
 * Initialise l'affichage des upgrades
 */
function initUpgrades() {
    renderUpgradesList();
}

/**
 * Affiche la liste des upgrades
 */
function renderUpgradesList() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';

    UPGRADES_DATA.forEach(upgrade => {
        const isPurchased = gameState.upgrades.includes(upgrade.id);
        const canPurchase = !isPurchased && canAfford(upgrade.price);

        // Vérifier les prérequis
        const requirementMet = !upgrade.requirement ||
                               gameState.upgrades.includes(upgrade.requirement);

        // Ne pas afficher si prérequis non rempli
        if (!requirementMet && !isPurchased) {
            return;
        }

        const upgradeDiv = document.createElement('div');
        upgradeDiv.classList.add('upgrade-item');

        if (isPurchased) {
            upgradeDiv.style.opacity = '0.6';
            upgradeDiv.style.borderColor = '#28a745';
        }

        let effectText = '';
        switch (upgrade.type) {
            case 'cpc':
                effectText = `x${upgrade.effect} CPC`;
                break;
            case 'cps':
                effectText = `x${upgrade.effect} CPS`;
                break;
            case 'critical':
                effectText = `${(upgrade.critChance * 100).toFixed(0)}% crit chance, x${upgrade.critMultiplier}`;
                break;
            case 'cost_reduction':
                effectText = `-${(upgrade.effect * 100).toFixed(0)}% coût générateurs`;
                break;
            default:
                effectText = 'Bonus spécial';
        }

        upgradeDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">${upgrade.name}</div>
                <div class="item-description">${upgrade.description}</div>
                <div class="item-stats">${effectText}</div>
            </div>
            <div class="item-action">
                ${isPurchased
                    ? '<span style="color: #28a745; font-weight: bold;">✓ ACHETÉ</span>'
                    : `<button class="buy-btn" data-upgrade="${upgrade.id}" ${!canPurchase ? 'disabled' : ''}>
                        ${formatNumber(upgrade.price)} coins
                    </button>`
                }
            </div>
        `;

        container.appendChild(upgradeDiv);

        // Attacher l'événement si pas acheté
        if (!isPurchased) {
            const buyBtn = upgradeDiv.querySelector('.buy-btn');
            if (buyBtn) {
                buyBtn.addEventListener('click', () => {
                    console.log('Achat upgrade:', upgrade.id);
                    buyUpgrade(upgrade.id);
                });
            }
        }
    });
}

/**
 * Achète un upgrade
 */
function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
    if (!upgrade) return;

    // Vérifier si déjà acheté
    if (gameState.upgrades.includes(upgradeId)) {
        showNotification('Upgrade déjà acheté !', 'error');
        return;
    }

    // Vérifier le coût
    if (!canAfford(upgrade.price)) {
        showNotification('Pas assez de coins !', 'error');
        return;
    }

    // Vérifier le prérequis
    if (upgrade.requirement && !gameState.upgrades.includes(upgrade.requirement)) {
        showNotification('Prérequis non rempli !', 'error');
        return;
    }

    // Acheter
    spendCoins(upgrade.price);
    gameState.upgrades.push(upgradeId);

    // Appliquer l'effet si c'est un critique
    if (upgrade.type === 'critical') {
        gameState.criticalChance = Math.max(gameState.criticalChance, upgrade.critChance);
        gameState.criticalMultiplier = Math.max(gameState.criticalMultiplier, upgrade.critMultiplier);
    }

    // Recalculer les stats
    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    // Rafraîchir l'affichage
    renderUpgradesList();
    renderGeneratorsList(); // Pour mettre à jour les coûts si réduction
    updateMainStats();

    showNotification(`${upgrade.name} acheté !`, 'success');
}
