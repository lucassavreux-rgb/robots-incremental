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
        showNotification("Pet already owned!", "error");
        return false;
    }

    GameState.pets.owned.push(petId);
    if (!GameState.pets.active) {
        GameState.pets.active = petId;
    }

    recalculateProduction();
    updatePetsUI();
    updateStatsUI();

    const pet = PETS.find(p => p.id === petId);
    showNotification(`Unlocked ${pet.name}!`, "success");
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
