/**
 * =====================================================
 * CLICK.JS - Click Management
 * =====================================================
 * Gestion du clic principal
 */

/**
 * Gère un clic
 */
function handleMainClick() {
    let cpc = GameState.totalCpc;

    // Vérifier critique
    const isCrit = Math.random() < GameState.click.critChance;
    if (isCrit) {
        cpc = cpc.multiply(GameState.click.critMultiplier);
    }

    // Ajouter les Shards
    GameState.shards = GameState.shards.add(cpc);
    GameState.stats.totalShardsEarned = GameState.stats.totalShardsEarned.add(cpc);
    GameState.stats.totalClicks++;

    // Dégâts au boss si actif
    if (GameState.boss.active) {
        GameState.boss.hp = GameState.boss.hp.subtract(cpc);

        // Vérifier défaite ET clamper à 0
        if (GameState.boss.hp.lessThanOrEqual(0)) {
            GameState.boss.hp = new BigNumber(0);
            defeatBoss();
        }

        updateBossUI();
    }

    // Animation de clic
    createClickAnimation(isCrit ? formatNumber(cpc) + " CRIT!" : formatNumber(cpc));

    // Mise à jour UI
    updateStatsUI();

    // Quête
    updateQuestProgress('clicks', 1);
    updateQuestProgress('shards_earned', cpc.toNumber());
}

/**
 * Crée une animation de clic
 */
function createClickAnimation(text) {
    const clickBtn = document.getElementById('main-click-button');
    if (!clickBtn) return;

    const rect = clickBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 100;
    const y = rect.top + rect.height / 2;

    const span = document.createElement('span');
    span.className = 'click-animation';
    span.textContent = text;
    span.style.left = x + 'px';
    span.style.top = y + 'px';

    document.body.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 1000);
}
