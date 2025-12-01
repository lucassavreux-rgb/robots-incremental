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
        name: "Better Finger",
        description: "+1 Shard per click",
        cost: 100,
        type: "click",
        effectType: "flat",
        value: 1
    },
    {
        id: "click_flat_2",
        name: "Strong Fingers",
        description: "+10 Shards per click",
        cost: 1000,
        type: "click",
        effectType: "flat",
        value: 10
    },
    {
        id: "click_flat_3",
        name: "Powerful Hands",
        description: "+100 Shards per click",
        cost: 50000,
        type: "click",
        effectType: "flat",
        value: 100
    },
    {
        id: "click_mult_1",
        name: "Click Amplifier",
        description: "×2 click power",
        cost: 10000,
        type: "click",
        effectType: "multiplier",
        value: 2
    },
    {
        id: "click_mult_2",
        name: "Quantum Clicker",
        description: "×3 click power",
        cost: 500000,
        type: "click",
        effectType: "multiplier",
        value: 3
    },
    {
        id: "click_crit_1",
        name: "Precision Strike",
        description: "+5% crit chance",
        cost: 25000,
        type: "click",
        effectType: "crit_chance",
        value: 0.05
    },
    {
        id: "click_crit_2",
        name: "Master Striker",
        description: "+10% crit chance",
        cost: 250000,
        type: "click",
        effectType: "crit_chance",
        value: 0.10
    },
    {
        id: "click_crit_mult_1",
        name: "Devastating Blow",
        description: "+2 to crit multiplier",
        cost: 100000,
        type: "click",
        effectType: "crit_multiplier",
        value: 2
    },
    // Generator specific
    {
        id: "generator_mine_mult_1",
        name: "Enhanced Mining",
        description: "×2 Shard Mine production",
        cost: 50000,
        type: "generator",
        effectType: "specific",
        targetGenerator: "shard_mine",
        value: 2
    },
    {
        id: "generator_factory_mult_1",
        name: "Nano Optimization",
        description: "×2 Nano Factory production",
        cost: 200000,
        type: "generator",
        effectType: "specific",
        targetGenerator: "nano_factory",
        value: 2
    },
    {
        id: "generator_lab_mult_1",
        name: "Crystal Enhancement",
        description: "×2 Crystal Lab production",
        cost: 1000000,
        type: "generator",
        effectType: "specific",
        targetGenerator: "crystal_lab",
        value: 2
    },
    // Global upgrades
    {
        id: "global_cps_mult_1",
        name: "Production Boost I",
        description: "×1.5 global CPS",
        cost: 25000,
        type: "global",
        effectType: "cps_multiplier",
        value: 1.5
    },
    {
        id: "global_cps_mult_2",
        name: "Production Boost II",
        description: "×2 global CPS",
        cost: 250000,
        type: "global",
        effectType: "cps_multiplier",
        value: 2
    },
    {
        id: "global_cps_mult_3",
        name: "Production Boost III",
        description: "×3 global CPS",
        cost: 5000000,
        type: "global",
        effectType: "cps_multiplier",
        value: 3
    },
    {
        id: "global_all_mult_1",
        name: "Universal Amplifier I",
        description: "×1.5 CPC and CPS",
        cost: 1000000,
        type: "global",
        effectType: "all_multiplier",
        value: 1.5
    },
    {
        id: "global_all_mult_2",
        name: "Universal Amplifier II",
        description: "×2 CPC and CPS",
        cost: 10000000,
        type: "global",
        effectType: "all_multiplier",
        value: 2
    },
    {
        id: "global_all_mult_3",
        name: "Universal Amplifier III",
        description: "×5 CPC and CPS",
        cost: 500000000,
        type: "global",
        effectType: "all_multiplier",
        value: 5
    },
    {
        id: "generator_cost_1",
        name: "Efficient Production I",
        description: "-10% generator costs",
        cost: 500000,
        type: "global",
        effectType: "cost_reduction",
        value: 0.10
    },
    {
        id: "generator_cost_2",
        name: "Efficient Production II",
        description: "-15% generator costs",
        cost: 10000000,
        type: "global",
        effectType: "cost_reduction",
        value: 0.15
    },
    {
        id: "generator_cost_3",
        name: "Efficient Production III",
        description: "-20% generator costs",
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
            description: "+10% CPS for all generators per level",
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
            description: "-1% generator costs per level (max -50%)",
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
            description: "+15% CPS global per level",
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
            description: "+5% RP gained per level",
            branch: "prestige",
            tier: 2,
            rpCost: 20,
            maxLevel: 5,
            effectType: "rp_gain",
            valuePerLevel: 0.05
        },
        {
            id: "t_prestige_3",
            name: "Rebirth Express",
            description: "Keep 5% of generators per level after prestige",
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
            description: "+10% RP effectiveness per level",
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
        description: "×3 click power"
    },
    {
        id: "a_mine_amulet",
        name: "Amulette de la Mine",
        rarity: "rare",
        effectType: "generator_specific",
        targetGenerator: "shard_mine",
        value: 4,
        description: "×4 Shard Mine production"
    },
    {
        id: "a_global_core",
        name: "Cœur Cristallin",
        rarity: "legendary",
        effectType: "global_multiplier",
        cpsValue: 2,
        cpcValue: 2,
        description: "×2 CPS and ×2 CPC"
    },
    {
        id: "a_prestige_orb",
        name: "Orbe de Renaissance",
        rarity: "legendary",
        effectType: "rp_gain",
        value: 0.25,
        description: "+25% RP on prestige"
    },
    {
        id: "a_factory_gem",
        name: "Gemme Nano",
        rarity: "rare",
        effectType: "generator_specific",
        targetGenerator: "nano_factory",
        value: 3,
        description: "×3 Nano Factory production"
    },
    {
        id: "a_crit_blade",
        name: "Lame Critique",
        rarity: "epic",
        effectType: "crit",
        critChance: 0.15,
        critMultiplier: 5,
        description: "+15% crit chance and +5 crit multiplier"
    }
];

// ========== PETS ==========
const PETS = [
    {
        id: "pet_fox",
        name: "Shard Fox",
        passiveBonusType: "cps_global",
        passiveValue: 0.10,
        activeBonusType: "cpc",
        activeMultiplier: 5,
        activeDurationSeconds: 10,
        cooldownSeconds: 120,
        description: "Passive: +10% CPS | Active: ×5 CPC for 10s"
    },
    {
        id: "pet_dragon",
        name: "Crystal Dragon",
        passiveBonusType: "cpc",
        passiveValue: 0.20,
        activeBonusType: "cps_global",
        activeMultiplier: 3,
        activeDurationSeconds: 15,
        cooldownSeconds: 180,
        description: "Passive: +20% CPC | Active: ×3 CPS for 15s"
    },
    {
        id: "pet_phoenix",
        name: "Phoenix Éternel",
        passiveBonusType: "global",
        passiveValue: 0.15,
        activeBonusType: "global",
        activeMultiplier: 10,
        activeDurationSeconds: 5,
        cooldownSeconds: 300,
        description: "Passive: +15% all production | Active: ×10 all for 5s"
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
        description: "×2 all production",
        type: "all_multiplier",
        multiplier: 2,
        duration: 60
    }
];
