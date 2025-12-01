/**
 * =====================================================
 * DATA.JS - Game Data Constants
 * =====================================================
 * Toutes les données du jeu (générateurs, upgrades, talents, etc.)
 */

// ========== GÉNÉRATEURS ==========
const GENERATORS = [
    {
        id: "click_drone",
        name: "Click Drone",
        baseCost: 50,
        costMultiplier: 1.15,
        baseCps: 0.5,
        cpsGrowthPerLevel: 1.05
    },
    {
        id: "shard_mine",
        name: "Shard Mine",
        baseCost: 500,
        costMultiplier: 1.15,
        baseCps: 5,
        cpsGrowthPerLevel: 1.06
    },
    {
        id: "nano_factory",
        name: "Nano Factory",
        baseCost: 5000,
        costMultiplier: 1.16,
        baseCps: 40,
        cpsGrowthPerLevel: 1.06
    },
    {
        id: "crystal_lab",
        name: "Crystal Laboratory",
        baseCost: 50000,
        costMultiplier: 1.17,
        baseCps: 300,
        cpsGrowthPerLevel: 1.07
    },
    {
        id: "temporal_reactor",
        name: "Temporal Reactor",
        baseCost: 600000,
        costMultiplier: 1.18,
        baseCps: 2500,
        cpsGrowthPerLevel: 1.07
    },
    {
        id: "dimensional_portal",
        name: "Dimensional Portal",
        baseCost: 7000000,
        costMultiplier: 1.19,
        baseCps: 20000,
        cpsGrowthPerLevel: 1.08
    },
    {
        id: "galactic_core",
        name: "Galactic Core",
        baseCost: 90000000,
        costMultiplier: 1.20,
        baseCps: 150000,
        cpsGrowthPerLevel: 1.08
    },
    {
        id: "quantum_singularity",
        name: "Quantum Singularity",
        baseCost: 1200000000,
        costMultiplier: 1.21,
        baseCps: 1200000,
        cpsGrowthPerLevel: 1.09
    }
];

// ========== UPGRADES ==========
const UPGRADES = [
    // Click upgrades
    {
        id: "click_flat_1",
        name: "Meilleur Doigt",
        description: "+1 Shard par clic",
        cost: 100,
        type: "click",
        effectType: "flat",
        value: 1
    },
    {
        id: "click_flat_2",
        name: "Doigts Puissants",
        description: "+10 Shards par clic",
        cost: 1000,
        type: "click",
        effectType: "flat",
        value: 10
    },
    {
        id: "click_flat_3",
        name: "Mains Surpuissantes",
        description: "+100 Shards par clic",
        cost: 50000,
        type: "click",
        effectType: "flat",
        value: 100
    },
    {
        id: "click_mult_1",
        name: "Amplificateur de Clic",
        description: "×2 puissance de clic",
        cost: 10000,
        type: "click",
        effectType: "multiplier",
        value: 2
    },
    {
        id: "click_mult_2",
        name: "Cliqueur Quantique",
        description: "×3 puissance de clic",
        cost: 500000,
        type: "click",
        effectType: "multiplier",
        value: 3
    },
    {
        id: "click_crit_1",
        name: "Frappe Précise",
        description: "+5% chance de critique",
        cost: 25000,
        type: "click",
        effectType: "crit_chance",
        value: 0.05
    },
    {
        id: "click_crit_2",
        name: "Maître Frappeur",
        description: "+10% chance de critique",
        cost: 250000,
        type: "click",
        effectType: "crit_chance",
        value: 0.10
    },
    {
        id: "click_crit_mult_1",
        name: "Coup Dévastateur",
        description: "+2 au multiplicateur critique",
        cost: 100000,
        type: "click",
        effectType: "crit_multiplier",
        value: 2
    },
    // Generator specific
    {
        id: "generator_mine_mult_1",
        name: "Minage Amélioré",
        description: "×2 production Shard Mine",
        cost: 50000,
        type: "generator",
        effectType: "specific",
        targetGenerator: "shard_mine",
        value: 2
    },
    {
        id: "generator_factory_mult_1",
        name: "Optimisation Nano",
        description: "×2 production Nano Factory",
        cost: 200000,
        type: "generator",
        effectType: "specific",
        targetGenerator: "nano_factory",
        value: 2
    },
    {
        id: "generator_lab_mult_1",
        name: "Amélioration Cristalline",
        description: "×2 production Crystal Lab",
        cost: 1000000,
        type: "generator",
        effectType: "specific",
        targetGenerator: "crystal_lab",
        value: 2
    },
    // Global upgrades
    {
        id: "global_cps_mult_1",
        name: "Boost de Production I",
        description: "×1.5 CPS global",
        cost: 25000,
        type: "global",
        effectType: "cps_multiplier",
        value: 1.5
    },
    {
        id: "global_cps_mult_2",
        name: "Boost de Production II",
        description: "×2 CPS global",
        cost: 250000,
        type: "global",
        effectType: "cps_multiplier",
        value: 2
    },
    {
        id: "global_cps_mult_3",
        name: "Boost de Production III",
        description: "×3 CPS global",
        cost: 5000000,
        type: "global",
        effectType: "cps_multiplier",
        value: 3
    },
    {
        id: "global_all_mult_1",
        name: "Amplificateur Universel I",
        description: "×1.5 CPC et CPS",
        cost: 1000000,
        type: "global",
        effectType: "all_multiplier",
        value: 1.5
    },
    {
        id: "global_all_mult_2",
        name: "Amplificateur Universel II",
        description: "×2 CPC et CPS",
        cost: 10000000,
        type: "global",
        effectType: "all_multiplier",
        value: 2
    },
    {
        id: "global_all_mult_3",
        name: "Amplificateur Universel III",
        description: "×5 CPC et CPS",
        cost: 500000000,
        type: "global",
        effectType: "all_multiplier",
        value: 5
    },
    {
        id: "generator_cost_1",
        name: "Production Efficace I",
        description: "-10% coût générateurs",
        cost: 500000,
        type: "global",
        effectType: "cost_reduction",
        value: 0.10
    },
    {
        id: "generator_cost_2",
        name: "Production Efficace II",
        description: "-15% coût générateurs",
        cost: 10000000,
        type: "global",
        effectType: "cost_reduction",
        value: 0.15
    },
    {
        id: "generator_cost_3",
        name: "Production Efficace III",
        description: "-20% coût générateurs",
        cost: 250000000,
        type: "global",
        effectType: "cost_reduction",
        value: 0.20
    }
];

// ========== TALENTS ==========
const TALENTS = {
    click: [
        {
            id: "t_click_1",
            name: "Doigts d'Acier",
            description: "+5% CPC per level",
            branch: "click",
            tier: 1,
            rpCost: 5,
            maxLevel: 10,
            effectType: "cpc_multiplier",
            valuePerLevel: 0.05
        },
        {
            id: "t_click_2",
            name: "Critiques Précis",
            description: "+2% crit chance per level (max 50%)",
            branch: "click",
            tier: 2,
            rpCost: 10,
            maxLevel: 10,
            effectType: "crit_chance",
            valuePerLevel: 0.02
        },
        {
            id: "t_click_3",
            name: "Explosion Critique",
            description: "+0.5 crit multiplier per level (max 20)",
            branch: "click",
            tier: 3,
            rpCost: 15,
            maxLevel: 10,
            effectType: "crit_multiplier",
            valuePerLevel: 0.5
        },
        {
            id: "t_click_4",
            name: "Maître du Clic",
            description: "+10% CPC per level",
            branch: "click",
            tier: 4,
            rpCost: 25,
            maxLevel: 5,
            effectType: "cpc_multiplier",
            valuePerLevel: 0.10
        }
    ],
    generators: [
        {
            id: "t_gen_1",
            name: "Efficacité Industrielle",
            description: "+3% CPS global per level",
            branch: "generators",
            tier: 1,
            rpCost: 5,
            maxLevel: 10,
            effectType: "cps_multiplier",
            valuePerLevel: 0.03
        },
        {
            id: "t_gen_2",
            name: "Production Focalisée",
            description: "+10% CPS pour tous les générateurs par niveau",
            branch: "generators",
            tier: 2,
            rpCost: 10,
            maxLevel: 8,
            effectType: "cps_multiplier",
            valuePerLevel: 0.10
        },
        {
            id: "t_gen_3",
            name: "Optimisation des Coûts",
            description: "-1% coût générateurs par niveau (max -50%)",
            branch: "generators",
            tier: 3,
            rpCost: 15,
            maxLevel: 10,
            effectType: "cost_reduction",
            valuePerLevel: 0.01
        },
        {
            id: "t_gen_4",
            name: "Super Production",
            description: "+15% CPS global par niveau",
            branch: "generators",
            tier: 4,
            rpCost: 30,
            maxLevel: 5,
            effectType: "cps_multiplier",
            valuePerLevel: 0.15
        }
    ],
    prestige: [
        {
            id: "t_prestige_1",
            name: "Renaissance Puissante",
            description: "+2% RP effectiveness per level",
            branch: "prestige",
            tier: 1,
            rpCost: 5,
            maxLevel: 10,
            effectType: "rp_effectiveness",
            valuePerLevel: 0.02
        },
        {
            id: "t_prestige_2",
            name: "Accélération Cosmique",
            description: "+5% RP gagnés par niveau",
            branch: "prestige",
            tier: 2,
            rpCost: 20,
            maxLevel: 5,
            effectType: "rp_gain",
            valuePerLevel: 0.05
        },
        {
            id: "t_prestige_3",
            name: "Renaissance Express",
            description: "Conserve 5% des générateurs par niveau après prestige",
            branch: "prestige",
            tier: 3,
            rpCost: 30,
            maxLevel: 3,
            effectType: "keep_generators",
            valuePerLevel: 0.05
        },
        {
            id: "t_prestige_4",
            name: "Maître de Renaissance",
            description: "+10% efficacité RP par niveau",
            branch: "prestige",
            tier: 4,
            rpCost: 40,
            maxLevel: 5,
            effectType: "rp_effectiveness",
            valuePerLevel: 0.10
        }
    ]
};

// ========== ARTEFACTS ==========
const ARTEFACTS = [
    {
        id: "a_click_ring",
        name: "Anneau du Clic Infini",
        rarity: "epic",
        effectType: "cpc_multiplier",
        value: 3,
        description: "×3 puissance de clic"
    },
    {
        id: "a_mine_amulet",
        name: "Amulette de la Mine",
        rarity: "rare",
        effectType: "generator_specific",
        targetGenerator: "shard_mine",
        value: 4,
        description: "×4 production Shard Mine"
    },
    {
        id: "a_global_core",
        name: "Cœur Cristallin",
        rarity: "legendary",
        effectType: "global_multiplier",
        cpsValue: 2,
        cpcValue: 2,
        description: "×2 CPS et ×2 CPC"
    },
    {
        id: "a_prestige_orb",
        name: "Orbe de Renaissance",
        rarity: "legendary",
        effectType: "rp_gain",
        value: 0.25,
        description: "+25% RP au prestige"
    },
    {
        id: "a_factory_gem",
        name: "Gemme Nano",
        rarity: "rare",
        effectType: "generator_specific",
        targetGenerator: "nano_factory",
        value: 3,
        description: "×3 production Nano Factory"
    },
    {
        id: "a_crit_blade",
        name: "Lame Critique",
        rarity: "epic",
        effectType: "crit",
        critChance: 0.15,
        critMultiplier: 5,
        description: "+15% chance critique et +5 multiplicateur critique"
    }
];

// ========== PETS ==========
const PETS = [
    // ===== BOSS DROP PETS (3) =====
    {
        id: "pet_wolf",
        name: "Loup Spectral",
        obtainType: "boss_drop",
        dropRate: 0.08, // 8% de drop (réduit pour rendre le jeu plus long)
        rarity: "rare",
        passiveBonusType: "cps_global",
        passiveValue: 0.12,
        activeBonusType: "cps_global",
        activeMultiplier: 4,
        activeDurationSeconds: 12,
        cooldownSeconds: 150,
        description: "Passif: +12% CPS | Actif: ×4 CPS pendant 12s"
    },
    {
        id: "pet_tiger",
        name: "Tigre Cosmique",
        obtainType: "boss_drop",
        dropRate: 0.04, // 4% de drop (réduit)
        rarity: "epic",
        passiveBonusType: "cpc",
        passiveValue: 0.25,
        activeBonusType: "cpc",
        activeMultiplier: 8,
        activeDurationSeconds: 8,
        cooldownSeconds: 200,
        description: "Passif: +25% CPC | Actif: ×8 CPC pendant 8s"
    },
    {
        id: "pet_leviathan",
        name: "Léviathan des Abysses",
        obtainType: "boss_drop",
        dropRate: 0.015, // 1.5% de drop (très rare - réduit)
        rarity: "legendary",
        passiveBonusType: "global",
        passiveValue: 0.30,
        activeBonusType: "global",
        activeMultiplier: 15,
        activeDurationSeconds: 6,
        cooldownSeconds: 400,
        description: "Passif: +30% toute production | Actif: ×15 tout pendant 6s"
    },

    // ===== SHOP PETS (3) =====
    {
        id: "pet_cat",
        name: "Chat Mystique",
        obtainType: "shop",
        cost: 1000000, // 1M Shards
        rarity: "common",
        passiveBonusType: "cpc",
        passiveValue: 0.08,
        activeBonusType: "cpc",
        activeMultiplier: 3,
        activeDurationSeconds: 15,
        cooldownSeconds: 120,
        description: "Passif: +8% CPC | Actif: ×3 CPC pendant 15s"
    },
    {
        id: "pet_bear",
        name: "Ours Céleste",
        obtainType: "shop",
        cost: 50000000, // 50M Shards
        rarity: "epic",
        passiveBonusType: "cps_global",
        passiveValue: 0.20,
        activeBonusType: "cps_global",
        activeMultiplier: 6,
        activeDurationSeconds: 10,
        cooldownSeconds: 180,
        description: "Passif: +20% CPS | Actif: ×6 CPS pendant 10s"
    },
    {
        id: "pet_serpent",
        name: "Serpent d'Or",
        obtainType: "shop",
        cost: 500000000, // 500M Shards
        rarity: "legendary",
        passiveBonusType: "global",
        passiveValue: 0.25,
        activeBonusType: "global",
        activeMultiplier: 12,
        activeDurationSeconds: 7,
        cooldownSeconds: 300,
        description: "Passif: +25% toute production | Actif: ×12 tout pendant 7s"
    },

    // ===== QUEST REWARD PETS (3) =====
    {
        id: "pet_owl",
        name: "Hibou Sage",
        obtainType: "quest_reward",
        questId: "quest_pet_owl", // Associé à une quête
        rarity: "rare",
        passiveBonusType: "cps_global",
        passiveValue: 0.15,
        activeBonusType: "cpc",
        activeMultiplier: 5,
        activeDurationSeconds: 10,
        cooldownSeconds: 160,
        description: "Passif: +15% CPS | Actif: ×5 CPC pendant 10s"
    },
    {
        id: "pet_turtle",
        name: "Tortue Millénaire",
        obtainType: "quest_reward",
        questId: "quest_pet_turtle",
        rarity: "epic",
        passiveBonusType: "global",
        passiveValue: 0.18,
        activeBonusType: "cps_global",
        activeMultiplier: 7,
        activeDurationSeconds: 12,
        cooldownSeconds: 220,
        description: "Passif: +18% toute production | Actif: ×7 CPS pendant 12s"
    },
    {
        id: "pet_eagle",
        name: "Aigle Doré",
        obtainType: "quest_reward",
        questId: "quest_pet_eagle",
        rarity: "legendary",
        passiveBonusType: "cpc",
        passiveValue: 0.35,
        activeBonusType: "global",
        activeMultiplier: 10,
        activeDurationSeconds: 8,
        cooldownSeconds: 250,
        description: "Passif: +35% CPC | Actif: ×10 tout pendant 8s"
    }
];

// ========== QUÊTES ==========
const QUESTS = [
    {
        id: "quest_clicks_1000",
        description: "Cliquer 1 000 fois",
        targetType: "clicks",
        targetValue: 1000,
        rewardShards: 10000,
        rewardRP: 1
    },
    {
        id: "quest_shards_1e7",
        description: "Gagner 10M Shards",
        targetType: "shards_earned",
        targetValue: 10000000,
        rewardShards: 100000,
        rewardRP: 5
    },
    {
        id: "quest_boss_1",
        description: "Tuer 1 boss",
        targetType: "boss_killed",
        targetValue: 1,
        rewardShards: 50000,
        rewardRP: 3
    },
    {
        id: "quest_prestige_1",
        description: "Effectuer 1 prestige",
        targetType: "prestige_done",
        targetValue: 1,
        rewardShards: 0,
        rewardRP: 10
    },
    {
        id: "quest_generators_10",
        description: "Acheter 10 générateurs",
        targetType: "generators_bought",
        targetValue: 10,
        rewardShards: 5000,
        rewardRP: 2
    },

    // ===== QUÊTES PETS =====
    {
        id: "quest_pet_owl",
        description: "Tuer 5 boss",
        targetType: "boss_killed",
        targetValue: 5,
        rewardShards: 100000,
        rewardRP: 10,
        rewardPet: "pet_owl"
    },
    {
        id: "quest_pet_turtle",
        description: "Gagner 1 000 000 000 Shards (1B)",
        targetType: "shards_earned",
        targetValue: 1000000000,
        rewardShards: 0,
        rewardRP: 20,
        rewardPet: "pet_turtle"
    },
    {
        id: "quest_pet_eagle",
        description: "Effectuer 3 prestiges",
        targetType: "prestige_done",
        targetValue: 3,
        rewardShards: 0,
        rewardRP: 30,
        rewardPet: "pet_eagle"
    }
];

// ========== ÉVÉNEMENTS ==========
const EVENTS = [
    {
        id: "event_click_frenzy",
        name: "Folie du Clic",
        description: "×10 CPC",
        type: "cpc_multiplier",
        multiplier: 10,
        duration: 30
    },
    {
        id: "event_shard_storm",
        name: "Tempête de Shards",
        description: "×5 CPS",
        type: "cps_multiplier",
        multiplier: 5,
        duration: 20
    },
    {
        id: "event_double_production",
        name: "Production Double",
        description: "×2 toute production",
        type: "all_multiplier",
        multiplier: 2,
        duration: 60
    }
];
