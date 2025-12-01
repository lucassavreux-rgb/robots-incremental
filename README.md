# ⚡ Shard Clicker

**Shard Clicker** is an advanced idle/incremental clicker game built with HTML, CSS, and vanilla JavaScript. Collect Shards, buy generators, unlock upgrades, prestige for Renaissance Points, and explore a deep progression system with talents, artefacts, pets, bosses, and quests!

## 🎮 Features

### Core Mechanics
- **Click System**: Click the main button to earn Shards (with critical hits!)
- **Generators**: 8 automated generators producing Shards per second
- **Upgrades**: 20+ permanent upgrades for click power and production
- **Big Numbers**: Custom BigNumber system supporting values up to 10^308 without Infinity

### Advanced Systems
- **Prestige/Renaissance**: Reset your progress to gain Renaissance Points (RP) for permanent multipliers
- **Talent Tree**: 3 branches (Click, Generators, Prestige) with 12+ talents
- **Artefacts**: 6 rare artefacts with different rarities (Rare, Epic, Legendary)
- **Pets**: 3 pets with passive bonuses and active abilities
- **Boss Fights**: Challenge bosses every 5 minutes for rewards
- **Daily Quests**: Complete quests for Shards and RP rewards
- **Random Events**: Temporary boosts to production

### Quality of Life
- **Auto-save**: Game saves every 10 seconds
- **Offline Progress**: Earn Shards while you're away
- **Export/Import**: Backup your save file
- **Responsive Design**: Play on desktop or mobile

## 📁 Project Structure

```
robots-incremental/
├── index.html              # Main HTML file
├── style.css               # Game styles
├── README.md               # This file
└── js/
    ├── numbers.js          # BigNumber system
    ├── data.js             # Game data constants
    ├── state.js            # Game state management
    ├── utils.js            # Utility functions & calculations
    ├── generators.js       # Generator system
    ├── click.js            # Click handling
    ├── upgrades.js         # Upgrade system
    ├── prestige.js         # Prestige/Renaissance system
    ├── talents.js          # Talent tree
    ├── artefacts.js        # Artefact system
    ├── pets.js             # Pet system
    ├── quests.js           # Quest system
    ├── bosses.js           # Boss fight system
    ├── events.js           # Random events
    ├── save.js             # Save/load system
    └── main.js             # Main game loop & UI
```

## 🚀 How to Play

### Local Development
1. Clone this repository
2. Open `index.html` in your web browser
3. Start clicking and progressing!

### Online (GitHub Pages)
1. Fork this repository
2. Go to Settings → Pages
3. Select branch `main` and folder `/` (root)
4. Click Save
5. Visit `https://your-username.github.io/robots-incremental/`

## 📊 Game Mechanics

### Generators
8 generators with exponential scaling:
1. **Click Drone** - Cost: 50 Shards
2. **Shard Mine** - Cost: 500 Shards
3. **Nano Factory** - Cost: 5K Shards
4. **Crystal Laboratory** - Cost: 50K Shards
5. **Temporal Reactor** - Cost: 600K Shards
6. **Dimensional Portal** - Cost: 7M Shards
7. **Galactic Core** - Cost: 90M Shards
8. **Quantum Singularity** - Cost: 1.2B Shards

**Milestones**: Every 25 levels doubles production!

### Prestige Formula
```
RP gained = floor(sqrt(totalShardsEarned / 1,000,000))
```

- At 1M Shards earned → 1 RP
- At 100M Shards earned → 10 RP
- At 1T Shards earned → 1,000 RP

**RP Multiplier**: `1 + (totalRP × 0.01)`
- 100 RP = ×2 all production
- 1000 RP = ×11 all production

### Critical Hits
- **Base Crit Chance**: 5%
- **Base Crit Multiplier**: ×3
- **Max Crit Chance**: 50% (via talents & upgrades)
- **Max Crit Multiplier**: ×20 (via talents & upgrades)

### Boss Fights
- Spawn every 5 minutes (cooldown)
- 30 seconds to defeat
- HP scales: `100K × (1.5 ^ bossesDefeated)`
- Rewards: Shards, RP, and 20% chance for artefact drop

## 🎯 Progression Tips

1. **Early Game (0-1M Shards)**
   - Focus on clicking and buying Click Drone
   - Purchase click upgrades first
   - Aim for your first prestige at 1M total Shards earned

2. **Mid Game (1-100 RP)**
   - Invest RP in Click and Generator talents
   - Unlock Shard Mine and Nano Factory
   - Complete daily quests for extra RP

3. **Late Game (100+ RP)**
   - Focus on Prestige talents for faster RP gain
   - Equip powerful artefacts
   - Unlock and upgrade pets
   - Challenge bosses regularly

4. **End Game (1000+ RP)**
   - Max out talent trees
   - Collect all artefacts
   - Optimize generator combinations
   - Push for highest Shard/s possible!

## 🔧 Technical Details

### BigNumber System
The game uses a custom BigNumber implementation to handle extremely large numbers:
- **Format**: Mantissa + Exponent
- **Display**: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc, Ud, Dd...
- **Max**: Up to 10^308 (never shows Infinity)
- **Precision**: Maintains accuracy for all calculations

### Save Data
- Stored in `localStorage` under key `shard_clicker_save`
- Auto-saves every 10 seconds
- Includes all progress: Shards, generators, upgrades, RP, talents, artefacts, pets, quests, stats
- Offline progress calculated on load

### Performance
- Game loop runs at 60 FPS
- Minimal DOM manipulation (selective updates)
- Efficient BigNumber operations
- No external dependencies

## 🐛 Troubleshooting

**Game not loading?**
- Clear browser cache
- Make sure JavaScript is enabled
- Check browser console for errors

**Save not working?**
- Ensure localStorage is enabled
- Check browser privacy settings
- Try exporting/importing save manually

**Performance issues?**
- Close other browser tabs
- Disable browser extensions
- Try a different browser (Chrome recommended)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🎨 Credits

- **Design**: Modern gradient theme with glassmorphism
- **Icons**: Unicode emojis
- **Font**: Segoe UI (system default)
- **Architecture**: Modular JavaScript with clean separation of concerns

## 📧 Contact

For questions, suggestions, or bug reports, please open an issue on GitHub.

---

**Have fun clicking! 💎⚡**
