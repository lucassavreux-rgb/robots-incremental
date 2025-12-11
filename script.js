// ===== ÉTAT DU JEU =====
let gameState = {
    dna: 0,
    dnaSold: 0,
    funds: 0,
    totalRevenue: 0,
    sellPrice: 0.05,
    baseDemand: 0.5,

    // Production
    productionRate: 0,
    autoSequencers: 0,
    autoSynthesizers: 0,

    // Computational
    processors: 0,
    memory: 0,
    operations: 0,

    // Upgrades achetés
    upgrades: {},

    // Projets débloqués
    unlockedProjects: [],
    completedProjects: [],

    // Phase du jeu
    phase: 1,

    // Stats
    tickCount: 0
};

// ===== UPGRADES DISPONIBLES =====
const UPGRADES = {
    autoSequencer: {
        name: 'Séquenceur Auto',
        desc: 'Produit 1 ADN/sec',
        baseCost: 5,
        costMultiplier: 1.15,
        count: 0,
        effect: () => {
            gameState.autoSequencers++;
            updateProductionRate();
        }
    },
    improvedSequencer: {
        name: 'Séquenceur Amélioré',
        desc: 'Les séquenceurs produisent 2x plus vite',
        cost: 100,
        unlocked: false,
        bought: false,
        requirement: () => gameState.autoSequencers >= 5,
        effect: () => {
            gameState.upgrades.improvedSequencer = true;
            updateProductionRate();
        }
    },
    autoSynthesizer: {
        name: 'Synthétiseur Auto',
        desc: 'Produit 5 ADN/sec',
        baseCost: 50,
        costMultiplier: 1.18,
        count: 0,
        requirement: () => gameState.autoSequencers >= 10,
        effect: () => {
            gameState.autoSynthesizers++;
            updateProductionRate();
        }
    },
    marketingCampaign: {
        name: 'Campagne Marketing',
        desc: 'Augmente la demande de +10%',
        cost: 200,
        unlocked: false,
        bought: false,
        requirement: () => gameState.dnaSold >= 100,
        effect: () => {
            gameState.baseDemand += 0.1;
            gameState.upgrades.marketingCampaign = true;
        }
    },
    bulkSelling: {
        name: 'Vente en Gros',
        desc: 'Vente automatique activée',
        cost: 150,
        unlocked: false,
        bought: false,
        requirement: () => gameState.dnaSold >= 50,
        effect: () => {
            gameState.upgrades.bulkSelling = true;
            addLog('Vente automatique activée !', 'success');
        }
    },
    quantumProcessor: {
        name: 'Processeur Quantique',
        desc: 'Débloque le calcul computationnel',
        cost: 500,
        unlocked: false,
        bought: false,
        requirement: () => gameState.totalRevenue >= 1000,
        effect: () => {
            gameState.upgrades.quantumProcessor = true;
            document.getElementById('computation-section').style.display = 'block';
            addLog('Calcul computationnel débloqué !', 'success');
        }
    }
};

// ===== PROJETS DE RECHERCHE =====
const PROJECTS = [
    {
        id: 'expandedMemory',
        name: 'Mémoire Étendue',
        desc: 'Stockage d\'ADN augmenté',
        cost: { funds: 1000 },
        requirement: () => gameState.totalRevenue >= 500,
        effect: () => {
            addLog('Capacité de stockage augmentée !', 'success');
        }
    },
    {
        id: 'neuralNetwork',
        name: 'Réseau Neural',
        desc: 'Optimise la production automatique',
        cost: { funds: 2000, operations: 1000 },
        requirement: () => gameState.processors >= 5,
        effect: () => {
            gameState.productionRate *= 1.5;
            addLog('Production optimisée par IA !', 'success');
        }
    },
    {
        id: 'globalExpansion',
        name: 'Expansion Mondiale',
        desc: 'Débloque de nouveaux marchés',
        cost: { funds: 5000 },
        requirement: () => gameState.dnaSold >= 10000,
        effect: () => {
            gameState.phase = 2;
            addLog('Nouveaux marchés débloqués !', 'success');
        }
    }
];

// ===== ÉLÉMENTS DOM =====
const elements = {
    dnaCount: document.getElementById('dna-count'),
    makeDnaBtn: document.getElementById('make-dna'),
    sellPrice: document.getElementById('sell-price'),
    funds: document.getElementById('funds'),
    dnaSold: document.getElementById('dna-sold'),
    totalRevenue: document.getElementById('total-revenue'),
    demand: document.getElementById('demand'),
    productionRate: document.getElementById('production-rate'),
    lowerPriceBtn: document.getElementById('lower-price'),
    raisePriceBtn: document.getElementById('raise-price'),
    sellDnaBtn: document.getElementById('sell-dna'),
    upgradesList: document.getElementById('upgrades-list'),
    projectsList: document.getElementById('projects-list'),
    eventLog: document.getElementById('event-log'),
    sequencerCount: document.getElementById('sequencer-count'),
    synthesizerCount: document.getElementById('synthesizer-count'),
    processorCount: document.getElementById('processor-count'),
    memoryCount: document.getElementById('memory-count'),
    operations: document.getElementById('operations')
};

// ===== INITIALISATION =====
function init() {
    loadGame();

    // Event listeners
    elements.makeDnaBtn.addEventListener('click', makeDNA);
    elements.lowerPriceBtn.addEventListener('click', () => adjustPrice(-0.01));
    elements.raisePriceBtn.addEventListener('click', () => adjustPrice(0.01));
    elements.sellDnaBtn.addEventListener('click', sellDNA);

    // Game loop
    setInterval(gameLoop, 100); // 10 FPS
    setInterval(slowLoop, 1000); // 1 FPS pour certains calculs

    updateUI();
    renderUpgrades();
    renderProjects();

    addLog('🧬 Bienvenue dans DNA Factory !', 'info');
}

// ===== FONCTIONS PRINCIPALES =====
function makeDNA() {
    gameState.dna++;
    updateDisplay();
    animateButton(elements.makeDnaBtn);
}

function adjustPrice(amount) {
    gameState.sellPrice = Math.max(0.01, Math.round((gameState.sellPrice + amount) * 100) / 100);
    updateDisplay();
}

function sellDNA() {
    if (gameState.dna <= 0) return;

    const demand = calculateDemand();
    const amountToSell = Math.min(gameState.dna, Math.ceil(gameState.dna * demand));

    if (amountToSell > 0) {
        gameState.dna -= amountToSell;
        const revenue = amountToSell * gameState.sellPrice;
        gameState.funds += revenue;
        gameState.totalRevenue += revenue;
        gameState.dnaSold += amountToSell;

        updateDisplay();

        if (amountToSell > 10) {
            addLog(`Vendu ${amountToSell} brins pour $${revenue.toFixed(2)}`, 'success');
        }
    }
}

function calculateDemand() {
    // La demande diminue avec le prix
    const priceImpact = Math.max(0.1, 1 - (gameState.sellPrice - 0.05) * 2);
    const demand = gameState.baseDemand * priceImpact;
    return Math.min(1, Math.max(0.1, demand));
}

function updateProductionRate() {
    let rate = 0;

    // Séquenceurs
    let sequencerMultiplier = 1;
    if (gameState.upgrades.improvedSequencer) sequencerMultiplier = 2;
    rate += gameState.autoSequencers * sequencerMultiplier;

    // Synthétiseurs
    rate += gameState.autoSynthesizers * 5;

    gameState.productionRate = rate;
}

function autoProduction(deltaTime) {
    if (gameState.productionRate > 0) {
        const produced = (gameState.productionRate * deltaTime) / 1000;
        gameState.dna += produced;
    }
}

function autoSell() {
    if (gameState.upgrades.bulkSelling && gameState.dna >= 1) {
        sellDNA();
    }
}

function buyUpgrade(upgradeKey) {
    const upgrade = UPGRADES[upgradeKey];
    const cost = upgrade.baseCost ?
        Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count || 0)) :
        upgrade.cost;

    if (gameState.funds >= cost) {
        gameState.funds -= cost;

        if (upgrade.count !== undefined) {
            upgrade.count++;
        } else {
            upgrade.bought = true;
        }

        upgrade.effect();
        updateDisplay();
        renderUpgrades();

        addLog(`Acheté: ${upgrade.name}`, 'success');
    }
}

function buyProject(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    let canAfford = true;
    if (project.cost.funds && gameState.funds < project.cost.funds) canAfford = false;
    if (project.cost.operations && gameState.operations < project.cost.operations) canAfford = false;

    if (canAfford) {
        if (project.cost.funds) gameState.funds -= project.cost.funds;
        if (project.cost.operations) gameState.operations -= project.cost.operations;

        gameState.completedProjects.push(projectId);
        project.effect();

        updateDisplay();
        renderProjects();

        addLog(`Projet complété: ${project.name}`, 'success');
    }
}

// ===== BOUCLES DE JEU =====
function gameLoop() {
    autoProduction(100);
    updateDisplay();
}

function slowLoop() {
    gameState.tickCount++;

    // Auto-sell toutes les secondes
    autoSell();

    // Générer des opérations
    if (gameState.processors > 0) {
        gameState.operations += gameState.processors * 1;
    }

    // Vérifier les nouveaux upgrades/projets
    if (gameState.tickCount % 5 === 0) {
        checkUnlocks();
    }

    // Mettre à jour l'interface des upgrades/projets toutes les secondes
    renderUpgrades();
    renderProjects();

    // Sauvegarder toutes les 10 secondes
    if (gameState.tickCount % 10 === 0) {
        saveGame();
    }

    updateDisplay();
}

function checkUnlocks() {
    // Vérifier les upgrades
    for (const [key, upgrade] of Object.entries(UPGRADES)) {
        if (!upgrade.unlocked && upgrade.requirement && upgrade.requirement()) {
            upgrade.unlocked = true;
            renderUpgrades();
        }
    }

    // Vérifier les projets
    let needsRender = false;
    PROJECTS.forEach(project => {
        if (!gameState.unlockedProjects.includes(project.id) &&
            !gameState.completedProjects.includes(project.id) &&
            project.requirement()) {
            gameState.unlockedProjects.push(project.id);
            document.getElementById('projects-section').style.display = 'block';
            needsRender = true;
        }
    });

    if (needsRender) {
        renderProjects();
    }
}

// ===== AFFICHAGE =====
function updateDisplay() {
    elements.dnaCount.textContent = formatNumber(gameState.dna);
    elements.sellPrice.textContent = '$' + gameState.sellPrice.toFixed(2);
    elements.funds.textContent = '$' + formatNumber(gameState.funds);
    elements.dnaSold.textContent = formatNumber(gameState.dnaSold);
    elements.totalRevenue.textContent = '$' + formatNumber(gameState.totalRevenue);
    elements.demand.textContent = Math.round(calculateDemand() * 100) + '%';
    elements.productionRate.textContent = gameState.productionRate.toFixed(1);

    if (elements.sequencerCount) {
        elements.sequencerCount.textContent = gameState.autoSequencers;
    }
    if (elements.synthesizerCount) {
        elements.synthesizerCount.textContent = gameState.autoSynthesizers;
    }
    if (elements.processorCount) {
        elements.processorCount.textContent = gameState.processors;
    }
    if (elements.operations) {
        elements.operations.textContent = formatNumber(gameState.operations);
    }
}

function updateUI() {
    updateDisplay();
}

function renderUpgrades() {
    elements.upgradesList.innerHTML = '';

    for (const [key, upgrade] of Object.entries(UPGRADES)) {
        // Skip si pas encore débloqué
        if (upgrade.unlocked === false && upgrade.requirement && !upgrade.requirement()) continue;
        if (upgrade.bought) continue;

        const cost = upgrade.baseCost ?
            Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count || 0)) :
            upgrade.cost;

        const canAfford = gameState.funds >= cost;

        const item = document.createElement('div');
        item.className = 'upgrade-item';
        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}${upgrade.count !== undefined ? ` (${upgrade.count})` : ''}</div>
                <div class="upgrade-desc">${upgrade.desc}</div>
                <div class="upgrade-cost">Coût: $${formatNumber(cost)}</div>
            </div>
            <button class="buy-btn" ${!canAfford ? 'disabled' : ''}>Acheter</button>
        `;

        item.querySelector('.buy-btn').addEventListener('click', () => buyUpgrade(key));
        elements.upgradesList.appendChild(item);
    }
}

function renderProjects() {
    elements.projectsList.innerHTML = '';

    PROJECTS.forEach(project => {
        if (!gameState.unlockedProjects.includes(project.id)) return;
        if (gameState.completedProjects.includes(project.id)) return;

        let canAfford = true;
        let costText = '';

        if (project.cost.funds) {
            costText += `$${formatNumber(project.cost.funds)}`;
            if (gameState.funds < project.cost.funds) canAfford = false;
        }
        if (project.cost.operations) {
            if (costText) costText += ' + ';
            costText += `${formatNumber(project.cost.operations)} ops`;
            if (gameState.operations < project.cost.operations) canAfford = false;
        }

        const item = document.createElement('div');
        item.className = 'project-item';
        item.innerHTML = `
            <div class="project-info">
                <div class="project-name">${project.name}</div>
                <div class="project-desc">${project.desc}</div>
                <div class="project-cost">Coût: ${costText}</div>
            </div>
            <button class="buy-btn" ${!canAfford ? 'disabled' : ''}>Rechercher</button>
        `;

        item.querySelector('.buy-btn').addEventListener('click', () => buyProject(project.id));
        elements.projectsList.appendChild(item);
    });
}

function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[Jour ${Math.floor(gameState.tickCount / 60)}] ${message}`;

    elements.eventLog.insertBefore(entry, elements.eventLog.firstChild);

    // Garder max 20 entrées
    while (elements.eventLog.children.length > 20) {
        elements.eventLog.removeChild(elements.eventLog.lastChild);
    }
}

// ===== UTILITAIRES =====
function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

function animateButton(btn) {
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 300);
}

// ===== SAUVEGARDE =====
function saveGame() {
    localStorage.setItem('dnaFactorySave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('dnaFactorySave');
    if (saved) {
        const loadedState = JSON.parse(saved);
        Object.assign(gameState, loadedState);

        // Recalculer les valeurs dérivées
        updateProductionRate();

        return true;
    }
    return false;
}

function resetGame() {
    if (confirm('Voulez-vous vraiment réinitialiser votre partie ?')) {
        localStorage.removeItem('dnaFactorySave');
        location.reload();
    }
}

// ===== DÉMARRAGE =====
window.addEventListener('load', init);

// Sauvegarder avant de quitter
window.addEventListener('beforeunload', saveGame);
