/**
 * =====================================================
 * BOSSES.JS - Boss Fight System
 * =====================================================
 * Gestion des combats de boss
 */

/**
 * Lance un combat de boss
 */
function startBoss() {
    if (GameState.boss.active) {
        showNotification("A boss is already active!", "error");
        return;
    }

    // Vérifier cooldown
    const now = Date.now();
    if (GameState.boss.cooldown > now) {
        const remaining = Math.ceil((GameState.boss.cooldown - now) / 1000);
        showNotification(`Cooldown: ${remaining}s remaining`, "error");
        return;
    }

    // Calculer HP du boss
    const baseBossHP = 100000;
    const hp = new BigNumber(baseBossHP).multiply(
        new BigNumber(Math.pow(1.5, GameState.boss.defeated))
    );

    // Activer le boss
    GameState.boss.active = true;
    GameState.boss.hp = hp;
    GameState.boss.maxHp = hp;

    // Timer de 30 secondes
    setTimeout(() => {
        if (GameState.boss.active) {
            failBoss();
        }
    }, 30000);

    updateBossUI();
    showNotification("Boss spawned! You have 30 seconds!", "info");
}

/**
 * Boss vaincu
 */
function defeatBoss() {
    if (!GameState.boss.active) return;

    GameState.boss.active = false;
    GameState.boss.defeated++;
    GameState.boss.cooldown = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Récompenses
    const rewardShards = GameState.boss.maxHp.multiply(10);
    const rewardRP = Math.max(1, Math.floor(GameState.boss.defeated / 5));

    GameState.shards = GameState.shards.add(rewardShards);
    GameState.prestige.currentRP += rewardRP;
    GameState.prestige.totalRP += rewardRP;

    // Chance d'artefact (20%)
    if (Math.random() < 0.20) {
        const availableArtefacts = ARTEFACTS.filter(a => !GameState.artefacts.owned.includes(a.id));
        if (availableArtefacts.length > 0) {
            const randomArtefact = availableArtefacts[Math.floor(Math.random() * availableArtefacts.length)];
            addArtefact(randomArtefact.id);
        }
    }

    updateBossUI();
    updateStatsUI();
    updatePrestigeUI();
    updateQuestProgress('boss_killed', 1);

    showNotification(`Boss defeated! Rewards: ${formatNumber(rewardShards)} Shards, ${rewardRP} RP`, "success");
}

/**
 * Boss échoué (timeout)
 */
function failBoss() {
    if (!GameState.boss.active) return;

    GameState.boss.active = false;
    GameState.boss.cooldown = Date.now() + (5 * 60 * 1000); // 5 minutes

    updateBossUI();
    showNotification("Boss escaped!", "error");
}

/**
 * Met à jour l'UI du boss
 */
function updateBossUI() {
    const container = document.getElementById('boss-container');
    if (!container) return;

    if (!GameState.boss.active) {
        // Afficher le bouton de lancement
        const now = Date.now();
        const onCooldown = GameState.boss.cooldown > now;
        const cooldownRemaining = onCooldown ? Math.ceil((GameState.boss.cooldown - now) / 1000) : 0;

        container.innerHTML = `
            <div class="boss-info">
                <p>Bosses defeated: ${GameState.boss.defeated}</p>
                <button class="btn btn-boss" onclick="startBoss()" ${onCooldown ? 'disabled' : ''}>
                    ${onCooldown ? `Cooldown: ${cooldownRemaining}s` : 'Start Boss Fight'}
                </button>
            </div>
        `;
    } else {
        // Afficher le boss actif
        const hpPercentage = GameState.boss.hp.divide(GameState.boss.maxHp).multiply(100).toNumber();

        container.innerHTML = `
            <div class="boss-active">
                <h3>BOSS FIGHT!</h3>
                <div class="boss-hp-bar">
                    <div class="boss-hp-fill" style="width: ${hpPercentage}%"></div>
                </div>
                <p>${formatNumber(GameState.boss.hp)} / ${formatNumber(GameState.boss.maxHp)} HP</p>
                <p>Click to deal damage!</p>
            </div>
        `;
    }
}
