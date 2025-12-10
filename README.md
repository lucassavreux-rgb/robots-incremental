# 💰 Investor Days - Simulation d'Investisseur

> Un jeu de gestion et simulation d'investissement où vous incarnez un investisseur qui fait fructifier son patrimoine au fil des jours.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Description

**Investor Days** est un jeu de simulation financière dans le navigateur où vous devez gérer vos investissements et faire croître votre capital sur plusieurs jours.

### Objectifs
- Faire fructifier votre capital de départ (10 000 €)
- Diversifier vos investissements entre différents actifs
- Gérer le risque et la volatilité
- Survivre aux événements aléatoires (krach, boom, taxes...)
- Atteindre la meilleure valeur nette possible après 365 jours

## ✨ Fonctionnalités

### 💼 Investissements disponibles
- **Compte Sécurisé** 🏦 - Faible risque, 2% de rendement annuel
- **Obligations** 📜 - Risque modéré, 4% de rendement, blocage 60 jours
- **Indice Boursier (ETF)** 📊 - Risque moyen, 7% de rendement
- **Immobilier** 🏠 - Risque moyen, 5% de rendement, blocage 90 jours
- **Startup / Venture** 🚀 - Risque élevé, 15% de rendement, très volatile

### ⚡ Événements aléatoires
- Krach boursier
- Boom économique
- Taxe exceptionnelle
- Opportunités spéciales
- Rallye technologique
- Crise immobilière

### 📊 Interface complète
- Suivi en temps réel de votre patrimoine
- Graphique d'évolution de la valeur nette
- Journal des événements
- Profil de risque dynamique
- Sauvegarde automatique dans le navigateur

## 🚀 Comment jouer

### En local
1. Téléchargez les fichiers du projet
2. Ouvrez `index.html` dans votre navigateur
3. Le jeu se lance automatiquement !

### En ligne (GitHub Pages)
Rendez-vous sur : [Votre lien GitHub Pages]

## 🎯 Règles du jeu

### Temps
- 1 seconde réelle = 1 jour dans le jeu
- Le temps défile automatiquement
- Possibilité de mettre en pause
- Bouton "Avance rapide" pour sauter 10 jours

### Investir
1. Cliquez sur "Investir" sur un actif
2. Choisissez le montant à investir
3. Validez l'investissement
4. Votre cash diminue, votre portefeuille augmente

### Vendre
- Cliquez sur "Vendre" dans votre portefeuille
- Attention aux périodes de blocage !
- Les pénalités s'appliquent si vous vendez trop tôt

### Stratégie
- Diversifiez vos investissements
- Équilibrez risque et rendement
- Gardez toujours du cash disponible
- Surveillez les événements aléatoires

## 📈 Calcul des rendements

Les rendements sont calculés quotidiennement avec :
- **Rendement moyen annuel** converti en rendement journalier
- **Volatilité** qui crée des variations aléatoires
- Les actifs à haut risque peuvent gagner ou perdre plus rapidement

Formule : `Valeur du jour = Valeur précédente × (1 + rendement journalier + volatilité aléatoire)`

## 💾 Sauvegarde

Le jeu sauvegarde automatiquement votre progression dans le **localStorage** du navigateur :
- Votre jour actuel
- Votre cash et portefeuille
- L'historique des 500 derniers jours
- Le journal des événements

Pour recommencer : cliquez sur "Nouvelle Partie"

## 🏆 Bilan après 365 jours

Au bout de 365 jours, un rapport s'affiche avec :
- Votre valeur nette finale
- Votre rendement total en %
- Votre meilleur jour
- Un commentaire sur votre performance

Vous pouvez ensuite continuer à jouer en mode infini !

## 🛠️ Technologies utilisées

- **HTML5** - Structure
- **CSS3** - Style avec variables CSS et animations
- **JavaScript Vanilla** - Logique du jeu (aucun framework)
- **Canvas API** - Graphique d'évolution

## 📂 Structure du projet

```
investor-days/
├── index.html      # Page principale
├── styles.css      # Styles et design
├── script.js       # Logique du jeu
└── README.md       # Ce fichier
```

## 🎨 Personnalisation

Le code est conçu pour être facilement modifiable :

### Modifier les constantes (dans `script.js`)
```javascript
const STARTING_CASH = 10000;        // Capital de départ
const DAY_DURATION_MS = 1000;       // Durée d'un jour en ms
const REPORT_DAY = 365;             // Jour du bilan
const EVENT_PROBABILITY = 0.05;     // 5% de chance d'événement
```

### Ajouter un nouvel actif
Ajoutez un objet dans le tableau `ASSETS` :
```javascript
{
    id: 'crypto',
    name: 'Cryptomonnaie',
    icon: '₿',
    risk: 'high',
    riskLabel: 'Très Élevé',
    annualReturn: 0.20,
    volatility: 0.15,
    minInvestment: 100,
    lockDays: 0,
    earlyPenalty: 0,
    description: 'Investissement ultra-volatile'
}
```

### Ajouter un événement
Ajoutez un objet dans le tableau `EVENTS` :
```javascript
{
    id: 'new-event',
    name: 'Nom de l\'événement',
    description: 'Description',
    probability: 0.1,
    effect: (gameState) => {
        // Votre logique ici
    }
}
```

## 📱 Responsive

Le jeu est optimisé pour :
- 💻 Desktop
- 📱 Tablettes
- 📱 Mobile (version adaptée)

## 🐛 Bugs connus

Aucun bug majeur connu pour le moment.

Si vous trouvez un bug, ouvrez une issue sur GitHub !

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Push sur la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ pour les passionnés de finance et de jeux de gestion !

## 🌟 Remerciements

Merci d'avoir joué à **Investor Days** !

N'hésitez pas à laisser une ⭐ si vous avez aimé le jeu !

---

**Bon investissement ! 💰📈**
