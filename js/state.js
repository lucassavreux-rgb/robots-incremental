// state.js - État global du jeu et sauvegarde

const SAVE_KEY = 'forgeEmpireSave';
const SAVE_VERSION = 1;

// État initial du jeu
const initialState = {
    version: SAVE_VERSION,

    // Ressources
    energy: 0,
    lifetimeEnergy: 0,
    bestRunEnergy: 0,

    // Prestige
    nuclei: 0,
    fragments: 0,
    totalPrestiges: 0,

    // Générateurs (8 types)
    generators: [0, 0, 0, 0, 0, 0, 0, 0],

    // Upgrades achetés (IDs)
    boughtUpgrades: [],

    // Talents (Points dépensés par talent)
    talents: {},
    talentPoints: 0,

    // Stats
    totalClicks: 0,
    timePlayed: 0,
    lastTick: Date.now(),

    // Options
    buyMode: 1, // 1, 10, 25, 100, 'max'
    autoSave: true,
    theme: 'dark',

    // Événements
    activeEvent: null,
    eventEndTime: 0,
    lastEventTime: 0
};

// État du jeu (copie profonde de l'état initial)
let gameState = JSON.parse(JSON.stringify(initialState));

/**
 * Obtient l'état du jeu
 * @returns {object}
 */
function getState() {
    return gameState;
}

/**
 * Modifie l'état du jeu
 * @param {object} updates - Mises à jour partielles
 */
function updateState(updates) {
    Object.assign(gameState, updates);
}

/**
 * Ajoute de l'énergie
 * @param {number} amount
 */
function addEnergy(amount) {
    const safe = window.ForgeNumbers.safeNumber(amount);
    gameState.energy += safe;
    gameState.lifetimeEnergy += safe;

    if (gameState.energy > gameState.bestRunEnergy) {
        gameState.bestRunEnergy = gameState.energy;
    }
}

/**
 * Dépense de l'énergie (retourne false si pas assez)
 * @param {number} amount
 * @returns {boolean}
 */
function spendEnergy(amount) {
    if (gameState.energy >= amount) {
        gameState.energy -= amount;
        return true;
    }
    return false;
}

/**
 * Achète un générateur
 * @param {number} index - Index du générateur (0-7)
 * @param {number} amount - Nombre à acheter
 */
function buyGenerator(index, amount) {
    if (index < 0 || index >= 8) return;
    gameState.generators[index] += amount;
}

/**
 * Achète un upgrade
 * @param {string} id
 */
function buyUpgrade(id) {
    if (!gameState.boughtUpgrades.includes(id)) {
        gameState.boughtUpgrades.push(id);
    }
}

/**
 * Vérifie si un upgrade est acheté
 * @param {string} id
 * @returns {boolean}
 */
function hasUpgrade(id) {
    return gameState.boughtUpgrades.includes(id);
}

/**
 * Augmente un talent
 * @param {string} id
 */
function upgradeTalent(id) {
    if (!gameState.talents[id]) {
        gameState.talents[id] = 0;
    }
    gameState.talents[id]++;
    gameState.talentPoints--;
}

/**
 * Obtient le niveau d'un talent
 * @param {string} id
 * @returns {number}
 */
function getTalentLevel(id) {
    return gameState.talents[id] || 0;
}

/**
 * Réinitialise pour prestige 1 (Noyaux)
 */
function resetForPrestige1() {
    gameState.energy = 0;
    gameState.generators = [0, 0, 0, 0, 0, 0, 0, 0];
    gameState.boughtUpgrades = gameState.boughtUpgrades.filter(id =>
        id.startsWith('qol_') // Garde uniquement les upgrades QoL
    );
    gameState.totalPrestiges++;
    gameState.lastTick = Date.now();
}

/**
 * Réinitialise pour prestige 2 (Fragments)
 */
function resetForPrestige2() {
    resetForPrestige1();
    gameState.nuclei = 0;
    gameState.bestRunEnergy = 0;
}

/**
 * Sauvegarde le jeu dans localStorage
 */
function saveGame() {
    try {
        const saveData = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, saveData);
        return true;
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
        return false;
    }
}

/**
 * Charge le jeu depuis localStorage
 * @returns {boolean} - true si chargement réussi
 */
function loadGame() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) return false;

        const loaded = JSON.parse(saveData);

        // Vérification de version
        if (loaded.version !== SAVE_VERSION) {
            console.warn('Version de sauvegarde différente');
            // Migration si nécessaire
        }

        // Merge avec l'état initial pour les nouvelles propriétés
        gameState = Object.assign({}, initialState, loaded);

        // Calcul offline progress
        calculateOfflineProgress();

        return true;
    } catch (e) {
        console.error('Erreur de chargement:', e);
        return false;
    }
}

/**
 * Calcule la progression hors ligne (max 8h)
 */
function calculateOfflineProgress() {
    const now = Date.now();
    const elapsed = (now - gameState.lastTick) / 1000; // secondes
    const maxOffline = 8 * 3600; // 8 heures max

    const offlineTime = Math.min(elapsed, maxOffline);

    if (offlineTime > 60) { // Plus d'1 minute
        // Calculer production offline
        const prodPerSec = window.ForgeGenerators ?
            window.ForgeGenerators.getTotalProduction() : 0;

        const offlineGain = prodPerSec * offlineTime;
        addEnergy(offlineGain);

        console.log(`Progression hors ligne: ${offlineTime.toFixed(0)}s, +${window.ForgeNumbers.formatNumber(offlineGain)} énergie`);
    }

    gameState.lastTick = now;
}

/**
 * Exporte la sauvegarde en base64
 * @returns {string}
 */
function exportSave() {
    try {
        const saveData = JSON.stringify(gameState);
        return btoa(saveData);
    } catch (e) {
        console.error('Erreur d\'export:', e);
        return '';
    }
}

/**
 * Importe une sauvegarde depuis base64
 * @param {string} data
 * @returns {boolean}
 */
function importSave(data) {
    try {
        const decoded = atob(data);
        const loaded = JSON.parse(decoded);

        if (loaded.version !== SAVE_VERSION) {
            console.warn('Version différente');
        }

        gameState = Object.assign({}, initialState, loaded);
        saveGame();
        return true;
    } catch (e) {
        console.error('Erreur d\'import:', e);
        return false;
    }
}

/**
 * Réinitialise complètement le jeu
 */
function resetGame() {
    gameState = JSON.parse(JSON.stringify(initialState));
    gameState.lastTick = Date.now();
    localStorage.removeItem(SAVE_KEY);
}

// Auto-save toutes les 10 secondes
setInterval(() => {
    if (gameState.autoSave) {
        saveGame();
    }
}, 10000);

// Sauvegarde avant fermeture
window.addEventListener('beforeunload', () => {
    gameState.lastTick = Date.now();
    saveGame();
});

// Export global
window.ForgeState = {
    getState,
    updateState,
    addEnergy,
    spendEnergy,
    buyGenerator,
    buyUpgrade,
    hasUpgrade,
    upgradeTalent,
    getTalentLevel,
    resetForPrestige1,
    resetForPrestige2,
    saveGame,
    loadGame,
    exportSave,
    importSave,
    resetGame
};
