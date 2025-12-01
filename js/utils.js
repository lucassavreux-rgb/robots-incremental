/**
 * =====================================================
 * UTILS.JS - Fonctions Utilitaires
 * =====================================================
 * Fonctions helper pour le jeu
 */

/**
 * Gère le changement d'onglets
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Activer l'onglet cliqué
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

/**
 * Crée un effet visuel lors du clic
 */
function createClickEffect(x, y, amount, isCritical = false) {
    const container = document.getElementById('click-effect-container');
    const effect = document.createElement('div');
    effect.classList.add('click-effect');
    effect.textContent = '+' + formatNumber(amount);

    if (isCritical) {
        effect.style.color = '#ff6b00';
        effect.style.fontSize = '2em';
        effect.textContent = 'CRIT! +' + formatNumber(amount);
    }

    // Position relative au container
    const rect = container.getBoundingClientRect();
    effect.style.left = (x - rect.left) + 'px';
    effect.style.top = (y - rect.top) + 'px';

    container.appendChild(effect);

    // Supprimer après l'animation
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

/**
 * Met à jour l'affichage des stats principales
 */
function updateMainStats() {
    document.getElementById('coins-display').textContent = formatNumber(gameState.coins);
    document.getElementById('cpc-display').textContent = formatNumber(gameState.cpc);
    document.getElementById('cps-display').textContent = formatNumber(gameState.cps);
    document.getElementById('rp-display').textContent = formatNumber(gameState.prestigePoints);
}

/**
 * Met à jour les statistiques
 */
function updateStatsDisplay() {
    document.getElementById('total-clicks').textContent = formatNumber(gameState.stats.totalClicks);
    document.getElementById('stats-total-coins').textContent = formatNumber(gameState.stats.totalCoinsEarned);
    document.getElementById('playtime').textContent = formatTime(gameState.stats.playtime);
    document.getElementById('critical-hits').textContent = formatNumber(gameState.stats.criticalHits);
    document.getElementById('bosses-defeated').textContent = formatNumber(gameState.stats.bossesDefeated);
}

/**
 * Formate un temps en secondes vers HH:MM:SS
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
 * Formate un temps en millisecondes vers MM:SS
 */
function formatTimeMS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Vérifie si le joueur peut acheter quelque chose
 */
function canAfford(cost) {
    // Toujours comparer en nombres normaux pour simplifier
    const costNum = (typeof cost === 'number') ? cost : (cost.toNumber ? cost.toNumber() : parseFloat(cost));
    const coinsNum = (typeof gameState.coins === 'number') ? gameState.coins : (gameState.coins.toNumber ? gameState.coins.toNumber() : parseFloat(gameState.coins));

    console.log('canAfford check:', { coins: coinsNum, cost: costNum, result: coinsNum >= costNum });

    return coinsNum >= costNum;
}

/**
 * Déduit un coût des coins du joueur
 */
function spendCoins(cost) {
    const before = gameState.coins;

    if (typeof cost === 'number') {
        gameState.coins -= cost;
    } else {
        gameState.coins = toBigNumber(gameState.coins).subtract(cost).toNumber();
    }

    console.log('spendCoins:', { before, cost, after: gameState.coins });

    updateMainStats();
}

/**
 * Ajoute des coins au joueur
 */
function addCoins(amount) {
    const oldCoins = gameState.coins;
    if (typeof amount === 'number') {
        gameState.coins += amount;
    } else {
        gameState.coins = toBigNumber(gameState.coins).add(amount).toNumber();
    }
    gameState.stats.totalCoinsEarned += (gameState.coins - oldCoins);
    updateMainStats();
}

/**
 * Calcule le CPC total avec tous les bonus
 */
function calculateTotalCPC() {
    let cpc = gameState.baseCPC;

    // Bonus des upgrades CPC
    gameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
        if (upgrade && upgrade.type === 'cpc') {
            cpc *= upgrade.effect;
        }
    });

    // Bonus des talents
    const cpcTalentBonus = calculateTalentBonus('cpc_bonus');
    cpc *= (1 + cpcTalentBonus);

    // Bonus des artefacts
    const cpcArtefactMult = calculateArtefactBonus('cpc_mult');
    cpc *= cpcArtefactMult;

    // Bonus du prestige
    const prestigeCPCBonus = gameState.prestigePoints * 0.01; // 1% par RP
    cpc *= (1 + prestigeCPCBonus);

    // Bonus global
    const globalMult = calculateGlobalMultiplier();
    cpc *= globalMult;

    return cpc;
}

/**
 * Calcule le CPS total avec tous les bonus
 */
function calculateTotalCPS() {
    let cps = 0;

    // Production de base des générateurs
    gameState.generators.forEach(gen => {
        const genData = GENERATORS_DATA.find(g => g.id === gen.id);
        if (!genData) return;

        let genProduction = genData.baseProduction * gen.level;

        // Bonus des milestones
        genData.milestones.forEach(milestone => {
            if (gen.level >= milestone) {
                genProduction *= 2;
            }
        });

        cps += genProduction;
    });

    // Bonus des upgrades CPS
    gameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
        if (upgrade && upgrade.type === 'cps') {
            cps *= upgrade.effect;
        }
    });

    // Bonus des talents
    const cpsTalentBonus = calculateTalentBonus('cps_bonus');
    cps *= (1 + cpsTalentBonus);

    // Bonus des pets
    const cpsPetBonus = calculatePetBonus('cps_bonus');
    cps *= (1 + cpsPetBonus);

    // Bonus des artefacts
    const cpsArtefactMult = calculateArtefactBonus('cps_mult');
    cps *= cpsArtefactMult;

    // Bonus du prestige
    const prestigeCPSBonus = gameState.prestigePoints * 0.02; // 2% par RP
    cps *= (1 + prestigeCPSBonus);

    // Bonus global
    const globalMult = calculateGlobalMultiplier();
    cps *= globalMult;

    // Auto-click bonus (talent)
    const autoClickBonus = calculateTalentBonus('auto_click');
    if (autoClickBonus > 0) {
        cps += calculateTotalCPC() * autoClickBonus;
    }

    // Événements actifs
    gameState.activeEvents.forEach(event => {
        if (event.type === 'cps_boost') {
            cps *= event.multiplier;
        }
    });

    return cps;
}

/**
 * Calcule le multiplicateur global de tous les bonus
 */
function calculateGlobalMultiplier() {
    let mult = 1;

    // Bonus des artefacts globaux
    mult *= calculateArtefactBonus('global_mult');

    // Bonus des pets globaux
    const petGlobalBonus = calculatePetBonus('global_mult');
    mult *= (1 + petGlobalBonus);

    return mult;
}

/**
 * Calcule le bonus des talents d'un type donné
 */
function calculateTalentBonus(type) {
    let bonus = 0;

    Object.values(gameState.talents).forEach(talentList => {
        talentList.forEach(talentProgress => {
            const talent = findTalentById(talentProgress.id);
            if (talent && talent.type === type) {
                bonus += talent.effect * talentProgress.level;
            }
        });
    });

    return bonus;
}

/**
 * Trouve un talent par son ID
 */
function findTalentById(id) {
    for (const branch in TALENTS_DATA) {
        const talent = TALENTS_DATA[branch].find(t => t.id === id);
        if (talent) return talent;
    }
    return null;
}

/**
 * Calcule le bonus des pets d'un type donné
 */
function calculatePetBonus(type) {
    let bonus = 0;

    gameState.pets.forEach(petProgress => {
        const petData = PETS_DATA.find(p => p.id === petProgress.id);
        if (petData && petData.passiveEffect.type === type) {
            bonus += petData.passiveEffect.baseValue * petProgress.level;
        }
    });

    return bonus;
}

/**
 * Calcule le bonus des artefacts d'un type donné
 */
function calculateArtefactBonus(type) {
    let mult = 1;
    let bonus = 0;

    gameState.equippedArtefacts.forEach(artefactId => {
        const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
        if (!artefact) return;

        if (artefact.effect.type === type) {
            if (type.includes('mult')) {
                mult *= artefact.effect.value;
            } else {
                bonus += artefact.effect.value;
            }
        }
    });

    // Set bonus
    const setBonus = calculateSetBonus();
    if (setBonus && setBonus.type === type) {
        if (type.includes('mult')) {
            mult *= setBonus.value;
        } else {
            bonus += setBonus.value;
        }
    }

    return type.includes('mult') ? mult : bonus;
}

/**
 * Calcule le set bonus actif
 */
function calculateSetBonus() {
    const setCounts = {};

    // Compter les artefacts par set
    gameState.equippedArtefacts.forEach(artefactId => {
        const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
        if (artefact && artefact.set) {
            setCounts[artefact.set] = (setCounts[artefact.set] || 0) + 1;
        }
    });

    // Trouver le meilleur set bonus
    let bestBonus = null;
    for (const setName in setCounts) {
        const count = setCounts[setName];
        const setData = ARTEFACT_SETS[setName];
        if (setData && setData.bonuses[count]) {
            bestBonus = setData.bonuses[count];
        }
    }

    return bestBonus;
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message, type = 'info') {
    // Simple console log pour l'instant
    // Peut être amélioré avec un système de toast
    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Ajoute un événement actif
 */
function addActiveEvent(eventType, multiplier, duration) {
    const event = {
        type: eventType,
        multiplier: multiplier,
        endTime: Date.now() + duration
    };
    gameState.activeEvents.push(event);
    updateActiveEventsDisplay();
}

/**
 * Met à jour l'affichage des événements actifs
 */
function updateActiveEventsDisplay() {
    const container = document.getElementById('active-events');

    if (gameState.activeEvents.length === 0) {
        container.innerHTML = '<p class="no-events">Aucun événement actif</p>';
        return;
    }

    container.innerHTML = '';
    gameState.activeEvents.forEach(event => {
        const timeLeft = Math.max(0, event.endTime - Date.now());
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
            <div class="event-name">${getEventName(event.type)} x${event.multiplier}</div>
            <div class="event-duration">${formatTimeMS(timeLeft)}</div>
        `;
        container.appendChild(eventDiv);
    });
}

/**
 * Obtient le nom d'un type d'événement
 */
function getEventName(type) {
    const names = {
        'cps_boost': '⚡ Boost CPS',
        'cpc_boost': '💥 Boost CPC',
        'frenzy': '🔥 Frenzy Mode',
        'power_boost': '🚀 Power Boost'
    };
    return names[type] || 'Événement';
}

/**
 * Nettoie les événements expirés
 */
function cleanupExpiredEvents() {
    const now = Date.now();
    gameState.activeEvents = gameState.activeEvents.filter(event => event.endTime > now);
    updateActiveEventsDisplay();
}
