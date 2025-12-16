// upgrades.js - Tous les upgrades du jeu

// Upgrades spécifiques aux générateurs (5 par générateur = 40 upgrades)
const GENERATOR_UPGRADES = [];

// Générer les upgrades pour chaque générateur
for (let genId = 0; genId < 8; genId++) {
    const genNames = ['Dynamo', 'Réacteur', 'Centrale', 'Accélérateur', 'Fonderie', 'Usine Quantique', 'Noyau Stellaire', 'Singularité'];
    const baseCosts = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10];

    for (let tier = 0; tier < 5; tier++) {
        GENERATOR_UPGRADES.push({
            id: `gen${genId}_${tier}`,
            name: `${genNames[genId]} Amélioré ${tier + 1}`,
            description: `Double la production des ${genNames[genId]}`,
            cost: baseCosts[genId] * Math.pow(100, tier),
            generatorId: genId,
            multiplier: 2,
            category: 'generator'
        });
    }
}

// Upgrades globaux (10 upgrades)
const GLOBAL_UPGRADES = [];
for (let i = 0; i < 10; i++) {
    GLOBAL_UPGRADES.push({
        id: `global_${i}`,
        name: `Boost Global ${i + 1}`,
        description: 'Multiplie toute la production par 1.25',
        cost: 1e4 * Math.pow(100, i),
        multiplier: 1.25,
        category: 'global'
    });
}

// Upgrades qualité de vie
const QOL_UPGRADES = [
    {
        id: 'qol_bulk10',
        name: 'Achat x10',
        description: 'Débloque le mode d\'achat x10',
        cost: 1e3,
        category: 'qol'
    },
    {
        id: 'qol_bulk25',
        name: 'Achat x25',
        description: 'Débloque le mode d\'achat x25',
        cost: 1e6,
        requirement: () => {
            const state = window.ForgeState.getState();
            return state.lifetimeEnergy >= 1e6;
        },
        category: 'qol'
    },
    {
        id: 'qol_bulk100',
        name: 'Achat x100',
        description: 'Débloque le mode d\'achat x100',
        cost: 1e8,
        requirement: () => {
            const state = window.ForgeState.getState();
            return state.lifetimeEnergy >= 1e8;
        },
        category: 'qol'
    },
    {
        id: 'qol_max',
        name: 'Achat MAX',
        description: 'Débloque le mode d\'achat MAX',
        cost: 1e9,
        requirement: () => {
            const state = window.ForgeState.getState();
            return state.lifetimeEnergy >= 1e9;
        },
        category: 'qol'
    },
    {
        id: 'qol_autoclicker',
        name: 'Drone Auto-Clic',
        description: 'Génère 10 clics par seconde automatiquement',
        cost: 1e10,
        requirement: () => {
            const state = window.ForgeState.getState();
            return state.totalClicks >= 1000;
        },
        category: 'qol'
    }
];

// Combine tous les upgrades
const ALL_UPGRADES = [...GENERATOR_UPGRADES, ...GLOBAL_UPGRADES, ...QOL_UPGRADES];

/**
 * Obtient tous les upgrades
 * @returns {Array}
 */
function getAllUpgrades() {
    return ALL_UPGRADES;
}

/**
 * Obtient les upgrades par catégorie
 * @param {string} category
 * @returns {Array}
 */
function getUpgradesByCategory(category) {
    return ALL_UPGRADES.filter(u => u.category === category);
}

/**
 * Obtient un upgrade par ID
 * @param {string} id
 * @returns {object}
 */
function getUpgrade(id) {
    return ALL_UPGRADES.find(u => u.id === id);
}

/**
 * Vérifie si un upgrade est disponible (requirements remplis)
 * @param {string} id
 * @returns {boolean}
 */
function isUpgradeAvailable(id) {
    const upgrade = getUpgrade(id);
    if (!upgrade) return false;

    // Déjà acheté
    if (window.ForgeState.hasUpgrade(id)) return false;

    // Vérifier requirement
    if (upgrade.requirement && !upgrade.requirement()) return false;

    return true;
}

/**
 * Vérifie si on peut acheter un upgrade
 * @param {string} id
 * @returns {boolean}
 */
function canAffordUpgrade(id) {
    const upgrade = getUpgrade(id);
    if (!upgrade) return false;

    const state = window.ForgeState.getState();
    return state.energy >= upgrade.cost;
}

/**
 * Achète un upgrade
 * @param {string} id
 * @returns {boolean}
 */
function buyUpgrade(id) {
    if (!isUpgradeAvailable(id)) return false;
    if (!canAffordUpgrade(id)) return false;

    const upgrade = getUpgrade(id);

    if (window.ForgeState.spendEnergy(upgrade.cost)) {
        window.ForgeState.buyUpgrade(id);
        return true;
    }

    return false;
}

/**
 * Calcule le multiplicateur des upgrades d'un générateur
 * @param {number} genId
 * @returns {number}
 */
function getGeneratorUpgradeMultiplier(genId) {
    let mult = 1;

    const state = window.ForgeState.getState();

    for (let tier = 0; tier < 5; tier++) {
        const upgradeId = `gen${genId}_${tier}`;
        if (state.boughtUpgrades.includes(upgradeId)) {
            const upgrade = getUpgrade(upgradeId);
            mult *= upgrade.multiplier;
        }
    }

    return mult;
}

/**
 * Calcule le multiplicateur global
 * @returns {number}
 */
function getGlobalMultiplier() {
    let mult = 1;

    const state = window.ForgeState.getState();

    for (let i = 0; i < 10; i++) {
        const upgradeId = `global_${i}`;
        if (state.boughtUpgrades.includes(upgradeId)) {
            const upgrade = getUpgrade(upgradeId);
            mult *= upgrade.multiplier;
        }
    }

    return mult;
}

/**
 * Vérifie si l'auto-clicker est débloqué
 * @returns {boolean}
 */
function hasAutoClicker() {
    return window.ForgeState.hasUpgrade('qol_autoclicker');
}

/**
 * Obtient le taux de clic automatique
 * @returns {number}
 */
function getAutoClickRate() {
    return hasAutoClicker() ? 10 : 0;
}

/**
 * Obtient les modes d'achat débloqués
 * @returns {Array}
 */
function getUnlockedBuyModes() {
    const modes = [1]; // x1 toujours disponible

    if (window.ForgeState.hasUpgrade('qol_bulk10')) modes.push(10);
    if (window.ForgeState.hasUpgrade('qol_bulk25')) modes.push(25);
    if (window.ForgeState.hasUpgrade('qol_bulk100')) modes.push(100);
    if (window.ForgeState.hasUpgrade('qol_max')) modes.push('max');

    return modes;
}

// Export global
window.ForgeUpgrades = {
    getAllUpgrades,
    getUpgradesByCategory,
    getUpgrade,
    isUpgradeAvailable,
    canAffordUpgrade,
    buyUpgrade,
    getGeneratorUpgradeMultiplier,
    getGlobalMultiplier,
    hasAutoClicker,
    getAutoClickRate,
    getUnlockedBuyModes
};
