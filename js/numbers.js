/**
 * =====================================================
 * NUMBERS.JS - Big Number System
 * =====================================================
 * Gère les grands nombres pour éviter Infinity
 * Implémentation basée sur mantissa + exponent
 */

class BigNumber {
    constructor(value) {
        if (value instanceof BigNumber) {
            this.mantissa = value.mantissa;
            this.exponent = value.exponent;
        } else if (typeof value === 'string') {
            this._fromString(value);
        } else if (typeof value === 'number') {
            this._fromNumber(value);
        } else {
            this.mantissa = 0;
            this.exponent = 0;
        }
        this._normalize();
    }

    _fromNumber(num) {
        if (num === 0) {
            this.mantissa = 0;
            this.exponent = 0;
            return;
        }
        const absNum = Math.abs(num);
        const sign = num < 0 ? -1 : 1;
        this.exponent = Math.floor(Math.log10(absNum));
        this.mantissa = sign * (absNum / Math.pow(10, this.exponent));
    }

    _fromString(str) {
        const num = parseFloat(str);
        this._fromNumber(num);
    }

    _normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            return;
        }
        while (Math.abs(this.mantissa) >= 10) {
            this.mantissa /= 10;
            this.exponent++;
        }
        while (Math.abs(this.mantissa) < 1 && this.mantissa !== 0) {
            this.mantissa *= 10;
            this.exponent--;
        }
    }

    add(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        if (this.mantissa === 0) return new BigNumber(bn);
        if (bn.mantissa === 0) return new BigNumber(this);

        const diff = this.exponent - bn.exponent;
        if (Math.abs(diff) > 15) {
            return diff > 0 ? new BigNumber(this) : new BigNumber(bn);
        }

        const m1 = this.mantissa * Math.pow(10, this.exponent);
        const m2 = bn.mantissa * Math.pow(10, bn.exponent);
        return new BigNumber(m1 + m2);
    }

    subtract(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        const negated = new BigNumber(bn);
        negated.mantissa = -negated.mantissa;
        return this.add(negated);
    }

    multiply(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        const result = new BigNumber(0);
        result.mantissa = this.mantissa * bn.mantissa;
        result.exponent = this.exponent + bn.exponent;
        result._normalize();
        return result;
    }

    divide(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        if (bn.mantissa === 0) return new BigNumber(Infinity);
        const result = new BigNumber(0);
        result.mantissa = this.mantissa / bn.mantissa;
        result.exponent = this.exponent - bn.exponent;
        result._normalize();
        return result;
    }

    pow(exponent) {
        if (exponent === 0) return new BigNumber(1);
        if (this.mantissa === 0) return new BigNumber(0);

        const result = new BigNumber(0);
        result.mantissa = Math.pow(this.mantissa, exponent);
        result.exponent = this.exponent * exponent;
        result._normalize();
        return result;
    }

    sqrt() {
        if (this.mantissa < 0) return new BigNumber(NaN);
        const result = new BigNumber(0);

        if (this.exponent % 2 === 0) {
            result.mantissa = Math.sqrt(this.mantissa);
            result.exponent = this.exponent / 2;
        } else {
            result.mantissa = Math.sqrt(this.mantissa * 10);
            result.exponent = (this.exponent - 1) / 2;
        }
        result._normalize();
        return result;
    }

    floor() {
        const num = this.toNumber();
        if (!isFinite(num)) return new BigNumber(this);
        return new BigNumber(Math.floor(num));
    }

    max(other) {
        return this.greaterThan(other) ? new BigNumber(this) : new BigNumber(other);
    }

    min(other) {
        return this.lessThan(other) ? new BigNumber(this) : new BigNumber(other);
    }

    greaterThan(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        if (this.exponent !== bn.exponent) {
            return this.exponent > bn.exponent;
        }
        return this.mantissa > bn.mantissa;
    }

    greaterThanOrEqual(other) {
        return this.greaterThan(other) || this.equals(other);
    }

    lessThan(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        return !this.greaterThanOrEqual(bn);
    }

    lessThanOrEqual(other) {
        return !this.greaterThan(other);
    }

    equals(other) {
        const bn = other instanceof BigNumber ? other : new BigNumber(other);
        return this.mantissa === bn.mantissa && this.exponent === bn.exponent;
    }

    toNumber() {
        if (this.exponent > 308) return Infinity;
        if (this.exponent < -308) return 0;
        return this.mantissa * Math.pow(10, this.exponent);
    }

    toString() {
        if (this.mantissa === 0) return "0";
        return this.mantissa.toFixed(2) + "e" + this.exponent;
    }

    clone() {
        return new BigNumber(this);
    }
}

/**
 * Format un BigNumber en string lisible avec suffixes
 */
function formatNumber(value) {
    const bn = value instanceof BigNumber ? value : new BigNumber(value);

    if (bn.mantissa === 0) return "0";

    const suffixes = [
        '', 'K', 'M', 'B', 'T',
        'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
        'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid',
        'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg'
    ];

    let exp = bn.exponent;
    let mant = bn.mantissa;

    // Ajuster pour avoir la mantisse entre 1 et 999.99
    while (Math.abs(mant) >= 1000 && exp > 0) {
        mant /= 10;
        exp++;
    }

    const suffixIndex = Math.floor(exp / 3);

    if (suffixIndex >= suffixes.length) {
        // Notation scientifique
        return mant.toFixed(2) + "e" + exp;
    }

    if (suffixIndex === 0) {
        // Nombres < 1000
        const num = mant * Math.pow(10, exp);
        if (num < 10) return num.toFixed(2);
        if (num < 100) return num.toFixed(1);
        return Math.floor(num).toString();
    }

    // Avec suffixe
    const displayMant = mant * Math.pow(10, exp % 3);
    return displayMant.toFixed(2) + suffixes[suffixIndex];
}

/**
 * Crée un BigNumber à partir de n'importe quelle valeur
 */
function toBigNumber(value) {
    if (value instanceof BigNumber) return value;
    return new BigNumber(value);
}
