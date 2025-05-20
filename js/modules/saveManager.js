/**
 * Save Manager Module
 * Handles saving and loading game state to localStorage
 */

import { gameState, updateState } from './gameState.js';

// Key for storing game data in localStorage
const SAVE_KEY = 'digger_game_save';

/**
 * Save the current game state to localStorage
 */
function saveGame() {
    try {
        // Create a deep copy of the game state to save
        const saveData = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, saveData);
        console.log('Game saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving game:', error);
        return false;
    }
}

/**
 * Load game state from localStorage
 * @returns {boolean} True if load was successful, false otherwise
 */
function loadGame() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);

        if (!saveData) {
            console.log('No save data found');
            return false;
        }

        // Parse saved data
        const loadedState = JSON.parse(saveData);

        // Update each property of the game state
        Object.keys(loadedState).forEach(key => {
            updateState(key, loadedState[key]);
        });

        console.log('Game loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading game:', error);
        return false;
    }
}

/**
 * Check if a saved game exists
 * @returns {boolean} True if save data exists, false otherwise
 */
function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Create a new game by clearing any existing save data
 */
function newGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
        console.log('Starting new game');
        return true;
    } catch (error) {
        console.error('Error starting new game:', error);
        return false;
    }
}

/**
 * Set up auto-save functionality
 * @param {number} interval - Time interval in milliseconds between auto-saves
 */
function setupAutoSave(interval = 30000) { // Default: save every 30 seconds
    setInterval(saveGame, interval);
    console.log(`Auto-save enabled (every ${interval/1000} seconds)`);

    // Also save when user leaves the page
    window.addEventListener('beforeunload', () => {
        saveGame();
    });
}

export {
    saveGame,
    loadGame,
    hasSaveData,
    newGame,
    setupAutoSave
};
