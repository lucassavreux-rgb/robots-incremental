/**
 * =====================================================
 * GUILD MANAGER - Game Logic
 * =====================================================
 * Jeu de gestion de guilde d'aventuriers (tour par tour)
 */

// ===== CONSTANTES =====
const STARTING_GOLD = 1000;
const STARTING_REPUTATION = 0;
const STARTING_DAY = 1;
const MAX_HEROES_BASE = 10;

// Noms aléatoires pour la génération de héros
const HERO_NAMES = [
    'Aldric', 'Bryn', 'Cael', 'Darian', 'Elara', 'Finn', 'Gwen', 'Haldor',
    'Isadora', 'Joric', 'Kira', 'Lyra', 'Magnus', 'Nessa', 'Orin', 'Petra',
    'Quinn', 'Ragnar', 'Sera', 'Thorne', 'Ulfric', 'Vanya', 'Wren', 'Xander',
    'Yara', 'Zephyr', 'Aria', 'Bjorn', 'Cassia', 'Dorian'
];

// ===== CLASSES DE BASE =====

// Classe Hero
class Hero {
    constructor(name, heroClass, level = 1) {
        this.id = Date.now() + Math.random();
        this.name = name;
        this.class = heroClass;
        this.level = level;
        this.xp = 0;
        this.xpToNext = this.calculateXPNeeded();

        // Stats de base selon la classe
        const baseStats = this.getClassBaseStats();
        this.hpMax = baseStats.hp + (level - 1) * 10;
        this.hp = this.hpMax;
        this.attack = baseStats.attack + (level - 1) * 3;
        this.defense = baseStats.defense + (level - 1) * 2;
        this.speed = baseStats.speed + (level - 1) * 1;

        this.status = 'available'; // available, on_mission, injured, dead
        this.recoveryDays = 0;
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.traits = this.generateTraits();
    }

    getClassBaseStats() {
        const stats = {
            warrior: { hp: 100, attack: 25, defense: 20, speed: 10 },
            mage: { hp: 60, attack: 35, defense: 8, speed: 12 },
            rogue: { hp: 70, attack: 28, defense: 12, speed: 25 },
            healer: { hp: 80, attack: 15, defense: 15, speed: 15 },
            ranger: { hp: 85, attack: 22, defense: 14, speed: 18 }
        };
        return stats[this.class] || stats.warrior;
    }

    calculateXPNeeded() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext && this.level < 50) {
            this.levelUp();
        }
    }

    levelUp() {
        this.xp -= this.xpToNext;
        this.level++;
        this.xpToNext = this.calculateXPNeeded();

        // Augmentation des stats
        this.hpMax += 10;
        this.hp = this.hpMax; // Heal complet au level up
        this.attack += 3;
        this.defense += 2;
        this.speed += 1;

        addLog(`🎉 ${this.name} est monté niveau ${this.level} !`, 'success');
    }

    generateTraits() {
        const allTraits = [
            { name: 'Chanceux', effect: 'luck' },
            { name: 'Robuste', effect: 'tanky' },
            { name: 'Agile', effect: 'fast' },
            { name: 'Leader', effect: 'leader' },
            { name: 'Fragile', effect: 'fragile' }
        ];

        // 30% de chance d'avoir un trait
        if (Math.random() < 0.3) {
            return [allTraits[Math.floor(Math.random() * allTraits.length)]];
        }
        return [];
    }

    getTotalStats() {
        let stats = {
            attack: this.attack,
            defense: this.defense,
            speed: this.speed
        };

        // Ajouter bonus d'équipement
        Object.values(this.equipment).forEach(eq => {
            if (eq) {
                Object.entries(eq.bonuses).forEach(([stat, value]) => {
                    if (stats[stat] !== undefined) {
                        stats[stat] += value;
                    }
                });
            }
        });

        return stats;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp === 0) {
            this.status = 'injured';
            this.recoveryDays = Math.floor(Math.random() * 3) + 2; // 2-4 jours
        }
    }

    heal(amount) {
        this.hp = Math.min(this.hpMax, this.hp + amount);
    }
}

// Classe Mission
class Mission {
    constructor(data) {
        this.id = Date.now() + Math.random();
        this.name = data.name;
        this.type = data.type;
        this.difficulty = data.difficulty;
        this.duration = data.duration;
        this.minLevel = data.minLevel || 1;
        this.recommendedClasses = data.recommendedClasses || [];
        this.rewards = data.rewards;
        this.description = data.description;

        this.assignedHeroes = [];
        this.daysRemaining = this.duration;
        this.status = 'available'; // available, ongoing, completed
    }

    assignHero(hero) {
        if (hero.status === 'available') {
            this.assignedHeroes.push(hero.id);
            hero.status = 'on_mission';
            return true;
        }
        return false;
    }

    start() {
        if (this.assignedHeroes.length > 0) {
            this.status = 'ongoing';
            this.daysRemaining = this.duration;
            addLog(`📜 Mission "${this.name}" lancée avec ${this.assignedHeroes.length} héros !`);
            return true;
        }
        return false;
    }

    advance() {
        if (this.status === 'ongoing') {
            this.daysRemaining--;
            if (this.daysRemaining === 0) {
                this.complete();
            }
        }
    }

    complete() {
        this.status = 'completed';
        const heroes = this.assignedHeroes.map(id => gameState.heroes.find(h => h.id === id));

        // Calculer chances de succès
        const success = this.calculateSuccess(heroes);

        if (success) {
            // Succès
            gameState.gold += this.rewards.gold;
            gameState.reputation += this.rewards.reputation;

            heroes.forEach(hero => {
                if (hero) {
                    hero.gainXP(this.rewards.xp);
                    hero.status = 'available';

                    // Petite chance de blessure même en succès
                    if (Math.random() < 0.1 * this.difficulty) {
                        hero.takeDamage(hero.hpMax * 0.3);
                    }
                }
            });

            addLog(`✅ Mission "${this.name}" réussie ! +${this.rewards.gold} or, +${this.rewards.reputation} réputation`, 'success');
        } else {
            // Échec
            heroes.forEach(hero => {
                if (hero) {
                    hero.takeDamage(hero.hpMax * (0.3 + 0.1 * this.difficulty));
                    hero.status = hero.hp > 0 ? 'available' : 'injured';
                }
            });

            addLog(`❌ Mission "${this.name}" échouée. Héros blessés.`, 'danger');
        }

        return success;
    }

    calculateSuccess(heroes) {
        if (heroes.length === 0) return false;

        // Calculer la puissance moyenne de l'équipe
        let teamPower = 0;
        let teamLevel = 0;

        heroes.forEach(hero => {
            if (hero) {
                const stats = hero.getTotalStats();
                teamPower += stats.attack + stats.defense + stats.speed;
                teamLevel += hero.level;

                // Bonus pour les classes recommandées
                if (this.recommendedClasses.includes(hero.class)) {
                    teamPower *= 1.2;
                }

                // Bonus traits
                hero.traits.forEach(trait => {
                    if (trait.effect === 'luck') teamPower *= 1.15;
                    if (trait.effect === 'leader' && heroes.length > 1) teamPower *= 1.1;
                });
            }
        });

        teamLevel /= heroes.length;

        // Calculer le seuil de difficulté
        const difficultyThreshold = this.difficulty * 100;
        const levelBonus = Math.max(0, (teamLevel - this.minLevel) * 20);

        // Chance de succès (minimum 10%, maximum 95%)
        let successChance = Math.min(95, Math.max(10,
            ((teamPower + levelBonus) / difficultyThreshold) * 60
        ));

        return Math.random() * 100 < successChance;
    }
}

// Classe Equipment
class Equipment {
    constructor(name, type, bonuses, cost) {
        this.id = Date.now() + Math.random();
        this.name = name;
        this.type = type; // weapon, armor, accessory
        this.bonuses = bonuses; // { attack: +X, defense: +Y, speed: +Z }
        this.cost = cost;
    }
}

// Classe GuildUpgrade
class GuildUpgrade {
    constructor(id, name, description, effect, baseCost, costMultiplier) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.effect = effect;
        this.level = 0;
        this.maxLevel = 5;
        this.baseCost = baseCost;
        this.costMultiplier = costMultiplier;
    }

    getCost() {
        if (this.level >= this.maxLevel) return Infinity;
        return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.level));
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }

    getEffectValue() {
        return this.effect.baseValue + (this.effect.perLevel * this.level);
    }
}

// ===== DONNÉES DU JEU =====

// Missions disponibles (template)
const MISSION_TEMPLATES = [
    // === DIFFICULTÉ 1 (30 missions faciles pour débutants) ===
    { name: 'Chasser des gobelins', type: 'combat', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior', 'ranger'], rewards: { gold: 100, reputation: 5, xp: 30 }, description: 'Des gobelins pillent les fermes environnantes.' },
    { name: 'Patrouiller le village', type: 'patrol', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 80, reputation: 4, xp: 25 }, description: 'Assurer la sécurité du village pendant la nuit.' },
    { name: 'Récolter des herbes', type: 'gathering', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger', 'healer'], rewards: { gold: 70, reputation: 3, xp: 20 }, description: 'Collecter des plantes médicinales dans la forêt.' },
    { name: 'Livrer un colis', type: 'delivery', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['rogue', 'ranger'], rewards: { gold: 90, reputation: 4, xp: 25 }, description: 'Livrer un paquet au village voisin.' },
    { name: 'Trouver un chat perdu', type: 'search', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger', 'rogue'], rewards: { gold: 60, reputation: 3, xp: 20 }, description: 'Le chat de la vieille dame a disparu.' },
    { name: 'Réparer la barrière', type: 'repair', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 75, reputation: 3, xp: 22 }, description: 'Aider à réparer les défenses du village.' },
    { name: 'Chasser des rats géants', type: 'combat', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior', 'rogue'], rewards: { gold: 85, reputation: 4, xp: 28 }, description: 'La cave de la taverne est infestée.' },
    { name: 'Escorter des enfants', type: 'escort', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 95, reputation: 5, xp: 30 }, description: 'Accompagner des enfants à l\'école.' },
    { name: 'Nettoyer la fontaine', type: 'cleaning', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['healer', 'mage'], rewards: { gold: 70, reputation: 3, xp: 20 }, description: 'La fontaine du village est polluée.' },
    { name: 'Chasser les loups', type: 'combat', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger', 'warrior'], rewards: { gold: 110, reputation: 5, xp: 32 }, description: 'Des loups attaquent le bétail.' },
    { name: 'Porter un message', type: 'delivery', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['rogue', 'ranger'], rewards: { gold: 65, reputation: 3, xp: 20 }, description: 'Message urgent pour le maire du village voisin.' },
    { name: 'Aider à la moisson', type: 'work', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 80, reputation: 4, xp: 25 }, description: 'Les fermiers ont besoin d\'aide.' },
    { name: 'Surveiller le marché', type: 'patrol', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['rogue', 'warrior'], rewards: { gold: 85, reputation: 4, xp: 26 }, description: 'Empêcher les vols sur le marché.' },
    { name: 'Chercher de l\'eau', type: 'gathering', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger'], rewards: { gold: 70, reputation: 3, xp: 22 }, description: 'Trouver une nouvelle source d\'eau.' },
    { name: 'Chasser des slimes', type: 'combat', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['mage', 'warrior'], rewards: { gold: 75, reputation: 3, xp: 24 }, description: 'Des slimes envahissent les champs.' },
    { name: 'Protéger le forgeron', type: 'guard', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 90, reputation: 4, xp: 28 }, description: 'Le forgeron reçoit des menaces.' },
    { name: 'Cueillir des champignons', type: 'gathering', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['healer', 'ranger'], rewards: { gold: 65, reputation: 3, xp: 20 }, description: 'Récolter des champignons rares.' },
    { name: 'Former les recrues', type: 'training', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 80, reputation: 4, xp: 25 }, description: 'Entraîner les nouvelles recrues de la milice.' },
    { name: 'Capturer un voleur', type: 'capture', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['rogue', 'warrior'], rewards: { gold: 100, reputation: 5, xp: 30 }, description: 'Un pickpocket sévit sur le marché.' },
    { name: 'Soigner les malades', type: 'healing', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['healer'], rewards: { gold: 85, reputation: 4, xp: 26 }, description: 'L\'infirmerie a besoin d\'aide.' },
    { name: 'Éteindre un feu', type: 'rescue', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 95, reputation: 5, xp: 30 }, description: 'Une grange est en feu !' },
    { name: 'Pêcher pour la taverne', type: 'gathering', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger'], rewards: { gold: 70, reputation: 3, xp: 22 }, description: 'La taverne a besoin de poisson frais.' },
    { name: 'Réparer le toit', type: 'repair', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 75, reputation: 3, xp: 23 }, description: 'Le toit de l\'église fuit.' },
    { name: 'Chasser des gobelins voleurs', type: 'combat', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['rogue', 'ranger'], rewards: { gold: 105, reputation: 5, xp: 31 }, description: 'Des gobelins volent de la nourriture.' },
    { name: 'Garder la porte', type: 'guard', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 80, reputation: 4, xp: 25 }, description: 'Surveiller la porte principale.' },
    { name: 'Chercher un chien perdu', type: 'search', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger'], rewards: { gold: 70, reputation: 3, xp: 22 }, description: 'Le chien de chasse du chasseur a disparu.' },
    { name: 'Nettoyer la taverne', type: 'cleaning', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 65, reputation: 3, xp: 20 }, description: 'La taverne après une grande fête.' },
    { name: 'Inspecter les pièges', type: 'patrol', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['ranger', 'rogue'], rewards: { gold: 85, reputation: 4, xp: 26 }, description: 'Vérifier les pièges autour du village.' },
    { name: 'Calmer une dispute', type: 'diplomacy', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['healer', 'mage'], rewards: { gold: 75, reputation: 4, xp: 24 }, description: 'Deux marchands se disputent.' },
    { name: 'Transporter des provisions', type: 'delivery', difficulty: 1, duration: 1, minLevel: 1, recommendedClasses: ['warrior'], rewards: { gold: 80, reputation: 4, xp: 25 }, description: 'Livrer des provisions à l\'avant-poste.' },

    // === DIFFICULTÉ 2 (25 missions intermédiaires) ===
    { name: 'Escorter un marchand', type: 'escort', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'ranger'], rewards: { gold: 200, reputation: 8, xp: 50 }, description: 'Un marchand a besoin de protection sur la route.' },
    { name: 'Explorer une grotte', type: 'exploration', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 250, reputation: 10, xp: 60 }, description: 'Une grotte mystérieuse a été découverte.' },
    { name: 'Enquête sur une disparition', type: 'investigation', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 300, reputation: 10, xp: 70 }, description: 'Plusieurs villageois ont disparu mystérieusement.' },
    { name: 'Combattre des bandits', type: 'combat', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'rogue'], rewards: { gold: 220, reputation: 9, xp: 55 }, description: 'Des bandits attaquent les voyageurs.' },
    { name: 'Trouver des reliques', type: 'exploration', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 240, reputation: 9, xp: 58 }, description: 'Des ruines contiennent des objets précieux.' },
    { name: 'Protéger le temple', type: 'guard', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 210, reputation: 8, xp: 52 }, description: 'Le temple est menacé par des pillards.' },
    { name: 'Capturer un déserteur', type: 'capture', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['rogue', 'ranger'], rewards: { gold: 230, reputation: 9, xp: 56 }, description: 'Un soldat a déserté avec des informations.' },
    { name: 'Nettoyer le cimetière', type: 'combat', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 200, reputation: 8, xp: 50 }, description: 'Des morts-vivants hantent le cimetière.' },
    { name: 'Espionner le camp ennemi', type: 'stealth', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['rogue'], rewards: { gold: 260, reputation: 10, xp: 62 }, description: 'Recueillir des informations sur l\'ennemi.' },
    { name: 'Sauver des otages', type: 'rescue', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'rogue'], rewards: { gold: 280, reputation: 11, xp: 65 }, description: 'Des bandits retiennent des prisonniers.' },
    { name: 'Chasser un ours enragé', type: 'combat', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['ranger', 'warrior'], rewards: { gold: 210, reputation: 8, xp: 52 }, description: 'Un ours attaque les bûcherons.' },
    { name: 'Escorter un noble', type: 'escort', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 270, reputation: 10, xp: 64 }, description: 'Un noble traverse une zone dangereuse.' },
    { name: 'Enquêter sur un meurtre', type: 'investigation', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 290, reputation: 11, xp: 68 }, description: 'Résoudre un crime mystérieux.' },
    { name: 'Détruire un nid de monstres', type: 'combat', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 240, reputation: 9, xp: 58 }, description: 'Un nid de créatures menace la route.' },
    { name: 'Récupérer des documents', type: 'stealth', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['rogue'], rewards: { gold: 250, reputation: 9, xp: 60 }, description: 'Des documents volés sont cachés.' },
    { name: 'Soigner une épidémie', type: 'healing', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['healer'], rewards: { gold: 260, reputation: 10, xp: 62 }, description: 'Un village souffre d\'une maladie.' },
    { name: 'Désamorcer des pièges', type: 'stealth', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['rogue'], rewards: { gold: 230, reputation: 9, xp: 56 }, description: 'Une zone est piégée par des bandits.' },
    { name: 'Pacifier un esprit', type: 'magic', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['mage', 'healer'], rewards: { gold: 270, reputation: 10, xp: 64 }, description: 'Un esprit tourmente une maison.' },
    { name: 'Traquer un assassin', type: 'investigation', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['rogue', 'ranger'], rewards: { gold: 300, reputation: 11, xp: 70 }, description: 'Un tueur en série sévit en ville.' },
    { name: 'Défendre le pont', type: 'combat', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior'], rewards: { gold: 220, reputation: 9, xp: 54 }, description: 'Un pont stratégique est attaqué.' },
    { name: 'Cartographier la forêt', type: 'exploration', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['ranger', 'rogue'], rewards: { gold: 240, reputation: 9, xp: 58 }, description: 'Explorer et cartographier une forêt.' },
    { name: 'Capturer un sorcier renégat', type: 'capture', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['mage', 'warrior'], rewards: { gold: 280, reputation: 10, xp: 66 }, description: 'Un mage fou doit être arrêté.' },
    { name: 'Escorter des réfugiés', type: 'escort', difficulty: 2, duration: 3, minLevel: 2, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 250, reputation: 10, xp: 60 }, description: 'Guider des réfugiés vers la sécurité.' },
    { name: 'Voler un plan', type: 'stealth', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['rogue'], rewards: { gold: 290, reputation: 11, xp: 68 }, description: 'Subtiliser des plans de guerre.' },
    { name: 'Combattre des loups-garous', type: 'combat', difficulty: 2, duration: 2, minLevel: 2, recommendedClasses: ['warrior', 'ranger'], rewards: { gold: 260, reputation: 10, xp: 62 }, description: 'Des loups-garous rodent la nuit.' },

    // === DIFFICULTÉ 3 (20 missions difficiles) ===
    { name: 'Infiltration de repaire de bandits', type: 'stealth', difficulty: 3, duration: 2, minLevel: 3, recommendedClasses: ['rogue'], rewards: { gold: 400, reputation: 15, xp: 80 }, description: 'Récupérer des objets volés sans se faire repérer.' },
    { name: 'Combattre un troll', type: 'combat', difficulty: 3, duration: 1, minLevel: 4, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 350, reputation: 12, xp: 90 }, description: 'Un troll terrorise un village.' },
    { name: 'Protéger une caravane', type: 'escort', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['warrior', 'ranger'], rewards: { gold: 450, reputation: 15, xp: 100 }, description: 'Escorter une grande caravane à travers terres dangereuses.' },
    { name: 'Explorer un temple maudit', type: 'exploration', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['mage', 'healer'], rewards: { gold: 420, reputation: 14, xp: 95 }, description: 'Un temple ancien cache des secrets.' },
    { name: 'Assassiner un chef bandit', type: 'stealth', difficulty: 3, duration: 2, minLevel: 4, recommendedClasses: ['rogue'], rewards: { gold: 480, reputation: 16, xp: 105 }, description: 'Éliminer le chef d\'une bande.' },
    { name: 'Affronter un ogre', type: 'combat', difficulty: 3, duration: 2, minLevel: 3, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 380, reputation: 13, xp: 88 }, description: 'Un ogre dévaste les cultures.' },
    { name: 'Voler un trésor', type: 'stealth', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['rogue'], rewards: { gold: 500, reputation: 16, xp: 110 }, description: 'Dérober un trésor bien gardé.' },
    { name: 'Sauver un village assiégé', type: 'combat', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 460, reputation: 15, xp: 102 }, description: 'Un village est attaqué par des monstres.' },
    { name: 'Traquer un vampire', type: 'investigation', difficulty: 3, duration: 3, minLevel: 4, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 490, reputation: 16, xp: 108 }, description: 'Un vampire se cache parmi les nobles.' },
    { name: 'Défendre la forteresse', type: 'combat', difficulty: 3, duration: 4, minLevel: 3, recommendedClasses: ['warrior'], rewards: { gold: 440, reputation: 14, xp: 98 }, description: 'Repousser une attaque massive.' },
    { name: 'Neutraliser un culte', type: 'combat', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 470, reputation: 15, xp: 104 }, description: 'Un culte maléfique doit être arrêté.' },
    { name: 'Escorter un roi', type: 'escort', difficulty: 3, duration: 4, minLevel: 4, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 520, reputation: 17, xp: 115 }, description: 'Protéger le roi lors de son voyage.' },
    { name: 'Purifier un sanctuaire', type: 'magic', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['mage', 'healer'], rewards: { gold: 450, reputation: 15, xp: 100 }, description: 'Un sanctuaire est corrompu par la magie noire.' },
    { name: 'Capturer un dragon wyrmling', type: 'capture', difficulty: 3, duration: 3, minLevel: 4, recommendedClasses: ['warrior', 'ranger'], rewards: { gold: 510, reputation: 17, xp: 112 }, description: 'Capturer un jeune dragon vivant.' },
    { name: 'Détruire un artefact maudit', type: 'magic', difficulty: 3, duration: 3, minLevel: 3, recommendedClasses: ['mage'], rewards: { gold: 480, reputation: 16, xp: 106 }, description: 'Un artefact répand le mal.' },
    { name: 'Infiltrer une forteresse', type: 'stealth', difficulty: 3, duration: 3, minLevel: 4, recommendedClasses: ['rogue'], rewards: { gold: 500, reputation: 16, xp: 110 }, description: 'Pénétrer dans une forteresse ennemie.' },
    { name: 'Combattre une hydre', type: 'combat', difficulty: 3, duration: 2, minLevel: 4, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 460, reputation: 15, xp: 102 }, description: 'Une hydre terrorise un lac.' },
    { name: 'Négocier avec des géants', type: 'diplomacy', difficulty: 3, duration: 2, minLevel: 3, recommendedClasses: ['healer', 'mage'], rewards: { gold: 430, reputation: 14, xp: 96 }, description: 'Éviter une guerre avec les géants.' },
    { name: 'Explorer le plan élémentaire', type: 'exploration', difficulty: 3, duration: 4, minLevel: 4, recommendedClasses: ['mage'], rewards: { gold: 540, reputation: 18, xp: 118 }, description: 'Voyager dans un autre plan.' },
    { name: 'Affronter un chevalier noir', type: 'combat', difficulty: 3, duration: 2, minLevel: 4, recommendedClasses: ['warrior'], rewards: { gold: 490, reputation: 16, xp: 108 }, description: 'Un chevalier déchu doit être vaincu.' },

    // === DIFFICULTÉ 4 (15 missions très difficiles) ===
    { name: 'Nettoyer un donjon', type: 'combat', difficulty: 4, duration: 4, minLevel: 5, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 600, reputation: 20, xp: 120 }, description: 'Un ancien donjon est infesté de monstres.' },
    { name: 'Récupérer un artefact', type: 'exploration', difficulty: 4, duration: 4, minLevel: 6, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 700, reputation: 25, xp: 150 }, description: 'Retrouver un artefact magique dans des ruines anciennes.' },
    { name: 'Tuer un lich', type: 'combat', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['mage', 'healer'], rewards: { gold: 750, reputation: 26, xp: 160 }, description: 'Un lich menace de lever une armée.' },
    { name: 'Infiltrer une capitale ennemie', type: 'stealth', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['rogue'], rewards: { gold: 800, reputation: 28, xp: 170 }, description: 'Mission d\'espionnage en territoire hostile.' },
    { name: 'Affronter un golem de fer', type: 'combat', difficulty: 4, duration: 3, minLevel: 5, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 650, reputation: 22, xp: 140 }, description: 'Un golem antique s\'est réactivé.' },
    { name: 'Sauver une cité assiégée', type: 'combat', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 720, reputation: 24, xp: 155 }, description: 'Une ville entière est en danger.' },
    { name: 'Voler la couronne royale', type: 'stealth', difficulty: 4, duration: 4, minLevel: 6, recommendedClasses: ['rogue'], rewards: { gold: 900, reputation: 30, xp: 180 }, description: 'Le vol le plus audacieux du siècle.' },
    { name: 'Détruire un portail démoniaque', type: 'magic', difficulty: 4, duration: 4, minLevel: 5, recommendedClasses: ['mage'], rewards: { gold: 780, reputation: 27, xp: 165 }, description: 'Fermer un portail vers les enfers.' },
    { name: 'Combattre un béhémoth', type: 'combat', difficulty: 4, duration: 4, minLevel: 6, recommendedClasses: ['warrior', 'ranger'], rewards: { gold: 710, reputation: 24, xp: 152 }, description: 'Une créature titanesque ravage la région.' },
    { name: 'Négocier avec les dragons', type: 'diplomacy', difficulty: 4, duration: 4, minLevel: 6, recommendedClasses: ['mage', 'healer'], rewards: { gold: 820, reputation: 28, xp: 175 }, description: 'Établir une trêve avec les dragons.' },
    { name: 'Explorer le Labyrinthe Éternel', type: 'exploration', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['rogue', 'ranger'], rewards: { gold: 760, reputation: 26, xp: 162 }, description: 'Un labyrinthe magique sans fin.' },
    { name: 'Purifier le Cœur de la Corruption', type: 'magic', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['mage', 'healer'], rewards: { gold: 800, reputation: 28, xp: 170 }, description: 'La source de toute corruption.' },
    { name: 'Vaincre le Champion des Ténèbres', type: 'combat', difficulty: 4, duration: 4, minLevel: 6, recommendedClasses: ['warrior'], rewards: { gold: 750, reputation: 26, xp: 160 }, description: 'Le plus grand guerrier du mal.' },
    { name: 'Récupérer l\'Œil du Destin', type: 'exploration', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 850, reputation: 29, xp: 178 }, description: 'Un artefact légendaire de divination.' },
    { name: 'Affronter une armée de morts-vivants', type: 'combat', difficulty: 4, duration: 5, minLevel: 6, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 700, reputation: 24, xp: 150 }, description: 'Une légion de morts-vivants marche.' },

    // === DIFFICULTÉ 5 (10 missions épiques / boss) ===
    { name: 'Affronter un dragon mineur', type: 'boss', difficulty: 5, duration: 5, minLevel: 8, recommendedClasses: ['warrior', 'mage', 'healer'], rewards: { gold: 1000, reputation: 40, xp: 200 }, description: 'Un jeune dragon menace la région !' },
    { name: 'Tuer le Roi Démon', type: 'boss', difficulty: 5, duration: 5, minLevel: 10, recommendedClasses: ['warrior', 'mage', 'healer'], rewards: { gold: 1500, reputation: 50, xp: 250 }, description: 'Le seigneur des démons doit tomber.' },
    { name: 'Vaincre le Dragon Ancien', type: 'boss', difficulty: 5, duration: 5, minLevel: 10, recommendedClasses: ['warrior', 'mage', 'healer'], rewards: { gold: 2000, reputation: 60, xp: 300 }, description: 'Le plus puissant des dragons.' },
    { name: 'Détruire la Liche Suprême', type: 'boss', difficulty: 5, duration: 5, minLevel: 9, recommendedClasses: ['mage', 'healer'], rewards: { gold: 1300, reputation: 45, xp: 220 }, description: 'Le maître des morts-vivants.' },
    { name: 'Affronter le Titan Primordial', type: 'boss', difficulty: 5, duration: 5, minLevel: 10, recommendedClasses: ['warrior', 'mage'], rewards: { gold: 1800, reputation: 55, xp: 280 }, description: 'Une divinité oubliée se réveille.' },
    { name: 'Vaincre l\'Archidémon', type: 'boss', difficulty: 5, duration: 5, minLevel: 10, recommendedClasses: ['warrior', 'mage', 'healer'], rewards: { gold: 1600, reputation: 52, xp: 260 }, description: 'Le général des armées infernales.' },
    { name: 'Détruire le Monde des Ombres', type: 'boss', difficulty: 5, duration: 5, minLevel: 9, recommendedClasses: ['rogue', 'mage'], rewards: { gold: 1400, reputation: 48, xp: 240 }, description: 'Anéantir un plan d\'existence.' },
    { name: 'Combattre les Quatre Cavaliers', type: 'boss', difficulty: 5, duration: 5, minLevel: 10, recommendedClasses: ['warrior', 'healer'], rewards: { gold: 1700, reputation: 54, xp: 270 }, description: 'Les hérauts de l\'apocalypse.' },
    { name: 'Tuer le Phénix Noir', type: 'boss', difficulty: 5, duration: 5, minLevel: 9, recommendedClasses: ['mage', 'ranger'], rewards: { gold: 1200, reputation: 42, xp: 210 }, description: 'Un phénix corrompu par le mal.' },
    { name: 'Vaincre le Dieu Fou', type: 'boss', difficulty: 5, duration: 5, minLevel: 10, recommendedClasses: ['warrior', 'mage', 'healer'], rewards: { gold: 2500, reputation: 70, xp: 350 }, description: 'La menace ultime pour le monde.' }
];

// Équipements disponibles
const EQUIPMENT_TEMPLATES = [
    { name: 'Épée en fer', type: 'weapon', bonuses: { attack: 5 }, cost: 100 },
    { name: 'Épée en acier', type: 'weapon', bonuses: { attack: 10 }, cost: 300 },
    { name: 'Épée enchantée', type: 'weapon', bonuses: { attack: 15, speed: 3 }, cost: 700 },
    { name: 'Armure de cuir', type: 'armor', bonuses: { defense: 5 }, cost: 100 },
    { name: 'Armure de plaques', type: 'armor', bonuses: { defense: 12 }, cost: 350 },
    { name: 'Armure runique', type: 'armor', bonuses: { defense: 18, attack: 3 }, cost: 800 },
    { name: 'Anneau de vitesse', type: 'accessory', bonuses: { speed: 5 }, cost: 200 },
    { name: 'Amulette de puissance', type: 'accessory', bonuses: { attack: 8 }, cost: 400 },
    { name: 'Cape du héros', type: 'accessory', bonuses: { attack: 5, defense: 5, speed: 5 }, cost: 900 }
];

// Améliorations de guilde
const GUILD_UPGRADES = [
    new GuildUpgrade(
        'training',
        '🎯 Salle d\'entraînement',
        'Augmente l\'XP gagnée par les héros',
        { baseValue: 0, perLevel: 20 },
        200,
        2
    ),
    new GuildUpgrade(
        'forge',
        '⚒️ Forge',
        'Réduit le coût des équipements',
        { baseValue: 0, perLevel: 10 },
        300,
        2.2
    ),
    new GuildUpgrade(
        'infirmary',
        '🏥 Infirmerie',
        'Réduit le temps de récupération des blessés',
        { baseValue: 0, perLevel: 1 },
        250,
        2
    ),
    new GuildUpgrade(
        'dormitory',
        '🛏️ Dortoirs',
        'Augmente le nombre max de héros',
        { baseValue: 0, perLevel: 2 },
        500,
        2.5
    ),
    new GuildUpgrade(
        'tavern',
        '🍺 Taverne de recrutement',
        'Améliore la qualité des nouveaux héros',
        { baseValue: 0, perLevel: 1 },
        400,
        2.3
    )
];

// ===== ÉTAT DU JEU =====
let gameState = {
    day: STARTING_DAY,
    gold: STARTING_GOLD,
    reputation: STARTING_REPUTATION,
    heroes: [],
    missions: {
        available: [],
        ongoing: []
    },
    upgrades: GUILD_UPGRADES,
    inventory: [],
    eventLog: []
};

// ===== FONCTIONS PRINCIPALES =====

function initGame() {
    // Charger la sauvegarde si elle existe
    if (loadGame()) {
        // Vérifier si il y a des missions, sinon en générer
        if (!gameState.missions.available || gameState.missions.available.length === 0) {
            generateMissions();
            addLog('📜 Missions disponibles générées !');
        }
        updateUI();
        addLog('🎮 Partie chargée avec succès !');
        return;
    }

    // Sinon, nouvelle partie
    gameState = {
        day: STARTING_DAY,
        gold: STARTING_GOLD,
        reputation: STARTING_REPUTATION,
        heroes: [],
        missions: {
            available: [],
            ongoing: []
        },
        upgrades: GUILD_UPGRADES,
        inventory: [],
        eventLog: []
    };

    // Créer héros de départ
    for (let i = 0; i < 3; i++) {
        const classes = ['warrior', 'mage', 'rogue'];
        const hero = new Hero(
            HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)],
            classes[i]
        );
        gameState.heroes.push(hero);
    }

    // Générer missions initiales
    generateMissions();

    addLog('🏰 Bienvenue dans votre nouvelle guilde d\'aventuriers !');
    updateUI();
    saveGame();
}

function endDay() {
    gameState.day++;

    // Avancer les missions en cours
    gameState.missions.ongoing.forEach(mission => {
        mission.advance();
    });

    // Retirer les missions complétées
    gameState.missions.ongoing = gameState.missions.ongoing.filter(m => m.status === 'ongoing');

    // Récupération des héros blessés
    gameState.heroes.forEach(hero => {
        if (hero.status === 'injured' && hero.recoveryDays > 0) {
            hero.recoveryDays--;
            if (hero.recoveryDays === 0) {
                hero.hp = hero.hpMax;
                hero.status = 'available';
                addLog(`💚 ${hero.name} a récupéré et est de nouveau disponible !`, 'success');
            }
        }
    });

    // Renouveler les missions tous les 3 jours
    if (gameState.day % 3 === 0) {
        generateMissions();
        addLog('📜 Nouvelles missions disponibles !');
    }

    // Événements aléatoires (1% de chance)
    if (Math.random() < 0.01) {
        triggerRandomEvent();
    }

    addLog(`🌙 Jour ${gameState.day} terminé.`);

    saveGame();
    updateUI();
}

function generateMissions() {
    // Filtrer missions selon réputation
    // Les missions de difficulté 1 sont toujours disponibles
    const availableTemplates = MISSION_TEMPLATES.filter(t => {
        const repRequirement = Math.max(0, (t.difficulty - 1) * 15); // Diff 1 = 0 rep, Diff 2 = 15 rep, etc.
        return gameState.reputation >= repRequirement;
    });

    // S'assurer qu'il y a au moins quelques missions
    if (availableTemplates.length === 0) {
        // Forcer au moins les missions de difficulté 1
        availableTemplates.push(...MISSION_TEMPLATES.filter(t => t.difficulty === 1));
    }

    // Générer 5-8 missions (plus de choix !)
    const count = Math.floor(Math.random() * 4) + 5;
    gameState.missions.available = [];

    // Générer les missions (on peut avoir plusieurs fois le même type)
    for (let i = 0; i < count; i++) {
        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        gameState.missions.available.push(new Mission(template));
    }
}

function recruitHero() {
    const maxHeroes = MAX_HEROES_BASE + getUpgradeEffect('dormitory');

    if (gameState.heroes.length >= maxHeroes) {
        addLog('❌ Dortoirs pleins ! Améliorez-les pour recruter plus de héros.', 'warning');
        return;
    }

    const cost = 200;
    if (gameState.gold < cost) {
        addLog('❌ Pas assez d\'or pour recruter ! (200 or nécessaire)', 'warning');
        return;
    }

    gameState.gold -= cost;

    const classes = ['warrior', 'mage', 'rogue', 'healer', 'ranger'];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomName = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)];

    // Bonus de taverne : héros de niveau plus élevé
    const bonusLevel = Math.floor(getUpgradeEffect('tavern') / 2);
    const level = 1 + bonusLevel;

    const hero = new Hero(randomName, randomClass, level);
    gameState.heroes.push(hero);

    addLog(`✨ ${hero.name} (${hero.class}) a rejoint la guilde !`, 'success');
    saveGame();
    updateUI();
}

function buyEquipment(index) {
    const template = EQUIPMENT_TEMPLATES[index];
    const discount = getUpgradeEffect('forge');
    const cost = Math.floor(template.cost * (1 - discount / 100));

    if (gameState.gold < cost) {
        addLog('❌ Pas assez d\'or !', 'warning');
        return;
    }

    gameState.gold -= cost;
    const equipment = new Equipment(template.name, template.type, template.bonuses, cost);
    gameState.inventory.push(equipment);

    addLog(`🛒 ${equipment.name} acheté ! → Allez dans "Héros" pour l'équiper`, 'success');
    saveGame();
    updateUI();
}

function upgradeGuild(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = upgrade.getCost();
    if (gameState.gold < cost) {
        addLog('❌ Pas assez d\'or !', 'warning');
        return;
    }

    if (upgrade.level >= upgrade.maxLevel) {
        addLog('❌ Amélioration déjà au maximum !', 'warning');
        return;
    }

    gameState.gold -= cost;
    upgrade.upgrade();

    addLog(`🏰 ${upgrade.name} amélioré au niveau ${upgrade.level} !`, 'success');
    saveGame();
    updateUI();
}

function getUpgradeEffect(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    return upgrade ? upgrade.getEffectValue() : 0;
}

function triggerRandomEvent() {
    const events = [
        {
            name: 'Marchand mystérieux',
            effect: () => {
                addLog('🎪 Un marchand propose un équipement à prix réduit !', 'success');
            }
        },
        {
            name: 'Don anonyme',
            effect: () => {
                const amount = 100;
                gameState.gold += amount;
                addLog(`💰 Un noble anonyme a fait un don de ${amount} or !`, 'success');
            }
        },
        {
            name: 'Rumeur',
            effect: () => {
                gameState.reputation += 5;
                addLog('⭐ Votre réputation augmente grâce à des rumeurs positives !', 'success');
            }
        }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
}

function getGuildRank() {
    const rep = gameState.reputation;
    if (rep < 50) return 'Novice';
    if (rep < 150) return 'Établi';
    if (rep < 300) return 'Reconnu';
    if (rep < 500) return 'Prestigieux';
    return 'Légendaire';
}

// ===== INTERFACE UTILISATEUR =====

function updateUI() {
    // Stats principales
    document.getElementById('current-day').textContent = gameState.day;
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('reputation').textContent = gameState.reputation;
    document.getElementById('hero-count').textContent = gameState.heroes.length;
    document.getElementById('hero-max').textContent = MAX_HEROES_BASE + getUpgradeEffect('dormitory');
    document.getElementById('guild-rank').textContent = getGuildRank();

    // Mettre à jour l'onglet actif
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    updateTabContent(activeTab);
}

function updateTabContent(tab) {
    switch (tab) {
        case 'heroes':
            renderHeroes();
            break;
        case 'missions':
            renderMissions();
            break;
        case 'guild':
            renderUpgrades();
            break;
        case 'shop':
            renderShop();
            break;
    }
}

function renderHeroes() {
    const container = document.getElementById('heroes-list');
    container.innerHTML = '';

    gameState.heroes.forEach(hero => {
        const card = document.createElement('div');
        card.className = `hero-card ${hero.status !== 'available' ? 'unavailable' : ''}`;
        card.onclick = () => showHeroDetail(hero.id);

        const stats = hero.getTotalStats();
        const hpPercent = (hero.hp / hero.hpMax) * 100;
        const xpPercent = (hero.xp / hero.xpToNext) * 100;

        let statusClass = 'status-available';
        let statusText = '✅ Disponible';
        if (hero.status === 'on_mission') {
            statusClass = 'status-on-mission';
            statusText = '⏳ En mission';
        } else if (hero.status === 'injured') {
            statusClass = 'status-injured';
            statusText = `🤕 Blessé (${hero.recoveryDays}j)`;
        }

        card.innerHTML = `
            <div class="hero-header">
                <div class="hero-name">${hero.name}</div>
                <div class="hero-level">Niv. ${hero.level}</div>
            </div>
            <div class="hero-class class-${hero.class}">${hero.class.toUpperCase()}</div>
            <div class="hero-hp-bar">
                <div class="hero-hp-fill" style="width: ${hpPercent}%">
                    ${hero.hp}/${hero.hpMax} HP
                </div>
            </div>
            <div class="hero-xp-bar">
                <div class="hero-xp-fill" style="width: ${xpPercent}%"></div>
            </div>
            <div class="hero-stats">
                <div class="stat">⚔️ <strong>${stats.attack}</strong></div>
                <div class="stat">🛡️ <strong>${stats.defense}</strong></div>
                <div class="stat">⚡ <strong>${stats.speed}</strong></div>
                <div class="stat">⭐ <strong>${hero.xp}/${hero.xpToNext}</strong> XP</div>
            </div>
            ${hero.traits.length > 0 ? `<div style="font-size: 0.85rem; color: var(--accent); margin-top: 5px;">🎖️ ${hero.traits[0].name}</div>` : ''}
            <div class="hero-status ${statusClass}">${statusText}</div>
        `;

        container.appendChild(card);
    });
}

function renderMissions() {
    // Missions disponibles
    const availableContainer = document.getElementById('missions-available');
    availableContainer.innerHTML = '';

    gameState.missions.available.forEach(mission => {
        const card = createMissionCard(mission);
        card.onclick = () => showMissionDetail(mission.id);
        availableContainer.appendChild(card);
    });

    if (gameState.missions.available.length === 0) {
        availableContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Aucune mission disponible pour le moment.</p>';
    }

    // Missions en cours
    const ongoingContainer = document.getElementById('missions-ongoing');
    ongoingContainer.innerHTML = '';

    gameState.missions.ongoing.forEach(mission => {
        const card = createMissionCard(mission);
        ongoingContainer.appendChild(card);
    });

    if (gameState.missions.ongoing.length === 0) {
        ongoingContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Aucune mission en cours.</p>';
    }
}

function createMissionCard(mission) {
    const card = document.createElement('div');
    card.className = 'mission-card';

    const diffNames = ['Facile', 'Normal', 'Difficile', 'Très Difficile', 'Épique'];

    card.innerHTML = `
        <div class="mission-header">
            <div class="mission-name">${mission.name}</div>
            <div class="mission-difficulty diff-${mission.difficulty}">${diffNames[mission.difficulty - 1] || 'Normal'}</div>
        </div>
        <div style="background: rgba(255,215,0,0.15); padding: 10px; border-radius: 6px; margin: 10px 0; text-align: center;">
            <div style="color: var(--accent); font-weight: bold; font-size: 1.1rem;">
                ⏱️ ${mission.status === 'ongoing' ? `${mission.daysRemaining}/${mission.duration}` : mission.duration} jours
            </div>
        </div>
        <div class="mission-info">
            ${mission.description}<br>
            <strong>Niveau min:</strong> ${mission.minLevel}<br>
            ${mission.status === 'ongoing' ? `<strong>👥 Héros assignés:</strong> ${mission.assignedHeroes.length}` : ''}
        </div>
        <div class="mission-rewards">
            <div class="reward">💰 ${mission.rewards.gold} or</div>
            <div class="reward">⭐ +${mission.rewards.reputation} rép</div>
            <div class="reward">📈 ${mission.rewards.xp} XP</div>
        </div>
    `;

    return card;
}

function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';

    gameState.upgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';

        const cost = upgrade.getCost();
        const canAfford = gameState.gold >= cost && upgrade.level < upgrade.maxLevel;

        card.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-level">Niveau ${upgrade.level}/${upgrade.maxLevel}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-effect">Effet actuel: +${upgrade.getEffectValue()}</div>
            ${upgrade.level < upgrade.maxLevel ? `
                <div style="margin: 15px 0;">
                    <strong>Prochain niveau:</strong> ${cost} or
                </div>
                <button class="btn btn-secondary" onclick="upgradeGuild('${upgrade.id}')" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? 'Améliorer' : 'Trop cher'}
                </button>
            ` : '<div style="color: var(--success); font-weight: bold; margin-top: 10px;">✅ NIVEAU MAX</div>'}
        `;

        container.appendChild(card);
    });
}

function renderShop() {
    const container = document.getElementById('shop-list');
    container.innerHTML = '';

    // Message d'aide
    const helpMsg = document.createElement('div');
    helpMsg.style.cssText = 'background: rgba(52, 152, 219, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--accent);';
    helpMsg.innerHTML = `
        <strong>💡 Comment équiper vos objets :</strong><br>
        1️⃣ Achetez l'objet ici<br>
        2️⃣ Allez dans l'onglet <strong>"Héros"</strong><br>
        3️⃣ Cliquez sur un héros<br>
        4️⃣ Cliquez sur <strong>"Équiper"</strong> dans l'inventaire<br>
        ✅ Les stats du héros augmentent automatiquement !
    `;
    container.appendChild(helpMsg);

    EQUIPMENT_TEMPLATES.forEach((template, index) => {
        const card = document.createElement('div');
        card.className = 'equipment-card';

        const discount = getUpgradeEffect('forge');
        const cost = Math.floor(template.cost * (1 - discount / 100));
        const canAfford = gameState.gold >= cost;

        card.innerHTML = `
            <div class="equipment-name">${template.name}</div>
            <div class="equipment-type type-${template.type}">${template.type.toUpperCase()}</div>
            <div class="equipment-bonuses">
                ${Object.entries(template.bonuses).map(([stat, value]) =>
                    `<div class="bonus">+${value} ${stat}</div>`
                ).join('')}
            </div>
            <div style="margin: 15px 0;">
                <strong>Prix:</strong> ${cost} or ${discount > 0 ? `<span style="color: var(--success);">(-${discount}%)</span>` : ''}
            </div>
            <button class="btn btn-primary" onclick="buyEquipment(${index})" ${!canAfford ? 'disabled' : ''}>
                ${canAfford ? 'Acheter' : 'Trop cher'}
            </button>
        `;

        container.appendChild(card);
    });
}

function addLog(message, type = 'info') {
    const entry = document.createElement('p');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;

    const log = document.getElementById('event-log');
    log.insertBefore(entry, log.firstChild);

    // Garder max 30 entrées
    while (log.children.length > 30) {
        log.removeChild(log.lastChild);
    }

    gameState.eventLog.unshift({ message, type, day: gameState.day });
    if (gameState.eventLog.length > 30) {
        gameState.eventLog.pop();
    }
}

// ===== MODALS =====

function showHeroDetail(heroId) {
    const hero = gameState.heroes.find(h => h.id === heroId);
    if (!hero) return;

    const modal = document.getElementById('hero-modal');
    const detail = document.getElementById('hero-detail');

    const stats = hero.getTotalStats();

    detail.innerHTML = `
        <h2>${hero.name}</h2>
        <div class="hero-class class-${hero.class}" style="display: inline-block; margin-bottom: 15px;">${hero.class.toUpperCase()}</div>
        <div style="margin: 20px 0;">
            <strong>Niveau:</strong> ${hero.level}<br>
            <strong>HP:</strong> ${hero.hp}/${hero.hpMax}<br>
            <strong>XP:</strong> ${hero.xp}/${hero.xpToNext}<br>
            <strong>Attaque:</strong> ${stats.attack}<br>
            <strong>Défense:</strong> ${stats.defense}<br>
            <strong>Vitesse:</strong> ${stats.speed}<br>
            ${hero.traits.length > 0 ? `<strong>Traits:</strong> ${hero.traits.map(t => t.name).join(', ')}<br>` : ''}
        </div>
        <h3>Équipement</h3>
        <div style="margin: 15px 0;">
            ${renderHeroEquipment(hero)}
        </div>
        <h3>Inventaire disponible</h3>
        <div style="margin: 15px 0;">
            ${renderInventoryForHero(hero)}
        </div>
    `;

    modal.classList.add('active');
}

function renderHeroEquipment(hero) {
    let html = '';
    Object.entries(hero.equipment).forEach(([slot, eq]) => {
        if (eq) {
            const bonusText = Object.entries(eq.bonuses).map(([stat, value]) => `+${value} ${stat}`).join(', ');
            html += `<div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px;">
                <strong>${slot}:</strong> ${eq.name} <span style="color: var(--success);">(${bonusText})</span>
                <button class="btn btn-secondary" style="margin-left: 10px; padding: 5px 10px;" onclick="unequipItem(${hero.id}, '${slot}')">Déséquiper</button>
            </div>`;
        } else {
            html += `<div style="margin: 10px 0; color: var(--text-secondary);"><strong>${slot}:</strong> Vide</div>`;
        }
    });
    return html || '<p style="color: var(--text-secondary);">Aucun équipement</p>';
}

function renderInventoryForHero(hero) {
    const available = gameState.inventory.filter(eq => {
        // Vérifier si l'équipement n'est pas déjà équipé par ce héros
        return !Object.values(hero.equipment).some(e => e && e.id === eq.id);
    });

    if (available.length === 0) {
        return '<p style="color: var(--text-secondary);">Aucun équipement disponible. Achetez-en dans la Boutique !</p>';
    }

    return available.map(eq => {
        const bonusText = Object.entries(eq.bonuses).map(([stat, value]) => `+${value} ${stat}`).join(', ');
        return `
            <div style="margin: 10px 0; padding: 10px; background: rgba(46, 204, 113, 0.15); border-radius: 6px; border: 2px solid rgba(46, 204, 113, 0.3);">
                <strong>${eq.name}</strong> (${eq.type})<br>
                <span style="color: var(--success); font-weight: bold;">📈 ${bonusText}</span>
                <button class="btn btn-success" style="margin-left: 10px; padding: 5px 10px;" onclick="equipItem(${hero.id}, ${eq.id})">⚡ Équiper</button>
            </div>
        `;
    }).join('');
}

function equipItem(heroId, equipmentId) {
    const hero = gameState.heroes.find(h => h.id === heroId);
    const equipment = gameState.inventory.find(e => e.id === equipmentId);

    if (!hero || !equipment) return;

    // Déséquiper l'ancien si présent
    if (hero.equipment[equipment.type]) {
        gameState.inventory.push(hero.equipment[equipment.type]);
    }

    // Équiper le nouveau
    hero.equipment[equipment.type] = equipment;
    gameState.inventory = gameState.inventory.filter(e => e.id !== equipmentId);

    addLog(`⚔️ ${hero.name} a équipé ${equipment.name}`, 'success');
    saveGame();
    showHeroDetail(heroId); // Rafraîchir
}

function unequipItem(heroId, slot) {
    const hero = gameState.heroes.find(h => h.id === heroId);
    if (!hero || !hero.equipment[slot]) return;

    const equipment = hero.equipment[slot];
    gameState.inventory.push(equipment);
    hero.equipment[slot] = null;

    addLog(`${hero.name} a déséquipé ${equipment.name}`);
    saveGame();
    showHeroDetail(heroId); // Rafraîchir
}

function closeHeroModal() {
    document.getElementById('hero-modal').classList.remove('active');
}

function showMissionDetail(missionId) {
    const mission = gameState.missions.available.find(m => m.id === missionId);
    if (!mission || mission.status !== 'available') return;

    const modal = document.getElementById('mission-modal');
    const detail = document.getElementById('mission-detail');

    const availableHeroes = gameState.heroes.filter(h => h.status === 'available');

    detail.innerHTML = `
        <h2>${mission.name}</h2>
        <p>${mission.description}</p>
        <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <strong>⏱️ Durée:</strong> <span style="color: var(--accent); font-size: 1.2rem; font-weight: bold;">${mission.duration} jours</span><br>
            <strong>📊 Difficulté:</strong> ${'⭐'.repeat(mission.difficulty)} (${mission.difficulty}/5)<br>
            <strong>📈 Niveau min recommandé:</strong> ${mission.minLevel}<br>
            <strong>🎯 Classes recommandées:</strong> ${mission.recommendedClasses.join(', ') || 'Aucune'}<br>
        </div>
        <div style="margin: 20px 0; padding: 15px; background: rgba(46, 204, 113, 0.2); border-radius: 8px;">
            <h3>💎 Récompenses</h3>
            <div style="font-size: 1.1rem;">💰 ${mission.rewards.gold} or</div>
            <div style="font-size: 1.1rem;">⭐ +${mission.rewards.reputation} réputation</div>
            <div style="font-size: 1.1rem;">📈 ${mission.rewards.xp} XP par héros</div>
        </div>
        <h3>👥 Assigner des héros</h3>
        <p style="color: var(--accent); font-weight: bold; margin-bottom: 10px;">
            ✅ Vous pouvez sélectionner PLUSIEURS héros pour cette mission !<br>
            Plus de héros = plus de chances de succès
        </p>
        <div id="hero-selection">
            ${availableHeroes.map(hero => `
                <div style="margin: 10px 0; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 2px solid transparent;" class="hero-select-item">
                    <div>
                        <strong style="font-size: 1.1rem;">${hero.name}</strong> - <span class="hero-class class-${hero.class}">${hero.class}</span> Niv. ${hero.level}
                        ${mission.recommendedClasses.includes(hero.class) ? '<span style="color: var(--success); font-weight: bold;"> ✓ RECOMMANDÉ</span>' : ''}
                        <br>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">⚔️ ${hero.getTotalStats().attack} | 🛡️ ${hero.getTotalStats().defense} | ⚡ ${hero.getTotalStats().speed}</span>
                    </div>
                    <input type="checkbox" id="hero-${hero.id}" style="width: 24px; height: 24px; cursor: pointer;">
                </div>
            `).join('')}
        </div>
        ${availableHeroes.length === 0 ? '<p style="color: var(--warning);">Aucun héros disponible !</p>' : ''}
        <button class="btn btn-primary" onclick="startMission(${mission.id})" style="margin-top: 20px; font-size: 1.1rem; padding: 15px 30px;" ${availableHeroes.length === 0 ? 'disabled' : ''}>
            🚀 Lancer la mission avec les héros sélectionnés
        </button>
    `;

    modal.classList.add('active');
}

function startMission(missionId) {
    const mission = gameState.missions.available.find(m => m.id === missionId);
    if (!mission) return;

    // Récupérer les héros sélectionnés
    const selectedHeroes = gameState.heroes.filter(hero => {
        const checkbox = document.getElementById(`hero-${hero.id}`);
        return checkbox && checkbox.checked;
    });

    if (selectedHeroes.length === 0) {
        addLog('❌ Vous devez assigner au moins un héros !', 'warning');
        return;
    }

    // Assigner les héros
    selectedHeroes.forEach(hero => mission.assignHero(hero));

    // Démarrer la mission
    if (mission.start()) {
        gameState.missions.available = gameState.missions.available.filter(m => m.id !== missionId);
        gameState.missions.ongoing.push(mission);

        closeMissionModal();
        saveGame();
        updateUI();
    }
}

function closeMissionModal() {
    document.getElementById('mission-modal').classList.remove('active');
}

// ===== SYSTÈME D'ONGLETS =====

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons et contenus
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Activer le bouton et le contenu sélectionné
        btn.classList.add('active');
        const tabId = 'tab-' + btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');

        // Mettre à jour le contenu
        updateTabContent(btn.dataset.tab);
    });
});

// ===== SAUVEGARDE & CHARGEMENT =====

function saveGame() {
    try {
        // Préparer les données à sauvegarder
        const saveData = {
            day: gameState.day,
            gold: gameState.gold,
            reputation: gameState.reputation,
            heroes: gameState.heroes.map(h => ({
                id: h.id,
                name: h.name,
                class: h.class,
                level: h.level,
                xp: h.xp,
                hp: h.hp,
                hpMax: h.hpMax,
                attack: h.attack,
                defense: h.defense,
                speed: h.speed,
                status: h.status,
                recoveryDays: h.recoveryDays,
                equipment: h.equipment,
                traits: h.traits
            })),
            missions: {
                available: gameState.missions.available,
                ongoing: gameState.missions.ongoing.map(m => ({
                    ...m,
                    // Sauvegarder toutes les propriétés nécessaires
                }))
            },
            upgrades: gameState.upgrades.map(u => ({
                id: u.id,
                level: u.level
            })),
            inventory: gameState.inventory,
            eventLog: gameState.eventLog.slice(0, 30)
        };

        localStorage.setItem('guildManagerSave', JSON.stringify(saveData));
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem('guildManagerSave');
        if (!saveData) return false;

        const data = JSON.parse(saveData);

        gameState.day = data.day;
        gameState.gold = data.gold;
        gameState.reputation = data.reputation;

        // Reconstruire les héros
        gameState.heroes = data.heroes.map(h => {
            const hero = new Hero(h.name, h.class, h.level);
            Object.assign(hero, h);
            return hero;
        });

        // Reconstruire les missions
        gameState.missions.available = data.missions.available.map(m => {
            const mission = new Mission(m);
            Object.assign(mission, m);
            return mission;
        });

        gameState.missions.ongoing = data.missions.ongoing.map(m => {
            const mission = new Mission(m);
            Object.assign(mission, m);
            return mission;
        });

        // Restaurer les niveaux d'upgrade
        data.upgrades.forEach(saved => {
            const upgrade = gameState.upgrades.find(u => u.id === saved.id);
            if (upgrade) {
                upgrade.level = saved.level;
            }
        });

        gameState.inventory = data.inventory || [];
        gameState.eventLog = data.eventLog || [];

        return true;
    } catch (e) {
        console.error('Erreur de chargement:', e);
        return false;
    }
}

function resetGame() {
    if (!confirm('Êtes-vous sûr de vouloir recommencer ? Toute progression sera perdue.')) {
        return;
    }

    localStorage.removeItem('guildManagerSave');
    location.reload();
}

// ===== INITIALISATION =====

document.addEventListener('DOMContentLoaded', initGame);
