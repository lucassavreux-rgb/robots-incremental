// prestige.js - Gestion des 2 prestiges (Noyaux et Fragments)

/**
 * Calcule le gain estimé de Noyaux au prestige
 * @returns {number}
 */
function calculateNucleiGain() {
    const state = window.ForgeState.getState();
    const lifetimeE = state.lifetimeEnergy;

    if (lifetimeE < 1e12) return 0;

    const gain = Math.floor(Math.pow(lifetimeE / 1e12, 0.5));
    return gain;
}

/**
 * Effectue le prestige 1 (Noyaux)
 * @returns {boolean}
 */
function doPrestige1() {
    const gain = calculateNucleiGain();

    if (gain <= 0) {
        return false;
    }

    const state = window.ForgeState.getState();

    // Ajouter les noyaux
    window.ForgeState.updateState({
        nuclei: state.nuclei + gain
    });

    // Reset
    window.ForgeState.resetForPrestige1();

    return true;
}

/**
 * Calcule le gain estimé de Fragments au prestige
 * @returns {number}
 */
function calculateFragmentsGain() {
    const state = window.ForgeState.getState();
    const nuclei = state.nuclei;

    if (nuclei < 250) return 0;

    const gain = Math.floor(Math.pow(nuclei / 250, 0.6));
    return gain;
}

/**
 * Effectue le prestige 2 (Fragments)
 * @returns {boolean}
 */
function doPrestige2() {
    const gain = calculateFragmentsGain();

    if (gain <= 0) {
        return false;
    }

    const state = window.ForgeState.getState();

    // Ajouter les fragments et points de talents
    window.ForgeState.updateState({
        fragments: state.fragments + gain,
        talentPoints: state.talentPoints + gain
    });

    // Reset complet
    window.ForgeState.resetForPrestige2();

    return true;
}

/**
 * Calcule le multiplicateur de production du prestige 1
 * @returns {number}
 */
function getPrestige1Multiplier() {
    const state = window.ForgeState.getState();
    return 1 + (state.nuclei * 0.05);
}

/**
 * Calcule le multiplicateur de production du prestige 2
 * @returns {number}
 */
function getPrestige2Multiplier() {
    const state = window.ForgeState.getState();
    return Math.pow(1.20, state.fragments);
}

/**
 * Calcule le multiplicateur total de prestige
 * @returns {number}
 */
function getPrestigeMultiplier() {
    return getPrestige1Multiplier() * getPrestige2Multiplier();
}

/**
 * Calcule le bonus de clic des noyaux
 * @returns {number}
 */
function getClickBonus() {
    const state = window.ForgeState.getState();
    return state.nuclei * 0.01;
}

/**
 * Vérifie si le prestige 1 est recommandé
 * @returns {boolean}
 */
function isPrestige1Recommended() {
    const gain = calculateNucleiGain();
    const state = window.ForgeState.getState();

    // Recommandé si on gagne au moins 1 et qu'on a moins de 10 noyaux
    // OU si on gagne plus que ce qu'on a actuellement
    return gain >= 1 && (state.nuclei < 10 || gain > state.nuclei * 0.5);
}

/**
 * Vérifie si le prestige 2 est recommandé
 * @returns {boolean}
 */
function isPrestige2Recommended() {
    const gain = calculateFragmentsGain();
    const state = window.ForgeState.getState();

    // Recommandé si on gagne au moins 1
    return gain >= 1 && (state.fragments < 5 || gain > state.fragments * 0.3);
}

// Export global
window.ForgePrestige = {
    calculateNucleiGain,
    doPrestige1,
    calculateFragmentsGain,
    doPrestige2,
    getPrestige1Multiplier,
    getPrestige2Multiplier,
    getPrestigeMultiplier,
    getClickBonus,
    isPrestige1Recommended,
    isPrestige2Recommended
};
