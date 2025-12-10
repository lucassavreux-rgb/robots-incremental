/**
 * =====================================================
 * INVESTOR DAYS - Game Logic
 * =====================================================
 * Jeu de simulation d'investisseur
 */

// ===== CONSTANTES =====
const STARTING_CASH = 10000;
const DAY_DURATION_MS = 1000; // 1 seconde = 1 jour
const REPORT_DAY = 365; // Afficher un bilan après 365 jours
const EVENT_PROBABILITY = 0.05; // 5% de chance d'événement par jour

// ===== DÉFINITION DES ACTIFS =====
const ASSETS = [
    {
        id: 'secure',
        name: 'Compte Sécurisé',
        icon: '🏦',
        risk: 'low',
        riskLabel: 'Faible',
        annualReturn: 0.02, // 2% par an
        volatility: 0.001, // Quasi nulle
        minInvestment: 100,
        lockDays: 0, // Pas de blocage
        earlyPenalty: 0, // Pas de pénalité
        description: 'Placement sûr avec rendement garanti'
    },
    {
        id: 'bonds',
        name: 'Obligations',
        icon: '📜',
        risk: 'low',
        riskLabel: 'Faible à Moyen',
        annualReturn: 0.04, // 4% par an
        volatility: 0.01,
        minInvestment: 500,
        lockDays: 60,
        earlyPenalty: 0.01, // -1% si vente avant 60 jours
        description: 'Titres de créance avec rendement stable'
    },
    {
        id: 'etf',
        name: 'Indice Boursier (ETF)',
        icon: '📊',
        risk: 'medium',
        riskLabel: 'Moyen',
        annualReturn: 0.07, // 7% par an
        volatility: 0.03,
        minInvestment: 1000,
        lockDays: 0,
        earlyPenalty: 0,
        description: 'Diversification sur le marché actions'
    },
    {
        id: 'realestate',
        name: 'Immobilier',
        icon: '🏠',
        risk: 'medium',
        riskLabel: 'Moyen',
        annualReturn: 0.05, // 5% par an
        volatility: 0.02,
        minInvestment: 5000,
        lockDays: 90,
        earlyPenalty: 0,
        description: 'Investissement immobilier locatif'
    },
    {
        id: 'startup',
        name: 'Startup / Venture',
        icon: '🚀',
        risk: 'high',
        riskLabel: 'Élevé',
        annualReturn: 0.15, // 15% par an
        volatility: 0.08, // Très volatile
        minInvestment: 2000,
        lockDays: 0,
        earlyPenalty: 0,
        description: 'Capital risque avec fort potentiel'
    }
];

// ===== ÉVÉNEMENTS POSSIBLES =====
const EVENTS = [
    {
        id: 'crash',
        name: 'Krach Boursier',
        description: 'Panique sur les marchés ! Les actifs risqués chutent.',
        probability: 0.15,
        effect: (gameState) => {
            gameState.portfolio.forEach(position => {
                const asset = ASSETS.find(a => a.id === position.assetId);
                if (asset && asset.risk === 'high') {
                    position.currentValue *= 0.85; // -15%
                } else if (asset && asset.risk === 'medium') {
                    position.currentValue *= 0.92; // -8%
                }
            });
        }
    },
    {
        id: 'boom',
        name: 'Boom Économique',
        description: 'L\'économie explose ! Tous les actifs progressent.',
        probability: 0.2,
        effect: (gameState) => {
            gameState.portfolio.forEach(position => {
                position.currentValue *= 1.08; // +8%
            });
        }
    },
    {
        id: 'tax',
        name: 'Taxe Exceptionnelle',
        description: 'Le gouvernement impose une taxe surprise.',
        probability: 0.1,
        effect: (gameState) => {
            const tax = gameState.cash * 0.01; // 1% du cash
            gameState.cash = Math.max(0, gameState.cash - tax);
        }
    },
    {
        id: 'opportunity',
        name: 'Opportunité Exceptionnelle',
        description: 'Un bonus inattendu de 500€ !',
        probability: 0.15,
        effect: (gameState) => {
            gameState.cash += 500;
        }
    },
    {
        id: 'tech-rally',
        name: 'Rallye Technologique',
        description: 'Les startups et ETF s\'envolent !',
        probability: 0.2,
        effect: (gameState) => {
            gameState.portfolio.forEach(position => {
                const asset = ASSETS.find(a => a.id === position.assetId);
                if (asset && (asset.id === 'startup' || asset.id === 'etf')) {
                    position.currentValue *= 1.12; // +12%
                }
            });
        }
    },
    {
        id: 'real-estate-drop',
        name: 'Crise Immobilière',
        description: 'Le marché immobilier ralentit.',
        probability: 0.2,
        effect: (gameState) => {
            gameState.portfolio.forEach(position => {
                const asset = ASSETS.find(a => a.id === position.assetId);
                if (asset && asset.id === 'realestate') {
                    position.currentValue *= 0.90; // -10%
                }
            });
        }
    }
];

// ===== ÉTAT DU JEU =====
let gameState = {
    day: 1,
    cash: STARTING_CASH,
    portfolio: [], // { id, assetId, amount, currentValue, dayPurchased }
    history: [{ day: 1, netWorth: STARTING_CASH }], // Pour le graphique
    eventLog: ['Jour 1 : Bienvenue ! Vous démarrez avec ' + formatMoney(STARTING_CASH)],
    isPaused: false,
    reportShown: false
};

// ===== GESTION DU TEMPS =====
let gameInterval = null;

function startGame() {
    gameInterval = setInterval(() => {
        if (!gameState.isPaused) {
            advanceDay();
        }
    }, DAY_DURATION_MS);
}

function stopGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

function advanceDay() {
    gameState.day++;

    // Mise à jour des investissements
    updatePortfolioValues();

    // Événements aléatoires
    if (Math.random() < EVENT_PROBABILITY) {
        triggerRandomEvent();
    }

    // Enregistrer l'historique
    const netWorth = calculateNetWorth();
    gameState.history.push({ day: gameState.day, netWorth });

    // Limiter l'historique à 500 derniers jours pour performance
    if (gameState.history.length > 500) {
        gameState.history.shift();
    }

    // Sauvegarder
    saveGame();

    // Mise à jour UI
    updateUI();

    // Vérifier si on doit afficher le rapport
    if (gameState.day === REPORT_DAY && !gameState.reportShown) {
        showReport();
        gameState.reportShown = true;
    }
}

function fastForward() {
    for (let i = 0; i < 10; i++) {
        if (!gameState.isPaused) {
            advanceDay();
        }
    }
}

// ===== CALCULS =====
function updatePortfolioValues() {
    gameState.portfolio.forEach(position => {
        const asset = ASSETS.find(a => a.id === position.assetId);
        if (!asset) return;

        // Calcul du rendement journalier
        const dailyReturn = asset.annualReturn / 365;
        const dailyVolatility = asset.volatility / Math.sqrt(365);

        // Rendement avec volatilité aléatoire
        const randomFactor = (Math.random() - 0.5) * 2 * dailyVolatility;
        const todayReturn = dailyReturn + randomFactor;

        // Mise à jour de la valeur
        position.currentValue *= (1 + todayReturn);

        // Arrondir à 2 décimales
        position.currentValue = Math.round(position.currentValue * 100) / 100;
    });
}

function calculateNetWorth() {
    const portfolioValue = gameState.portfolio.reduce((sum, pos) => sum + pos.currentValue, 0);
    return gameState.cash + portfolioValue;
}

function calculatePortfolioValue() {
    return gameState.portfolio.reduce((sum, pos) => sum + pos.currentValue, 0);
}

function calculateRiskProfile() {
    if (gameState.portfolio.length === 0) {
        return { level: 'Prudent', percent: 0 };
    }

    const totalValue = calculatePortfolioValue();
    let riskScore = 0;

    gameState.portfolio.forEach(position => {
        const asset = ASSETS.find(a => a.id === position.assetId);
        if (!asset) return;

        const weight = position.currentValue / totalValue;
        const assetRisk = asset.risk === 'low' ? 1 : asset.risk === 'medium' ? 2 : 3;
        riskScore += weight * assetRisk;
    });

    const percent = (riskScore / 3) * 100;
    let level = 'Prudent';
    if (riskScore > 2.3) level = 'Agressif';
    else if (riskScore > 1.5) level = 'Équilibré';
    else if (riskScore > 0.8) level = 'Modéré';

    return { level, percent };
}

// ===== INVESTISSEMENTS =====
function invest(assetId, amount) {
    const asset = ASSETS.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Actif introuvable' };

    // Vérifications
    if (amount < asset.minInvestment) {
        return { success: false, message: `Montant minimum : ${formatMoney(asset.minInvestment)}` };
    }

    if (amount > gameState.cash) {
        return { success: false, message: 'Cash insuffisant' };
    }

    // Créer la position
    const position = {
        id: Date.now() + Math.random(),
        assetId: asset.id,
        amount: amount,
        currentValue: amount,
        dayPurchased: gameState.day
    };

    gameState.portfolio.push(position);
    gameState.cash -= amount;

    // Log
    addLog(`Jour ${gameState.day} : Investi ${formatMoney(amount)} dans ${asset.name}`, 'success');

    saveGame();
    return { success: true };
}

function sell(positionId) {
    const positionIndex = gameState.portfolio.findIndex(p => p.id === positionId);
    if (positionIndex === -1) return { success: false, message: 'Position introuvable' };

    const position = gameState.portfolio[positionIndex];
    const asset = ASSETS.find(a => a.id === position.assetId);
    if (!asset) return { success: false, message: 'Actif introuvable' };

    // Vérifier le blocage
    const daysHeld = gameState.day - position.dayPurchased;
    if (daysHeld < asset.lockDays) {
        return {
            success: false,
            message: `Impossible de vendre avant ${asset.lockDays} jours (reste ${asset.lockDays - daysHeld} jours)`
        };
    }

    // Calculer la valeur avec pénalité éventuelle
    let saleValue = position.currentValue;
    if (daysHeld < asset.lockDays + 30 && asset.earlyPenalty > 0) {
        saleValue *= (1 - asset.earlyPenalty);
    }

    // Vendre
    gameState.cash += saleValue;
    gameState.portfolio.splice(positionIndex, 1);

    // Calculer le gain/perte
    const profit = saleValue - position.amount;
    const profitPercent = ((profit / position.amount) * 100).toFixed(2);
    const profitText = profit >= 0 ? `+${formatMoney(profit)}` : formatMoney(profit);

    // Log
    addLog(
        `Jour ${gameState.day} : Vendu ${asset.name} pour ${formatMoney(saleValue)} (${profitText}, ${profitPercent}%)`,
        profit >= 0 ? 'success' : 'error'
    );

    saveGame();
    return { success: true };
}

// ===== ÉVÉNEMENTS =====
function triggerRandomEvent() {
    // Sélectionner un événement aléatoire pondéré par probabilité
    const totalProb = EVENTS.reduce((sum, e) => sum + e.probability, 0);
    let random = Math.random() * totalProb;

    let selectedEvent = null;
    for (let event of EVENTS) {
        random -= event.probability;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }

    if (!selectedEvent) return;

    // Appliquer l'effet
    selectedEvent.effect(gameState);

    // Log
    addLog(`Jour ${gameState.day} : ⚡ ${selectedEvent.name} - ${selectedEvent.description}`, 'event');
}

// ===== UTILITAIRES =====
function formatMoney(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + ' M€';
    }
    if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + ' k€';
    }
    return amount.toFixed(0) + ' €';
}

function addLog(message, type = 'info') {
    gameState.eventLog.unshift({ message, type, timestamp: Date.now() });

    // Limiter à 50 derniers événements
    if (gameState.eventLog.length > 50) {
        gameState.eventLog.pop();
    }
}

// ===== SAUVEGARDE =====
function saveGame() {
    try {
        localStorage.setItem('investorDaysSave', JSON.stringify(gameState));
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
    }
}

function loadGame() {
    try {
        const save = localStorage.getItem('investorDaysSave');
        if (save) {
            gameState = JSON.parse(save);
            return true;
        }
    } catch (e) {
        console.error('Erreur de chargement:', e);
    }
    return false;
}

function resetGame() {
    if (!confirm('Êtes-vous sûr de vouloir recommencer ? Toute progression sera perdue.')) {
        return;
    }

    localStorage.removeItem('investorDaysSave');
    gameState = {
        day: 1,
        cash: STARTING_CASH,
        portfolio: [],
        history: [{ day: 1, netWorth: STARTING_CASH }],
        eventLog: ['Jour 1 : Bienvenue ! Vous démarrez avec ' + formatMoney(STARTING_CASH)],
        isPaused: false,
        reportShown: false
    };

    updateUI();
    drawChart();
}

// ===== INTERFACE =====
function updateUI() {
    // En-tête
    document.getElementById('current-day').textContent = gameState.day;
    document.getElementById('cash-available').textContent = formatMoney(gameState.cash);
    document.getElementById('portfolio-value').textContent = formatMoney(calculatePortfolioValue());
    document.getElementById('net-worth').textContent = formatMoney(calculateNetWorth());

    // Profil de risque
    const risk = calculateRiskProfile();
    document.getElementById('risk-profile').textContent = risk.level;
    const riskFill = document.getElementById('risk-fill');
    riskFill.style.width = risk.percent + '%';

    // Couleur du profil de risque
    if (risk.percent < 33) {
        riskFill.style.background = 'var(--risk-low)';
    } else if (risk.percent < 66) {
        riskFill.style.background = 'var(--risk-medium)';
    } else {
        riskFill.style.background = 'var(--risk-high)';
    }

    // Liste des investissements
    renderInvestmentsList();

    // Portefeuille
    renderPortfolio();

    // Journal
    renderEventLog();

    // Graphique
    drawChart();
}

function renderInvestmentsList() {
    const container = document.getElementById('investments-list');
    container.innerHTML = '';

    ASSETS.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'investment-card';
        card.innerHTML = `
            <div class="investment-header">
                <div class="investment-name">${asset.icon} ${asset.name}</div>
                <span class="risk-badge ${asset.risk}">${asset.riskLabel}</span>
            </div>
            <div class="investment-info">
                <div class="info-item">
                    <span class="info-label">Rendement moyen</span>
                    <span class="info-value">${(asset.annualReturn * 100).toFixed(1)}% / an</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Volatilité</span>
                    <span class="info-value">${asset.risk === 'low' ? 'Faible' : asset.risk === 'medium' ? 'Moyenne' : 'Élevée'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Montant minimum</span>
                    <span class="info-value">${formatMoney(asset.minInvestment)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Blocage</span>
                    <span class="info-value">${asset.lockDays > 0 ? asset.lockDays + ' jours' : 'Aucun'}</span>
                </div>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 10px;">${asset.description}</p>
            <button class="btn btn-primary" onclick="openInvestModal('${asset.id}')">
                💰 Investir
            </button>
        `;
        container.appendChild(card);
    });
}

function renderPortfolio() {
    const container = document.getElementById('portfolio-list');

    if (gameState.portfolio.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun investissement pour le moment</p>';
        return;
    }

    container.innerHTML = '';

    gameState.portfolio.forEach(position => {
        const asset = ASSETS.find(a => a.id === position.assetId);
        if (!asset) return;

        const daysHeld = gameState.day - position.dayPurchased;
        const profit = position.currentValue - position.amount;
        const profitPercent = ((profit / position.amount) * 100).toFixed(2);
        const canSell = daysHeld >= asset.lockDays;

        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <div class="portfolio-header">
                <div class="portfolio-name">${asset.icon} ${asset.name}</div>
                <div class="days-held">${daysHeld} jours détenu${daysHeld > 1 ? 's' : ''}</div>
            </div>
            <div class="portfolio-stats">
                <div class="stat-item">
                    <span class="stat-label">Investi</span>
                    <span class="stat-value">${formatMoney(position.amount)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Valeur actuelle</span>
                    <span class="stat-value">${formatMoney(position.currentValue)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Gain/Perte</span>
                    <span class="stat-value ${profit >= 0 ? 'gain' : 'loss'}">
                        ${profit >= 0 ? '+' : ''}${formatMoney(profit)} (${profitPercent}%)
                    </span>
                </div>
            </div>
            <div class="portfolio-actions">
                <button class="btn btn-sell" onclick="sellPosition(${position.id})" ${!canSell ? 'disabled' : ''}>
                    ${canSell ? '💸 Vendre' : `🔒 Bloqué ${asset.lockDays - daysHeld} jours`}
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderEventLog() {
    const container = document.getElementById('events-log');
    container.innerHTML = '';

    gameState.eventLog.slice(0, 20).forEach(entry => {
        const p = document.createElement('p');
        p.className = `log-entry ${entry.type || ''}`;
        p.textContent = typeof entry === 'string' ? entry : entry.message;
        container.appendChild(p);
    });
}

function drawChart() {
    const canvas = document.getElementById('chart-canvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.history.length < 2) return;

    // Dimensions
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Trouver min/max
    const values = gameState.history.map(h => h.netWorth);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Dessiner l'axe
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Dessiner la courbe
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    gameState.history.forEach((point, index) => {
        const x = padding + (index / (gameState.history.length - 1)) * width;
        const y = canvas.height - padding - ((point.netWorth - minValue) / range) * height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(formatMoney(maxValue), 5, padding + 15);
    ctx.fillText(formatMoney(minValue), 5, canvas.height - padding + 5);
    ctx.fillText('Jour ' + gameState.history[0].day, padding, canvas.height - 10);
    ctx.fillText('Jour ' + gameState.history[gameState.history.length - 1].day, canvas.width - padding - 40, canvas.height - 10);
}

// ===== MODAL D'INVESTISSEMENT =====
let currentAssetModal = null;

function openInvestModal(assetId) {
    currentAssetModal = ASSETS.find(a => a.id === assetId);
    if (!currentAssetModal) return;

    document.getElementById('modal-asset-name').textContent = currentAssetModal.name;
    document.getElementById('modal-risk').textContent = currentAssetModal.riskLabel;
    document.getElementById('modal-return').textContent = (currentAssetModal.annualReturn * 100).toFixed(1) + '% / an';
    document.getElementById('modal-min').textContent = formatMoney(currentAssetModal.minInvestment);

    document.getElementById('invest-amount').value = '';
    document.getElementById('invest-modal').classList.add('active');
}

function closeInvestModal() {
    document.getElementById('invest-modal').classList.remove('active');
    currentAssetModal = null;
}

function confirmInvest() {
    if (!currentAssetModal) return;

    const amount = parseFloat(document.getElementById('invest-amount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('Montant invalide');
        return;
    }

    const result = invest(currentAssetModal.id, amount);
    if (result.success) {
        closeInvestModal();
        updateUI();
    } else {
        alert(result.message);
    }
}

function setQuickAmount(percent) {
    if (!currentAssetModal) return;
    const amount = Math.floor(gameState.cash * (percent / 100));
    document.getElementById('invest-amount').value = amount;
}

// ===== VENTE =====
function sellPosition(positionId) {
    const result = sell(positionId);
    if (!result.success) {
        alert(result.message);
    } else {
        updateUI();
    }
}

// ===== RAPPORT =====
function showReport() {
    const netWorth = calculateNetWorth();
    const startingWorth = STARTING_CASH;
    const totalReturn = ((netWorth - startingWorth) / startingWorth * 100).toFixed(2);
    const bestDay = gameState.history.reduce((max, h) => h.netWorth > max.netWorth ? h : max, gameState.history[0]);

    let comment = '';
    if (totalReturn < 0) {
        comment = '❌ Investisseur en difficulté - Peut mieux faire !';
    } else if (totalReturn < 10) {
        comment = '😐 Investisseur prudent - Vous avez protégé votre capital.';
    } else if (totalReturn < 30) {
        comment = '👍 Investisseur équilibré - Belle performance !';
    } else if (totalReturn < 60) {
        comment = '🌟 Investisseur talentueux - Excellents résultats !';
    } else {
        comment = '🏆 Roi du risque - Performance exceptionnelle !';
    }

    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = `
        <p><strong>Jours joués :</strong> ${gameState.day}</p>
        <p><strong>Capital de départ :</strong> ${formatMoney(startingWorth)}</p>
        <p><strong>Valeur nette finale :</strong> <span class="highlight">${formatMoney(netWorth)}</span></p>
        <p><strong>Rendement total :</strong> ${totalReturn}%</p>
        <p><strong>Meilleur jour :</strong> Jour ${bestDay.day} avec ${formatMoney(bestDay.netWorth)}</p>
        <p style="margin-top: 20px; font-size: 1.2rem; font-weight: bold;">${comment}</p>
    `;

    document.getElementById('report-modal').classList.add('active');
}

function closeReport() {
    document.getElementById('report-modal').classList.remove('active');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Charger la partie sauvegardée
    const loaded = loadGame();

    // Mettre à jour l'UI
    updateUI();

    // Démarrer le jeu
    startGame();

    // Boutons de contrôle
    document.getElementById('pause-btn').addEventListener('click', () => {
        gameState.isPaused = !gameState.isPaused;
        document.getElementById('pause-btn').textContent = gameState.isPaused ? '▶️ Reprendre' : '⏸️ Pause';
    });

    document.getElementById('fast-forward-btn').addEventListener('click', fastForward);
    document.getElementById('reset-btn').addEventListener('click', resetGame);

    // Modal d'investissement
    document.getElementById('invest-modal').querySelector('.close-btn').addEventListener('click', closeInvestModal);
    document.getElementById('confirm-invest-btn').addEventListener('click', confirmInvest);

    // Boutons rapides
    document.querySelectorAll('.btn-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const percent = parseInt(e.target.dataset.percent);
            setQuickAmount(percent);
        });
    });

    // Modal de rapport
    document.getElementById('report-modal').querySelector('.close-btn').addEventListener('click', closeReport);
    document.getElementById('continue-btn').addEventListener('click', closeReport);

    // Fermer les modals en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});

// ===== NETTOYAGE À LA FERMETURE =====
window.addEventListener('beforeunload', () => {
    stopGame();
    saveGame();
});
