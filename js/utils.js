// utils.js - Fonctions utilitaires

/**
 * Sélecteur DOM simplifié
 * @param {string} selector
 * @returns {Element}
 */
function $(selector) {
    return document.querySelector(selector);
}

/**
 * Sélecteur DOM multiple simplifié
 * @param {string} selector
 * @returns {NodeList}
 */
function $$(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Crée un élément HTML
 * @param {string} tag
 * @param {object} attrs
 * @param {string} content
 * @returns {Element}
 */
function createElement(tag, attrs = {}, content = '') {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });

    if (content) {
        el.innerHTML = content;
    }

    return el;
}

/**
 * Formate le temps en secondes
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Gestion d'événements rares
 */
let lastEventCheck = Date.now();

function checkForEvents() {
    const state = window.ForgeState.getState();
    const now = Date.now();

    // Ne déclenche pas pendant un événement actif
    if (state.activeEvent && now < state.eventEndTime) {
        return;
    }

    // Intervalle entre événements: 8-15 minutes
    const minInterval = 8 * 60 * 1000;
    const maxInterval = 15 * 60 * 1000;
    const timeSinceLastEvent = now - (state.lastEventTime || 0);

    if (timeSinceLastEvent < minInterval) {
        return;
    }

    // Probabilité d'événement (toutes les 10 secondes)
    if (now - lastEventCheck < 10000) {
        return;
    }

    lastEventCheck = now;

    // Random roll
    const roll = Math.random();
    const chance = 0.001; // 0.1% par check = événement rare

    if (roll < chance) {
        triggerRandomEvent();
    }
}

function triggerRandomEvent() {
    const events = ['surge', 'stability'];
    const event = events[Math.floor(Math.random() * events.length)];

    const state = window.ForgeState.getState();
    const now = Date.now();

    window.ForgeState.updateState({
        activeEvent: event,
        eventEndTime: now + 30000, // 30 secondes
        lastEventTime: now
    });

    // Notification
    if (window.ForgeUI) {
        if (event === 'surge') {
            window.ForgeUI.showNotification('⚡ Surtension ! Production x2 pendant 30s', 'event');
        } else {
            window.ForgeUI.showNotification('💎 Stabilité ! Coûts -10% pendant 30s', 'event');
        }
    }
}

/**
 * Vérifie si un événement est actif
 * @returns {object|null}
 */
function getActiveEvent() {
    const state = window.ForgeState.getState();
    const now = Date.now();

    if (state.activeEvent && now < state.eventEndTime) {
        return {
            type: state.activeEvent,
            timeLeft: (state.eventEndTime - now) / 1000
        };
    }

    return null;
}

/**
 * Confirme une action importante
 * @param {string} message
 * @returns {boolean}
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * Debounce une fonction
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export global
window.ForgeUtils = {
    $,
    $$,
    createElement,
    formatTime,
    checkForEvents,
    getActiveEvent,
    confirmAction,
    debounce
};
