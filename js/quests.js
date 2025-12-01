/**
 * =====================================================
 * QUESTS.JS - Quest System
 * =====================================================
 * Gestion des quêtes journalières
 */

/**
 * Génère des quêtes journalières
 */
function generateDailyQuests() {
    GameState.quests.active = [];
    GameState.quests.progress = {};

    // Sélectionner 3 quêtes aléatoires
    const available = QUESTS.filter(q => !GameState.quests.completed.includes(q.id));
    const selected = [];

    while (selected.length < 3 && available.length > 0) {
        const index = Math.floor(Math.random() * available.length);
        selected.push(available[index]);
        available.splice(index, 1);
    }

    GameState.quests.active = selected.map(q => q.id);

    updateQuestsUI();
}

/**
 * Met à jour la progression d'une quête
 */
function updateQuestProgress(type, amount) {
    GameState.quests.active.forEach(questId => {
        const quest = QUESTS.find(q => q.id === questId);
        if (!quest || quest.targetType !== type) return;

        // Mettre à jour la progression
        if (!GameState.quests.progress[questId]) {
            GameState.quests.progress[questId] = 0;
        }

        GameState.quests.progress[questId] += amount;

        // Vérifier si complétée
        if (GameState.quests.progress[questId] >= quest.targetValue) {
            completeQuest(questId);
        }
    });

    updateQuestsUI();
}

/**
 * Complète une quête
 */
function completeQuest(questId) {
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;

    // Récompenses
    if (quest.rewardShards) {
        GameState.shards = GameState.shards.add(new BigNumber(quest.rewardShards));
    }
    if (quest.rewardRP) {
        GameState.prestige.currentRP += quest.rewardRP;
        GameState.prestige.totalRP += quest.rewardRP;
    }

    // Récompense de pet
    if (quest.rewardPet) {
        unlockPet(quest.rewardPet);
    }

    // Marquer comme complétée
    GameState.quests.completed.push(questId);
    const index = GameState.quests.active.indexOf(questId);
    if (index !== -1) {
        GameState.quests.active.splice(index, 1);
    }

    updateQuestsUI();
    updateStatsUI();
    updatePrestigeUI();

    showNotification(`Quête complétée ! Récompenses réclamées !`, "success");
}

/**
 * Met à jour l'UI des quêtes
 */
function updateQuestsUI() {
    const container = document.getElementById('quests-list');
    if (!container) return;

    container.innerHTML = '';

    if (GameState.quests.active.length === 0) {
        container.innerHTML = '<p>No active quests. Generate new daily quests!</p>';
        return;
    }

    GameState.quests.active.forEach(questId => {
        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) return;

        const progress = GameState.quests.progress[questId] || 0;
        const percentage = Math.min(100, (progress / quest.targetValue) * 100);

        const div = document.createElement('div');
        div.className = 'quest-item';
        div.innerHTML = `
            <div class="quest-info">
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">
                    <div class="quest-progress-bar">
                        <div class="quest-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span>${formatNumber(progress)} / ${formatNumber(quest.targetValue)}</span>
                </div>
                <div class="quest-rewards">
                    Récompenses:
                    ${quest.rewardShards ? formatNumber(quest.rewardShards) + ' Shards' : ''}
                    ${quest.rewardRP ? quest.rewardRP + ' RP' : ''}
                    ${quest.rewardPet ? '<strong>🐾 PET !</strong>' : ''}
                </div>
            </div>
        `;

        container.appendChild(div);
    });
}
