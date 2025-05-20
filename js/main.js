/**
 * Main Game Module
 * Entry point that initializes and connects all game components
 */

// Import modules
import { gameState, applyDifficultyScaling } from './modules/gameState.js';
import { updateResourceDisplay, giveLayerCompletionRewards } from './modules/resources.js';
import { initGrid, handleDigDeeper, triggerDigDeeperAnimation } from './modules/grid.js';
import { initUI, showNotification, openModal, closeModal, setupEventListeners, addGameStyles } from './modules/ui.js';
import { initInventory, openInventoryModal, closeInventoryModal, addToInventory, removeFromInventory, updateInventoryDisplay } from './modules/inventory.js';
import { initShop, openShopModal, updateShopDisplay } from './modules/shop.js';
import { saveGame, loadGame, hasSaveData, newGame, setupAutoSave } from './modules/saveManager.js';

// Expose modules to global window for cross-module access
// This is needed for the current structure where modules reference each other
window.gameStateModule = { gameState, applyDifficultyScaling };
window.resourcesModule = { updateResourceDisplay, giveLayerCompletionRewards };
window.gridModule = { initGrid, handleDigDeeper, triggerDigDeeperAnimation };
window.uiModule = { showNotification, openModal, closeModal };
window.inventoryModule = { addToInventory, removeFromInventory, updateInventoryDisplay };
window.shopModule = { updateShopDisplay, openShopModal };
window.saveManagerModule = { saveGame, loadGame, hasSaveData, newGame };

// DOM elements
let domElements = {
    splashScreen: null,
    continueGameButton: null,
    newGameButton: null,
    gameContainer: null,
    diggingGrid: null,
    gemsCounter: null,
    stoneCounter: null,
    inventoryButton: null,
    shopButton: null,
    infoButton: null,
    digDeeperButton: null,
    inventoryModal: null,
    shopModal: null,
    infoModal: null,
    notificationArea: null
};

/**
 * Initialize the splash screen
 */
function initSplashScreen() {
    // Get splash screen elements
    domElements = {
        splashScreen: document.getElementById('splash-screen'),
        continueGameButton: document.getElementById('continue-game-button'),
        newGameButton: document.getElementById('new-game-button'),
        gameContainer: document.querySelector('.game-container'),
        diggingGrid: document.getElementById('digging-grid'),
        gemsCounter: document.getElementById('gems-counter'),
        stoneCounter: document.getElementById('stone-counter'),
        inventoryButton: document.getElementById('inventory-button'),
        shopButton: document.getElementById('shop-button'),
        infoButton: document.getElementById('info-button'),
        digDeeperButton: document.getElementById('dig-deeper-button'),
        inventoryModal: document.getElementById('inventory-modal'),
        shopModal: document.getElementById('shop-modal'),
        infoModal: document.getElementById('info-modal'),
        notificationArea: document.getElementById('notification-area')
    };

    // Check if saved game exists
    const hasSave = hasSaveData();
    domElements.continueGameButton.disabled = !hasSave;

    // Set up event listeners for splash screen buttons
    domElements.continueGameButton.addEventListener('click', () => {
        continueGame();
    });

    domElements.newGameButton.addEventListener('click', () => {
        startNewGame();
    });
}

/**
 * Continue a saved game
 */
function continueGame() {
    // Load the saved game state
    const loadSuccess = loadGame();

    if (loadSuccess) {
        // Hide splash screen and show game
        domElements.splashScreen.style.display = 'none';
        domElements.gameContainer.style.display = 'flex';

        // Initialize the game with loaded state
        initGame();

        showNotification('Game loaded successfully!');
    } else {
        showNotification('Failed to load saved game.');
    }
}

/**
 * Start a new game
 */
function startNewGame() {
    // Reset game state
    newGame();

    // Hide splash screen and show game
    domElements.splashScreen.style.display = 'none';
    domElements.gameContainer.style.display = 'flex';

    // Initialize the game
    initGame();

    showNotification('Welcome to Digger! Tap the grid to start mining.');
}

/**
 * Initialize the game
 */
function initGame() {

    // Initialize modules
    initInventory(domElements.inventoryModal);

    initUI({
        shopModal: domElements.shopModal,
        infoModal: domElements.infoModal,
        notificationArea: domElements.notificationArea
    });

    initShop(domElements.shopModal);

    initGrid(domElements.diggingGrid, domElements.digDeeperButton);

    // Set up auto-save
    setupAutoSave();

    // Set up event listeners for game controls
    setupEventListeners({
        inventoryButton: domElements.inventoryButton,
        shopButton: domElements.shopButton,
        infoButton: domElements.infoButton,
        digDeeperButton: domElements.digDeeperButton,
        handleInventoryOpen: openInventoryModal,
        handleDigDeeper: handleDigDeeper
    });

    // Add game styles
    addGameStyles();

    // Update UI for initial state
    updateResourceDisplay();

    // Show welcome message
    showNotification('Welcome to Digger! Tap the grid to start mining.');
}

    // Initialize the game when DOM is loaded
    document.addEventListener('DOMContentLoaded', initSplashScreen);

export {
    initSplashScreen,
    initGame,
    continueGame,
    startNewGame
};
