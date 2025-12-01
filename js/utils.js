/**
 * =====================================================
 * UTILS.JS - Utility Functions
 * =====================================================
 * Fonctions de calcul et utilitaires
 */

/**
 * Calcule le CPC total
 * Formula: CPC = (base + flatBonus) × globalClickMultiplier × prestigeClickMultiplier
 *          × talentsClickMultiplier × artefactsClickMultiplier × eventClickMultiplier
 */
function calculateTotalCPC() {
    let cpc = GameState.click.base.add(GameState.click.flatBonus);

    // Multiplier de base
    cpc = cpc.multiply(GameState.click.multiplier);

    // Multiplier des upgrades
    const upgradeMultiplier = getUpgradeClickMultiplier();
    cpc = cpc.multiply(upgradeMultiplier);

    // Multiplier de prestige
    const prestigeMultiplier = getPrestigeMultiplier();
    cpc = cpc.multiply(prestigeMultiplier);

    // Multiplier des talents
    const talentMultiplier = getTalentClickMultiplier();
    cpc = cpc.multiply(talentMultiplier);

    // Multiplier des artefacts
    const artefactMultiplier = getArtefactClickMultiplier();
    cpc = cpc.multiply(artefactMultiplier);

    // Multiplier des pets
    const petMultiplier = getPetClickMultiplier();
    cpc = cpc.multiply(petMultiplier);

    // Multiplier des événements
    const eventMultiplier = getEventClickMultiplier();
    cpc = cpc.multiply(eventMultiplier);

    return cpc;
}

/**
 * Calcule le CPS total
 */
function calculateTotalCPS() {
    let totalCps = new BigNumber(0);

    // Pour chaque générateur
    GENERATORS.forEach(gen => {
        const level = GameState.generators[gen.id] || 0;
        if (level === 0) return;

        // Production de base: baseCps * (cpsGrowthPerLevel ^ (level - 1))
        let production = new BigNumber(gen.baseCps).multiply(
            new BigNumber(Math.pow(gen.cpsGrowthPerLevel, level - 1))
        );

        // Bonus de milestone: x2 tous les 25 niveaux
        const milestoneBonus = Math.pow(2, Math.floor(level / 25));
        production = production.multiply(milestoneBonus);

        // Multiplier spécifique au générateur (upgrades)
        const genSpecificMult = getGeneratorSpecificMultiplier(gen.id);
        production = production.multiply(genSpecificMult);

        totalCps = totalCps.add(production);
    });

    // Multiplier global de CPS (upgrades)
    const upgradeMultiplier = getUpgradeCpsMultiplier();
    totalCps = totalCps.multiply(upgradeMultiplier);

    // Multiplier de prestige
    const prestigeMultiplier = getPrestigeMultiplier();
    totalCps = totalCps.multiply(prestigeMultiplier);

    // Multiplier des talents
    const talentMultiplier = getTalentCpsMultiplier();
    totalCps = totalCps.multiply(talentMultiplier);

    // Multiplier des artefacts
    const artefactMultiplier = getArtefactCpsMultiplier();
    totalCps = totalCps.multiply(artefactMultiplier);

    // Multiplier des pets
    const petMultiplier = getPetCpsMultiplier();
    totalCps = totalCps.multiply(petMultiplier);

    // Multiplier des événements
    const eventMultiplier = getEventCpsMultiplier();
    totalCps = totalCps.multiply(eventMultiplier);

    return totalCps;
}

/**
 * Calcule le multiplicateur de prestige
 * prestigeMultiplier = 1 + (totalRP × 0.01)
 */
function getPrestigeMultiplier() {
    let baseMultiplier = 1 + (GameState.prestige.totalRP * 0.01);

    // Bonus des talents de prestige (effectiveness)
    const effectivenessBonus = getTalentPrestigeEffectiveness();
    baseMultiplier *= (1 + effectivenessBonus);

    return baseMultiplier;
}

/**
 * Calcule le multiplicateur de clic des upgrades
 */
function getUpgradeClickMultiplier() {
    let multiplier = 1;
    let flatBonus = 0;

    GameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;

        if (upgrade.type === 'click') {
            if (upgrade.effectType === 'multiplier') {
                multiplier *= upgrade.value;
            } else if (upgrade.effectType === 'flat') {
                flatBonus += upgrade.value;
            }
        } else if (upgrade.type === 'global' && upgrade.effectType === 'all_multiplier') {
            multiplier *= upgrade.value;
        }
    });

    // Ajouter le flat bonus à la base
    if (flatBonus > 0) {
        GameState.click.flatBonus = new BigNumber(flatBonus);
    }

    return multiplier;
}

/**
 * Calcule le multiplicateur de CPS des upgrades
 */
function getUpgradeCpsMultiplier() {
    let multiplier = 1;

    GameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;

        if (upgrade.type === 'global') {
            if (upgrade.effectType === 'cps_multiplier') {
                multiplier *= upgrade.value;
            } else if (upgrade.effectType === 'all_multiplier') {
                multiplier *= upgrade.value;
            }
        }
    });

    return multiplier;
}

/**
 * Calcule le multiplicateur spécifique d'un générateur
 */
function getGeneratorSpecificMultiplier(generatorId) {
    let multiplier = 1;

    GameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;

        if (upgrade.type === 'generator' &&
            upgrade.effectType === 'specific' &&
            upgrade.targetGenerator === generatorId) {
            multiplier *= upgrade.value;
        }
    });

    // Artefacts
    GameState.artefacts.equipped.forEach(artefactId => {
        const artefact = ARTEFACTS.find(a => a.id === artefactId);
        if (!artefact) return;

        if (artefact.effectType === 'generator_specific' &&
            artefact.targetGenerator === generatorId) {
            multiplier *= artefact.value;
        }
    });

    return multiplier;
}

/**
 * Multiplicateurs des talents
 */
function getTalentClickMultiplier() {
    let multiplier = 1;

    const clickTalents = GameState.talents.click;
    for (let talentId in clickTalents) {
        const level = clickTalents[talentId];
        const talent = TALENTS.click.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'cpc_multiplier') {
            multiplier *= (1 + talent.valuePerLevel * level);
        }
    }

    return multiplier;
}

function getTalentCpsMultiplier() {
    let multiplier = 1;

    const genTalents = GameState.talents.generators;
    for (let talentId in genTalents) {
        const level = genTalents[talentId];
        const talent = TALENTS.generators.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'cps_multiplier') {
            multiplier *= (1 + talent.valuePerLevel * level);
        }
    }

    return multiplier;
}

function getTalentPrestigeEffectiveness() {
    let bonus = 0;

    const prestigeTalents = GameState.talents.prestige;
    for (let talentId in prestigeTalents) {
        const level = prestigeTalents[talentId];
        const talent = TALENTS.prestige.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'rp_effectiveness') {
            bonus += talent.valuePerLevel * level;
        }
    }

    return bonus;
}

/**
 * Multiplicateurs des artefacts
 */
function getArtefactClickMultiplier() {
    let multiplier = 1;

    GameState.artefacts.equipped.forEach(artefactId => {
        const artefact = ARTEFACTS.find(a => a.id === artefactId);
        if (!artefact) return;

        if (artefact.effectType === 'cpc_multiplier') {
            multiplier *= artefact.value;
        } else if (artefact.effectType === 'global_multiplier') {
            multiplier *= artefact.cpcValue;
        } else if (artefact.effectType === 'crit') {
            // Géré séparément dans les stats de crit
        }
    });

    return multiplier;
}

function getArtefactCpsMultiplier() {
    let multiplier = 1;

    GameState.artefacts.equipped.forEach(artefactId => {
        const artefact = ARTEFACTS.find(a => a.id === artefactId);
        if (!artefact) return;

        if (artefact.effectType === 'global_multiplier') {
            multiplier *= artefact.cpsValue;
        }
    });

    return multiplier;
}

/**
 * Multiplicateurs des pets
 */
function getPetClickMultiplier() {
    let multiplier = 1;

    GameState.pets.owned.forEach(petId => {
        const pet = PETS.find(p => p.id === petId);
        if (!pet) return;

        if (pet.passiveBonusType === 'cpc') {
            multiplier *= (1 + pet.passiveValue);
        } else if (pet.passiveBonusType === 'global') {
            multiplier *= (1 + pet.passiveValue);
        }
    });

    // Bonus actif
    const activeEvent = GameState.activeEvents.find(e => e.type === 'pet_cpc');
    if (activeEvent) {
        multiplier *= activeEvent.multiplier;
    }

    return multiplier;
}

function getPetCpsMultiplier() {
    let multiplier = 1;

    GameState.pets.owned.forEach(petId => {
        const pet = PETS.find(p => p.id === petId);
        if (!pet) return;

        if (pet.passiveBonusType === 'cps_global') {
            multiplier *= (1 + pet.passiveValue);
        } else if (pet.passiveBonusType === 'global') {
            multiplier *= (1 + pet.passiveValue);
        }
    });

    // Bonus actif
    const activeEvent = GameState.activeEvents.find(e => e.type === 'pet_cps');
    if (activeEvent) {
        multiplier *= activeEvent.multiplier;
    }

    return multiplier;
}

/**
 * Multiplicateurs des événements
 */
function getEventClickMultiplier() {
    let multiplier = 1;

    GameState.activeEvents.forEach(event => {
        if (event.type === 'cpc_multiplier' || event.type === 'all_multiplier') {
            multiplier *= event.multiplier;
        }
    });

    return multiplier;
}

function getEventCpsMultiplier() {
    let multiplier = 1;

    GameState.activeEvents.forEach(event => {
        if (event.type === 'cps_multiplier' || event.type === 'all_multiplier') {
            multiplier *= event.multiplier;
        }
    });

    return multiplier;
}

/**
 * Calcule la réduction de coût des générateurs
 */
function getGeneratorCostReduction() {
    let reduction = 0;

    // Upgrades
    GameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;

        if (upgrade.effectType === 'cost_reduction') {
            reduction += upgrade.value;
        }
    });

    // Talents
    const genTalents = GameState.talents.generators;
    for (let talentId in genTalents) {
        const level = genTalents[talentId];
        const talent = TALENTS.generators.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'cost_reduction') {
            reduction += talent.valuePerLevel * level;
        }
    }

    // Cap à 50%
    return Math.min(reduction, 0.50);
}

/**
 * Calcule le coût d'un générateur au niveau actuel
 */
function getGeneratorCost(generatorId) {
    const gen = GENERATORS.find(g => g.id === generatorId);
    if (!gen) return new BigNumber(0);

    const level = GameState.generators[generatorId] || 0;

    // Formule: baseCost * (costMultiplier ^ level)
    let cost = new BigNumber(gen.baseCost).multiply(
        new BigNumber(Math.pow(gen.costMultiplier, level))
    );

    // Réduction de coût
    const reduction = getGeneratorCostReduction();
    cost = cost.multiply(1 - reduction);

    return cost;
}

/**
 * Calcule les RP obtenus au prestige
 * Formula: floor(max(0, sqrt(currentShards / 1e6)))
 */
function calculatePrestigeRP() {
    const divider = new BigNumber(1000000);
    const ratio = GameState.shards.divide(divider);

    if (ratio.lessThan(1)) return 0;

    let rp = Math.floor(ratio.sqrt().toNumber());

    // Bonus des talents
    const genTalents = GameState.talents.prestige;
    for (let talentId in genTalents) {
        const level = genTalents[talentId];
        const talent = TALENTS.prestige.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'rp_gain') {
            rp *= (1 + talent.valuePerLevel * level);
        }
    }

    // Bonus des artefacts
    GameState.artefacts.equipped.forEach(artefactId => {
        const artefact = ARTEFACTS.find(a => a.id === artefactId);
        if (!artefact) return;

        if (artefact.effectType === 'rp_gain') {
            rp *= (1 + artefact.value);
        }
    });

    return Math.floor(rp);
}

/**
 * Met à jour les stats de critique
 */
function updateCritStats() {
    let critChance = GameState.click.critChance;
    let critMultiplier = GameState.click.critMultiplier;

    // Upgrades
    GameState.upgrades.forEach(upgradeId => {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;

        if (upgrade.effectType === 'crit_chance') {
            critChance += upgrade.value;
        } else if (upgrade.effectType === 'crit_multiplier') {
            critMultiplier += upgrade.value;
        }
    });

    // Talents
    const clickTalents = GameState.talents.click;
    for (let talentId in clickTalents) {
        const level = clickTalents[talentId];
        const talent = TALENTS.click.find(t => t.id === talentId);
        if (!talent) continue;

        if (talent.effectType === 'crit_chance') {
            critChance += talent.valuePerLevel * level;
        } else if (talent.effectType === 'crit_multiplier') {
            critMultiplier += talent.valuePerLevel * level;
        }
    }

    // Artefacts
    GameState.artefacts.equipped.forEach(artefactId => {
        const artefact = ARTEFACTS.find(a => a.id === artefactId);
        if (!artefact) return;

        if (artefact.effectType === 'crit') {
            critChance += artefact.critChance || 0;
            critMultiplier += artefact.critMultiplier || 0;
        }
    });

    // Caps
    GameState.click.critChance = Math.min(critChance, 0.50);
    GameState.click.critMultiplier = Math.min(critMultiplier, 20);
}
