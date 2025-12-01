/**
 * =====================================================
 * NUMBERS.JS - Gestion des Grands Nombres
 * =====================================================
 * Système BigNumber maison pour gérer les nombres énormes
 * Format: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc, etc.
 * Jamais Infinity !
 */

// Suffixes pour les grands nombres
const NUMBER_SUFFIXES = [
    '', 'K', 'M', 'B', 'T', // 10^0 à 10^12
    'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', // 10^15 à 10^33
    'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', // 10^36 à 10^63
    'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg', // 10^66 à 10^93
    'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OcTg', 'NoTg', 'Qd' // 10^96 à 10^123
];

/**
 * Classe BigNumber - Représente un nombre sous forme mantisse + exposant
 */
class BigNumber {
    constructor(mantissa = 0, exponent = 0) {
        this.mantissa = mantissa;
        this.exponent = exponent;
        this.normalize();
    }

    /**
     * Normalise le nombre (mantisse entre 1 et 1000)
     */
    normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            return;
        }

        // Éviter Infinity
        if (!isFinite(this.mantissa)) {
            this.mantissa = 999.99;
            this.exponent = 308;
            return;
        }

        // Normaliser pour que mantisse soit entre 1 et 1000
        while (this.mantissa >= 1000 && this.exponent < 308) {
            this.mantissa /= 1000;
            this.exponent += 3;
        }

        while (this.mantissa < 1 && this.mantissa > 0 && this.exponent > 0) {
            this.mantissa *= 1000;
            this.exponent -= 3;
        }

        // Si mantisse < 1 et exposant = 0, on garde tel quel
        if (this.mantissa < 1 && this.exponent === 0) {
            // OK, c'est un petit nombre
        }
    }

    /**
     * Convertit vers un nombre normal (si possible)
     */
    toNumber() {
        if (this.exponent === 0) {
            return this.mantissa;
        }
        if (this.exponent > 308) {
            return Infinity;
        }
        return this.mantissa * Math.pow(10, this.exponent);
    }

    /**
     * Crée un BigNumber depuis un nombre normal
     */
    static fromNumber(num) {
        if (!isFinite(num)) {
            return new BigNumber(999.99, 308);
        }
        if (num === 0) {
            return new BigNumber(0, 0);
        }

        const exponent = Math.floor(Math.log10(Math.abs(num)));
        const mantissa = num / Math.pow(10, exponent);
        return new BigNumber(mantissa, exponent);
    }

    /**
     * Addition
     */
    add(other) {
        if (typeof other === 'number') {
            other = BigNumber.fromNumber(other);
        }

        if (this.exponent === other.exponent) {
            return new BigNumber(this.mantissa + other.mantissa, this.exponent);
        }

        // Si différence d'exposant > 15, le plus grand gagne
        if (Math.abs(this.exponent - other.exponent) > 15) {
            return this.exponent > other.exponent ? this.clone() : other.clone();
        }

        // Convertir au même exposant
        if (this.exponent > other.exponent) {
            const diff = this.exponent - other.exponent;
            const otherMantissa = other.mantissa / Math.pow(10, diff);
            return new BigNumber(this.mantissa + otherMantissa, this.exponent);
        } else {
            const diff = other.exponent - this.exponent;
            const thisMantissa = this.mantissa / Math.pow(10, diff);
            return new BigNumber(thisMantissa + other.mantissa, other.exponent);
        }
    }

    /**
     * Soustraction
     */
    subtract(other) {
        if (typeof other === 'number') {
            other = BigNumber.fromNumber(other);
        }

        if (this.exponent === other.exponent) {
            const result = this.mantissa - other.mantissa;
            if (result < 0) return new BigNumber(0, 0);
            return new BigNumber(result, this.exponent);
        }

        if (this.exponent > other.exponent) {
            const diff = this.exponent - other.exponent;
            const otherMantissa = other.mantissa / Math.pow(10, diff);
            const result = this.mantissa - otherMantissa;
            if (result < 0) return new BigNumber(0, 0);
            return new BigNumber(result, this.exponent);
        } else {
            // other > this, donc résultat négatif = 0
            return new BigNumber(0, 0);
        }
    }

    /**
     * Multiplication
     */
    multiply(other) {
        if (typeof other === 'number') {
            other = BigNumber.fromNumber(other);
        }

        const newMantissa = this.mantissa * other.mantissa;
        const newExponent = this.exponent + other.exponent;
        return new BigNumber(newMantissa, newExponent);
    }

    /**
     * Division
     */
    divide(other) {
        if (typeof other === 'number') {
            other = BigNumber.fromNumber(other);
        }

        if (other.mantissa === 0) {
            return new BigNumber(0, 0);
        }

        const newMantissa = this.mantissa / other.mantissa;
        const newExponent = this.exponent - other.exponent;
        return new BigNumber(newMantissa, newExponent);
    }

    /**
     * Puissance
     */
    pow(power) {
        if (power === 0) return new BigNumber(1, 0);
        if (power === 1) return this.clone();

        // Pour grandes puissances, utiliser log
        const logValue = Math.log10(this.mantissa) + this.exponent;
        const newLogValue = logValue * power;
        const newExponent = Math.floor(newLogValue);
        const newMantissa = Math.pow(10, newLogValue - newExponent);
        return new BigNumber(newMantissa, newExponent);
    }

    /**
     * Comparaisons
     */
    greaterThan(other) {
        if (typeof other === 'number') {
            other = BigNumber.fromNumber(other);
        }
        if (this.exponent > other.exponent) return true;
        if (this.exponent < other.exponent) return false;
        return this.mantissa > other.mantissa;
    }

    greaterThanOrEqual(other) {
        return this.greaterThan(other) || this.equals(other);
    }

    lessThan(other) {
        return !this.greaterThanOrEqual(other);
    }

    lessThanOrEqual(other) {
        return !this.greaterThan(other);
    }

    equals(other) {
        if (typeof other === 'number') {
            other = BigNumber.fromNumber(other);
        }
        return this.exponent === other.exponent &&
               Math.abs(this.mantissa - other.mantissa) < 0.0001;
    }

    /**
     * Clone
     */
    clone() {
        return new BigNumber(this.mantissa, this.exponent);
    }

    /**
     * Formate le nombre pour affichage
     */
    format(decimals = 2) {
        if (this.mantissa === 0) return '0';

        // Pour petits nombres (< 1000)
        if (this.exponent === 0 && this.mantissa < 1000) {
            return this.mantissa.toFixed(decimals);
        }

        // Calculer l'index du suffixe (chaque suffixe = 3 exposants)
        const suffixIndex = Math.floor(this.exponent / 3);

        if (suffixIndex < NUMBER_SUFFIXES.length) {
            // Utiliser le suffixe
            const displayMantissa = this.mantissa * Math.pow(10, this.exponent % 3);
            return displayMantissa.toFixed(decimals) + NUMBER_SUFFIXES[suffixIndex];
        } else {
            // Notation scientifique pour nombres ultra-grands
            return this.mantissa.toFixed(decimals) + 'e' + this.exponent;
        }
    }

    /**
     * Conversion JSON
     */
    toJSON() {
        return {
            mantissa: this.mantissa,
            exponent: this.exponent
        };
    }

    static fromJSON(json) {
        if (!json || typeof json !== 'object') {
            return new BigNumber(0, 0);
        }
        return new BigNumber(json.mantissa || 0, json.exponent || 0);
    }
}

/**
 * Fonction helper pour formater n'importe quel nombre
 */
function formatNumber(value, decimals = 2) {
    if (value instanceof BigNumber) {
        return value.format(decimals);
    }

    if (typeof value === 'number') {
        if (value < 1000) {
            return value.toFixed(decimals);
        }
        return BigNumber.fromNumber(value).format(decimals);
    }

    return '0';
}

/**
 * Convertit une valeur en BigNumber si nécessaire
 */
function toBigNumber(value) {
    if (value instanceof BigNumber) {
        return value;
    }
    if (typeof value === 'number') {
        return BigNumber.fromNumber(value);
    }
    return new BigNumber(0, 0);
}
