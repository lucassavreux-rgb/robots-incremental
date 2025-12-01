/**
 * =====================================================
 * ARTEFACTS.JS - Système d'Artefacts
 * =====================================================
 * Artefacts rares avec bonus puissants et set effects
 */

/**
 * Initialise le système d'artefacts
 */
function initArtefacts() {
    renderArtefactsList();
    updateArtefactsInfo();
}

/**
 * Affiche la liste des artefacts
 */
function renderArtefactsList() {
    const container = document.getElementById('artefacts-list');
    container.innerHTML = '';

    ARTEFACTS_DATA.forEach(artefact => {
        const isUnlocked = gameState.unlockedArtefacts.includes(artefact.id);
        const isEquipped = gameState.equippedArtefacts.includes(artefact.id);

        const artefactDiv = document.createElement('div');
        artefactDiv.classList.add('artefact-item');

        if (isEquipped) {
            artefactDiv.classList.add('equipped');
        }

        const rarityClass = artefact.rarity;

        if (!isUnlocked) {
            artefactDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${artefact.name} 🔒</div>
                    <span class="artefact-rarity ${rarityClass}">${artefact.rarity}</span>
                    <div class="item-description">Artefact verrouillé</div>
                    <div class="item-stats">Obtenez-le via prestige ou boss</div>
                </div>
            `;
        } else {
            let effectText = '';
            switch (artefact.effect.type) {
                case 'cpc_mult':
                    effectText = `x${artefact.effect.value} CPC`;
                    break;
                case 'cps_mult':
                    effectText = `x${artefact.effect.value} CPS`;
                    break;
                case 'generator_mult':
                    effectText = `x${artefact.effect.value} production ${artefact.effect.generator}`;
                    break;
                case 'boss_damage':
                    effectText = `x${artefact.effect.value} dégâts boss`;
                    break;
                case 'rp_bonus':
                    effectText = `+${(artefact.effect.value * 100).toFixed(0)}% RP`;
                    break;
                default:
                    effectText = 'Bonus spécial';
            }

            artefactDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${artefact.name}</div>
                    <span class="artefact-rarity ${rarityClass}">${artefact.rarity}</span>
                    <div class="item-description">${artefact.description}</div>
                    <div class="item-stats">
                        ${effectText}<br>
                        Set: ${artefact.set}
                    </div>
                </div>
                <div class="item-action">
                    ${isEquipped ?
                        `<button class="equip-btn" data-artefact="unequip-${artefact.id}">
                            Déséquiper
                        </button>` :
                        `<button class="equip-btn" data-artefact="equip-${artefact.id}"
                                ${gameState.equippedArtefacts.length >= 3 ? 'disabled' : ''}>
                            Équiper
                        </button>`
                    }
                </div>
            `;

            container.appendChild(artefactDiv);

            // Attacher l'événement
            const equipBtn = artefactDiv.querySelector('.equip-btn');
            if (equipBtn) {
                equipBtn.addEventListener('click', () => {
                    if (isEquipped) {
                        console.log('Déséquipement artefact:', artefact.id);
                        unequipArtefact(artefact.id);
                    } else {
                        console.log('Équipement artefact:', artefact.id);
                        equipArtefact(artefact.id);
                    }
                });
            }
        } else {
            container.appendChild(artefactDiv);
        }
    });
}

/**
 * Équipe un artefact
 */
function equipArtefact(artefactId) {
    if (gameState.equippedArtefacts.length >= 3) {
        showNotification('Maximum 3 artefacts équipés !', 'error');
        return;
    }

    if (!gameState.unlockedArtefacts.includes(artefactId)) {
        showNotification('Artefact non débloqué !', 'error');
        return;
    }

    if (gameState.equippedArtefacts.includes(artefactId)) {
        showNotification('Artefact déjà équipé !', 'error');
        return;
    }

    gameState.equippedArtefacts.push(artefactId);

    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    renderArtefactsList();
    updateArtefactsInfo();
    updateMainStats();

    const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
    showNotification(`${artefact.name} équipé !`, 'success');
}

/**
 * Déséquipe un artefact
 */
function unequipArtefact(artefactId) {
    const index = gameState.equippedArtefacts.indexOf(artefactId);
    if (index === -1) return;

    gameState.equippedArtefacts.splice(index, 1);

    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    renderArtefactsList();
    updateArtefactsInfo();
    updateMainStats();

    const artefact = ARTEFACTS_DATA.find(a => a.id === artefactId);
    showNotification(`${artefact.name} déséquipé !`, 'success');
}

/**
 * Met à jour les infos d'artefacts
 */
function updateArtefactsInfo() {
    document.getElementById('equipped-artefacts-count').textContent =
        gameState.equippedArtefacts.length;

    const setBonus = calculateSetBonus();
    if (setBonus) {
        document.getElementById('active-set-bonus').textContent = setBonus.description;
    } else {
        document.getElementById('active-set-bonus').textContent = 'Aucun';
    }
}

/**
 * Débloque un artefact aléatoire
 */
function unlockRandomArtefact() {
    const locked = ARTEFACTS_DATA.filter(a =>
        !gameState.unlockedArtefacts.includes(a.id));

    if (locked.length === 0) {
        showNotification('Tous les artefacts débloqués !', 'info');
        return null;
    }

    // Probabilité basée sur la rareté
    const rarityWeights = {
        'common': 50,
        'rare': 30,
        'epic': 15,
        'legendary': 5
    };

    const weightedPool = [];
    locked.forEach(artefact => {
        const weight = rarityWeights[artefact.rarity] || 10;
        for (let i = 0; i < weight; i++) {
            weightedPool.push(artefact);
        }
    });

    const selected = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    gameState.unlockedArtefacts.push(selected.id);

    renderArtefactsList();
    showNotification(`Artefact débloqué : ${selected.name} (${selected.rarity})!`, 'success');

    return selected;
}
