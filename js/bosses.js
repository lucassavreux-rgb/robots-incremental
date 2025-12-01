/**
 * =====================================================
 * BOSSES.JS - Système de Boss Fights
 * =====================================================
 * Boss qui apparaissent régulièrement avec récompenses
 */

/**
 * Initialise le système de boss
 */
function initBosses() {
    updateBossDisplay();
}

/**
 * Met à jour l'affichage du boss
 */
function updateBossDisplay() {
    if (!gameState.currentBoss) {
        document.getElementById('boss-number').textContent = gameState.stats.bossesDefeated + 1;
        document.getElementById('boss-hp-text').textContent = 'Aucun boss';
        document.getElementById('boss-hp-fill').style.width = '0%';
        document.getElementById('boss-timer').textContent = '--:--';
        return;
    }

    const boss = gameState.currentBoss;
    const hpPercent = (boss.currentHP / boss.maxHP) * 100;

    document.getElementById('boss-number').textContent = boss.number;
    document.getElementById('boss-hp-fill').style.width = hpPercent + '%';
    document.getElementById('boss-hp-text').textContent =
        `${formatNumber(boss.currentHP)} / ${formatNumber(boss.maxHP)}`;
}

/**
 * Met à jour le timer du prochain boss
 */
function updateBossTimer() {
    const now = Date.now();
    const nextBossTime = gameState.nextBossTime || now;
    const timeLeft = Math.max(0, nextBossTime - now);

    if (timeLeft === 0 && !gameState.currentBoss) {
        spawnBoss();
    }

    document.getElementById('boss-timer').textContent = formatTimeMS(timeLeft);
}

/**
 * Fait apparaître un boss
 */
function spawnBoss() {
    const bossNumber = gameState.stats.bossesDefeated + 1;

    // HP exponentiel
    const baseHP = 1000;
    const maxHP = Math.floor(baseHP * Math.pow(2, bossNumber - 1));

    gameState.currentBoss = {
        number: bossNumber,
        maxHP: maxHP,
        currentHP: maxHP
    };

    updateBossDisplay();
    showNotification(`Boss #${bossNumber} apparu !`, 'info');
}

/**
 * Attaque le boss
 */
function attackBoss() {
    if (!gameState.currentBoss) return;

    const boss = gameState.currentBoss;
    let damage = gameState.cpc;

    // Bonus des artefacts
    gameState.equippedArtefacts.forEach(artefactId => {
        const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
        if (artefact && artefact.effect.type === 'boss_damage') {
            damage *= artefact.effect.value;
        }
    });

    boss.currentHP -= damage;

    if (boss.currentHP <= 0) {
        defeatBoss();
    }

    updateBossDisplay();
}

/**
 * Défait le boss
 */
function defeatBoss() {
    const bossNumber = gameState.currentBoss.number;

    // Récompenses
    const coinsReward = 1000 * Math.pow(2, bossNumber - 1);
    addCoins(coinsReward);

    // Chance d'artefact (10%)
    if (Math.random() < 0.1) {
        unlockRandomArtefact();
    }

    // Stats
    gameState.stats.bossesDefeated++;

    // Quêtes
    updateQuestProgress('bosses', 1);

    // Prochain boss dans 5 minutes
    gameState.nextBossTime = Date.now() + (5 * 60 * 1000);
    gameState.currentBoss = null;

    updateBossDisplay();
    showNotification(`Boss #${bossNumber} vaincu ! +${formatNumber(coinsReward)} coins`, 'success');
}
