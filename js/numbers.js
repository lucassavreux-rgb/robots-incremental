// numbers.js - Gestion des grands nombres et formatage

// Suffixes pour les grands nombres
const NUMBER_SUFFIXES = [
    { value: 1e3, suffix: 'K' },
    { value: 1e6, suffix: 'M' },
    { value: 1e9, suffix: 'B' },
    { value: 1e12, suffix: 'T' },
    { value: 1e15, suffix: 'Qa' },
    { value: 1e18, suffix: 'Qi' },
    { value: 1e21, suffix: 'Sx' },
    { value: 1e24, suffix: 'Sp' },
    { value: 1e27, suffix: 'Oc' },
    { value: 1e30, suffix: 'No' },
    { value: 1e33, suffix: 'De' },
    { value: 1e36, suffix: 'UDe' },
    { value: 1e39, suffix: 'DDe' },
    { value: 1e42, suffix: 'TDe' },
    { value: 1e45, suffix: 'QaDe' },
    { value: 1e48, suffix: 'QiDe' },
    { value: 1e51, suffix: 'SxDe' },
    { value: 1e54, suffix: 'SpDe' },
    { value: 1e57, suffix: 'OcDe' },
    { value: 1e60, suffix: 'NoDe' },
    { value: 1e63, suffix: 'Vg' },
    { value: 1e66, suffix: 'UVg' },
    { value: 1e69, suffix: 'DVg' },
    { value: 1e72, suffix: 'TVg' },
    { value: 1e75, suffix: 'QaVg' },
    { value: 1e78, suffix: 'QiVg' },
    { value: 1e81, suffix: 'SxVg' },
    { value: 1e84, suffix: 'SpVg' },
    { value: 1e87, suffix: 'OcVg' },
    { value: 1e90, suffix: 'NoVg' },
    { value: 1e93, suffix: 'Tg' },
    { value: 1e96, suffix: 'UTg' },
    { value: 1e99, suffix: 'DTg' },
    { value: 1e102, suffix: 'TTg' },
    { value: 1e105, suffix: 'QaTg' },
    { value: 1e108, suffix: 'QiTg' }
];

/**
 * Formate un nombre avec suffixe (K, M, B, T, etc.)
 * @param {number} n - Le nombre à formater
 * @param {number} decimals - Nombre de décimales (défaut: 2)
 * @returns {string} - Le nombre formaté
 */
function formatNumber(n, decimals = 2) {
    // Gestion des cas spéciaux
    if (n === null || n === undefined) return '0';
    if (isNaN(n)) {
        console.error('formatNumber received NaN');
        return '0';
    }
    if (!isFinite(n)) {
        console.error('formatNumber received Infinity');
        return '9.99e+308'; // MAX_VALUE approx
    }

    // Nombres négatifs
    if (n < 0) return '-' + formatNumber(-n, decimals);

    // Petits nombres (< 1000)
    if (n < 1000) {
        return n < 10 ? n.toFixed(decimals) : Math.floor(n).toString();
    }

    // Chercher le bon suffixe
    for (let i = NUMBER_SUFFIXES.length - 1; i >= 0; i--) {
        const { value, suffix } = NUMBER_SUFFIXES[i];
        if (n >= value) {
            const formatted = (n / value).toFixed(decimals);
            return formatted + suffix;
        }
    }

    // Fallback (ne devrait jamais arriver)
    return n.toExponential(decimals);
}

/**
 * Formatage court sans décimales pour les compteurs
 * @param {number} n
 * @returns {string}
 */
function formatInt(n) {
    if (n < 1000) return Math.floor(n).toString();
    return formatNumber(n, 0);
}

/**
 * Vérifie si un nombre est valide (pas NaN, pas Infinity)
 * @param {number} n
 * @returns {boolean}
 */
function isValidNumber(n) {
    return typeof n === 'number' && isFinite(n) && !isNaN(n);
}

/**
 * Sécurise un nombre (retourne 0 si invalide)
 * @param {number} n
 * @returns {number}
 */
function safeNumber(n) {
    return isValidNumber(n) ? n : 0;
}

/**
 * Calcule le coût d'un achat bulk (somme géométrique)
 * @param {number} baseCost - Coût de base
 * @param {number} growth - Facteur de croissance
 * @param {number} owned - Nombre déjà possédé
 * @param {number} amount - Nombre à acheter
 * @returns {number} - Coût total
 */
function calculateBulkCost(baseCost, growth, owned, amount) {
    if (amount <= 0) return 0;
    if (growth === 1) return baseCost * amount; // Cas spécial croissance linéaire

    const firstCost = baseCost * Math.pow(growth, owned);
    const geometricSum = (Math.pow(growth, amount) - 1) / (growth - 1);

    return firstCost * geometricSum;
}

/**
 * Calcule le nombre maximum d'achats possibles
 * @param {number} funds - Fonds disponibles
 * @param {number} baseCost - Coût de base
 * @param {number} growth - Facteur de croissance
 * @param {number} owned - Nombre déjà possédé
 * @returns {number} - Nombre maximum achetable
 */
function calculateMaxBuy(funds, baseCost, growth, owned) {
    if (funds <= 0 || baseCost <= 0) return 0;
    if (growth === 1) return Math.floor(funds / baseCost);

    const currentCost = baseCost * Math.pow(growth, owned);
    if (funds < currentCost) return 0;

    // Formule: n = floor( log( 1 + funds*(g-1)/(baseCost*g^owned) ) / log(g) )
    const ratio = (funds * (growth - 1)) / currentCost;
    const n = Math.floor(Math.log(1 + ratio) / Math.log(growth));

    return Math.max(0, n);
}

/**
 * Calcule le coût du prochain achat
 * @param {number} baseCost
 * @param {number} growth
 * @param {number} owned
 * @returns {number}
 */
function calculateNextCost(baseCost, growth, owned) {
    return baseCost * Math.pow(growth, owned);
}

// Export des fonctions
window.ForgeNumbers = {
    formatNumber,
    formatInt,
    isValidNumber,
    safeNumber,
    calculateBulkCost,
    calculateMaxBuy,
    calculateNextCost
};
