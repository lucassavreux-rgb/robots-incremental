/**
 * =====================================================
 * PETS.JS - Système de Pets
 * =====================================================
 * Déblocage, amélioration et utilisation des pets
 */

/**
 * Initialise le système de pets
 */
function initPets() {
    renderPetsList();
    updateActivePetDisplay();
}

/**
 * Met à jour l'état des boutons pets sans re-render complet
 */
function updatePetsButtons() {
    PETS_DATA.forEach(petData => {
        const petState = gameState.pets.find(p => p.id === petData.id);
        const isUnlocked = petState !== undefined;
        const level = petState ? petState.level : 0;

        if (!isUnlocked) {
            // Bouton de déblocage
            const canUnlock = gameState.prestigePoints >= petData.unlockCost;
            const unlockBtn = document.querySelector(`.buy-btn[data-pet="unlock-${petData.id}"]`);
            if (unlockBtn) {
                unlockBtn.disabled = !canUnlock;
            }
        } else if (level < petData.maxLevel) {
            // Bouton d'amélioration
            const canUpgrade = gameState.prestigePoints >= petData.upgradeCost;
            const upgradeBtn = document.querySelector(`.upgrade-btn[data-pet="upgrade-${petData.id}"]`);
            if (upgradeBtn) {
                upgradeBtn.disabled = !canUpgrade;
            }
        }
    });
}

/**
 * Affiche la liste des pets
 */
function renderPetsList() {
    const container = document.getElementById('pets-list');
    container.innerHTML = '';

    PETS_DATA.forEach(petData => {
        const petState = gameState.pets.find(p => p.id === petData.id);
        const isUnlocked = petState !== undefined;
        const level = petState ? petState.level : 0;

        const petDiv = document.createElement('div');
        petDiv.classList.add('pet-item');

        if (!isUnlocked) {
            // Pet verrouillé
            const canUnlock = gameState.prestigePoints >= petData.unlockCost;

            petDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${petData.icon} ${petData.name} 🔒</div>
                    <div class="item-description">${petData.description}</div>
                    <div class="item-stats">
                        Passif: ${petData.passiveEffect.type}<br>
                        Actif: ${petData.activeAbility.name}
                    </div>
                </div>
                <div class="item-action">
                    <button class="buy-btn" data-pet="unlock-${petData.id}"
                            ${!canUnlock ? 'disabled' : ''}>
                        Débloquer: ${petData.unlockCost} RP
                    </button>
                </div>
            `;

            container.appendChild(petDiv);

            // Attacher l'événement
            const unlockBtn = petDiv.querySelector('.buy-btn');
            if (unlockBtn) {
                unlockBtn.addEventListener('click', () => {
                    console.log('Déblocage pet:', petData.id);
                    unlockPet(petData.id);
                });
            }
        } else {
            // Pet débloqué
            const canUpgrade = level < petData.maxLevel &&
                              gameState.prestigePoints >= petData.upgradeCost;

            const passiveBonus = petData.passiveEffect.baseValue * level;
            let passiveBonusText = '';
            if (petData.passiveEffect.type.includes('bonus') || petData.passiveEffect.type.includes('chance')) {
                passiveBonusText = `+${(passiveBonus * 100).toFixed(0)}%`;
            } else {
                passiveBonusText = passiveBonus.toFixed(1);
            }

            const isActive = gameState.activePet === petData.id;

            petDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${petData.icon} ${petData.name} ${isActive ? '⭐' : ''}</div>
                    <div class="item-description">${petData.description}</div>
                    <div class="item-stats">
                        Niveau: ${level} / ${petData.maxLevel}<br>
                        Passif: ${passiveBonusText}<br>
                        Actif: ${petData.activeAbility.description}
                    </div>
                </div>
                <div class="item-action">
                    ${!isActive ?
                        `<button class="equip-btn" data-pet="activate-${petData.id}">
                            Activer
                        </button>` :
                        '<span style="color: #28a745;">✓ ACTIF</span>'}
                    ${level < petData.maxLevel ?
                        `<button class="upgrade-btn" data-pet="upgrade-${petData.id}"
                                ${!canUpgrade ? 'disabled' : ''}>
                            Améliorer: ${petData.upgradeCost} RP
                        </button>` :
                        '<span style="color: #ffc107;">★ MAX</span>'}
                </div>
            `;

            container.appendChild(petDiv);

            // Attacher les événements
            if (!isActive) {
                const activateBtn = petDiv.querySelector('.equip-btn');
                if (activateBtn) {
                    activateBtn.addEventListener('click', () => {
                        console.log('Activation pet:', petData.id);
                        setActivePet(petData.id);
                    });
                }
            }

            if (level < petData.maxLevel) {
                const upgradeBtn = petDiv.querySelector('.upgrade-btn');
                if (upgradeBtn) {
                    upgradeBtn.addEventListener('click', () => {
                        console.log('Amélioration pet:', petData.id);
                        upgradePet(petData.id);
                    });
                }
            }
        }
    });
}

/**
 * Débloque un pet
 */
function unlockPet(petId) {
    const petData = PETS_DATA.find(p => p.id === petId);
    if (!petData) return;

    if (gameState.pets.some(p => p.id === petId)) {
        showNotification('Pet déjà débloqué !', 'error');
        return;
    }

    if (gameState.prestigePoints < petData.unlockCost) {
        showNotification('Pas assez de RP !', 'error');
        return;
    }

    gameState.prestigePoints -= petData.unlockCost;
    gameState.pets.push({
        id: petId,
        level: 1
    });

    // Si c'est le premier pet, l'activer automatiquement
    if (gameState.pets.length === 1) {
        gameState.activePet = petId;
    }

    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    renderPetsList();
    updateActivePetDisplay();
    updateMainStats();

    showNotification(`${petData.name} débloqué !`, 'success');
}

/**
 * Améliore un pet
 */
function upgradePet(petId) {
    const petData = PETS_DATA.find(p => p.id === petId);
    const petState = gameState.pets.find(p => p.id === petId);

    if (!petData || !petState) return;

    if (petState.level >= petData.maxLevel) {
        showNotification('Pet déjà au maximum !', 'error');
        return;
    }

    if (gameState.prestigePoints < petData.upgradeCost) {
        showNotification('Pas assez de RP !', 'error');
        return;
    }

    gameState.prestigePoints -= petData.upgradeCost;
    petState.level++;

    gameState.cpc = calculateTotalCPC();
    gameState.cps = calculateTotalCPS();

    renderPetsList();
    updateMainStats();

    showNotification(`${petData.name} amélioré !`, 'success');
}

/**
 * Active un pet
 */
function setActivePet(petId) {
    gameState.activePet = petId;
    renderPetsList();
    updateActivePetDisplay();
    showNotification('Pet actif changé !', 'success');
}

/**
 * Met à jour l'affichage du pet actif
 */
function updateActivePetDisplay() {
    const petId = gameState.activePet;

    if (!petId) {
        document.getElementById('active-pet-name').textContent = 'Aucun';
        document.getElementById('active-pet-ability').disabled = true;
        return;
    }

    const petData = PETS_DATA.find(p => p.id === petId);
    if (!petData) return;

    document.getElementById('active-pet-name').textContent =
        `${petData.icon} ${petData.name}`;

    const abilityBtn = document.getElementById('active-pet-ability');
    abilityBtn.disabled = false;
    abilityBtn.onclick = () => usePetAbility(petId);
}

/**
 * Utilise l'abilité d'un pet
 */
function usePetAbility(petId) {
    const petData = PETS_DATA.find(p => p.id === petId);
    if (!petData) return;

    const now = Date.now();
    const cooldownKey = `pet_${petId}_cooldown`;

    if (gameState.cooldowns[cooldownKey] && gameState.cooldowns[cooldownKey] > now) {
        const timeLeft = Math.ceil((gameState.cooldowns[cooldownKey] - now) / 1000);
        showNotification(`Cooldown: ${timeLeft}s`, 'error');
        return;
    }

    // Activer l'abilité
    const ability = petData.activeAbility;

    if (petId === 'pet_cat') {
        // Chat: garantit des critiques
        gameState.guaranteedCrits = true;
        setTimeout(() => {
            gameState.guaranteedCrits = false;
        }, ability.duration);
    } else {
        // Autres: boost de production
        addActiveEvent('pet_ability', ability.multiplier, ability.duration);
    }

    // Mettre le cooldown
    gameState.cooldowns[cooldownKey] = now + ability.cooldown;

    showNotification(`${ability.name} activé !`, 'success');
}
