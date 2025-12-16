// ui.js - Interface utilisateur complète

const { $, $$, createElement, formatTime } = window.ForgeUtils;
const { formatNumber, formatInt } = window.ForgeNumbers;

let currentTab = 'production';

/**
 * Initialise l'interface
 */
function initUI() {
    // Event listeners onglets
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Bouton clic manuel
    $('#click-btn').addEventListener('click', () => {
        window.ForgeGenerators.doClick();
        animateClick();
    });

    // Buy mode buttons
    $$('.buy-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setBuyMode(btn.dataset.mode));
    });

    // Prestige buttons
    $('#prestige1-btn').addEventListener('click', handlePrestige1);
    $('#prestige2-btn').addEventListener('click', handlePrestige2);

    // Options buttons
    $('#export-btn').addEventListener('click', exportSave);
    $('#import-btn').addEventListener('click', importSave);
    $('#reset-btn').addEventListener('click', resetGame);
    $('#theme-toggle').addEventListener('click', toggleTheme);

    // Initial render
    render();
}

/**
 * Bascule entre les onglets
 * @param {string} tab
 */
function switchTab(tab) {
    currentTab = tab;

    // Update buttons
    $$('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update content
    $$('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tab}`);
    });

    render();
}

/**
 * Définit le mode d'achat
 * @param {string|number} mode
 */
function setBuyMode(mode) {
    const parsedMode = mode === 'max' ? 'max' : parseInt(mode);
    window.ForgeState.updateState({ buyMode: parsedMode });

    $$('.buy-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode == mode);
    });
}

/**
 * Rendu principal (appelé à chaque frame)
 */
function render() {
    updateHeader();

    if (currentTab === 'production') {
        renderProduction();
    } else if (currentTab === 'upgrades') {
        renderUpgrades();
    } else if (currentTab === 'prestige') {
        renderPrestige();
    } else if (currentTab === 'talents') {
        renderTalents();
    } else if (currentTab === 'stats') {
        renderStats();
    }

    updateBuyModes();
    renderEventBanner();
}

/**
 * Met à jour le header
 */
function updateHeader() {
    const state = window.ForgeState.getState();
    const prodPerSec = window.ForgeGenerators.getTotalProduction();

    $('#energy-display').textContent = formatNumber(state.energy);
    $('#energy-per-sec').textContent = `${formatNumber(prodPerSec)}/s`;
    $('#nuclei-display').textContent = formatInt(state.nuclei);
    $('#fragments-display').textContent = formatInt(state.fragments);

    // Clic value
    const clickValue = window.ForgeGenerators.getClickValue();
    $('#click-value').textContent = formatNumber(clickValue);
}

/**
 * Rendu de l'onglet Production
 */
function renderProduction() {
    const container = $('#generators-list');
    container.innerHTML = '';

    const state = window.ForgeState.getState();

    for (let i = 0; i < 8; i++) {
        const gen = window.ForgeGenerators.getGenerator(i);
        const owned = window.ForgeGenerators.getOwned(i);
        const prod = window.ForgeGenerators.getGeneratorProduction(i);
        const cost = window.ForgeGenerators.getNextCost(i);

        const canAfford = state.energy >= cost;
        const buyMode = state.buyMode;

        // Calcul coût et texte selon mode
        let displayCost = cost;
        let buttonText = 'Acheter';

        if (buyMode !== 1 && buyMode !== 'max') {
            displayCost = window.ForgeGenerators.getBulkCost(i, buyMode);
            buttonText = `Acheter x${buyMode}`;
        } else if (buyMode === 'max') {
            const maxAmount = window.ForgeGenerators.getMaxBuyable(i);
            if (maxAmount > 0) {
                displayCost = window.ForgeGenerators.getBulkCost(i, maxAmount);
                buttonText = `Acheter MAX (${formatInt(maxAmount)})`;
            } else {
                buttonText = 'MAX (0)';
            }
        }

        const card = createElement('div', { className: 'generator-card' });

        card.innerHTML = `
            <div class="gen-header">
                <div class="gen-name">${gen.name}</div>
                <div class="gen-count">${formatInt(owned)}</div>
            </div>
            <div class="gen-info">
                <div class="gen-prod">Production: ${formatNumber(prod)}/s</div>
                <div class="gen-cost">Coût: ${formatNumber(displayCost)} E</div>
            </div>
            <button class="btn-buy ${canAfford ? '' : 'disabled'}" data-gen="${i}">
                ${buttonText}
            </button>
        `;

        card.querySelector('.btn-buy').addEventListener('click', () => buyGeneratorHandler(i));

        container.appendChild(card);
    }
}

/**
 * Handler d'achat de générateur
 * @param {number} index
 */
function buyGeneratorHandler(index) {
    const state = window.ForgeState.getState();
    const mode = state.buyMode;

    if (mode === 'max') {
        window.ForgeGenerators.buyMax(index);
    } else {
        window.ForgeGenerators.buyGenerator(index, mode);
    }
}

/**
 * Rendu de l'onglet Upgrades
 */
function renderUpgrades() {
    const container = $('#upgrades-list');
    container.innerHTML = '';

    const state = window.ForgeState.getState();

    // Catégories
    const categories = [
        { id: 'generator', name: 'Améliorations de Générateurs' },
        { id: 'global', name: 'Améliorations Globales' },
        { id: 'qol', name: 'Qualité de Vie' }
    ];

    categories.forEach(cat => {
        const upgrades = window.ForgeUpgrades.getUpgradesByCategory(cat.id);
        const available = upgrades.filter(u => window.ForgeUpgrades.isUpgradeAvailable(u.id));

        if (available.length === 0) return;

        const section = createElement('div', { className: 'upgrade-section' });
        section.innerHTML = `<h3>${cat.name}</h3>`;

        available.forEach(upgrade => {
            const canAfford = window.ForgeUpgrades.canAffordUpgrade(upgrade.id);

            const card = createElement('div', { className: 'upgrade-card' });
            card.innerHTML = `
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
                <div class="upgrade-cost">Coût: ${formatNumber(upgrade.cost)} E</div>
                <button class="btn-buy ${canAfford ? '' : 'disabled'}" data-upgrade="${upgrade.id}">
                    Acheter
                </button>
            `;

            card.querySelector('.btn-buy').addEventListener('click', () => {
                if (window.ForgeUpgrades.buyUpgrade(upgrade.id)) {
                    renderUpgrades(); // Re-render
                }
            });

            section.appendChild(card);
        });

        container.appendChild(section);
    });

    if (container.children.length === 0) {
        container.innerHTML = '<p class="empty-msg">Tous les upgrades sont achetés ou verrouillés.</p>';
    }
}

/**
 * Rendu de l'onglet Prestige
 */
function renderPrestige() {
    const nucleiGain = window.ForgePrestige.calculateNucleiGain();
    const fragmentsGain = window.ForgePrestige.calculateFragmentsGain();

    $('#nuclei-gain').textContent = formatInt(nucleiGain);
    $('#fragments-gain').textContent = formatInt(fragmentsGain);

    // Mult displays
    const p1Mult = window.ForgePrestige.getPrestige1Multiplier();
    const p2Mult = window.ForgePrestige.getPrestige2Multiplier();

    $('#prestige1-mult').textContent = `x${p1Mult.toFixed(2)}`;
    $('#prestige2-mult').textContent = `x${p2Mult.toFixed(2)}`;

    // Button states
    const p1Btn = $('#prestige1-btn');
    const p2Btn = $('#prestige2-btn');

    p1Btn.disabled = nucleiGain <= 0;
    p2Btn.disabled = fragmentsGain <= 0;

    p1Btn.classList.toggle('recommended', window.ForgePrestige.isPrestige1Recommended());
    p2Btn.classList.toggle('recommended', window.ForgePrestige.isPrestige2Recommended());
}

/**
 * Handlers prestige
 */
function handlePrestige1() {
    if (!window.ForgeUtils.confirmAction('Voulez-vous vraiment faire un Prestige 1 ? Cela réinitialisera votre progression (hors Noyaux).')) {
        return;
    }

    if (window.ForgePrestige.doPrestige1()) {
        showNotification('✨ Prestige 1 effectué ! Noyaux gagnés !', 'success');
        switchTab('production');
    }
}

function handlePrestige2() {
    if (!window.ForgeUtils.confirmAction('Voulez-vous vraiment faire un Prestige 2 ? Cela réinitialisera TOUT (hors Fragments et Talents).')) {
        return;
    }

    if (window.ForgePrestige.doPrestige2()) {
        showNotification('🌟 Prestige 2 effectué ! Fragments gagnés !', 'success');
        switchTab('production');
    }
}

/**
 * Rendu de l'onglet Talents
 */
function renderTalents() {
    const state = window.ForgeState.getState();
    const container = $('#talents-list');
    container.innerHTML = '';

    $('#talent-points').textContent = state.talentPoints;

    const talents = window.ForgeTalents.getAllTalents();

    talents.forEach(talent => {
        const level = window.ForgeTalents.getTalentLevel(talent.id);
        const canUpgrade = window.ForgeTalents.canUpgradeTalent(talent.id);

        const card = createElement('div', { className: 'talent-card' });
        card.innerHTML = `
            <div class="talent-header">
                <div class="talent-name">${talent.name}</div>
                <div class="talent-level">${level}/${talent.maxRank}</div>
            </div>
            <div class="talent-desc">${talent.description}</div>
            <button class="btn-talent ${canUpgrade ? '' : 'disabled'}" data-talent="${talent.id}">
                Améliorer (1 point)
            </button>
        `;

        card.querySelector('.btn-talent').addEventListener('click', () => {
            if (window.ForgeTalents.upgradeTalent(talent.id)) {
                renderTalents();
            }
        });

        container.appendChild(card);
    });
}

/**
 * Rendu de l'onglet Stats
 */
function renderStats() {
    const state = window.ForgeState.getState();

    $('#stat-lifetime').textContent = formatNumber(state.lifetimeEnergy);
    $('#stat-bestrun').textContent = formatNumber(state.bestRunEnergy);
    $('#stat-clicks').textContent = formatInt(state.totalClicks);
    $('#stat-prestiges').textContent = formatInt(state.totalPrestiges);
    $('#stat-time').textContent = formatTime(state.timePlayed);
}

/**
 * Met à jour l'affichage des modes d'achat
 */
function updateBuyModes() {
    const unlocked = window.ForgeUpgrades.getUnlockedBuyModes();

    $$('.buy-mode-btn').forEach(btn => {
        const mode = btn.dataset.mode;
        btn.style.display = unlocked.includes(mode) || unlocked.includes(parseInt(mode)) ? 'inline-block' : 'none';
    });
}

/**
 * Rendu de la bannière d'événement
 */
function renderEventBanner() {
    const event = window.ForgeUtils.getActiveEvent();
    const banner = $('#event-banner');

    if (!event) {
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'block';

    if (event.type === 'surge') {
        banner.textContent = `⚡ SURTENSION: Production x2 (${Math.ceil(event.timeLeft)}s)`;
        banner.className = 'event-banner surge';
    } else {
        banner.textContent = `💎 STABILITÉ: Coûts -10% (${Math.ceil(event.timeLeft)}s)`;
        banner.className = 'event-banner stability';
    }
}

/**
 * Animation de clic
 */
function animateClick() {
    const btn = $('#click-btn');
    btn.classList.add('clicked');
    setTimeout(() => btn.classList.remove('clicked'), 100);

    // Particule
    const particle = createElement('div', {
        className: 'click-particle',
        style: {
            left: '50%',
            top: '50%'
        }
    }, `+${formatNumber(window.ForgeGenerators.getClickValue())}`);

    btn.parentElement.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
}

/**
 * Affiche une notification
 * @param {string} message
 * @param {string} type
 */
function showNotification(message, type = 'info') {
    const notif = createElement('div', {
        className: `notification ${type}`
    }, message);

    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

/**
 * Export de la sauvegarde
 */
function exportSave() {
    const data = window.ForgeState.exportSave();
    navigator.clipboard.writeText(data).then(() => {
        showNotification('Sauvegarde copiée !', 'success');
    });
}

/**
 * Import de la sauvegarde
 */
function importSave() {
    const data = prompt('Collez votre sauvegarde :');
    if (!data) return;

    if (window.ForgeState.importSave(data)) {
        showNotification('Sauvegarde importée !', 'success');
        location.reload();
    } else {
        showNotification('Erreur d\'import', 'error');
    }
}

/**
 * Reset du jeu
 */
function resetGame() {
    if (!window.ForgeUtils.confirmAction('ATTENTION : Voulez-vous vraiment réinitialiser TOUT le jeu ? Cette action est irréversible.')) {
        return;
    }

    window.ForgeState.resetGame();
    location.reload();
}

/**
 * Bascule thème
 */
function toggleTheme() {
    const state = window.ForgeState.getState();
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';

    window.ForgeState.updateState({ theme: newTheme });
    document.body.className = `theme-${newTheme}`;

    $('#theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Export global
window.ForgeUI = {
    initUI,
    render,
    showNotification
};
