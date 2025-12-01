/**
 * =====================================================
 * SAVE.JS - Save/Load System
 * =====================================================
 * Gestion de la sauvegarde localStorage
 */

const SAVE_KEY = 'shard_clicker_save';

/**
 * Sauvegarde le jeu
 */
function saveGame() {
    try {
        // Convertir BigNumbers en objets sérialisables
        const saveData = {
            shards: { mantissa: GameState.shards.mantissa, exponent: GameState.shards.exponent },
            totalCps: { mantissa: GameState.totalCps.mantissa, exponent: GameState.totalCps.exponent },
            totalCpc: { mantissa: GameState.totalCpc.mantissa, exponent: GameState.totalCpc.exponent },
            click: {
                base: { mantissa: GameState.click.base.mantissa, exponent: GameState.click.base.exponent },
                flatBonus: { mantissa: GameState.click.flatBonus.mantissa, exponent: GameState.click.flatBonus.exponent },
                multiplier: { mantissa: GameState.click.multiplier.mantissa, exponent: GameState.click.multiplier.exponent },
                critChance: GameState.click.critChance,
                critMultiplier: GameState.click.critMultiplier
            },
            generators: GameState.generators,
            upgrades: GameState.upgrades,
            prestige: GameState.prestige,
            talents: GameState.talents,
            artefacts: GameState.artefacts,
            pets: GameState.pets,
            boss: {
                active: GameState.boss.active,
                hp: { mantissa: GameState.boss.hp.mantissa, exponent: GameState.boss.hp.exponent },
                maxHp: { mantissa: GameState.boss.maxHp.mantissa, exponent: GameState.boss.maxHp.exponent },
                defeated: GameState.boss.defeated,
                cooldown: GameState.boss.cooldown
            },
            quests: GameState.quests,
            stats: {
                totalClicks: GameState.stats.totalClicks,
                totalShardsEarned: { mantissa: GameState.stats.totalShardsEarned.mantissa, exponent: GameState.stats.totalShardsEarned.exponent },
                playTime: GameState.stats.playTime,
                generatorsBought: GameState.stats.generatorsBought,
                upgradesBought: GameState.stats.upgradesBought
            },
            lastSave: Date.now()
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        GameState.lastSave = Date.now();

        showNotification("Game saved!", "success");
        return true;
    } catch (error) {
        console.error("Save error:", error);
        showNotification("Save failed!", "error");
        return false;
    }
}

/**
 * Charge le jeu
 */
function loadGame() {
    try {
        const saveDataStr = localStorage.getItem(SAVE_KEY);
        if (!saveDataStr) return false;

        const saveData = JSON.parse(saveDataStr);

        // Restaurer les BigNumbers
        GameState.shards = new BigNumber(0);
        GameState.shards.mantissa = saveData.shards.mantissa;
        GameState.shards.exponent = saveData.shards.exponent;

        GameState.totalCps = new BigNumber(0);
        GameState.totalCps.mantissa = saveData.totalCps.mantissa;
        GameState.totalCps.exponent = saveData.totalCps.exponent;

        GameState.totalCpc = new BigNumber(0);
        GameState.totalCpc.mantissa = saveData.totalCpc.mantissa;
        GameState.totalCpc.exponent = saveData.totalCpc.exponent;

        GameState.click.base = new BigNumber(0);
        GameState.click.base.mantissa = saveData.click.base.mantissa;
        GameState.click.base.exponent = saveData.click.base.exponent;

        GameState.click.flatBonus = new BigNumber(0);
        GameState.click.flatBonus.mantissa = saveData.click.flatBonus.mantissa;
        GameState.click.flatBonus.exponent = saveData.click.flatBonus.exponent;

        GameState.click.multiplier = new BigNumber(0);
        GameState.click.multiplier.mantissa = saveData.click.multiplier.mantissa;
        GameState.click.multiplier.exponent = saveData.click.multiplier.exponent;

        GameState.click.critChance = saveData.click.critChance;
        GameState.click.critMultiplier = saveData.click.critMultiplier;

        GameState.generators = saveData.generators;
        GameState.upgrades = saveData.upgrades;
        GameState.prestige = saveData.prestige;
        GameState.talents = saveData.talents;
        GameState.artefacts = saveData.artefacts;
        GameState.pets = saveData.pets;

        GameState.boss.active = saveData.boss.active;
        GameState.boss.hp = new BigNumber(0);
        GameState.boss.hp.mantissa = saveData.boss.hp.mantissa;
        GameState.boss.hp.exponent = saveData.boss.hp.exponent;
        GameState.boss.maxHp = new BigNumber(0);
        GameState.boss.maxHp.mantissa = saveData.boss.maxHp.mantissa;
        GameState.boss.maxHp.exponent = saveData.boss.maxHp.exponent;
        GameState.boss.defeated = saveData.boss.defeated;
        GameState.boss.cooldown = saveData.boss.cooldown;

        GameState.quests = saveData.quests;

        GameState.stats.totalClicks = saveData.stats.totalClicks;
        GameState.stats.totalShardsEarned = new BigNumber(0);
        GameState.stats.totalShardsEarned.mantissa = saveData.stats.totalShardsEarned.mantissa;
        GameState.stats.totalShardsEarned.exponent = saveData.stats.totalShardsEarned.exponent;
        GameState.stats.playTime = saveData.stats.playTime;
        GameState.stats.generatorsBought = saveData.stats.generatorsBought;
        GameState.stats.upgradesBought = saveData.stats.upgradesBought;

        // Calculer le temps offline
        const now = Date.now();
        const offlineTime = (now - saveData.lastSave) / 1000; // en secondes
        const offlineShards = GameState.totalCps.multiply(offlineTime);
        GameState.shards = GameState.shards.add(offlineShards);

        if (offlineTime > 60) {
            showNotification(`Welcome back! Earned ${formatNumber(offlineShards)} Shards offline!`, "info");
        }

        recalculateProduction();
        return true;
    } catch (error) {
        console.error("Load error:", error);
        showNotification("Load failed! Starting new game.", "error");
        return false;
    }
}

/**
 * Réinitialise le jeu
 */
function resetGame() {
    if (!confirm("Are you sure you want to reset ALL progress? This cannot be undone!")) {
        return;
    }

    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

/**
 * Exporte la sauvegarde
 */
function exportSave() {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) {
        showNotification("No save to export!", "error");
        return;
    }

    const blob = new Blob([saveDataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shard_clicker_save.txt';
    a.click();
    URL.revokeObjectURL(url);

    showNotification("Save exported!", "success");
}

/**
 * Importe une sauvegarde
 */
function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const saveDataStr = event.target.result;
                localStorage.setItem(SAVE_KEY, saveDataStr);
                location.reload();
            } catch (error) {
                showNotification("Import failed! Invalid save file.", "error");
            }
        };
        reader.readAsText(file);
    };

    input.click();
}
