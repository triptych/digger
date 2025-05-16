/**
 * Digger Game - Core JavaScript
 * Mobile-first cozy mining game
 */

// Game state
const gameState = {
    resources: {
        gems: 0,
        stone: 0
    },
    currentDepth: 1,
    inventory: [],
    gridSize: 5, // 5x5 grid
    cells: [] // Will hold cell data
};

// DOM elements
let diggingGrid = null;
let gemsCounter = null;
let stoneCounter = null;
let inventoryButton = null;
let shopButton = null;
let digDeeperButton = null;
let inventoryModal = null;
let shopModal = null;
let notificationArea = null;

/**
 * Initialize the game
 */
function initGame() {
    // Get DOM elements
    diggingGrid = document.getElementById('digging-grid');
    gemsCounter = document.getElementById('gems-counter');
    stoneCounter = document.getElementById('stone-counter');
    inventoryButton = document.getElementById('inventory-button');
    shopButton = document.getElementById('shop-button');
    digDeeperButton = document.getElementById('dig-deeper-button');
    inventoryModal = document.getElementById('inventory-modal');
    shopModal = document.getElementById('shop-modal');
    notificationArea = document.getElementById('notification-area');

    // Set up event listeners
    setupEventListeners();

    // Generate initial grid
    generateGrid();

    // Update UI
    updateResourceDisplay();
}

/**
 * Set up event listeners for game controls
 */
function setupEventListeners() {
    // Inventory button
    inventoryButton.addEventListener('click', () => {
        openModal(inventoryModal);
    });

    // Shop button
    shopButton.addEventListener('click', () => {
        openModal(shopModal);
    });

    // Dig deeper button
    digDeeperButton.addEventListener('click', () => {
        gameState.currentDepth++;
        generateGrid();
        showNotification(`Digging deeper to level ${gameState.currentDepth}! 🔽`);
    });

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
 * Generate the digging grid
 */
function generateGrid() {
    // Clear existing grid
    diggingGrid.innerHTML = '';
    gameState.cells = [];

    // Create cells
    for (let i = 0; i < gameState.gridSize * gameState.gridSize; i++) {
        const cell = createCell(i);
        diggingGrid.appendChild(cell.element);
        gameState.cells.push(cell);
    }
}

/**
 * Create a grid cell
 * @param {number} index - Cell index
 * @returns {Object} Cell object with data and DOM element
 */
function createCell(index) {
    // Calculate cell hardness based on depth
    const hardness = Math.floor(Math.random() * 3) + gameState.currentDepth;

    // Determine if cell contains a gem (higher chance on deeper levels)
    const hasGem = Math.random() < (0.05 + (gameState.currentDepth * 0.02));

    // Create cell element
    const cellElement = document.createElement('div');
    cellElement.className = 'grid-cell';
    cellElement.setAttribute('data-index', index);

    // Cell data
    const cellData = {
        index,
        hardness,
        durability: hardness, // Current health of cell
        hasGem,
        element: cellElement,
        broken: false
    };

    // Add touch/click event listener
    cellElement.addEventListener('click', () => digCell(cellData));
    cellElement.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        digCell(cellData);
    });

    return cellData;
}

/**
 * Handle digging a cell
 * @param {Object} cell - Cell data
 */
function digCell(cell) {
    // Skip if already broken
    if (cell.broken) return;

    // Reduce durability
    cell.durability--;

    // Apply visual feedback
    applyDiggingVisualFeedback(cell);

    // Check if cell is broken
    if (cell.durability <= 0) {
        breakCell(cell);
    }
}

/**
 * Apply visual feedback when digging a cell
 * @param {Object} cell - Cell data
 */
function applyDiggingVisualFeedback(cell) {
    // Calculate progress percentage
    const progress = 1 - (cell.durability / cell.hardness);

    // Apply visual changes based on progress
    cell.element.style.backgroundColor = `rgba(139, 115, 85, ${1 - progress * 0.5})`;

    // Add crack effect based on progress
    if (progress > 0.25) {
        cell.element.textContent = '╱';
    }
    if (progress > 0.5) {
        cell.element.textContent = '╳';
    }
    if (progress > 0.75) {
        cell.element.textContent = '╳╳';
    }

    // Add animation class
    cell.element.classList.add('dig-animation');

    // Remove animation class after animation completes
    setTimeout(() => {
        cell.element.classList.remove('dig-animation');
    }, 300);
}

/**
 * Break a cell completely
 * @param {Object} cell - Cell data
 */
function breakCell(cell) {
    // Mark as broken
    cell.broken = true;

    // Update visuals
    cell.element.classList.add('broken');
    cell.element.textContent = '';

    // Always give stone
    gameState.resources.stone++;

    // Check for gem
    if (cell.hasGem) {
        gameState.resources.gems++;
        showNotification('Found a gem! 💎');

        // Show gem in cell
        const gemElement = document.createElement('span');
        gemElement.textContent = '💎';
        gemElement.classList.add('gem-reveal');
        cell.element.appendChild(gemElement);
    } else {
        // Show stone in cell
        const stoneElement = document.createElement('span');
        stoneElement.textContent = '🪨';
        stoneElement.classList.add('resource-reveal');
        cell.element.appendChild(stoneElement);
    }

    // Update UI
    updateResourceDisplay();
}

/**
 * Open a modal
 * @param {HTMLElement} modal - Modal element
 */
function openModal(modal) {
    // Update modal content based on type
    if (modal === inventoryModal) {
        updateInventoryModal();
    } else if (modal === shopModal) {
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
 * Update inventory modal content
 */
function updateInventoryModal() {
    const inventoryItems = document.getElementById('inventory-items');
    inventoryItems.innerHTML = '';

    // Add resources section
    const resourcesSection = document.createElement('div');
    resourcesSection.className = 'inventory-section';

    const resourcesTitle = document.createElement('h3');
    resourcesTitle.textContent = 'Resources';
    resourcesSection.appendChild(resourcesTitle);

    const resourcesList = document.createElement('div');
    resourcesList.className = 'resources-list';

    // Gems
    const gemsItem = document.createElement('div');
    gemsItem.className = 'inventory-item';
    gemsItem.innerHTML = `<span class="item-icon">💎</span> Gems: ${gameState.resources.gems}`;
    resourcesList.appendChild(gemsItem);

    // Stone
    const stoneItem = document.createElement('div');
    stoneItem.className = 'inventory-item';
    stoneItem.innerHTML = `<span class="item-icon">🪨</span> Stone: ${gameState.resources.stone}`;
    resourcesList.appendChild(stoneItem);

    resourcesSection.appendChild(resourcesList);
    inventoryItems.appendChild(resourcesSection);

    // Add placeholder for future items
    const itemsSection = document.createElement('div');
    itemsSection.className = 'inventory-section';

    const itemsTitle = document.createElement('h3');
    itemsTitle.textContent = 'Items';
    itemsSection.appendChild(itemsTitle);

    const itemsList = document.createElement('div');
    itemsList.className = 'items-list';

    if (gameState.inventory.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No items yet. Visit the shop to purchase items!';
        itemsList.appendChild(emptyMessage);
    } else {
        // Future implementation: display inventory items
    }

    itemsSection.appendChild(itemsList);
    inventoryItems.appendChild(itemsSection);
}

/**
 * Update shop modal content
 */
function updateShopModal() {
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';

    // Placeholder for shop items
    const shopMessage = document.createElement('p');
    shopMessage.textContent = 'Shop coming soon! Check back later for upgrades and special items.';
    shopItems.appendChild(shopMessage);
}

/**
 * Update resource display
 */
function updateResourceDisplay() {
    gemsCounter.textContent = `💎 ${gameState.resources.gems}`;
    stoneCounter.textContent = `🪨 ${gameState.resources.stone}`;
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

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Add CSS for the dig animation
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

    .gem-reveal, .resource-reveal {
        animation: reveal 0.5s forwards;
        opacity: 0;
        transform: scale(0);
        display: inline-block;
    }

    @keyframes reveal {
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
`);
