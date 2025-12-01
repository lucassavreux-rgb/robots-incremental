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
    console.log('🔄 DEBUT PRESTIGE');
    try {
        console.log('1. Calcul RP gain...');
        const rpGain = calculatePrestigeRP();
        console.log('   RP gain:', rpGain);

        if (rpGain === 0) {
            console.log('   ❌ Pas assez de coins');
            showNotification('Pas assez de coins pour un prestige !', 'error');
            return;
        }

        // Confirmer
        console.log('2. Demande confirmation...');
        if (!confirm(`Êtes-vous sûr de vouloir faire un prestige ?\n\nVous gagnerez ${formatNumber(rpGain)} RP.\n\nTous vos coins, générateurs et upgrades seront réinitialisés !`)) {
            console.log('   ❌ Annulé par utilisateur');
            return;
        }

        console.log('3. Confirmation OK, gain RP...');
        // Gagner les RP
        gameState.prestigePoints += rpGain;
        console.log('   Total RP:', gameState.prestigePoints);

        // Vérifier le talent "Héritage" avec protection
        console.log('4. Calcul keepCoins (Héritage)...');
        let keepCoins = 0;
        try {
            keepCoins = calculateTalentBonus('keep_coins') || 0;
            console.log('   keepCoins:', keepCoins);
        } catch (error) {
            console.error('   Erreur calcul keepCoins:', error);
            keepCoins = 0;
        }
        const coinsToKeep = Math.floor(gameState.coins * keepCoins);
        console.log('   Coins à garder:', coinsToKeep);

        // Reset
        console.log('5. Reset gameState...');
        gameState.coins = coinsToKeep;
        gameState.generators = [];
        gameState.upgrades = [];
        gameState.baseCPC = 1;
        gameState.criticalChance = 0;
        gameState.criticalMultiplier = 2;
        console.log('   ✅ Reset terminé');

        // Recalculer tout avec protection
        console.log('6. Recalcul CPC...');
        try {
            gameState.cpc = calculateTotalCPC();
            console.log('   CPC:', gameState.cpc);
        } catch (error) {
            console.error('   Erreur calcul CPC après prestige:', error);
            gameState.cpc = gameState.baseCPC;
        }

        console.log('7. Recalcul CPS...');
        try {
            gameState.cps = calculateTotalCPS();
            console.log('   CPS:', gameState.cps);
        } catch (error) {
            console.error('   Erreur calcul CPS après prestige:', error);
            gameState.cps = 0;
        }

        // Stats
        console.log('8. Mise à jour stats...');
        gameState.stats.prestigeCount++;

        // Quêtes
        console.log('9. Mise à jour quêtes...');
        if (typeof updateQuestProgress === 'function') {
            updateQuestProgress('prestige', 1);
        }

        // Rafraîchir tout - Re-render car tout est reset
        console.log('10. Re-render UI...');
        console.log('   - renderGeneratorsList()');
        renderGeneratorsList();
        console.log('   - renderUpgradesList()');
        renderUpgradesList();
        console.log('   - renderTalentsList()');
        renderTalentsList();
        console.log('   - updatePrestigeDisplay()');
        updatePrestigeDisplay();
        console.log('   - updateMainStats()');
        updateMainStats();
        console.log('   ✅ UI mise à jour');

        console.log('✅ PRESTIGE TERMINÉ !');
        showNotification(`Prestige effectué ! +${formatNumber(rpGain)} RP`, 'success');
    } catch (error) {
        console.error('💥 ERREUR CRITIQUE pendant prestige:', error);
        console.error('Stack:', error.stack);
        alert('ERREUR PENDANT LE PRESTIGE ! Ouvre la console (F12) et fais une capture d\'écran !');
        showNotification('Erreur pendant le prestige ! Vérifie la console.', 'error');
    }
}

// Événement du bouton prestige
document.getElementById('prestige-btn')?.addEventListener('click', doPrestige);
