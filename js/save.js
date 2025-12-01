/**
 * =====================================================
 * SAVE.JS - Système de Sauvegarde
 * =====================================================
 * Sauvegarde localStorage, export/import, auto-save
 */

const SAVE_KEY = 'clickerGameUltimate_save';
const AUTOSAVE_INTERVAL = 10000; // 10 secondes

/**
 * Initialise le système de sauvegarde
 */
function initSaveSystem() {
    // Boutons
    document.getElementById('manual-save-btn')?.addEventListener('click', saveGame);
    document.getElementById('export-save-btn')?.addEventListener('click', exportSave);
    document.getElementById('import-save-btn')?.addEventListener('click', openImportModal);
    document.getElementById('reset-save-btn')?.addEventListener('click', resetSave);
    document.getElementById('confirm-import-btn')?.addEventListener('click', importSave);
    document.getElementById('cancel-import-btn')?.addEventListener('click', closeImportModal);

    // Auto-save
    setInterval(() => {
        saveGame();
        updateAutoSaveTimer();
    }, AUTOSAVE_INTERVAL);

    // Charger la sauvegarde au démarrage
    loadGame();
}

/**
 * Sauvegarde le jeu
 */
function saveGame() {
    try {
        const saveData = {
            version: '1.0',
            timestamp: Date.now(),
            state: gameState
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('Jeu sauvegardé');
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        showNotification('Erreur de sauvegarde !', 'error');
    }
}

/**
 * Charge le jeu
 */
function loadGame() {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);

        if (!savedData) {
            console.log('Aucune sauvegarde trouvée, nouvelle partie');
            return false;
        }

        const saveData = JSON.parse(savedData);
        const loadedState = saveData.state;

        // Fusionner avec l'état par défaut pour les nouveaux champs
        Object.assign(gameState, loadedState);

        console.log('Jeu chargé');
        showNotification('Sauvegarde chargée !', 'success');
        return true;
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showNotification('Erreur de chargement !', 'error');
        return false;
    }
}

/**
 * Exporte la sauvegarde en base64
 */
function exportSave() {
    try {
        const saveData = {
            version: '1.0',
            timestamp: Date.now(),
            state: gameState
        };

        const json = JSON.stringify(saveData);
        const base64 = btoa(json);

        // Copier dans le presse-papier
        navigator.clipboard.writeText(base64).then(() => {
            showNotification('Sauvegarde copiée dans le presse-papier !', 'success');
        }).catch(() => {
            // Fallback: afficher dans une alerte
            prompt('Copiez cette sauvegarde:', base64);
        });
    } catch (error) {
        console.error('Erreur d\'export:', error);
        showNotification('Erreur d\'export !', 'error');
    }
}

/**
 * Ouvre le modal d'import
 */
function openImportModal() {
    document.getElementById('import-modal').classList.add('active');
}

/**
 * Ferme le modal d'import
 */
function closeImportModal() {
    document.getElementById('import-modal').classList.remove('active');
    document.getElementById('import-textarea').value = '';
}

/**
 * Importe une sauvegarde
 */
function importSave() {
    try {
        const base64 = document.getElementById('import-textarea').value.trim();

        if (!base64) {
            showNotification('Aucune sauvegarde fournie !', 'error');
            return;
        }

        const json = atob(base64);
        const saveData = JSON.parse(json);

        // Vérifier la version
        if (saveData.version !== '1.0') {
            if (!confirm('Version de sauvegarde différente. Continuer ?')) {
                return;
            }
        }

        // Charger l'état
        Object.assign(gameState, saveData.state);

        // Rafraîchir tout
        initializeGame();

        closeImportModal();
        showNotification('Sauvegarde importée !', 'success');

        // Sauvegarder
        saveGame();
    } catch (error) {
        console.error('Erreur d\'import:', error);
        showNotification('Sauvegarde invalide !', 'error');
    }
}

/**
 * Réinitialise la sauvegarde
 */
function resetSave() {
    if (!confirm('ATTENTION : Cela supprimera toute votre progression !\n\nÊtes-vous VRAIMENT sûr ?')) {
        return;
    }

    if (!confirm('Dernière confirmation : TOUT sera perdu !')) {
        return;
    }

    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

/**
 * Met à jour le timer d'auto-save
 */
function updateAutoSaveTimer() {
    const seconds = AUTOSAVE_INTERVAL / 1000;
    document.getElementById('auto-save-timer').textContent = seconds + 's';
}
