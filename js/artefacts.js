/**
 * =====================================================
 * ARTEFACTS.JS - Artefact System
 * =====================================================
 * Gestion des artefacts
 */

/**
 * Équipe un artefact
 */
function equipArtefact(artefactId) {
    // Vérifier si possédé
    if (!GameState.artefacts.owned.includes(artefactId)) {
        showNotification("You don't own this artefact!", "error");
        return false;
    }

    // Vérifier si déjà équipé
    if (GameState.artefacts.equipped.includes(artefactId)) {
        showNotification("Already equipped!", "error");
        return false;
    }

    // Vérifier le nombre de slots (max 3)
    if (GameState.artefacts.equipped.length >= 3) {
        showNotification("Maximum 3 artefacts equipped! Unequip one first.", "error");
        return false;
    }

    // Équiper
    GameState.artefacts.equipped.push(artefactId);

    // Recalculer
    updateCritStats();
    recalculateProduction();

    // UI
    updateArtefactsUI();
    updateStatsUI();

    const artefact = ARTEFACTS.find(a => a.id === artefactId);
    showNotification(`Equipped ${artefact.name}!`, "success");
    return true;
}

/**
 * Déséquipe un artefact
 */
function unequipArtefact(artefactId) {
    const index = GameState.artefacts.equipped.indexOf(artefactId);
    if (index === -1) {
        showNotification("Not equipped!", "error");
        return false;
    }

    // Déséquiper
    GameState.artefacts.equipped.splice(index, 1);

    // Recalculer
    updateCritStats();
    recalculateProduction();

    // UI
    updateArtefactsUI();
    updateStatsUI();

    const artefact = ARTEFACTS.find(a => a.id === artefactId);
    showNotification(`Unequipped ${artefact.name}!`, "success");
    return true;
}

/**
 * Ajoute un artefact à l'inventaire
 */
function addArtefact(artefactId) {
    if (GameState.artefacts.owned.includes(artefactId)) {
        return false; // Déjà possédé
    }

    GameState.artefacts.owned.push(artefactId);
    updateArtefactsUI();

    const artefact = ARTEFACTS.find(a => a.id === artefactId);
    showNotification(`Found ${artefact.name}!`, "success");
    return true;
}

/**
 * Met à jour l'UI des artefacts
 */
function updateArtefactsUI() {
    const container = document.getElementById('artefacts-list');
    if (!container) return;

    container.innerHTML = '<h3>Equipped Artefacts</h3><div id="equipped-artefacts"></div><h3>Inventory</h3><div id="inventory-artefacts"></div>';

    const equippedContainer = document.getElementById('equipped-artefacts');
    const inventoryContainer = document.getElementById('inventory-artefacts');

    // Artefacts équipés
    if (GameState.artefacts.equipped.length === 0) {
        equippedContainer.innerHTML = '<p>No artefacts equipped</p>';
    } else {
        GameState.artefacts.equipped.forEach(artefactId => {
            const artefact = ARTEFACTS.find(a => a.id === artefactId);
            if (!artefact) return;

            const div = document.createElement('div');
            div.className = `artefact-item rarity-${artefact.rarity}`;
            div.innerHTML = `
                <div class="artefact-info">
                    <div class="artefact-name">${artefact.name}</div>
                    <div class="artefact-description">${artefact.description}</div>
                    <div class="artefact-rarity">${artefact.rarity}</div>
                </div>
                <button class="btn btn-unequip" onclick="unequipArtefact('${artefact.id}')">Unequip</button>
            `;
            equippedContainer.appendChild(div);
        });
    }

    // Inventaire
    const unequipped = GameState.artefacts.owned.filter(id => !GameState.artefacts.equipped.includes(id));
    if (unequipped.length === 0) {
        inventoryContainer.innerHTML = '<p>No artefacts in inventory</p>';
    } else {
        unequipped.forEach(artefactId => {
            const artefact = ARTEFACTS.find(a => a.id === artefactId);
            if (!artefact) return;

            const div = document.createElement('div');
            div.className = `artefact-item rarity-${artefact.rarity}`;
            div.innerHTML = `
                <div class="artefact-info">
                    <div class="artefact-name">${artefact.name}</div>
                    <div class="artefact-description">${artefact.description}</div>
                    <div class="artefact-rarity">${artefact.rarity}</div>
                </div>
                <button class="btn btn-equip" onclick="equipArtefact('${artefact.id}')">Equip</button>
            `;
            inventoryContainer.appendChild(div);
        });
    }
}
