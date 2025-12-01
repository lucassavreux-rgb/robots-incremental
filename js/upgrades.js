/**
 * =====================================================
 * UPGRADES.JS - Upgrade Management
 * =====================================================
 * Gestion des upgrades classiques
 */

/**
 * Achète un upgrade
 */
function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    // Vérifier si déjà acheté
    if (GameState.upgrades.includes(upgradeId)) {
        showNotification("Already purchased!", "error");
        return false;
    }

    const cost = new BigNumber(upgrade.cost);

    if (GameState.shards.lessThan(cost)) {
        showNotification("Not enough Shards!", "error");
        return false;
    }

    // Acheter
    GameState.shards = GameState.shards.subtract(cost);
    GameState.upgrades.push(upgradeId);
    GameState.stats.upgradesBought++;

    // Mettre à jour les stats de crit
    updateCritStats();

    // Recalculer production
    recalculateProduction();

    // Mise à jour UI
    updateUpgradesUI();
    updateStatsUI();

    showNotification(`Purchased ${upgrade.name}!`, "success");
    return true;
}

/**
 * Met à jour l'UI des upgrades
 */
function updateUpgradesUI() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;

    container.innerHTML = '';

    UPGRADES.forEach(upgrade => {
        const purchased = GameState.upgrades.includes(upgrade.id);
        if (purchased) return; // Ne pas afficher les upgrades déjà achetés

        const cost = new BigNumber(upgrade.cost);
        const canAfford = GameState.shards.greaterThanOrEqual(cost);

        const div = document.createElement('div');
        div.className = 'upgrade-item' + (canAfford ? '' : ' disabled');
        div.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
            </div>
            <div class="upgrade-actions">
                <div class="upgrade-cost">${formatNumber(cost)} Shards</div>
                <button class="btn btn-buy" onclick="buyUpgrade('${upgrade.id}')" ${canAfford ? '' : 'disabled'}>
                    Buy
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}
