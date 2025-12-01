/**
 * =====================================================
 * PRESTIGE.JS - Système de Prestige
 * =====================================================
 * Reset du jeu avec gain de RP et bonus permanents
 */

/**
 * Initialise le système de prestige
 */
function initPrestige() {
    updatePrestigeDisplay();
}

/**
 * Met à jour l'affichage du prestige
 */
function updatePrestigeDisplay() {
    // Calculer les RP après prestige
    const rpGain = calculatePrestigeRP();

    document.getElementById('total-coins-earned').textContent =
        formatNumber(gameState.stats.totalCoinsEarned);
    document.getElementById('rp-after-prestige').textContent =
        formatNumber(rpGain);

    // Activer/désactiver le bouton
    const prestigeBtn = document.getElementById('prestige-btn');
    if (rpGain > 0) {
        prestigeBtn.disabled = false;
    } else {
        prestigeBtn.disabled = true;
    }

    // Afficher les bonus actuels
    renderPrestigeBonuses();
}

/**
 * Calcule les RP gagnés au prestige
 */
function calculatePrestigeRP() {
    const totalCoins = gameState.stats.totalCoinsEarned;

    if (totalCoins < 1000000) return 0;

    // Formule: sqrt(totalCoins / 1000000)
    let rp = Math.floor(Math.sqrt(totalCoins / 1000000));

    // Bonus des talents
    const rpTalentBonus = calculateTalentBonus('rp_bonus');
    rp *= (1 + rpTalentBonus);

    // Bonus des artefacts
    gameState.equippedArtefacts.forEach(artefactId => {
        const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
        if (artefact && artefact.effect.type === 'rp_bonus') {
            rp *= (1 + artefact.effect.value);
        }
    });

    return Math.floor(rp);
}

/**
 * Affiche les bonus actuels du prestige
 */
function renderPrestigeBonuses() {
    const container = document.getElementById('prestige-bonuses-list');

    if (gameState.prestigePoints === 0) {
        container.innerHTML = '<p style="color: #a0a0a0;">Aucun bonus pour le moment</p>';
        return;
    }

    const cpcBonus = (gameState.prestigePoints * 1).toFixed(0);
    const cpsBonus = (gameState.prestigePoints * 2).toFixed(0);

    container.innerHTML = `
        <div class="bonus-item">
            <strong>CPC:</strong> +${cpcBonus}%
        </div>
        <div class="bonus-item">
            <strong>CPS:</strong> +${cpsBonus}%
        </div>
        <div class="bonus-item">
            <strong>RP disponibles:</strong> ${formatNumber(gameState.prestigePoints)}
        </div>
    `;
}

/**
 * Effectue un prestige
 */
function doPrestige() {
    const rpGain = calculatePrestigeRP();

    if (rpGain === 0) {
        showNotification('Pas assez de coins pour un prestige !', 'error');
        return;
    }

    // Confirmer
    if (!confirm(`Êtes-vous sûr de vouloir faire un prestige ?\n\nVous gagnerez ${formatNumber(rpGain)} RP.\n\nTous vos coins, générateurs et upgrades seront réinitialisés !`)) {
        return;
    }

    // Gagner les RP
    gameState.prestigePoints += rpGain;

    // Vérifier le talent "Héritage"
    const keepCoins = calculateTalentBonus('keep_coins');
    const coinsToKeep = Math.floor(gameState.coins * keepCoins);

    // Reset
    gameState.coins = coinsToKeep;
    gameState.generators = [];
    gameState.upgrades = [];
    gameState.baseCPC = 1;
    gameState.criticalChance = 0;
    gameState.criticalMultiplier = 2;

    // Recalculer tout
    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    // Stats
    gameState.stats.prestigeCount++;

    // Quêtes
    updateQuestProgress('prestige', 1);

    // Rafraîchir tout
    renderGeneratorsList();
    renderUpgradesList();
    renderTalentsList();
    updatePrestigeDisplay();
    updateMainStats();

    showNotification(`Prestige effectué ! +${formatNumber(rpGain)} RP`, 'success');
}

// Événement du bouton prestige
document.getElementById('prestige-btn')?.addEventListener('click', doPrestige);
