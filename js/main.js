// main.js - Bootstrap et game loop principal

let lastTime = Date.now();
let accumulator = 0;

/**
 * Initialisation du jeu
 */
function init() {
    console.log('🔥 Forge Empire - Initialisation...');

    // Debug: Vérifier que tous les modules sont chargés
    const modules = {
        ForgeNumbers: !!window.ForgeNumbers,
        ForgeState: !!window.ForgeState,
        ForgeGenerators: !!window.ForgeGenerators,
        ForgeUpgrades: !!window.ForgeUpgrades,
        ForgePrestige: !!window.ForgePrestige,
        ForgeTalents: !!window.ForgeTalents,
        ForgeUtils: !!window.ForgeUtils,
        ForgeUI: !!window.ForgeUI
    };
    console.log('📦 Modules chargés:', modules);

    // Vérifier si tous les modules sont chargés
    const allLoaded = Object.values(modules).every(v => v === true);
    if (!allLoaded) {
        console.error('❌ ERREUR: Certains modules ne sont pas chargés!');
        const missing = Object.entries(modules).filter(([k, v]) => !v).map(([k]) => k);
        console.error('Modules manquants:', missing);
        alert('❌ ERREUR: Modules manquants: ' + missing.join(', '));
        return;
    }
    console.log('✅ Tous les modules sont chargés');

    // Charger sauvegarde
    const loaded = window.ForgeState.loadGame();
    if (loaded) {
        console.log('✅ Sauvegarde chargée');
    } else {
        console.log('🆕 Nouvelle partie');
    }

    // Initialiser l'UI
    console.log('Initialisation de l\'UI...');
    window.ForgeUI.initUI();
    console.log('UI initialisée');

    // Appliquer le thème
    const state = window.ForgeState.getState();
    document.body.className = `theme-${state.theme}`;

    // Démarrer le game loop
    gameLoop();

    console.log('✅ Forge Empire - Prêt !');
}

/**
 * Game loop principal (requestAnimationFrame)
 */
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000; // En secondes
    lastTime = now;

    // Limiter deltaTime max (si tab inactive trop longtemps)
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Mise à jour
    update(clampedDelta);

    // Rendu (max 20 FPS pour économiser ressources)
    accumulator += clampedDelta;
    if (accumulator >= 0.05) { // 20 FPS
        render();
        accumulator = 0;
    }

    // Boucle
    requestAnimationFrame(gameLoop);
}

/**
 * Update du jeu (production, etc.)
 * @param {number} delta - Temps écoulé en secondes
 */
function update(delta) {
    const state = window.ForgeState.getState();

    // Production automatique
    const prodPerSec = window.ForgeGenerators.getTotalProduction();
    const energyGain = prodPerSec * delta;

    window.ForgeState.addEnergy(energyGain);

    // Incrémenter temps joué
    window.ForgeState.updateState({
        timePlayed: state.timePlayed + delta
    });

    // Vérifier événements rares
    window.ForgeUtils.checkForEvents();
}

/**
 * Rendu de l'interface
 */
function render() {
    window.ForgeUI.render();
}

// Démarrage quand DOM prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
