/**
 * =====================================================
 * MAIN.JS - Main Game Loop & UI
 * =====================================================
 * Boucle de jeu principale et gestion de l'interface
 */

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }

    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.textContent = message;

    container.appendChild(div);

    setTimeout(() => {
        div.classList.add('notification-fade');
        setTimeout(() => div.remove(), 500);
    }, 3000);
}

/**
 * Met à jour les stats principales
 */
function updateStatsUI() {
    // Shards
    const shardsEl = document.getElementById('shards-count');
    if (shardsEl) {
        shardsEl.textContent = formatNumber(GameState.shards);
    }

    // CPS
    const cpsEl = document.getElementById('cps-count');
    if (cpsEl) {
        cpsEl.textContent = formatNumber(GameState.totalCps);
    }

    // CPC
    const cpcEl = document.getElementById('cpc-count');
    if (cpcEl) {
        cpcEl.textContent = formatNumber(GameState.totalCpc);
    }

    // Crit chance & multiplier
    const critChanceEl = document.getElementById('crit-chance');
    if (critChanceEl) {
        critChanceEl.textContent = (GameState.click.critChance * 100).toFixed(1) + '%';
    }

    const critMultEl = document.getElementById('crit-multiplier');
    if (critMultEl) {
        critMultEl.textContent = 'x' + GameState.click.critMultiplier.toFixed(1);
    }

    // Stats
    const totalClicksEl = document.getElementById('total-clicks');
    if (totalClicksEl) {
        totalClicksEl.textContent = GameState.stats.totalClicks;
    }

    const totalShardsEl = document.getElementById('total-shards');
    if (totalShardsEl) {
        totalShardsEl.textContent = formatNumber(GameState.stats.totalShardsEarned);
    }

    const playTimeEl = document.getElementById('play-time');
    if (playTimeEl) {
        const hours = Math.floor(GameState.stats.playTime / 3600);
        const minutes = Math.floor((GameState.stats.playTime % 3600) / 60);
        const seconds = Math.floor(GameState.stats.playTime % 60);
        playTimeEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }
}

/**
 * Met à jour toute l'interface
 */
function updateAllUI() {
    updateStatsUI();
    updateGeneratorsUI();
    updateUpgradesUI();
    updatePrestigeUI();
    updateTalentsUI();
    updateArtefactsUI();
    updatePetsUI();
    updatePetShopUI();
    updateQuestsUI();
    updateBossUI();
    updateEventsUI();
}

/**
 * Change d'onglet
 */
function switchTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Désactiver tous les boutons d'onglet
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activer l'onglet sélectionné
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }
}

// Variable pour l'auto-refresh des boutons et du boss UI
let lastButtonRefresh = 0;
let lastBossUIUpdate = 0;

/**
 * Boucle de jeu principale
 */
function gameLoop() {
    const now = Date.now();
    const delta = (now - GameState.lastTick) / 1000; // en secondes

    // Production passive
    const shardsGained = GameState.totalCps.multiply(delta);
    GameState.shards = GameState.shards.add(shardsGained);
    GameState.stats.totalShardsEarned = GameState.stats.totalShardsEarned.add(shardsGained);

    // Temps de jeu
    GameState.stats.playTime += delta;

    // Dégâts au boss (CPS)
    if (GameState.boss.active) {
        const bossDamage = GameState.totalCps.multiply(delta);
        GameState.boss.hp = GameState.boss.hp.subtract(bossDamage);

        // Vérifier défaite (empêcher HP négatifs)
        if (GameState.boss.hp.lessThanOrEqual(0)) {
            GameState.boss.hp = new BigNumber(0); // Forcer à 0
            defeatBoss();
        }
    }

    // Nettoyer les événements expirés
    cleanupExpiredEvents();

    // Événements aléatoires
    triggerRandomEvent();

    // Mettre à jour l'UI
    updateStatsUI();
    updateEventsUI();

    // Mettre à jour les cooldowns des pets
    updatePetsUI();

    // Auto-refresh des boutons et du boss UI (1 fois par seconde)
    if (now - lastButtonRefresh >= 1000) {
        if (typeof updateGeneratorsButtonsOnly === 'function') {
            updateGeneratorsButtonsOnly();
        }
        if (typeof updateUpgradesButtonsOnly === 'function') {
            updateUpgradesButtonsOnly();
        }
        if (typeof updatePetShopUI === 'function') {
            updatePetShopUI();
        }
        // Refresh du prestige UI (important pour le bouton prestige)
        if (typeof updatePrestigeUI === 'function') {
            updatePrestigeUI();
        }
        lastButtonRefresh = now;
    }

    // Mettre à jour l'UI du boss (cooldown countdown)
    if (now - lastBossUIUpdate >= 1000) {
        updateBossUI();
        lastBossUIUpdate = now;
    }

    GameState.lastTick = now;
}

/**
 * Sauvegarde automatique
 */
function autoSave() {
    saveGame();
}

/**
 * Initialise le jeu
 */
function initGame() {
    console.log("🎮 Shard Clicker - Initializing...");

    // Charger ou initialiser
    const loaded = loadGame();
    if (!loaded) {
        initializeState();
        generateDailyQuests();
    }

    // Event listeners
    const clickBtn = document.getElementById('main-click-button');
    if (clickBtn) {
        clickBtn.addEventListener('click', handleMainClick);
    }

    // Onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Boutons de sauvegarde
    const saveBtn = document.getElementById('save-button');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveGame);
    }

    const resetBtn = document.getElementById('reset-button');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }

    const exportBtn = document.getElementById('export-button');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSave);
    }

    const importBtn = document.getElementById('import-button');
    if (importBtn) {
        importBtn.addEventListener('click', importSave);
    }

    // Quêtes
    const generateQuestsBtn = document.getElementById('generate-quests-button');
    if (generateQuestsBtn) {
        generateQuestsBtn.addEventListener('click', generateDailyQuests);
    }

    // Afficher l'onglet par défaut
    switchTab('generators');

    // UI initiale
    updateAllUI();

    // Boucle de jeu (60 FPS)
    setInterval(gameLoop, 1000 / 60);

    // Sauvegarde automatique (toutes les 10 secondes)
    setInterval(autoSave, 10000);

    console.log("✅ Game initialized!");
    console.log("");
    console.log("📊 === MULTIPLICATEURS ACTUELS ===");
    console.log("  RP Total:", GameState.prestige.totalRP);
    console.log("  Prestige Multiplier:", getPrestigeMultiplier().toFixed(2) + "x");
    console.log("  CPC Total:", formatNumber(GameState.totalCpc));
    console.log("  CPS Total:", formatNumber(GameState.totalCps));
    console.log("");
    console.log("💡 Pour voir les détails de calcul à chaque clic:");
    console.log("   Tape: window.DEBUG_MULTIPLIERS = true");
    console.log("   Puis clique dans le jeu!");
}

// Démarrer le jeu au chargement
document.addEventListener('DOMContentLoaded', initGame);
