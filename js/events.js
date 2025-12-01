/**
 * =====================================================
 * EVENTS.JS - Temporary Events System
 * =====================================================
 * Gestion des événements temporaires
 */

/**
 * Déclenche un événement aléatoire
 */
function triggerRandomEvent() {
    // 1% de chance par seconde
    if (Math.random() > 0.01) return;

    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    // Ajouter l'événement
    const now = Date.now();
    GameState.activeEvents.push({
        id: event.id,
        type: event.type,
        multiplier: event.multiplier,
        endTime: now + (event.duration * 1000)
    });

    recalculateProduction();
    updateStatsUI();

    showNotification(`Event: ${event.name}! ${event.description}`, "info");
}

/**
 * Nettoie les événements expirés
 */
function cleanupExpiredEvents() {
    const now = Date.now();
    const before = GameState.activeEvents.length;

    GameState.activeEvents = GameState.activeEvents.filter(event => event.endTime > now);

    if (GameState.activeEvents.length < before) {
        recalculateProduction();
        updateStatsUI();
    }
}

/**
 * Affiche les événements actifs
 */
function updateEventsUI() {
    const container = document.getElementById('active-events');
    if (!container) return;

    if (GameState.activeEvents.length === 0) {
        container.innerHTML = '<p>No active events</p>';
        return;
    }

    container.innerHTML = '';

    GameState.activeEvents.forEach(event => {
        const eventData = EVENTS.find(e => e.id === event.id);
        if (!eventData) return;

        const now = Date.now();
        const remaining = Math.ceil((event.endTime - now) / 1000);

        const div = document.createElement('div');
        div.className = 'event-item';
        div.innerHTML = `
            <div class="event-name">${eventData.name}</div>
            <div class="event-description">${eventData.description}</div>
            <div class="event-timer">${remaining}s remaining</div>
        `;

        container.appendChild(div);
    });
}
