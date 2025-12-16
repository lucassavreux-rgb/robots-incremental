// generators.js - Gestion des 8 générateurs

// Données des générateurs
const GENERATORS = [
    {
        id: 0,
        name: 'Dynamo',
        baseCost: 15,
        costGrowth: 1.15,
        baseProd: 0.1
    },
    {
        id: 1,
        name: 'Réacteur',
        baseCost: 150,
        costGrowth: 1.16,
        baseProd: 1
    },
    {
        id: 2,
        name: 'Centrale',
        baseCost: 1500,
        costGrowth: 1.17,
        baseProd: 8
    },
    {
        id: 3,
        name: 'Accélérateur',
        baseCost: 15000,
        costGrowth: 1.18,
        baseProd: 47
    },
    {
        id: 4,
        name: 'Fonderie',
        baseCost: 150000,
        costGrowth: 1.19,
        baseProd: 260
    },
    {
        id: 5,
        name: 'Usine Quantique',
        baseCost: 1.5e6,
        costGrowth: 1.20,
        baseProd: 1400
    },
    {
        id: 6,
        name: 'Noyau Stellaire',
        baseCost: 1.5e7,
        costGrowth: 1.21,
        baseProd: 7800
    },
    {
        id: 7,
        name: 'Singularité',
        baseCost: 1.5e8,
        costGrowth: 1.22,
        baseProd: 44000
    }
];

/**
 * Obtient les données d'un générateur
 * @param {number} index
 * @returns {object}
 */
function getGenerator(index) {
    return GENERATORS[index];
}

/**
 * Obtient le nombre possédé d'un générateur
 * @param {number} index
 * @returns {number}
 */
function getOwned(index) {
    const state = window.ForgeState.getState();
    return state.generators[index] || 0;
}

/**
 * Calcule le multiplicateur de synergie d'un générateur
 * Chaque 10 du tier suivant donne x1.05 (ou plus selon talents)
 * @param {number} index
 * @returns {number}
 */
function getSynergyMultiplier(index) {
    if (index >= 7) return 1; // Singularité n'a pas de synergie

    const state = window.ForgeState.getState();
    const nextTierOwned = state.generators[index + 1] || 0;
    const stacks = Math.floor(nextTierOwned / 10);

    // Base synergie 1.05, peut être amélioré par talent
    let baseSynergy = 1.05;
    if (window.ForgeTalents) {
        const synergyLevel = window.ForgeTalents.getTalentLevel('synergy');
        baseSynergy += synergyLevel * 0.01; // +0.01 par niveau
    }

    return Math.pow(baseSynergy, stacks);
}

/**
 * Calcule le multiplicateur total d'un générateur
 * @param {number} index
 * @returns {number}
 */
function getGeneratorMultiplier(index) {
    let mult = 1;

    // Synergies
    mult *= getSynergyMultiplier(index);

    // Upgrades spécifiques au générateur
    if (window.ForgeUpgrades) {
        mult *= window.ForgeUpgrades.getGeneratorUpgradeMultiplier(index);
    }

    // Upgrades globales
    if (window.ForgeUpgrades) {
        mult *= window.ForgeUpgrades.getGlobalMultiplier();
    }

    // Multiplicateurs de prestige
    if (window.ForgePrestige) {
        mult *= window.ForgePrestige.getPrestigeMultiplier();
    }

    // Talents
    if (window.ForgeTalents) {
        mult *= window.ForgeTalents.getProductionMultiplier();
    }

    // Événement actif
    const state = window.ForgeState.getState();
    if (state.activeEvent === 'surge' && Date.now() < state.eventEndTime) {
        mult *= 2; // x2 pendant surtension
    }

    return mult;
}

/**
 * Calcule la production par seconde d'un générateur
 * @param {number} index
 * @returns {number}
 */
function getGeneratorProduction(index) {
    const gen = GENERATORS[index];
    const owned = getOwned(index);
    const mult = getGeneratorMultiplier(index);

    return owned * gen.baseProd * mult;
}

/**
 * Calcule la production totale par seconde
 * @returns {number}
 */
function getTotalProduction() {
    let total = 0;

    for (let i = 0; i < 8; i++) {
        total += getGeneratorProduction(i);
    }

    // Ajouter production du clic automatique si débloqué
    if (window.ForgeUpgrades && window.ForgeUpgrades.hasAutoClicker()) {
        total += getClickValue() * window.ForgeUpgrades.getAutoClickRate();
    }

    return window.ForgeNumbers.safeNumber(total);
}

/**
 * Calcule le coût du prochain achat d'un générateur
 * @param {number} index
 * @returns {number}
 */
function getNextCost(index) {
    const gen = GENERATORS[index];
    const owned = getOwned(index);

    // Réduction de growth par milestones/talents
    let growth = gen.costGrowth;
    if (window.ForgeTalents) {
        growth -= window.ForgeTalents.getCostReduction();
    }
    growth = Math.max(1.01, growth); // Minimum 1.01

    return window.ForgeNumbers.calculateNextCost(gen.baseCost, growth, owned);
}

/**
 * Calcule le coût d'un achat bulk
 * @param {number} index
 * @param {number} amount
 * @returns {number}
 */
function getBulkCost(index, amount) {
    const gen = GENERATORS[index];
    const owned = getOwned(index);

    let growth = gen.costGrowth;
    if (window.ForgeTalents) {
        growth -= window.ForgeTalents.getCostReduction();
    }
    growth = Math.max(1.01, growth);

    return window.ForgeNumbers.calculateBulkCost(gen.baseCost, growth, owned, amount);
}

/**
 * Calcule le maximum achetable
 * @param {number} index
 * @returns {number}
 */
function getMaxBuyable(index) {
    const state = window.ForgeState.getState();
    const gen = GENERATORS[index];
    const owned = getOwned(index);

    let growth = gen.costGrowth;
    if (window.ForgeTalents) {
        growth -= window.ForgeTalents.getCostReduction();
    }
    growth = Math.max(1.01, growth);

    // Bonus coût d'événement
    let funds = state.energy;
    if (state.activeEvent === 'stability' && Date.now() < state.eventEndTime) {
        funds /= 0.9; // Comme si on avait 10% de plus
    }

    return window.ForgeNumbers.calculateMaxBuy(funds, gen.baseCost, growth, owned);
}

/**
 * Achète un générateur
 * @param {number} index
 * @param {number} amount
 * @returns {boolean} - true si acheté
 */
function buyGenerator(index, amount) {
    if (amount <= 0) return false;

    const cost = getBulkCost(index, amount);

    // Réduction de coût si événement
    const state = window.ForgeState.getState();
    let finalCost = cost;
    if (state.activeEvent === 'stability' && Date.now() < state.eventEndTime) {
        finalCost *= 0.9; // -10% coût
    }

    if (window.ForgeState.spendEnergy(finalCost)) {
        window.ForgeState.buyGenerator(index, amount);
        return true;
    }

    return false;
}

/**
 * Achète en mode max
 * @param {number} index
 * @returns {number} - nombre acheté
 */
function buyMax(index) {
    const maxAmount = getMaxBuyable(index);
    if (maxAmount > 0) {
        buyGenerator(index, maxAmount);
        return maxAmount;
    }
    return 0;
}

/**
 * Valeur du clic manuel
 * @returns {number}
 */
function getClickValue() {
    let value = 1;

    // Bonus prestige
    if (window.ForgePrestige) {
        value += window.ForgePrestige.getClickBonus();
    }

    // Bonus talents
    if (window.ForgeTalents) {
        value *= window.ForgeTalents.getClickMultiplier();
    }

    return value;
}

/**
 * Effectue un clic manuel
 */
function doClick() {
    const value = getClickValue();
    window.ForgeState.addEnergy(value);

    const state = window.ForgeState.getState();
    window.ForgeState.updateState({ totalClicks: state.totalClicks + 1 });
}

// Export global
window.ForgeGenerators = {
    GENERATORS,
    getGenerator,
    getOwned,
    getSynergyMultiplier,
    getGeneratorMultiplier,
    getGeneratorProduction,
    getTotalProduction,
    getNextCost,
    getBulkCost,
    getMaxBuyable,
    buyGenerator,
    buyMax,
    getClickValue,
    doClick
};
