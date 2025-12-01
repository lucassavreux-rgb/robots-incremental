/**
 * =====================================================
 * STATE.JS - Game State Management
 * =====================================================
 * Contient l'état global du jeu
 */

const GameState = {
    // Monnaie principale
    shards: new BigNumber(0),

    // Production
    totalCps: new BigNumber(0),
    totalCpc: new BigNumber(1),

    // Clic
    click: {
        base: new BigNumber(1),
        flatBonus: new BigNumber(0),
        multiplier: new BigNumber(1),
        critChance: 0.05,
        critMultiplier: 3
    },

    // Générateurs: { id: level }
    generators: {},

    // Upgrades achetés: [id1, id2, ...]
    upgrades: [],

    // Prestige
    prestige: {
        currentRP: 0,
        totalRP: 0,
        totalPrestigeCount: 0
    },

    // Talents: { branch: { id: level } }
    talents: {
        click: {},
        generators: {},
        prestige: {}
    },

    // Artefacts
    artefacts: {
        owned: [],      // Artefacts possédés
        equipped: []    // Artefacts équipés (max 3)
    },

    // Pets
    pets: {
        owned: [],      // Pets possédés
        active: null,   // Pet actif
        activeCooldowns: {}  // { petId: timestamp }
    },

    // Boss
    boss: {
        active: false,
        hp: new BigNumber(0),
        maxHp: new BigNumber(0),
        defeated: 0,
        cooldown: 0
    },

    // Quêtes
    quests: {
        active: [],     // Quêtes actives
        completed: [],  // IDs des quêtes complétées
        progress: {}    // { questId: progress }
    },

    // Événements actifs
    activeEvents: [],  // { id, endTime }

    // Statistiques
    stats: {
        totalClicks: 0,
        totalShardsEarned: new BigNumber(0),
        playTime: 0,  // en secondes
        generatorsBought: 0,
        upgradesBought: 0
    },

    // Temps
    lastTick: Date.now(),
    lastSave: Date.now()
};

/**
 * Initialise l'état du jeu avec des valeurs par défaut
 */
function initializeState() {
    // Initialiser les générateurs
    GENERATORS.forEach(gen => {
        if (!GameState.generators[gen.id]) {
            GameState.generators[gen.id] = 0;
        }
    });

    // Recalculer la production
    recalculateProduction();
}

/**
 * Recalcule le CPC et CPS totaux
 */
function recalculateProduction() {
    GameState.totalCpc = calculateTotalCPC();
    GameState.totalCps = calculateTotalCPS();
}
