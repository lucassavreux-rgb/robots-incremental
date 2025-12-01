/**
 * =====================================================
 * GENERATORS.JS - Gestion des Générateurs
 * =====================================================
 * Achat, affichage et production des générateurs
 */

/**
 * Initialise l'affichage des générateurs
 */
function initGenerators() {
    renderGeneratorsList();
}

/**
 * Met à jour l'état des boutons (disabled/enabled) sans re-render complet
 */
function updateGeneratorsButtons() {
    GENERATORS_DATA.forEach(genData => {
        const genState = gameState.generators.find(g => g.id === genData.id);
        const level = genState ? genState.level : 0;
        const cost = calculateGeneratorCost(genData, level);
        const canBuy = canAfford(cost);

        // Trouver l'item complet pour mettre à jour plusieurs éléments
        const buttons = document.querySelectorAll(`.buy-btn[data-generator="${genData.id}"]`);
        buttons.forEach(button => {
            const genItem = button.closest('.generator-item');
            if (!genItem) return;

            // Mettre à jour le bouton
            button.disabled = !canBuy;
            button.textContent = formatNumber(cost) + ' coins';

            // Mettre à jour le niveau affiché
            const levelDisplay = genItem.querySelector('.item-level');
            if (levelDisplay) {
                levelDisplay.textContent = 'Lvl ' + level;
            }

            // Mettre à jour la production affichée
            const production = calculateGeneratorProduction(genData, level);
            const milestonesReached = genData.milestones.filter(m => level >= m).length;
            const statsDiv = genItem.querySelector('.item-stats');
            if (statsDiv) {
                statsDiv.innerHTML = `
                    Production: ${formatNumber(production)}/s |
                    Niveau: ${level} |
                    Milestones: ${milestonesReached}/${genData.milestones.length}
                `;
            }
        });
    });
}

/**
 * Affiche la liste des générateurs
 */
function renderGeneratorsList() {
    const container = document.getElementById('generators-list');
    container.innerHTML = '';

    GENERATORS_DATA.forEach(genData => {
        const genState = gameState.generators.find(g => g.id === genData.id);
        const level = genState ? genState.level : 0;

        const genDiv = document.createElement('div');
        genDiv.classList.add('generator-item');

        // Calculer le coût actuel
        const cost = calculateGeneratorCost(genData, level);

        // Calculer la production actuelle
        const production = calculateGeneratorProduction(genData, level);

        // Vérifier si achetable
        const canBuy = canAfford(cost);
        console.log(`Render ${genData.id}: level=${level}, cost=${cost}, coins=${gameState.coins}, canBuy=${canBuy}`);

        // Calculer les milestones atteints
        const milestonesReached = genData.milestones.filter(m => level >= m).length;

        genDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">${genData.icon} ${genData.name}</div>
                <div class="item-description">${genData.description}</div>
                <div class="item-stats">
                    Production: ${formatNumber(production)}/s |
                    Niveau: ${level} |
                    Milestones: ${milestonesReached}/${genData.milestones.length}
                </div>
            </div>
            <div class="item-action">
                <div class="item-level">Lvl ${level}</div>
                <button class="buy-btn" data-generator="${genData.id}" ${!canBuy ? 'disabled' : ''}>
                    ${formatNumber(cost)} coins
                </button>
            </div>
        `;

        container.appendChild(genDiv);

        // Attacher l'événement proprement (pas inline)
        const buyBtn = genDiv.querySelector('.buy-btn');
        buyBtn.addEventListener('click', () => {
            console.log('Bouton cliqué pour:', genData.id);
            buyGenerator(genData.id);
        });
    });
}

/**
 * Calcule le coût d'un générateur au niveau donné
 */
function calculateGeneratorCost(genData, currentLevel) {
    let cost = genData.basePrice * Math.pow(genData.priceMultiplier, currentLevel);

    // Réduction de coût des upgrades
    gameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
        if (upgrade && upgrade.type === 'cost_reduction') {
            cost *= (1 - upgrade.effect);
        }
    });

    // Réduction de coût des talents
    const costReduction = calculateTalentBonus('cost_reduction');
    cost *= (1 - costReduction);

    return Math.max(1, Math.floor(cost));
}

/**
 * Calcule la production d'un générateur au niveau donné
 */
function calculateGeneratorProduction(genData, level) {
    if (level === 0) return 0;

    let production = genData.baseProduction * level;

    // Bonus des milestones
    genData.milestones.forEach(milestone => {
        if (level >= milestone) {
            production *= 2;
        }
    });

    // Bonus des upgrades CPS
    gameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
        if (upgrade && upgrade.type === 'cps') {
            production *= upgrade.effect;
        }
    });

    // Bonus des talents
    const cpsTalentBonus = calculateTalentBonus('cps_bonus');
    production *= (1 + cpsTalentBonus);

    // Bonus des artefacts spécifiques
    gameState.equippedArtefacts.forEach(artefactId => {
        const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
        if (artefact && artefact.effect.type === 'generator_mult' &&
            artefact.effect.generator === genData.id) {
            production *= artefact.effect.value;
        }
    });

    // Bonus du prestige
    const prestigeCPSBonus = gameState.prestigePoints * 0.02; // 2% par RP
    production *= (1 + prestigeCPSBonus);

    return production;
}

/**
 * Achète un générateur
 */
function buyGenerator(generatorId) {
    const genData = GENERATORS_DATA.find(g => g.id === generatorId);
    if (!genData) return;

    const genState = gameState.generators.find(g => g.id === generatorId);
    const currentLevel = genState ? genState.level : 0;

    const cost = calculateGeneratorCost(genData, currentLevel);

    console.log('Tentative achat:', generatorId, '| Coût:', cost, '| Coins:', gameState.coins, '| Peut acheter:', canAfford(cost));

    if (!canAfford(cost)) {
        showNotification('Pas assez de coins !', 'error');
        return;
    }

    // Acheter
    spendCoins(cost);

    // Augmenter le niveau
    if (genState) {
        genState.level++;
    } else {
        gameState.generators.push({
            id: generatorId,
            level: 1
        });
    }

    // Stats
    gameState.stats.generatorsBought++;

    // Mettre à jour les quêtes (si la fonction existe)
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress('generators_bought', 1);
    }

    // Recalculer CPS
    gameState.cps = calculateTotalCPS();

    // Rafraîchir l'affichage (plus besoin de re-render tout, juste update les boutons)
    console.log('Avant updateGeneratorsButtons - coins:', gameState.coins);
    updateGeneratorsButtons();
    console.log('Après updateGeneratorsButtons - coins:', gameState.coins);
    updateMainStats();

    showNotification(`${genData.name} acheté !`, 'success');
}

/**
 * Achète le maximum de niveaux d'un générateur
 */
function buyMaxGenerator(generatorId) {
    const genData = GENERATORS_DATA.find(g => g.id === generatorId);
    if (!genData) return;

    let purchased = 0;
    let genState = gameState.generators.find(g => g.id === generatorId);

    while (purchased < 100) { // Limite de sécurité
        const currentLevel = genState ? genState.level : 0;
        const cost = calculateGeneratorCost(genData, currentLevel);

        if (!canAfford(cost)) break;

        spendCoins(cost);

        if (genState) {
            genState.level++;
        } else {
            genState = { id: generatorId, level: 1 };
            gameState.generators.push(genState);
        }

        purchased++;
        gameState.stats.generatorsBought++;
    }

    if (purchased > 0) {
        updateQuestProgress('generators_bought', purchased);
        gameState.cps = calculateTotalCPS();
        renderGeneratorsList();
        updateMainStats();
        showNotification(`${genData.name} x${purchased} acheté !`, 'success');
    }
}
