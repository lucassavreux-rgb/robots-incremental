/**
 * =====================================================
 * QUESTS.JS - Système de Quêtes Journalières
 * =====================================================
 * Quêtes avec récompenses et reset journalier
 */

/**
 * Initialise le système de quêtes
 */
function initQuests() {
    generateDailyQuests();
    renderQuestsList();
    updateQuestResetTimer();
}

/**
 * Génère les quêtes journalières
 */
function generateDailyQuests() {
    const now = Date.now();
    const lastReset = gameState.questsLastReset || 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    // Reset si plus de 24h
    if (now - lastReset > dayInMs) {
        gameState.activeQuests = [];
        gameState.questsLastReset = now;

        // Sélectionner 3 quêtes aléatoires
        const shuffled = [...QUESTS_TEMPLATES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        selected.forEach(template => {
            const quest = {
                id: template.id + '_' + Date.now(),
                templateId: template.id,
                name: template.name,
                description: template.description,
                type: template.type,
                target: Math.floor(template.targetBase * Math.pow(template.targetScaling, gameState.stats.prestigeCount)),
                progress: 0,
                completed: false,
                claimed: false,
                reward: template.reward
            };

            // Remplacer {target} dans la description
            quest.description = quest.description.replace('{target}', formatNumber(quest.target));

            gameState.activeQuests.push(quest);
        });
    }
}

/**
 * Affiche les quêtes
 */
function renderQuestsList() {
    const container = document.getElementById('quests-list');
    container.innerHTML = '';

    if (gameState.activeQuests.length === 0) {
        container.innerHTML = '<p style="color: #a0a0a0;">Aucune quête active</p>';
        return;
    }

    gameState.activeQuests.forEach(quest => {
        const questDiv = document.createElement('div');
        questDiv.classList.add('quest-item');

        if (quest.completed) {
            questDiv.classList.add('completed');
        }

        const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);

        let rewardText = '';
        if (quest.reward.type === 'rp') {
            const rpAmount = Math.floor(quest.reward.base * Math.pow(quest.reward.scaling || 1, gameState.stats.prestigeCount));
            rewardText = `${rpAmount} RP`;
        } else if (quest.reward.type === 'coins') {
            const coinsAmount = Math.floor(quest.reward.base * Math.pow(quest.reward.scaling || 1, gameState.stats.prestigeCount));
            rewardText = `${formatNumber(coinsAmount)} coins`;
        } else if (quest.reward.type === 'boost') {
            rewardText = 'Boost x2 (30s)';
        }

        questDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">${quest.name}</div>
                <div class="item-description">${quest.description}</div>
                <div class="quest-progress">
                    Progression: ${formatNumber(quest.progress)} / ${formatNumber(quest.target)} (${progressPercent.toFixed(0)}%)
                </div>
                <div class="quest-reward">Récompense: ${rewardText}</div>
            </div>
            <div class="item-action">
                ${quest.completed && !quest.claimed ?
                    `<button class="claim-btn" onclick="claimQuestReward('${quest.id}')">
                        Réclamer
                    </button>` :
                    quest.claimed ?
                    '<span style="color: #28a745;">✓ TERMINÉ</span>' :
                    '<span style="color: #ffc107;">En cours...</span>'
                }
            </div>
        `;

        container.appendChild(questDiv);
    });
}

/**
 * Met à jour la progression d'une quête
 */
function updateQuestProgress(type, amount) {
    let updated = false;

    gameState.activeQuests.forEach(quest => {
        if (quest.type === type && !quest.completed) {
            quest.progress += amount;

            if (quest.progress >= quest.target) {
                quest.progress = quest.target;
                quest.completed = true;
                showNotification(`Quête complétée : ${quest.name} !`, 'success');
                updated = true;
            }
        }
    });

    if (updated) {
        renderQuestsList();
    }
}

/**
 * Réclame la récompense d'une quête
 */
function claimQuestReward(questId) {
    const quest = gameState.activeQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    quest.claimed = true;

    // Donner la récompense
    if (quest.reward.type === 'rp') {
        const rpAmount = Math.floor(quest.reward.base * Math.pow(quest.reward.scaling || 1, gameState.stats.prestigeCount));
        gameState.prestigePoints += rpAmount;
        showNotification(`+${rpAmount} RP !`, 'success');
    } else if (quest.reward.type === 'coins') {
        const coinsAmount = Math.floor(quest.reward.base * Math.pow(quest.reward.scaling || 1, gameState.stats.prestigeCount));
        addCoins(coinsAmount);
        showNotification(`+${formatNumber(coinsAmount)} coins !`, 'success');
    } else if (quest.reward.type === 'boost') {
        addActiveEvent('power_boost', 2, 30000);
        showNotification('Boost x2 activé !', 'success');
    }

    renderQuestsList();
    updateMainStats();
}

/**
 * Met à jour le timer de reset des quêtes
 */
function updateQuestResetTimer() {
    const now = Date.now();
    const lastReset = gameState.questsLastReset || now;
    const dayInMs = 24 * 60 * 60 * 1000;
    const nextReset = lastReset + dayInMs;
    const timeLeft = Math.max(0, nextReset - now);

    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

    document.getElementById('quest-reset-timer').textContent =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
