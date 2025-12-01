/**
 * =====================================================
 * TALENTS.JS - Talent Tree System
 * =====================================================
 * Gestion de l'arbre de talents
 */

/**
 * Achète un niveau de talent
 */
function buyTalent(branchName, talentId) {
    const talent = TALENTS[branchName].find(t => t.id === talentId);
    if (!talent) return false;

    const currentLevel = GameState.talents[branchName][talentId] || 0;

    if (currentLevel >= talent.maxLevel) {
        showNotification("Talent already maxed!", "error");
        return false;
    }

    if (GameState.prestige.currentRP < talent.rpCost) {
        showNotification("Not enough RP!", "error");
        return false;
    }

    // Acheter
    GameState.prestige.currentRP -= talent.rpCost;
    GameState.talents[branchName][talentId] = currentLevel + 1;

    // Recalculer
    updateCritStats();
    recalculateProduction();

    // UI
    updateTalentsUI();
    updatePrestigeUI();
    updateStatsUI();

    showNotification(`${talent.name} upgraded!`, "success");
    return true;
}

/**
 * Met à jour l'UI des talents
 */
function updateTalentsUI() {
    for (let branchName in TALENTS) {
        const containerId = `talents-${branchName}-list`;
        const container = document.getElementById(containerId);
        if (!container) continue;

        container.innerHTML = '';

        TALENTS[branchName].forEach(talent => {
            const level = GameState.talents[branchName][talent.id] || 0;
            const canBuy = GameState.prestige.currentRP >= talent.rpCost && level < talent.maxLevel;

            const div = document.createElement('div');
            div.className = 'talent-item' + (level > 0 ? ' talent-purchased' : '') + (canBuy ? '' : ' disabled');
            div.innerHTML = `
                <div class="talent-info">
                    <div class="talent-name">${talent.name}</div>
                    <div class="talent-description">${talent.description}</div>
                    <div class="talent-level">Level: ${level}/${talent.maxLevel}</div>
                </div>
                <div class="talent-actions">
                    <div class="talent-cost">${talent.rpCost} RP</div>
                    <button class="btn btn-buy" onclick="buyTalent('${branchName}', '${talent.id}')" ${canBuy ? '' : 'disabled'}>
                        ${level >= talent.maxLevel ? 'MAX' : 'Upgrade'}
                    </button>
                </div>
            `;

            container.appendChild(div);
        });
    }
}
