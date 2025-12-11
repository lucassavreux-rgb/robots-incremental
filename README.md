# ⚔️ Guild Manager - Gestion de Guilde d'Aventuriers

> Un jeu de gestion tour par tour où vous incarnez le maître d'une guilde d'aventuriers dans un univers heroic-fantasy.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Description

**Guild Manager** est un jeu de gestion stratégique au tour par tour. Vous devez recruter des héros, les envoyer en mission, gérer leurs équipements, améliorer votre guilde et faire croître votre réputation !

### Objectifs
- Recruter et gérer une équipe de héros de différentes classes
- Envoyer vos héros en mission pour gagner de l'or et de la réputation
- Faire progresser vos héros (niveaux, équipements, compétences)
- Améliorer votre guilde avec de nouveaux bâtiments
- Survivre aux risques (blessures, échecs de missions)
- Devenir la guilde la plus prestigieuse du royaume !

## ✨ Fonctionnalités

### 👥 Système de Héros
- **5 classes jouables** : Guerrier, Mage, Voleur, Soigneur, Ranger
- **Progression complète** : montée de niveau, gain d'XP
- **Stats détaillées** : HP, Attaque, Défense, Vitesse
- **Traits spéciaux** : Chanceux, Robuste, Leader, etc.
- **Système d'équipement** : armes, armures, accessoires
- **États** : Disponible, En mission, Blessé

### 📜 Missions Variées
- **10 types de missions** différentes
- **5 niveaux de difficulté**
- Durées variables (1 à 5 jours)
- **Risques** : échecs, blessures
- **Récompenses** : or, réputation, XP
- **Système de recommandations** : classes optimales par mission
- **Calcul intelligent** : chances de succès basées sur les stats

### 🏰 Améliorations de Guilde
- **Salle d'entraînement** : +XP pour les héros
- **Forge** : réduction du coût des équipements
- **Infirmerie** : récupération plus rapide
- **Dortoirs** : plus de héros recrutables
- **Taverne** : meilleure qualité des recrues

### 🛒 Boutique d'Équipements
- **9 équipements** disponibles
- 3 catégories : Armes, Armures, Accessoires
- Bonus de stats variés
- Système de réduction (amélioration Forge)

### 🎲 Mécaniques de Jeu
- **Tour par tour** : bouton "Fin de journée"
- **Gestion du temps** : missions qui progressent jour par jour
- **Récupération** : héros blessés se soignent avec le temps
- **Événements aléatoires** (rares)
- **Système de réputation** : débloque de nouvelles missions
- **Rangs de guilde** : Novice → Légendaire

## 🚀 Comment jouer

### En local
1. Téléchargez les 3 fichiers : `index.html`, `styles.css`, `script.js`
2. Ouvrez `index.html` dans votre navigateur
3. Le jeu se lance automatiquement !

### En ligne (GitHub Pages)
Rendez-vous sur : [Votre lien GitHub Pages]

## 🎯 Guide de jeu

### Démarrage
- Vous commencez avec **1000 or**, **0 réputation** et **3 héros** de niveau 1
- Des missions sont disponibles immédiatement

### Recruter des héros
- Coût : 200 or par héros
- Héros générés aléatoirement (nom, classe)
- Limite de héros augmentable avec l'amélioration "Dortoirs"

### Lancer une mission
1. Allez dans l'onglet **Missions**
2. Cliquez sur une mission disponible
3. Sélectionnez les héros à assigner
4. Cliquez sur "Lancer la mission"
5. La mission démarre et progresse jour par jour

### Fin de journée
- Cliquez sur le bouton **"🌙 Fin de journée"**
- Les missions en cours avancent d'un jour
- Les héros blessés récupèrent
- Les missions terminées donnent leurs récompenses
- Nouvelles missions tous les 3 jours

### Gérer les équipements
1. Achetez des équipements dans l'onglet **Boutique**
2. Cliquez sur un héros pour voir ses détails
3. Équipez les objets de votre inventaire
4. Les stats du héros augmentent automatiquement

### Améliorer la guilde
- Dépensez votre or dans l'onglet **Guilde**
- Chaque amélioration a 5 niveaux
- Les effets sont permanents et cumulatifs

## 📊 Système de combat

Les chances de succès d'une mission dépendent de :
- **Niveau moyen** des héros vs niveau recommandé
- **Stats totales** de l'équipe (Attaque + Défense + Vitesse)
- **Classes recommandées** : bonus si la classe correspond
- **Traits spéciaux** : bonus pour certains traits
- **Nombre de héros** : plus de héros = plus de chances

Formule : entre 10% et 95% de chances de succès

### Conséquences
- **Succès** : récompenses complètes, peu de risques
- **Échec** : héros blessés, pas de récompenses
- **Blessure** : héros indisponible pendant 2-4 jours

## 💾 Sauvegarde

Le jeu sauvegarde automatiquement votre progression dans le navigateur (localStorage) :
- À chaque fin de journée
- Après chaque action importante
- Chargement automatique au lancement

Bouton **"Nouvelle Partie"** pour recommencer à zéro.

## 🛠️ Technologies

- **HTML5** - Structure
- **CSS3** - Design avec variables CSS et animations
- **JavaScript Vanilla** - Logique du jeu (aucun framework)
- Architecture orientée objet (classes Hero, Mission, Equipment, etc.)

## 📂 Structure du projet

```
guild-manager/
├── index.html      # Page principale avec structure à onglets
├── styles.css      # Design fantasy avec thème sombre
├── script.js       # Logique complète du jeu
└── README.md       # Ce fichier
```

## 🎨 Personnalisation

Le code est conçu pour être facilement modifiable :

### Ajouter une nouvelle mission
Dans `MISSION_TEMPLATES` (script.js), ajoutez :
```javascript
{
    name: 'Nom de la mission',
    type: 'combat',
    difficulty: 3,
    duration: 2,
    minLevel: 5,
    recommendedClasses: ['warrior', 'mage'],
    rewards: { gold: 500, reputation: 20, xp: 100 },
    description: 'Description de la mission'
}
```

### Ajouter un nouvel équipement
Dans `EQUIPMENT_TEMPLATES` :
```javascript
{
    name: 'Épée légendaire',
    type: 'weapon',
    bonuses: { attack: 25, speed: 5 },
    cost: 1500
}
```

### Modifier les constantes
```javascript
const STARTING_GOLD = 1000;        // Or de départ
const STARTING_REPUTATION = 0;     // Réputation de départ
const MAX_HEROES_BASE = 10;        // Nombre max de héros
```

## 📱 Responsive

Le jeu s'adapte aux différentes tailles d'écran :
- 💻 Desktop (expérience optimale)
- 📱 Tablettes
- 📱 Mobile (interface adaptée)

## 🎯 Conseils stratégiques

1. **Diversifiez vos classes** : chaque classe a ses forces
2. **Améliorez la salle d'entraînement tôt** : XP bonus permanent
3. **Gérez vos héros blessés** : toujours avoir des remplaçants
4. **Choisissez les bonnes missions** : classes recommandées = +chances
5. **Investissez dans les équipements** : boost significatif
6. **Montez votre réputation** : débloque missions plus rentables

## 🐛 Bugs connus

Aucun bug majeur connu pour le moment.

Si vous trouvez un bug, ouvrez une issue sur GitHub !

## 🤝 Contribution

Les contributions sont bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push sur la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## 📜 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Créé avec ❤️ pour les amateurs de jeux de gestion et d'univers fantasy !

## 🌟 Remerciements

Merci d'avoir joué à **Guild Manager** !

N'hésitez pas à laisser une ⭐ si vous avez aimé le jeu !

---

**Bonne gestion de guilde ! ⚔️🏰**
