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

// Expose modules to global window for cross-module access
// This is needed for the current structure where modules reference each other
window.gameStateModule = { gameState, applyDifficultyScaling };
window.resourcesModule = { updateResourceDisplay, giveLayerCompletionRewards };
window.gridModule = { initGrid, handleDigDeeper, triggerDigDeeperAnimation };
window.uiModule = { showNotification, openModal, closeModal };
window.inventoryModule = { addToInventory, removeFromInventory, updateInventoryDisplay };

// DOM elements
let domElements = {
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
 * Initialize the game when DOM is loaded
 */
function initGame() {
    // Get DOM elements
    domElements = {
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

    // Initialize modules
    initInventory(domElements.inventoryModal);

    initUI({
        shopModal: domElements.shopModal,
        infoModal: domElements.infoModal,
        notificationArea: domElements.notificationArea
    });

    initGrid(domElements.diggingGrid, domElements.digDeeperButton);

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
document.addEventListener('DOMContentLoaded', initGame);

export {
    initGame
};
