/**
 * =====================================================
 * PETS.JS - Pet System
 * =====================================================
 * Gestion des pets (bonus passifs et actifs)
 */

/**
 * Débloque un pet
 */
function unlockPet(petId) {
    if (GameState.pets.owned.includes(petId)) {
        showNotification("Pet déjà possédé !", "error");
        return false;
    }

    GameState.pets.owned.push(petId);
    if (!GameState.pets.active) {
        GameState.pets.active = petId;
    }

    recalculateProduction();
    updatePetsUI();
    updatePetShopUI();
    updateStatsUI();

    const pet = PETS.find(p => p.id === petId);
    showNotification(`${pet.name} débloqué !`, "success");
    return true;
}

/**
 * Achète un pet dans le shop
 */
function buyPet(petId) {
    const pet = PETS.find(p => p.id === petId);
    if (!pet) return false;

    // Vérifier si pet déjà possédé
    if (GameState.pets.owned.includes(petId)) {
        showNotification("Pet déjà possédé !", "error");
        return false;
    }

    // Vérifier si c'est un pet shop
    if (pet.obtainType !== 'shop') {
        showNotification("Ce pet ne peut pas être acheté !", "error");
        return false;
    }

    // Vérifier le coût
    const cost = new BigNumber(pet.cost);
    if (GameState.shards.lessThan(cost)) {
        showNotification("Pas assez de Shards !", "error");
        return false;
    }

    // Acheter
    GameState.shards = GameState.shards.subtract(cost);
    unlockPet(petId);

    return true;
}

/**
 * Active un pet
 */
function activatePet(petId) {
    if (!GameState.pets.owned.includes(petId)) {
        showNotification("Pet not owned!", "error");
        return false;
    }

    GameState.pets.active = petId;
    recalculateProduction();
    updatePetsUI();
    updateStatsUI();

    const pet = PETS.find(p => p.id === petId);
    showNotification(`Activated ${pet.name}!`, "success");
    return true;
}

/**
 * Utilise la capacité active d'un pet
 */
function usePetAbility(petId) {
    const pet = PETS.find(p => p.id === petId);
    if (!pet) return false;

    // Vérifier cooldown
    const now = Date.now();
    const cooldownEnd = GameState.pets.activeCooldowns[petId] || 0;
    if (now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        showNotification(`Cooldown: ${remaining}s remaining`, "error");
        return false;
    }

    // Activer
    const eventType = pet.activeBonusType === 'cpc' ? 'pet_cpc' : 'pet_cps';
    GameState.activeEvents.push({
        id: `pet_${petId}`,
        type: eventType,
        multiplier: pet.activeMultiplier,
        endTime: now + (pet.activeDurationSeconds * 1000)
    });

    // Cooldown
    GameState.pets.activeCooldowns[petId] = now + (pet.cooldownSeconds * 1000);

    recalculateProduction();
    updatePetsUI();
    updateStatsUI();

    showNotification(`${pet.name} ability activated!`, "success");
    return true;
}

/**
 * Met à jour l'UI des pets
 */
function updatePetsUI() {
    const container = document.getElementById('pets-list');
    if (!container) return;

    container.innerHTML = '';

    PETS.forEach(pet => {
        const owned = GameState.pets.owned.includes(pet.id);
        const active = GameState.pets.active === pet.id;

        if (!owned) {
            // Pet non débloqué (peut être affiché ou masqué selon le design)
            return;
        }

        // Calculer cooldown
        const now = Date.now();
        const cooldownEnd = GameState.pets.activeCooldowns[pet.id] || 0;
        const onCooldown = now < cooldownEnd;
        const cooldownRemaining = onCooldown ? Math.ceil((cooldownEnd - now) / 1000) : 0;

        const div = document.createElement('div');
        div.className = 'pet-item' + (active ? ' pet-active' : '');
        div.innerHTML = `
            <div class="pet-info">
                <div class="pet-name">${pet.name}</div>
                <div class="pet-description">${pet.description}</div>
            </div>
            <div class="pet-actions">
                ${!active ? `<button class="btn btn-activate" onclick="activatePet('${pet.id}')">Activate</button>` : '<span class="pet-status">Active</span>'}
                <button class="btn btn-ability" onclick="usePetAbility('${pet.id}')" ${onCooldown ? 'disabled' : ''}>
                    ${onCooldown ? `Cooldown: ${cooldownRemaining}s` : 'Use Ability'}
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

/**
 * Met à jour l'UI du pet shop
 */
function updatePetShopUI() {
    const container = document.getElementById('pet-shop-list');
    if (!container) return;

    container.innerHTML = '';

    // Filtrer les pets du shop
    const shopPets = PETS.filter(p => p.obtainType === 'shop');

    shopPets.forEach(pet => {
        const owned = GameState.pets.owned.includes(pet.id);
        const cost = new BigNumber(pet.cost);
        const canAfford = GameState.shards.greaterThanOrEqual(cost);

        const div = document.createElement('div');
        div.className = 'pet-shop-item' + (owned ? ' pet-owned' : '') + (!canAfford && !owned ? ' disabled' : '');
        div.innerHTML = `
            <div class="pet-info">
                <div class="pet-name">${pet.name} ${owned ? '✓' : ''}</div>
                <div class="pet-rarity rarity-${pet.rarity}">${pet.rarity.toUpperCase()}</div>
                <div class="pet-description">${pet.description}</div>
                <div class="pet-cost">Coût: ${formatNumber(cost)} Shards</div>
            </div>
            <div class="pet-actions">
                ${!owned ?
                    `<button class="btn btn-buy" onclick="buyPet('${pet.id}')" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Acheter' : 'Trop cher'}
                    </button>`
                    : '<span class="pet-status">Possédé</span>'}
            </div>
        `;

        container.appendChild(div);
    });
}
