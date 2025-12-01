/**
 * =====================================================
 * TALENTS.JS - Arbre de Talents
 * =====================================================
 * Dépense de RP pour débloquer des talents permanents
 */

/**
 * Initialise le système de talents
 */
function initTalents() {
    renderTalentsList();
}

/**
 * Met à jour l'état des boutons talents sans re-render complet
 */
function updateTalentsButtons() {
    ['click', 'generators', 'prestige'].forEach(branchName => {
        const talents = TALENTS_DATA[branchName];
        const branchState = gameState.talents[branchName] || [];

        talents.forEach(talent => {
            const talentState = branchState.find(t => t.id === talent.id);
            const currentLevel = talentState ? talentState.level : 0;

            if (currentLevel >= talent.maxLevel) return; // Déjà max

            const canUpgrade = gameState.prestigePoints >= talent.cost;
            const button = document.querySelector(`.upgrade-btn[data-talent="${branchName}-${talent.id}"]`);
            if (button) {
                button.disabled = !canUpgrade;
            }
        });
    });
}

/**
 * Affiche tous les talents
 */
function renderTalentsList() {
    // Branche Clic
    renderTalentBranch('click', 'talents-click-list');
    // Branche Générateurs
    renderTalentBranch('generators', 'talents-generators-list');
    // Branche Prestige
    renderTalentBranch('prestige', 'talents-prestige-list');
}

/**
 * Affiche une branche de talents
 */
function renderTalentBranch(branchName, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const talents = TALENTS_DATA[branchName];
    const branchState = gameState.talents[branchName] || [];

    talents.forEach(talent => {
        const talentState = branchState.find(t => t.id === talent.id);
        const currentLevel = talentState ? talentState.level : 0;

        const talentDiv = document.createElement('div');
        talentDiv.classList.add('talent-item');

        if (currentLevel > 0) {
            talentDiv.classList.add('unlocked');
        }

        // Vérifier si on peut améliorer
        const canUpgrade = currentLevel < talent.maxLevel &&
                          gameState.prestigePoints >= talent.cost;

        // Vérifier le prérequis
        const requirementMet = !talent.requirement ||
                              branchState.some(t => t.id === talent.requirement && t.level > 0);

        // Calculer l'effet total
        const totalEffect = talent.effect * currentLevel;
        let effectText = '';
        if (talent.type.includes('bonus') || talent.type.includes('chance') || talent.type.includes('reduction')) {
            effectText = `${(totalEffect * 100).toFixed(0)}%`;
        } else {
            effectText = totalEffect.toFixed(1);
        }

        talentDiv.innerHTML = `
            <div class="talent-name">${talent.name}</div>
            <div class="talent-effect">
                ${talent.description}
                ${currentLevel > 0 ? `<br><strong>Effet: ${effectText}</strong>` : ''}
            </div>
            <div class="talent-cost">
                Niveau: ${currentLevel} / ${talent.maxLevel}
                ${currentLevel < talent.maxLevel ?
                    `<br>Coût: ${talent.cost} RP` : ''}
            </div>
            ${currentLevel < talent.maxLevel && requirementMet ?
                `<button class="upgrade-btn" data-talent="${branchName}-${talent.id}"
                        ${!canUpgrade ? 'disabled' : ''}>
                    Améliorer
                </button>` :
                (currentLevel >= talent.maxLevel ?
                    '<span style="color: #28a745; font-weight: bold;">✓ MAX</span>' :
                    '<span style="color: #dc3545;">🔒 Bloqué</span>')}
        `;

        container.appendChild(talentDiv);

        // Attacher l'événement si le bouton existe
        if (currentLevel < talent.maxLevel && requirementMet) {
            const upgradeBtn = talentDiv.querySelector('.upgrade-btn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    console.log('Achat talent:', branchName, talent.id);
                    upgradeTalent(branchName, talent.id);
                });
            }
        }
    });
}

/**
 * Améliore un talent
 */
function upgradeTalent(branchName, talentId) {
    const talent = TALENTS_DATA[branchName].find(t => t.id === talentId);
    if (!talent) return;

    const branchState = gameState.talents[branchName] || [];
    const talentState = branchState.find(t => t.id === talentId);
    const currentLevel = talentState ? talentState.level : 0;

    // Vérifications
    if (currentLevel >= talent.maxLevel) {
        showNotification('Talent déjà au maximum !', 'error');
        return;
    }

    if (gameState.prestigePoints < talent.cost) {
        showNotification('Pas assez de RP !', 'error');
        return;
    }

    // Vérifier le prérequis
    if (talent.requirement &&
        !branchState.some(t => t.id === talent.requirement && t.level > 0)) {
        showNotification('Prérequis non rempli !', 'error');
        return;
    }

    // Acheter
    gameState.prestigePoints -= talent.cost;

    // Améliorer
    if (talentState) {
        talentState.level++;
    } else {
        if (!gameState.talents[branchName]) {
            gameState.talents[branchName] = [];
        }
        gameState.talents[branchName].push({ id: talentId, level: 1 });
    }

    // Recalculer tout
    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    // Rafraîchir
    renderTalentsList();
    renderGeneratorsList();
    updateMainStats();
    updatePrestigeDisplay();

    showNotification(`${talent.name} amélioré !`, 'success');
}
