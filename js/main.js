/**
 * =====================================================
 * MAIN.JS - Boucle Principale du Jeu
 * =====================================================
 * Initialisation, game loop, état du jeu
 */

/**
 * État global du jeu
 */
const gameState = {
    // Monnaie
    coins: 0,
    prestigePoints: 0,

    // Stats de base
    baseCPC: 1,
    cpc: 1,
    cps: 0,

    // Critiques
    criticalChance: 0,
    criticalMultiplier: 2,
    guaranteedCrits: false,

    // Générateurs
    generators: [],

    // Upgrades achetés
    upgrades: [],

    // Talents (par branche)
    talents: {
        click: [],
        generators: [],
        prestige: []
    },

    // Pets
    pets: [],
    activePet: null,

    // Artefacts
    unlockedArtefacts: [],
    equippedArtefacts: [],

    // Quêtes
    activeQuests: [],
    questsLastReset: null,

    // Boss
    currentBoss: null,
    nextBossTime: Date.now() + (5 * 60 * 1000), // 5 minutes

    // Événements actifs
    activeEvents: [],

    // Cooldowns
    cooldowns: {},

    // Statistiques
    stats: {
        totalClicks: 0,
        totalCoinsEarned: 0,
        playtime: 0,
        criticalHits: 0,
        bossesDefeated: 0,
        prestigeCount: 0,
        generatorsBought: 0
    }
};

/**
 * Initialise le jeu
 */
function initializeGame() {
    console.log('🎮 Initialisation de Clicker Game Ultimate...');

    // Charger la sauvegarde
    loadGame();

    // Initialiser tous les systèmes
    initTabs();
    initGenerators();
    initUpgrades();
    initPrestige();
    initTalents();
    initPets();
    initArtefacts();
    initQuests();
    initBosses();
    initSaveSystem();

    // Initialiser les événements
    initClickEvents();
    initBoosterEvents();

    // Recalculer les stats
    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    // Mettre à jour l'affichage
    updateMainStats();
    updateStatsDisplay();

    // Démarrer la boucle de jeu
    startGameLoop();

    console.log('✅ Jeu initialisé !');
}

/**
 * Initialise les événements de clic
 */
function initClickEvents() {
    const clickBtn = document.getElementById('main-click-btn');

    clickBtn.addEventListener('click', (e) => {
        handleClick(e);
    });

    // Attaquer le boss au clic aussi
    clickBtn.addEventListener('click', () => {
        if (gameState.currentBoss) {
            attackBoss();
        }
    });
}

/**
 * Gère un clic
 */
function handleClick(event) {
    let coinsGained = gameState.cpc;
    let isCritical = false;

    // Vérifier critique
    if (gameState.guaranteedCrits || Math.random() < gameState.criticalChance) {
        coinsGained *= gameState.criticalMultiplier;
        isCritical = true;
        gameState.stats.criticalHits++;
    }

    // Ajouter les coins
    addCoins(coinsGained);

    // Stats
    gameState.stats.totalClicks++;

    // Quêtes (si la fonction existe)
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress('clicks', 1);
        updateQuestProgress('coins', coinsGained);
    }

    // Effet visuel
    createClickEffect(event.clientX, event.clientY, coinsGained, isCritical);
}

/**
 * Initialise les boosters
 */
function initBoosterEvents() {
    document.getElementById('power-boost-btn')?.addEventListener('click', () => {
        usePowerBoost();
    });

    document.getElementById('frenzy-boost-btn')?.addEventListener('click', () => {
        useFrenzyBoost();
    });
}

/**
 * Utilise le Power Boost
 */
function usePowerBoost() {
    const cooldownKey = 'power_boost';
    const now = Date.now();

    if (gameState.cooldowns[cooldownKey] && gameState.cooldowns[cooldownKey] > now) {
        const timeLeft = Math.ceil((gameState.cooldowns[cooldownKey] - now) / 1000);
        showNotification(`Cooldown: ${timeLeft}s`, 'error');
        return;
    }

    // Activer le boost
    addActiveEvent('power_boost', 2, 30000);

    // Cooldown de 2 minutes
    gameState.cooldowns[cooldownKey] = now + (2 * 60 * 1000);

    showNotification('Power Boost x2 activé !', 'success');
}

/**
 * Utilise le Frenzy Boost
 */
function useFrenzyBoost() {
    const cooldownKey = 'frenzy_boost';
    const now = Date.now();

    if (gameState.cooldowns[cooldownKey] && gameState.cooldowns[cooldownKey] > now) {
        const timeLeft = Math.ceil((gameState.cooldowns[cooldownKey] - now) / 1000);
        showNotification(`Cooldown: ${timeLeft}s`, 'error');
        return;
    }

    // Activer le frenzy (CPC x50, CPS x10)
    addActiveEvent('frenzy', 50, 10000);

    // Cooldown de 5 minutes
    gameState.cooldowns[cooldownKey] = now + (5 * 60 * 1000);

    showNotification('Frenzy Mode activé !', 'success');
}

/**
 * Démarre la boucle de jeu (tick ~100ms)
 */
function startGameLoop() {
    let lastTick = Date.now();

    setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTick) / 1000; // en secondes
        lastTick = now;

        // Production automatique (CPS)
        if (gameState.cps > 0) {
            const coinsProduced = gameState.cps * delta;
            addCoins(coinsProduced);
            if (typeof updateQuestProgress === 'function') {
                updateQuestProgress('coins', coinsProduced);
            }
        }

        // Playtime
        gameState.stats.playtime += delta;

        // Nettoyer les événements expirés
        cleanupExpiredEvents();

        // Mettre à jour les cooldowns des boosters
        updateBoosterCooldowns();

        // Mettre à jour le timer du boss
        updateBossTimer();

        // Mettre à jour le timer des quêtes
        updateQuestResetTimer();

        // Rafraîchir l'affichage des stats (toutes les secondes)
        if (Math.floor(now / 1000) !== Math.floor((now - 100) / 1000)) {
            updateStatsDisplay();
        }
    }, 100);
}

/**
 * Met à jour l'affichage des cooldowns des boosters
 */
function updateBoosterCooldowns() {
    const now = Date.now();

    // Power Boost
    const powerCooldown = gameState.cooldowns['power_boost'];
    if (powerCooldown && powerCooldown > now) {
        const timeLeft = Math.ceil((powerCooldown - now) / 1000);
        document.getElementById('power-boost-cooldown').textContent = timeLeft + 's';
        document.getElementById('power-boost-btn').disabled = true;
    } else {
        document.getElementById('power-boost-cooldown').textContent = 'Ready';
        document.getElementById('power-boost-btn').disabled = false;
    }

    // Frenzy Boost
    const frenzyCooldown = gameState.cooldowns['frenzy_boost'];
    if (frenzyCooldown && frenzyCooldown > now) {
        const timeLeft = Math.ceil((frenzyCooldown - now) / 1000);
        document.getElementById('frenzy-boost-cooldown').textContent = timeLeft + 's';
        document.getElementById('frenzy-boost-btn').disabled = true;
    } else {
        document.getElementById('frenzy-boost-cooldown').textContent = 'Ready';
        document.getElementById('frenzy-boost-btn').disabled = false;
    }
}

/**
 * Démarre le jeu quand la page est chargée
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Sauvegarder avant de quitter
window.addEventListener('beforeunload', () => {
    saveGame();
});

// Empêcher le zoom par pinch sur mobile
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});

// Empêcher le double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
