/**
 * =====================================================
 * GENERATORS.JS - Generator Management
 * =====================================================
 * Gestion des générateurs et de leur achat
 */

/**
 * Achète un générateur
 */
function buyGenerator(generatorId) {
    const cost = getGeneratorCost(generatorId);

    if (GameState.shards.lessThan(cost)) {
        showNotification("Not enough Shards!", "error");
        return false;
    }

    // Acheter
    GameState.shards = GameState.shards.subtract(cost);
    GameState.generators[generatorId] = (GameState.generators[generatorId] || 0) + 1;

    // Stats
    GameState.stats.generatorsBought++;

    // Recalculer production
    recalculateProduction();

    // Mise à jour UI
    updateGeneratorsUI();
    updateStatsUI();

    // Quête
    updateQuestProgress('generators_bought', 1);

    showNotification(`Bought ${GENERATORS.find(g => g.id === generatorId).name}!`, "success");
    return true;
}

/**
 * Achète le maximum de générateurs possibles
 */
function buyMaxGenerators(generatorId) {
    let bought = 0;

    while (bought < 1000) { // Limite de sécurité
        const cost = getGeneratorCost(generatorId);
        if (GameState.shards.lessThan(cost)) break;

        GameState.shards = GameState.shards.subtract(cost);
        GameState.generators[generatorId] = (GameState.generators[generatorId] || 0) + 1;
        bought++;
    }

    if (bought === 0) {
        showNotification("Not enough Shards!", "error");
        return;
    }

    GameState.stats.generatorsBought += bought;
    recalculateProduction();
    updateGeneratorsUI();
    updateStatsUI();
    updateQuestProgress('generators_bought', bought);

    showNotification(`Bought ${bought}x ${GENERATORS.find(g => g.id === generatorId).name}!`, "success");
}

/**
 * Met à jour l'UI des générateurs
 */
function updateGeneratorsUI() {
    const container = document.getElementById('generators-list');
    if (!container) return;

    container.innerHTML = '';

    GENERATORS.forEach(gen => {
        const level = GameState.generators[gen.id] || 0;
        const cost = getGeneratorCost(gen.id);
        const canAfford = GameState.shards.greaterThanOrEqual(cost);

        // Calculer la production de ce générateur
        let production = new BigNumber(0);
        if (level > 0) {
            production = new BigNumber(gen.baseCps).multiply(
                new BigNumber(Math.pow(gen.cpsGrowthPerLevel, level - 1))
            );
            const milestoneBonus = Math.pow(2, Math.floor(level / 25));
            production = production.multiply(milestoneBonus);
            production = production.multiply(getGeneratorSpecificMultiplier(gen.id));
        }

        const div = document.createElement('div');
        div.className = 'generator-item' + (canAfford ? '' : ' disabled');
        div.innerHTML = `
            <div class="generator-info">
                <div class="generator-name">${gen.name}</div>
                <div class="generator-level">Level: ${level}</div>
                <div class="generator-production">${formatNumber(production)} Shards/s</div>
            </div>
            <div class="generator-actions">
                <div class="generator-cost">${formatNumber(cost)} Shards</div>
                <button class="btn btn-buy" onclick="buyGenerator('${gen.id}')" ${canAfford ? '' : 'disabled'}>
                    Buy
                </button>
                <button class="btn btn-buy-max" onclick="buyMaxGenerators('${gen.id}')" ${canAfford ? '' : 'disabled'}>
                    Buy Max
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}
