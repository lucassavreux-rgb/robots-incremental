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

    // Mise à jour UI (SANS recréer le DOM)
    updateGeneratorsButtonsOnly();
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
    updateGeneratorsButtonsOnly();
    updateStatsUI();
    updateQuestProgress('generators_bought', bought);

    showNotification(`Bought ${bought}x ${GENERATORS.find(g => g.id === generatorId).name}!`, "success");
}

/**
 * Met à jour seulement les boutons (sans recréer le DOM)
 */
function updateGeneratorsButtonsOnly() {
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

        // Trouver tous les éléments pour ce générateur
        const container = document.getElementById('generators-list');
        if (!container) return;

        const genItems = container.querySelectorAll('.generator-item');
        genItems.forEach((item, index) => {
            if (index !== GENERATORS.findIndex(g => g.id === gen.id)) return;

            // Mettre à jour classe disabled
            if (canAfford) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }

            // Mettre à jour level
            const levelEl = item.querySelector('.generator-level');
            if (levelEl) levelEl.textContent = `Level: ${level}`;

            // Mettre à jour production
            const prodEl = item.querySelector('.generator-production');
            if (prodEl) prodEl.textContent = `${formatNumber(production)} Shards/s`;

            // Mettre à jour coût
            const costEl = item.querySelector('.generator-cost');
            if (costEl) costEl.textContent = `${formatNumber(cost)} Shards`;

            // Mettre à jour boutons
            const buyBtn = item.querySelector('.btn-buy');
            const buyMaxBtn = item.querySelector('.btn-buy-max');
            if (buyBtn) buyBtn.disabled = !canAfford;
            if (buyMaxBtn) buyMaxBtn.disabled = !canAfford;
        });
    });
}

/**
 * Met à jour l'UI des générateurs (re-render complet)
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
