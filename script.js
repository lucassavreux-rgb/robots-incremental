// ===== ÉTAT DU JEU =====
let gameState = {
    // Ressources principales
    dna: 0,
    funds: 0,
    wire: 1000, // Matière première (comme Wire dans Paperclips)

    // Production
    dnaPrice: 0.25,
    publicDemand: 50,
    marketing: 0,
    marketingLevel: 1,

    // Statistiques
    dnaCreated: 0,
    dnaSold: 0,
    unsoldInventory: 0,

    // Automatisation
    autoClippers: 0,
    megaClippers: 0,

    // Computational
    processors: 0,
    memory: 0,
    operations: 0,
    creativity: 0,
    trust: 0,

    // Projects
    availableProjects: [],
    completedProjects: [],

    // Phase
    phase: 1,

    // Timers
    lastSellTime: Date.now(),
    tickCount: 0
};

// ===== PROJETS =====
const PROJECTS = [
    {
        id: 'improvedAutoClippers',
        name: 'Séquenceurs Améliorés',
        desc: 'Les AutoClippers produisent 25% plus vite',
        cost: { creativity: 100 },
        trigger: () => gameState.autoClippers >= 5,
        effect: () => {
            addLog('AutoClippers améliorés !', 'success');
        }
    },
    {
        id: 'evenBetterAutoClippers',
        name: 'Séquenceurs Optimisés',
        desc: 'Les AutoClippers produisent 50% plus vite',
        cost: { creativity: 250 },
        trigger: () => gameState.completedProjects.includes('improvedAutoClippers'),
        effect: () => {
            addLog('AutoClippers optimisés !', 'success');
        }
    },
    {
        id: 'optimizedMarketing',
        name: 'Marketing Optimisé',
        desc: 'Le marketing coûte 25% moins cher',
        cost: { creativity: 150 },
        trigger: () => gameState.marketing >= 5,
        effect: () => {
            addLog('Marketing optimisé !', 'success');
        }
    },
    {
        id: 'creativityUpgrade',
        name: 'Créativité Améliorée',
        desc: '+1 Créativité par opération',
        cost: { creativity: 200 },
        trigger: () => gameState.processors >= 5,
        effect: () => {
            addLog('Créativité augmentée !', 'success');
        }
    },
    {
        id: 'wireBuyer',
        name: 'Acheteur de Wire Auto',
        desc: 'Achète automatiquement du wire',
        cost: { creativity: 300 },
        trigger: () => gameState.funds >= 1000,
        effect: () => {
            addLog('Achat automatique de wire activé !', 'success');
        }
    },
    {
        id: 'megaClippers',
        name: 'Méga Séquenceurs',
        desc: 'Débloque les MegaClippers (5x plus rapide)',
        cost: { creativity: 500 },
        trigger: () => gameState.autoClippers >= 50,
        effect: () => {
            addLog('MegaClippers débloqués !', 'success');
        }
    }
];

// ===== ÉLÉMENTS DOM =====
const $ = id => document.getElementById(id);

// ===== INITIALISATION =====
function init() {
    loadGame();

    // Event listeners
    $('make-dna-btn').addEventListener('click', makeDNA);
    $('lower-price').addEventListener('click', () => adjustPrice(-0.01));
    $('raise-price').addEventListener('click', () => adjustPrice(0.01));
    $('buy-wire').addEventListener('click', buyWire);
    $('buy-autoclipper').addEventListener('click', () => buyAutoClipper());
    $('buy-marketing').addEventListener('click', () => buyMarketing());

    // Loops
    setInterval(gameLoop, 50); // 20 FPS
    setInterval(slowLoop, 1000); // 1 FPS

    updateUI();
    addLog('🧬 Bienvenue dans DNA Factory !', 'info');
}

// ===== PRODUCTION =====
function makeDNA() {
    if (gameState.wire < 1) {
        addLog('⚠️ Pas assez de wire !', 'warning');
        return;
    }

    gameState.wire--;
    gameState.dna++;
    gameState.unsoldInventory++;
    gameState.dnaCreated++;

    // Créativité basée sur les opérations
    if (gameState.processors > 0 && Math.random() < 0.1) {
        gameState.creativity++;
    }

    updateUI();
}

function autoProduction() {
    // AutoClippers
    if (gameState.autoClippers > 0) {
        let rate = gameState.autoClippers * 0.05; // 0.05 par tick (20 FPS)

        // Bonus des upgrades
        if (gameState.completedProjects.includes('improvedAutoClippers')) {
            rate *= 1.25;
        }
        if (gameState.completedProjects.includes('evenBetterAutoClippers')) {
            rate *= 1.5;
        }

        const toProduce = Math.min(rate, gameState.wire);
        if (toProduce > 0) {
            gameState.wire -= toProduce;
            gameState.dna += toProduce;
            gameState.unsoldInventory += toProduce;
            gameState.dnaCreated += toProduce;
        }
    }

    // MegaClippers
    if (gameState.megaClippers > 0) {
        let rate = gameState.megaClippers * 0.25; // 5x plus rapide

        const toProduce = Math.min(rate, gameState.wire);
        if (toProduce > 0) {
            gameState.wire -= toProduce;
            gameState.dna += toProduce;
            gameState.unsoldInventory += toProduce;
            gameState.dnaCreated += toProduce;
        }
    }
}

// ===== VENTE AUTOMATIQUE =====
function autoSell() {
    if (gameState.dna <= 0) return;

    const demand = calculateDemand();
    const sellRate = 0.7; // Vend 70% par seconde

    const toSell = Math.min(
        gameState.dna,
        Math.max(1, Math.floor(gameState.dna * demand * sellRate))
    );

    if (toSell > 0) {
        gameState.dna -= toSell;
        gameState.unsoldInventory -= toSell;
        const revenue = toSell * gameState.dnaPrice;
        gameState.funds += revenue;
        gameState.dnaSold += toSell;
    }
}

function calculateDemand() {
    // Demande basée sur le prix et le marketing
    const priceImpact = Math.max(0.1, 1 - (gameState.dnaPrice - 0.25) * 3);
    const marketingBonus = 1 + (gameState.marketing * 0.15);
    const publicDemandFactor = gameState.publicDemand / 100;

    return Math.min(1, priceImpact * marketingBonus * publicDemandFactor);
}

function adjustPrice(amount) {
    gameState.dnaPrice = Math.max(0.01, Math.round((gameState.dnaPrice + amount) * 100) / 100);
    updateUI();
}

// ===== ACHATS =====
function buyWire() {
    const cost = 15;
    const amount = 1000;

    if (gameState.funds >= cost) {
        gameState.funds -= cost;
        gameState.wire += amount;
        updateUI();
    }
}

function buyAutoClipper() {
    const cost = 5 * Math.pow(1.1, gameState.autoClippers);

    if (gameState.funds >= cost) {
        gameState.funds -= cost;
        gameState.autoClippers++;
        updateUI();
    }
}

function buyMarketing() {
    let baseCost = 100 * Math.pow(1.5, gameState.marketing);

    // Réduction avec upgrade
    if (gameState.completedProjects.includes('optimizedMarketing')) {
        baseCost *= 0.75;
    }

    if (gameState.funds >= baseCost) {
        gameState.funds -= baseCost;
        gameState.marketing++;
        gameState.marketingLevel = gameState.marketing + 1;
        updateUI();
    }
}

function buyMegaClipper() {
    const cost = 1000 * Math.pow(1.15, gameState.megaClippers);

    if (gameState.funds >= cost && gameState.completedProjects.includes('megaClippers')) {
        gameState.funds -= cost;
        gameState.megaClippers++;
        updateUI();
    }
}

function buyProcessor() {
    const cost = 50;

    if (gameState.funds >= cost) {
        gameState.funds -= cost;
        gameState.processors++;
        updateUI();
    }
}

function completeProject(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    let canAfford = true;
    if (project.cost.funds && gameState.funds < project.cost.funds) canAfford = false;
    if (project.cost.creativity && gameState.creativity < project.cost.creativity) canAfford = false;
    if (project.cost.operations && gameState.operations < project.cost.operations) canAfford = false;

    if (canAfford) {
        if (project.cost.funds) gameState.funds -= project.cost.funds;
        if (project.cost.creativity) gameState.creativity -= project.cost.creativity;
        if (project.cost.operations) gameState.operations -= project.cost.operations;

        gameState.completedProjects.push(projectId);
        gameState.availableProjects = gameState.availableProjects.filter(p => p !== projectId);

        project.effect();
        updateUI();
    }
}

// ===== BOUCLES =====
function gameLoop() {
    autoProduction();

    // Génération d'opérations
    if (gameState.processors > 0) {
        gameState.operations += gameState.processors * 0.05;

        // Créativité depuis opérations
        if (gameState.completedProjects.includes('creativityUpgrade')) {
            gameState.creativity += gameState.processors * 0.01;
        }
    }

    updateUI();
}

function slowLoop() {
    gameState.tickCount++;

    // Vente automatique
    autoSell();

    // Fluctuation de la demande publique
    const change = (Math.random() - 0.5) * 5;
    gameState.publicDemand = Math.max(10, Math.min(100, gameState.publicDemand + change));

    // Achat automatique de wire
    if (gameState.completedProjects.includes('wireBuyer')) {
        if (gameState.wire < 500 && gameState.funds >= 15) {
            buyWire();
        }
    }

    // Vérifier nouveaux projets
    checkProjects();

    // Sauvegarde
    if (gameState.tickCount % 10 === 0) {
        saveGame();
    }

    updateUI();
}

function checkProjects() {
    PROJECTS.forEach(project => {
        if (!gameState.completedProjects.includes(project.id) &&
            !gameState.availableProjects.includes(project.id) &&
            project.trigger()) {
            gameState.availableProjects.push(project.id);
        }
    });
}

// ===== UI =====
function updateUI() {
    // Stats principales
    $('dna-count').textContent = formatNum(gameState.dna);
    $('funds').textContent = '$' + formatNum(gameState.funds, 2);
    $('wire').textContent = formatNum(gameState.wire);
    $('dna-price').textContent = '$' + gameState.dnaPrice.toFixed(2);
    $('unsold').textContent = formatNum(gameState.unsoldInventory);

    // Demande
    const demand = calculateDemand();
    $('demand').textContent = Math.round(demand * 100) + '%';
    $('public-demand').textContent = Math.round(gameState.publicDemand) + '%';

    // Production
    const prodRate = (gameState.autoClippers + gameState.megaClippers * 5);
    $('production-rate').textContent = prodRate.toFixed(1) + '/sec';

    // Counts
    $('autoclipper-count').textContent = gameState.autoClippers;
    $('megaclipper-count').textContent = gameState.megaClippers;
    $('marketing-level').textContent = gameState.marketingLevel;

    // Computational
    $('processor-count').textContent = gameState.processors;
    $('operations').textContent = formatNum(gameState.operations);
    $('creativity').textContent = formatNum(gameState.creativity);

    // Buttons
    updateButtons();
    renderProjects();

    // Afficher sections
    if (gameState.autoClippers > 0) {
        $('automation-section').style.display = 'block';
    }

    if (gameState.processors > 0 || gameState.dnaSold > 2000) {
        $('computation-section').style.display = 'block';
    }
}

function updateButtons() {
    // Wire
    $('buy-wire').disabled = gameState.funds < 15;
    $('buy-wire').textContent = gameState.funds >= 15 ? 'Acheter 1000 Wire ($15)' : 'Trop cher ($15)';

    // AutoClipper
    const clipperCost = 5 * Math.pow(1.1, gameState.autoClippers);
    $('buy-autoclipper').disabled = gameState.funds < clipperCost;
    $('buy-autoclipper').textContent = `Acheter AutoClipper ($${formatNum(clipperCost, 2)})`;

    // Marketing
    let marketingCost = 100 * Math.pow(1.5, gameState.marketing);
    if (gameState.completedProjects.includes('optimizedMarketing')) {
        marketingCost *= 0.75;
    }
    $('buy-marketing').disabled = gameState.funds < marketingCost;
    $('buy-marketing').textContent = `Augmenter Marketing ($${formatNum(marketingCost, 2)})`;

    // MegaClipper
    if (gameState.completedProjects.includes('megaClippers')) {
        $('megaclipper-section').style.display = 'block';
        const megaCost = 1000 * Math.pow(1.15, gameState.megaClippers);
        $('buy-megaclipper').disabled = gameState.funds < megaCost;
        $('buy-megaclipper').textContent = `Acheter MegaClipper ($${formatNum(megaCost, 2)})`;
        $('buy-megaclipper').onclick = buyMegaClipper;
    }

    // Processor
    if ($('buy-processor')) {
        $('buy-processor').disabled = gameState.funds < 50;
        $('buy-processor').textContent = gameState.funds >= 50 ? 'Acheter Processeur ($50)' : 'Trop cher ($50)';
        $('buy-processor').onclick = buyProcessor;
    }
}

function renderProjects() {
    const container = $('projects-list');
    if (!container) return;

    container.innerHTML = '';

    if (gameState.availableProjects.length === 0) {
        $('projects-section').style.display = 'none';
        return;
    }

    $('projects-section').style.display = 'block';

    gameState.availableProjects.forEach(projectId => {
        const project = PROJECTS.find(p => p.id === projectId);
        if (!project) return;

        let costText = '';
        let canAfford = true;

        if (project.cost.funds) {
            costText += `$${formatNum(project.cost.funds)}`;
            if (gameState.funds < project.cost.funds) canAfford = false;
        }
        if (project.cost.creativity) {
            if (costText) costText += ' + ';
            costText += `${formatNum(project.cost.creativity)} créativité`;
            if (gameState.creativity < project.cost.creativity) canAfford = false;
        }
        if (project.cost.operations) {
            if (costText) costText += ' + ';
            costText += `${formatNum(project.cost.operations)} ops`;
            if (gameState.operations < project.cost.operations) canAfford = false;
        }

        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <div class="project-info">
                <div class="project-name">${project.name}</div>
                <div class="project-desc">${project.desc}</div>
                <div class="project-cost">Coût: ${costText}</div>
            </div>
            <button class="btn" ${!canAfford ? 'disabled' : ''}>Rechercher</button>
        `;

        div.querySelector('.btn').onclick = () => completeProject(projectId);
        container.appendChild(div);
    });
}

function addLog(message, type = 'info') {
    const log = $('event-log');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;

    log.insertBefore(entry, log.firstChild);

    while (log.children.length > 15) {
        log.removeChild(log.lastChild);
    }
}

function formatNum(num, decimals = 0) {
    if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
    return decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
}

// ===== SAUVEGARDE =====
function saveGame() {
    localStorage.setItem('dnaFactorySave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('dnaFactorySave');
    if (saved) {
        Object.assign(gameState, JSON.parse(saved));
        return true;
    }
    return false;
}

function resetGame() {
    if (confirm('Réinitialiser la partie ?')) {
        localStorage.removeItem('dnaFactorySave');
        location.reload();
    }
}

// ===== DÉMARRAGE =====
window.addEventListener('load', init);
window.addEventListener('beforeunload', saveGame);
