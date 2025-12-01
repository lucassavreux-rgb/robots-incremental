/**
 * =====================================================
 * DATA.JS - Données du Jeu
 * =====================================================
 * Toutes les configurations : générateurs, upgrades,
 * talents, pets, artefacts, quêtes
 */

/**
 * ========== GÉNÉRATEURS ==========
 * Minimum 6 générateurs avec scaling exponentiel
 */
const GENERATORS_DATA = [
    {
        id: 'cursor',
        name: '🖱️ Curseur',
        description: 'Clique automatiquement pour vous',
        basePrice: 15,
        baseProduction: 0.1,
        priceMultiplier: 1.15,
        icon: '🖱️',
        milestones: [25, 50, 100, 200, 400] // Niveaux où bonus x2
    },
    {
        id: 'grandma',
        name: '👵 Mamie',
        description: 'Une gentille mamie qui génère des coins',
        basePrice: 100,
        baseProduction: 1,
        priceMultiplier: 1.15,
        icon: '👵',
        milestones: [25, 50, 100, 200, 400]
    },
    {
        id: 'farm',
        name: '🌾 Ferme',
        description: 'Cultive des coins dorés',
        basePrice: 1100,
        baseProduction: 8,
        priceMultiplier: 1.15,
        icon: '🌾',
        milestones: [25, 50, 100, 200, 400]
    },
    {
        id: 'mine',
        name: '⛏️ Mine',
        description: 'Extrait des coins du sol',
        basePrice: 12000,
        baseProduction: 47,
        priceMultiplier: 1.15,
        icon: '⛏️',
        milestones: [25, 50, 100, 200, 400]
    },
    {
        id: 'factory',
        name: '🏭 Usine',
        description: 'Produit des coins en masse',
        basePrice: 130000,
        baseProduction: 260,
        priceMultiplier: 1.15,
        icon: '🏭',
        milestones: [25, 50, 100, 200, 400]
    },
    {
        id: 'bank',
        name: '🏦 Banque',
        description: 'Investit et multiplie vos coins',
        basePrice: 1400000,
        baseProduction: 1400,
        priceMultiplier: 1.15,
        icon: '🏦',
        milestones: [25, 50, 100, 200, 400]
    },
    {
        id: 'temple',
        name: '🛕 Temple',
        description: 'Temple sacré générant des richesses divines',
        basePrice: 20000000,
        baseProduction: 7800,
        priceMultiplier: 1.15,
        icon: '🛕',
        milestones: [25, 50, 100, 200, 400]
    },
    {
        id: 'wizard',
        name: '🧙 Magicien',
        description: 'Utilise la magie pour créer des coins',
        basePrice: 330000000,
        baseProduction: 44000,
        priceMultiplier: 1.15,
        icon: '🧙',
        milestones: [25, 50, 100, 200, 400]
    }
];

/**
 * ========== UPGRADES ==========
 * Upgrades globales pour CPC, CPS, critiques, etc.
 */
const UPGRADES_DATA = [
    // Upgrades CPC
    {
        id: 'cpc1',
        name: 'Doigts Rapides',
        description: 'Double votre CPC',
        type: 'cpc',
        effect: 2,
        price: 100,
        requirement: null
    },
    {
        id: 'cpc2',
        name: 'Main Bionique',
        description: 'Triple votre CPC',
        type: 'cpc',
        effect: 3,
        price: 1000,
        requirement: 'cpc1'
    },
    {
        id: 'cpc3',
        name: 'Pouvoir Surhumain',
        description: 'x5 CPC',
        type: 'cpc',
        effect: 5,
        price: 10000,
        requirement: 'cpc2'
    },
    {
        id: 'cpc4',
        name: 'Force Divine',
        description: 'x10 CPC',
        type: 'cpc',
        effect: 10,
        price: 100000,
        requirement: 'cpc3'
    },

    // Upgrades CPS
    {
        id: 'cps1',
        name: 'Efficacité I',
        description: 'Double la production de tous les générateurs',
        type: 'cps',
        effect: 2,
        price: 500,
        requirement: null
    },
    {
        id: 'cps2',
        name: 'Efficacité II',
        description: 'x3 production globale',
        type: 'cps',
        effect: 3,
        price: 5000,
        requirement: 'cps1'
    },
    {
        id: 'cps3',
        name: 'Efficacité III',
        description: 'x5 production globale',
        type: 'cps',
        effect: 5,
        price: 50000,
        requirement: 'cps2'
    },

    // Critiques
    {
        id: 'crit1',
        name: 'Coup Chanceux',
        description: '5% de chance de critique (x5 coins)',
        type: 'critical',
        critChance: 0.05,
        critMultiplier: 5,
        price: 1000,
        requirement: null
    },
    {
        id: 'crit2',
        name: 'Frappe Précise',
        description: '10% de chance de critique (x5 coins)',
        type: 'critical',
        critChance: 0.10,
        critMultiplier: 5,
        price: 10000,
        requirement: 'crit1'
    },
    {
        id: 'crit3',
        name: 'Maître Critique',
        description: '15% de chance de critique (x10 coins)',
        type: 'critical',
        critChance: 0.15,
        critMultiplier: 10,
        price: 100000,
        requirement: 'crit2'
    },

    // Réduction de coûts
    {
        id: 'cost1',
        name: 'Négociateur',
        description: 'Réduit le coût des générateurs de 5%',
        type: 'cost_reduction',
        effect: 0.05,
        price: 5000,
        requirement: null
    },
    {
        id: 'cost2',
        name: 'Économiste',
        description: 'Réduit le coût des générateurs de 10%',
        type: 'cost_reduction',
        effect: 0.10,
        price: 50000,
        requirement: 'cost1'
    }
];

/**
 * ========== TALENTS ==========
 * 3 branches : Clic, Générateurs, Prestige
 */
const TALENTS_DATA = {
    click: [
        {
            id: 'talent_click_1',
            name: 'Clic Puissant I',
            description: '+50% CPC',
            type: 'cpc_bonus',
            effect: 0.5,
            cost: 1,
            maxLevel: 5,
            requirement: null
        },
        {
            id: 'talent_click_2',
            name: 'Clic Puissant II',
            description: '+100% CPC',
            type: 'cpc_bonus',
            effect: 1.0,
            cost: 3,
            maxLevel: 5,
            requirement: 'talent_click_1'
        },
        {
            id: 'talent_click_3',
            name: 'Critique Amélioré',
            description: '+5% chance de critique',
            type: 'crit_chance',
            effect: 0.05,
            cost: 5,
            maxLevel: 3,
            requirement: 'talent_click_1'
        },
        {
            id: 'talent_click_4',
            name: 'Auto-clicker',
            description: 'Gagne 10% de ton CPC par seconde',
            type: 'auto_click',
            effect: 0.1,
            cost: 10,
            maxLevel: 1,
            requirement: 'talent_click_2'
        }
    ],
    generators: [
        {
            id: 'talent_gen_1',
            name: 'Production I',
            description: '+50% CPS',
            type: 'cps_bonus',
            effect: 0.5,
            cost: 1,
            maxLevel: 5,
            requirement: null
        },
        {
            id: 'talent_gen_2',
            name: 'Production II',
            description: '+100% CPS',
            type: 'cps_bonus',
            effect: 1.0,
            cost: 3,
            maxLevel: 5,
            requirement: 'talent_gen_1'
        },
        {
            id: 'talent_gen_3',
            name: 'Réduction de Prix',
            description: 'Les générateurs coûtent 10% moins cher',
            type: 'cost_reduction',
            effect: 0.1,
            cost: 5,
            maxLevel: 3,
            requirement: 'talent_gen_1'
        },
        {
            id: 'talent_gen_4',
            name: 'Synergie',
            description: '+1% CPS par type de générateur possédé',
            type: 'synergy',
            effect: 0.01,
            cost: 10,
            maxLevel: 1,
            requirement: 'talent_gen_2'
        }
    ],
    prestige: [
        {
            id: 'talent_pres_1',
            name: 'Prestige Puissant I',
            description: '+20% RP gagnés au prestige',
            type: 'rp_bonus',
            effect: 0.2,
            cost: 2,
            maxLevel: 5,
            requirement: null
        },
        {
            id: 'talent_pres_2',
            name: 'Prestige Puissant II',
            description: '+50% RP gagnés au prestige',
            type: 'rp_bonus',
            effect: 0.5,
            cost: 5,
            maxLevel: 3,
            requirement: 'talent_pres_1'
        },
        {
            id: 'talent_pres_3',
            name: 'Héritage',
            description: 'Garde 10% de tes coins après prestige',
            type: 'keep_coins',
            effect: 0.1,
            cost: 15,
            maxLevel: 1,
            requirement: 'talent_pres_1'
        },
        {
            id: 'talent_pres_4',
            name: 'Bonus RP Passif',
            description: '+10% à tous les bonus RP',
            type: 'rp_bonus_mult',
            effect: 0.1,
            cost: 20,
            maxLevel: 5,
            requirement: 'talent_pres_2'
        }
    ]
};

/**
 * ========== PETS ==========
 * Pets passifs et actifs
 */
const PETS_DATA = [
    {
        id: 'pet_dog',
        name: '🐕 Chien Fidèle',
        description: 'Un compagnon loyal qui booste votre CPS',
        unlockCost: 5, // RP
        upgradeCost: 10, // RP par niveau
        maxLevel: 10,
        passiveEffect: {
            type: 'cps_bonus',
            baseValue: 0.2, // +20% par niveau
            perLevel: 0.2
        },
        activeAbility: {
            name: 'Aboiement Motivant',
            description: 'x3 CPS pendant 10 secondes',
            multiplier: 3,
            duration: 10000, // ms
            cooldown: 60000 // ms
        },
        icon: '🐕'
    },
    {
        id: 'pet_cat',
        name: '🐈 Chat Chanceux',
        description: 'Un chat qui améliore vos critiques',
        unlockCost: 10,
        upgradeCost: 15,
        maxLevel: 10,
        passiveEffect: {
            type: 'crit_chance',
            baseValue: 0.03, // +3% par niveau
            perLevel: 0.03
        },
        activeAbility: {
            name: 'Ronronnement Mystique',
            description: 'Garantit des critiques pendant 5 secondes',
            multiplier: 1,
            duration: 5000,
            cooldown: 90000
        },
        icon: '🐈'
    },
    {
        id: 'pet_dragon',
        name: '🐉 Dragon',
        description: 'Créature légendaire ultra-puissante',
        unlockCost: 50,
        upgradeCost: 50,
        maxLevel: 5,
        passiveEffect: {
            type: 'global_mult',
            baseValue: 0.5, // +50% tout par niveau
            perLevel: 0.5
        },
        activeAbility: {
            name: 'Souffle Ardent',
            description: 'x10 production totale pendant 15 secondes',
            multiplier: 10,
            duration: 15000,
            cooldown: 180000
        },
        icon: '🐉'
    }
];

/**
 * ========== ARTEFACTS ==========
 * Objets rares avec bonus forts
 */
const ARTEFACTS_DATA = [
    {
        id: 'artefact_ring',
        name: '💍 Anneau du Pouvoir',
        description: 'x2 CPC',
        rarity: 'rare',
        effect: {
            type: 'cpc_mult',
            value: 2
        },
        set: 'power'
    },
    {
        id: 'artefact_crown',
        name: '👑 Couronne Royale',
        description: 'x3 production des Banques',
        rarity: 'epic',
        effect: {
            type: 'generator_mult',
            generator: 'bank',
            value: 3
        },
        set: 'royal'
    },
    {
        id: 'artefact_staff',
        name: '🔱 Bâton Magique',
        description: 'x5 production des Magiciens',
        rarity: 'epic',
        effect: {
            type: 'generator_mult',
            generator: 'wizard',
            value: 5
        },
        set: 'magic'
    },
    {
        id: 'artefact_orb',
        name: '🔮 Orbe Mystique',
        description: 'x2 CPS global',
        rarity: 'legendary',
        effect: {
            type: 'cps_mult',
            value: 2
        },
        set: 'magic'
    },
    {
        id: 'artefact_sword',
        name: '⚔️ Épée Légendaire',
        description: 'x3 dégâts aux boss',
        rarity: 'legendary',
        effect: {
            type: 'boss_damage',
            value: 3
        },
        set: 'power'
    },
    {
        id: 'artefact_shield',
        name: '🛡️ Bouclier Ancien',
        description: '+50% RP au prestige',
        rarity: 'rare',
        effect: {
            type: 'rp_bonus',
            value: 0.5
        },
        set: 'royal'
    }
];

/**
 * ========== SET BONUS ==========
 * Bonus si plusieurs artefacts du même set équipés
 */
const ARTEFACT_SETS = {
    power: {
        name: 'Set du Pouvoir',
        bonuses: {
            2: { description: '+100% CPC', type: 'cpc_mult', value: 2 },
            3: { description: 'x5 CPC et CPS', type: 'global_mult', value: 5 }
        }
    },
    royal: {
        name: 'Set Royal',
        bonuses: {
            2: { description: '+50% coins gagnés', type: 'coin_mult', value: 1.5 },
            3: { description: 'x3 tout', type: 'global_mult', value: 3 }
        }
    },
    magic: {
        name: 'Set Magique',
        bonuses: {
            2: { description: '+100% CPS', type: 'cps_mult', value: 2 },
            3: { description: 'x10 production Magiciens', type: 'generator_mult', generator: 'wizard', value: 10 }
        }
    }
};

/**
 * ========== QUÊTES ==========
 * Quêtes journalières
 */
const QUESTS_TEMPLATES = [
    {
        id: 'quest_clicks',
        name: 'Cliqueur Acharné',
        description: 'Faire {target} clics',
        type: 'clicks',
        targetBase: 100,
        targetScaling: 1.5,
        reward: {
            type: 'rp',
            base: 2,
            scaling: 1.3
        }
    },
    {
        id: 'quest_coins',
        name: 'Richesse',
        description: 'Gagner {target} coins',
        type: 'coins',
        targetBase: 10000,
        targetScaling: 2,
        reward: {
            type: 'boost',
            duration: 30000 // 30s boost x2
        }
    },
    {
        id: 'quest_boss',
        name: 'Chasseur de Boss',
        description: 'Vaincre {target} boss',
        type: 'bosses',
        targetBase: 3,
        targetScaling: 1.2,
        reward: {
            type: 'rp',
            base: 5,
            scaling: 1.5
        }
    },
    {
        id: 'quest_prestige',
        name: 'Renaître',
        description: 'Faire un prestige',
        type: 'prestige',
        targetBase: 1,
        targetScaling: 1,
        reward: {
            type: 'rp',
            base: 10,
            scaling: 1
        }
    },
    {
        id: 'quest_generators',
        name: 'Investisseur',
        description: 'Acheter {target} générateurs',
        type: 'generators_bought',
        targetBase: 50,
        targetScaling: 1.5,
        reward: {
            type: 'coins',
            base: 50000,
            scaling: 3
        }
    }
];
