// talents.js - Arbre de talents (débloqué avec Fragments)

const TALENTS = [
    {
        id: 'yield',
        name: 'Rendement',
        description: '+10% production globale par rang',
        maxRank: 5,
        effect: (rank) => 1 + (rank * 0.10)
    },
    {
        id: 'efficiency',
        name: 'Efficience',
        description: 'Réduit la croissance des coûts de G1-G3 de -0.01 par rang',
        maxRank: 3,
        effect: (rank) => rank * 0.01
    },
    {
        id: 'synergy',
        name: 'Synergie',
        description: 'Améliore les synergies de 1.05 → 1.06+ par rang',
        maxRank: 4,
        effect: (rank) => rank * 0.01
    },
    {
        id: 'fractalClick',
        name: 'Clic Fractal',
        description: '+20% valeur de clic par rang',
        maxRank: 5,
        effect: (rank) => 1 + (rank * 0.20)
    },
    {
        id: 'automation',
        name: 'Automation',
        description: 'Déverrouille le drone auto-clic',
        maxRank: 1,
        effect: (rank) => rank // Juste un unlock
    }
];

/**
 * Obtient tous les talents
 * @returns {Array}
 */
function getAllTalents() {
    return TALENTS;
}

/**
 * Obtient un talent par ID
 * @param {string} id
 * @returns {object}
 */
function getTalent(id) {
    return TALENTS.find(t => t.id === id);
}

/**
 * Obtient le niveau actuel d'un talent
 * @param {string} id
 * @returns {number}
 */
function getTalentLevel(id) {
    return window.ForgeState.getTalentLevel(id);
}

/**
 * Vérifie si on peut améliorer un talent
 * @param {string} id
 * @returns {boolean}
 */
function canUpgradeTalent(id) {
    const talent = getTalent(id);
    if (!talent) return false;

    const state = window.ForgeState.getState();
    const currentLevel = getTalentLevel(id);

    // Vérifie rang max et points disponibles
    return currentLevel < talent.maxRank && state.talentPoints > 0;
}

/**
 * Améliore un talent
 * @param {string} id
 * @returns {boolean}
 */
function upgradeTalent(id) {
    if (!canUpgradeTalent(id)) return false;

    window.ForgeState.upgradeTalent(id);
    return true;
}

/**
 * Calcule l'effet multiplicateur de production des talents
 * @returns {number}
 */
function getProductionMultiplier() {
    let mult = 1;

    // Rendement
    const yieldLevel = getTalentLevel('yield');
    const yieldTalent = getTalent('yield');
    if (yieldLevel > 0) {
        mult *= yieldTalent.effect(yieldLevel);
    }

    return mult;
}

/**
 * Calcule la réduction de coût des talents
 * @returns {number}
 */
function getCostReduction() {
    const efficiencyLevel = getTalentLevel('efficiency');
    const efficiencyTalent = getTalent('efficiency');

    if (efficiencyLevel > 0) {
        return efficiencyTalent.effect(efficiencyLevel);
    }

    return 0;
}

/**
 * Calcule le multiplicateur de clic des talents
 * @returns {number}
 */
function getClickMultiplier() {
    const clickLevel = getTalentLevel('fractalClick');
    const clickTalent = getTalent('fractalClick');

    if (clickLevel > 0) {
        return clickTalent.effect(clickLevel);
    }

    return 1;
}

/**
 * Vérifie si l'automation est débloquée
 * @returns {boolean}
 */
function hasAutomation() {
    return getTalentLevel('automation') > 0;
}

// Export global
window.ForgeTalents = {
    getAllTalents,
    getTalent,
    getTalentLevel,
    canUpgradeTalent,
    upgradeTalent,
    getProductionMultiplier,
    getCostReduction,
    getClickMultiplier,
    hasAutomation
};
