/**
 * =====================================================
 * PRESTIGE.JS - Prestige System
 * =====================================================
 * Gestion de la renaissance / prestige
 */

/**
 * Effectue un prestige
 */
function doPrestige() {
    const rpGain = calculatePrestigeRP();

    if (rpGain === 0) {
        showNotification("You need at least 1M Shards earned to prestige!", "error");
        return;
    }

    if (!confirm(`Are you sure you want to prestige?\n\nYou will gain ${rpGain} RP and lose all Shards, generators, and upgrades.\n\nTalents, artefacts, and pets will be kept.`)) {
        return;
    }

    // Gagner les RP
    GameState.prestige.currentRP += rpGain;
    GameState.prestige.totalRP += rpGain;
    GameState.prestige.totalPrestigeCount++;

    // Calculer le pourcentage de générateurs à garder (talents)
    let keepPercentage = 0;
    const prestigeTalents = GameState.talents.prestige;
    for (let talentId in prestigeTalents) {
        const level = prestigeTalents[talentId];
        const talent = TALENTS.prestige.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'keep_generators') {
            keepPercentage += talent.valuePerLevel * level;
        }
    }

    // Sauvegarder les niveaux de générateurs à garder
    const keptGenerators = {};
    if (keepPercentage > 0) {
        for (let genId in GameState.generators) {
            const level = GameState.generators[genId];
            keptGenerators[genId] = Math.floor(level * keepPercentage);
        }
    }

    // Reset
    GameState.shards = new BigNumber(0);
    GameState.generators = keptGenerators;
    GameState.upgrades = [];

    // Recalculer
    updateCritStats();
    recalculateProduction();

    // UI
    updateAllUI();

    // Quête
    updateQuestProgress('prestige_done', 1);

    showNotification(`Prestige complete! Gained ${rpGain} RP!`, "success");
}

/**
 * Met à jour l'UI du prestige
 */
function updatePrestigeUI() {
    // RP actuels
    const currentRPEl = document.getElementById('current-rp');
    if (currentRPEl) {
        currentRPEl.textContent = GameState.prestige.currentRP;
    }

    // RP totaux
    const totalRPEl = document.getElementById('total-rp');
    if (totalRPEl) {
        totalRPEl.textContent = GameState.prestige.totalRP;
    }

    // RP à gagner
    const rpGain = calculatePrestigeRP();
    const rpGainEl = document.getElementById('rp-gain');
    if (rpGainEl) {
        rpGainEl.textContent = rpGain;
    }

    // Multiplier de prestige
    const prestigeMult = getPrestigeMultiplier();
    const prestigeMultEl = document.getElementById('prestige-multiplier');
    if (prestigeMultEl) {
        prestigeMultEl.textContent = 'x' + prestigeMult.toFixed(2);
    }

    // Bouton prestige
    const prestigeBtn = document.getElementById('prestige-button');
    if (prestigeBtn) {
        prestigeBtn.disabled = rpGain === 0;
    }
}
