/**
 * UI Module
 * Handles UI elements and interactions
 */

import { gameState } from './gameState.js';

// Will be set by the init function
let shopModal = null;
let infoModal = null;
let notificationArea = null;

/**
 * Initialize the UI module
 * @param {Object} elements - Object containing UI elements
 */
function initUI(elements) {
    shopModal = elements.shopModal;
    infoModal = elements.infoModal;
    notificationArea = elements.notificationArea;

    // Initialize stats
    updateGameStats();
}

/**
 * Show a notification
 * @param {string} message - Notification message
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notificationArea.appendChild(notification);

    // Remove notification after animation completes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Open a modal
 * @param {HTMLElement} modal - Modal element
 */
function openModal(modal) {
    // Update modal content based on type
    if (modal === shopModal) {
        updateShopModal();
    }

    // Show modal
    modal.style.display = 'flex';
}

/**
 * Close a modal
 * @param {HTMLElement} modal - Modal element
 */
function closeModal(modal) {
    modal.style.display = 'none';
}

/**
 * Update shop modal content
 */
function updateShopModal() {
    // Shop update is now handled by the shop module
    window.shopModule.updateShopDisplay();
}

/**
 * Update game stats in the info modal
 */
function updateGameStats() {
    // Get the current state
    const state = gameState;

    // Update the stats in the info modal
    document.getElementById('blocks-mined').textContent = state.stats.blocksMined;
    document.getElementById('max-depth').textContent = state.stats.maxDepth;
    document.getElementById('total-resources').textContent = state.stats.totalResources;

    // Update last save time if available
    const saveTimeElement = document.getElementById('last-save-time');
    if (saveTimeElement) {
        const lastSaveTime = localStorage.getItem('digger_last_save_time');
        saveTimeElement.textContent = lastSaveTime ? new Date(parseInt(lastSaveTime)).toLocaleTimeString() : 'Never';
    }
}

/**
 * Handle manual save game button
 */
function handleSaveGame() {
    if (window.saveManagerModule && window.saveManagerModule.saveGame()) {
        // Record save time
        localStorage.setItem('digger_last_save_time', Date.now().toString());
        updateGameStats();
        showNotification('Game saved successfully! 💾');
    } else {
        showNotification('Failed to save game!');
    }
}

/**
 * Set up event listeners for game controls
 * @param {Object} elements - Object containing UI elements and button handlers
 */
function setupEventListeners(elements) {
    const {
        inventoryButton,
        shopButton,
        infoButton,
        digDeeperButton,
        handleInventoryOpen,
        handleDigDeeper
    } = elements;

    // Set tooltip titles for game control buttons
    inventoryButton.setAttribute('title', 'Open your inventory to see collected resources and items');
    shopButton.setAttribute('title', 'Visit the shop to purchase upgrades and special items');
    infoButton.setAttribute('title', 'View game information and stats');
    digDeeperButton.setAttribute('title', 'Dig deeper to the next level after clearing current layer');

    // Inventory button
    inventoryButton.addEventListener('click', handleInventoryOpen);

    // Shop button
    shopButton.addEventListener('click', () => {
        window.shopModule.openShopModal();
    });

    // Info button
    infoButton.addEventListener('click', () => {
        updateGameStats();
        openModal(infoModal);
    });

    // Save game button (in the info modal)
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', handleSaveGame);
    }

    // Dig deeper button
    digDeeperButton.addEventListener('click', handleDigDeeper);

    // Close buttons for modals
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal if clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

/**
 * Add CSS for animations and effects
 */
function addGameStyles() {
    document.head.insertAdjacentHTML('beforeend', `
    <style>
        .dig-animation {
            animation: dig-shake 0.3s;
        }

        @keyframes dig-shake {
            0%, 100% { transform: translateY(0); }
            25% { transform: translateY(-2px); }
            75% { transform: translateY(2px); }
        }

        .broken {
            background-color: var(--color-surface) !important;
        }

        .gem-reveal, .resource-reveal, .special-item-reveal {
            animation: reveal 0.5s forwards;
            opacity: 0;
            transform: scale(0);
            display: inline-block;
            font-size: 1.8rem;
            z-index: 2;
        }

        .special-item-reveal {
            animation: special-reveal 0.8s forwards;
            font-size: 2rem;
        }

        @keyframes reveal {
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes special-reveal {
            0% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
                transform: scale(1.3) rotate(10deg);
            }
            100% {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.4);
            pointer-events: none;
            opacity: 0.6;
            transition: transform 0.6s, opacity 0.6s;
        }

        .dig-deeper-ready {
            animation: pulse 1.5s infinite;
            background-color: var(--color-accent) !important;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .glow-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
            opacity: 0.7;
            animation: glow-pulse 1.5s infinite;
            z-index: 0;
        }

        @keyframes glow-pulse {
            0% { opacity: 0.5; }
            50% { opacity: 0.8; }
            100% { opacity: 0.5; }
        }

        .sparkle-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        }

        .sparkle {
            position: absolute;
            font-size: 1rem;
            transition: opacity 0.8s, transform 1.2s;
        }

        .special-neighbor-pulse {
            animation: neighbor-pulse 1s;
        }

        @keyframes neighbor-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .special-inventory-item {
            position: relative;
            background-color: var(--color-background);
            border: 1px solid var(--color-primary);
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            flex-direction: column;
            align-items: flex-start;
        }

        .special-inventory-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .item-details {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .item-name {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .item-description {
            font-size: 0.8rem;
            opacity: 0.8;
        }

        .dig-deeper-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0);
            pointer-events: none;
            transition: background-color 0.5s;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .dig-deeper-overlay.active {
            background-color: rgba(0, 0, 0, 0.6);
        }

        .depth-indicator {
            font-size: 2rem;
            color: white;
            background-color: var(--color-primary);
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            transform: scale(0);
            animation: depth-appear 0.5s forwards;
        }

        @keyframes depth-appear {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
    </style>
    `);
}

export {
    initUI,
    showNotification,
    openModal,
    closeModal,
    setupEventListeners,
    addGameStyles,
    updateGameStats,
    handleSaveGame
};
