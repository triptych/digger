/**
 * Inventory Module
 * Manages player's inventory functionality
 */

import { gameState } from './gameState.js';
import { closeModal } from './ui.js';

// Will be set by the init function
let inventoryModal = null;

// Inventory configuration
const inventoryConfig = {
    maxCapacity: 50,          // Maximum items in inventory
    maxStackSize: 99,         // Maximum stack size for stackable items
    categories: [
        {
            id: 'resources',
            name: 'Resources',
            icon: '🧱',
            description: 'Basic materials found while digging'
        },
        {
            id: 'gems',
            name: 'Gems',
            icon: '💎',
            description: 'Valuable gems with special properties'
        },
        {
            id: 'tools',
            name: 'Tools',
            icon: '⛏️',
            description: 'Special tools and equipment'
        },
        {
            id: 'treasures',
            name: 'Treasures',
            icon: '🧰',
            description: 'Rare and valuable finds'
        }
    ]
};

/**
 * Initialize the inventory system
 * @param {Object} modal - The inventory modal element
 */
function initInventory(modal) {
    inventoryModal = modal;

    // Initialize inventory structure if not present
    if (!gameState.inventory) {
        gameState.inventory = [];
    }

    // Initialize inventory metadata
    gameState.inventoryMeta = {
        currentCapacity: 0,
        spaceUpgrades: 0,
        activeCategory: 'all',
        sortMethod: 'default'
    };

    // Set up inventory event listeners
    setupInventoryEventListeners();
}

/**
 * Set up event listeners for inventory interactions
 */
function setupInventoryEventListeners() {
    // Close button for inventory modal
    const closeButton = document.querySelector('#inventory-modal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeInventoryModal();
        });
    }

    // Inventory modal backdrop click
    if (inventoryModal) {
        inventoryModal.addEventListener('click', (e) => {
            if (e.target === inventoryModal) {
                closeInventoryModal();
            }
        });
    }
}

/**
 * Open the inventory modal
 */
function openInventoryModal() {
    updateInventoryDisplay();
    inventoryModal.style.display = 'flex';
}

/**
 * Close the inventory modal
 */
function closeInventoryModal() {
    inventoryModal.style.display = 'none';
}

/**
 * Add an item to the inventory
 * @param {Object} gameStateObj - Reference to the game state
 * @param {Object} item - The item to add
 * @returns {boolean} - Whether the item was successfully added
 */
function addToInventory(gameStateObj, item) {
    // Check if inventory is full
    if (gameStateObj.inventoryMeta.currentCapacity >= getCurrentMaxCapacity(gameStateObj)) {
        window.uiModule.showNotification("Inventory full! Sell items or upgrade your bag.");
        return false;
    }

    // If item is stackable, check if we already have it
    if (item.stackable && item.stackable === true) {
        const existingItem = gameStateObj.inventory.find(i =>
            i.type === item.type &&
            i.variant === item.variant
        );

        if (existingItem) {
            // Increase quantity up to max stack size
            if (existingItem.quantity < inventoryConfig.maxStackSize) {
                existingItem.quantity++;
                return true;
            } else {
                window.uiModule.showNotification(`Can't carry more ${item.name}!`);
                return false;
            }
        }

        // New stackable item
        item.quantity = 1;
    }

    // Add new item to inventory
    gameStateObj.inventory.push(item);
    gameStateObj.inventoryMeta.currentCapacity++;
    return true;
}

/**
 * Remove an item from the inventory
 * @param {Object} gameStateObj - Reference to the game state
 * @param {number} index - Index of the item to remove
 * @param {number} quantity - Quantity to remove (for stackable items)
 * @returns {Object|null} - The removed item, or null if failed
 */
function removeFromInventory(gameStateObj, index, quantity = 1) {
    if (index < 0 || index >= gameStateObj.inventory.length) {
        return null;
    }

    const item = gameStateObj.inventory[index];

    // Handle stackable items
    if (item.stackable && item.quantity > quantity) {
        item.quantity -= quantity;
        return {...item, quantity: quantity}; // Return a copy with the removed quantity
    }

    // Remove the entire item
    gameStateObj.inventory.splice(index, 1);
    gameStateObj.inventoryMeta.currentCapacity--;
    return item;
}

/**
 * Get current maximum inventory capacity
 * @param {Object} gameStateObj - Reference to the game state
 * @returns {number} - The current maximum capacity
 */
function getCurrentMaxCapacity(gameStateObj) {
    // Base capacity plus upgrades
    return inventoryConfig.maxCapacity + (gameStateObj.inventoryMeta.spaceUpgrades * 10);
}

/**
 * Get items by category
 * @param {string} categoryId - Category ID to filter by
 * @returns {Array} - Filtered items
 */
function getItemsByCategory(categoryId) {
    if (categoryId === 'all') {
        return gameState.inventory;
    }

    return gameState.inventory.filter(item => {
        switch(categoryId) {
            case 'resources':
                return item.type === 'resource';
            case 'gems':
                return item.type === 'gem';
            case 'tools':
                return item.type === 'special' &&
                      ['pickaxe', 'magnet', 'compass'].includes(item.variant);
            case 'treasures':
                return item.type === 'special' &&
                      ['chest', 'bomb'].includes(item.variant);
            default:
                return false;
        }
    });
}

/**
 * Sort inventory items
 * @param {Array} items - Items to sort
 * @param {string} method - Sorting method
 * @returns {Array} - Sorted items
 */
function sortInventoryItems(items, method) {
    const sortedItems = [...items]; // Create a copy to sort

    switch(method) {
        case 'name':
            sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'type':
            sortedItems.sort((a, b) => {
                // Sort by type first
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                // Then by variant
                return a.variant.localeCompare(b.variant);
            });
            break;
        case 'rarity':
            sortedItems.sort((a, b) => {
                // Rarity might be undefined for some items
                const rarityA = a.rarity || 0;
                const rarityB = b.rarity || 0;
                return rarityB - rarityA; // Higher rarity first
            });
            break;
        case 'quantity':
            sortedItems.sort((a, b) => {
                const qtyA = a.quantity || 1;
                const qtyB = b.quantity || 1;
                return qtyB - qtyA; // Higher quantity first
            });
            break;
        default: // 'default' sorting
            sortedItems.sort((a, b) => {
                // Group by type first
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                // Resources: sort by value
                if (a.type === 'resource') {
                    return (b.value || 0) - (a.value || 0);
                }
                // Special items and gems: sort by rarity
                return (b.rarity || 0) - (a.rarity || 0);
            });
    }

    return sortedItems;
}

/**
 * Update the inventory display
 */
function updateInventoryDisplay() {
    const inventoryItems = document.getElementById('inventory-items');
    if (!inventoryItems) return;

    // Clear existing content
    inventoryItems.innerHTML = '';

    // Add inventory capacity indicator
    const capacitySection = document.createElement('div');
    capacitySection.className = 'inventory-capacity';
    capacitySection.innerHTML = `
        <div class="capacity-bar">
            <div class="capacity-fill" style="width: ${(gameState.inventoryMeta.currentCapacity / getCurrentMaxCapacity(gameState) * 100)}%"></div>
        </div>
        <div class="capacity-text">
            ${gameState.inventoryMeta.currentCapacity}/${getCurrentMaxCapacity(gameState)} slots used
        </div>
    `;
    inventoryItems.appendChild(capacitySection);

    // Add category tabs
    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'inventory-categories';

    // Add "All" category first
    const allCategoryTab = document.createElement('div');
    allCategoryTab.className = `category-tab ${gameState.inventoryMeta.activeCategory === 'all' ? 'active' : ''}`;
    allCategoryTab.innerHTML = `<span>🔍 All</span>`;
    allCategoryTab.addEventListener('click', () => {
        gameState.inventoryMeta.activeCategory = 'all';
        updateInventoryDisplay();
    });
    categoriesSection.appendChild(allCategoryTab);

    // Add other category tabs
    inventoryConfig.categories.forEach(category => {
        const categoryTab = document.createElement('div');
        categoryTab.className = `category-tab ${gameState.inventoryMeta.activeCategory === category.id ? 'active' : ''}`;
        categoryTab.innerHTML = `<span>${category.icon} ${category.name}</span>`;
        categoryTab.addEventListener('click', () => {
            gameState.inventoryMeta.activeCategory = category.id;
            updateInventoryDisplay();
        });
        categoriesSection.appendChild(categoryTab);
    });

    inventoryItems.appendChild(categoriesSection);

    // Add sorting options
    const sortingSection = document.createElement('div');
    sortingSection.className = 'inventory-sorting';

    const sortLabel = document.createElement('span');
    sortLabel.textContent = 'Sort by:';
    sortingSection.appendChild(sortLabel);

    const sortMethods = [
        { id: 'default', name: 'Default' },
        { id: 'name', name: 'Name' },
        { id: 'type', name: 'Type' },
        { id: 'rarity', name: 'Rarity' },
        { id: 'quantity', name: 'Quantity' }
    ];

    sortMethods.forEach(method => {
        const sortButton = document.createElement('button');
        sortButton.className = `sort-button ${gameState.inventoryMeta.sortMethod === method.id ? 'active' : ''}`;
        sortButton.textContent = method.name;
        sortButton.addEventListener('click', () => {
            gameState.inventoryMeta.sortMethod = method.id;
            updateInventoryDisplay();
        });
        sortingSection.appendChild(sortButton);
    });

    inventoryItems.appendChild(sortingSection);

    // Get filtered and sorted items
    const filteredItems = getItemsByCategory(gameState.inventoryMeta.activeCategory);
    const sortedItems = sortInventoryItems(filteredItems, gameState.inventoryMeta.sortMethod);

    // Add items display
    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'inventory-grid';

    if (sortedItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-inventory-message';
        emptyMessage.textContent = 'No items in this category. Keep digging to find treasures!';
        itemsGrid.appendChild(emptyMessage);
    } else {
        // Display items
        sortedItems.forEach((item, index) => {
            const itemElement = createInventoryItemElement(item, index);
            itemsGrid.appendChild(itemElement);
        });
    }

    inventoryItems.appendChild(itemsGrid);
}

/**
 * Create an inventory item element
 * @param {Object} item - The item to display
 * @param {number} index - The item's index in the inventory
 * @returns {HTMLElement} - The created element
 */
function createInventoryItemElement(item, index) {
    const itemElement = document.createElement('div');
    itemElement.className = 'inventory-grid-item';

    // Add rarity class if applicable
    if (item.rarity) {
        if (item.rarity >= 0.9) {
            itemElement.classList.add('legendary-item');
        } else if (item.rarity >= 0.7) {
            itemElement.classList.add('rare-item');
        } else if (item.rarity >= 0.5) {
            itemElement.classList.add('uncommon-item');
        } else {
            itemElement.classList.add('common-item');
        }
    }

    // Item icon with colored background for gems and special items
    const itemIconWrapper = document.createElement('div');
    itemIconWrapper.className = 'item-icon-wrapper';

    if (item.color) {
        itemIconWrapper.style.backgroundColor = item.color;
        itemIconWrapper.style.boxShadow = `0 0 10px ${item.color}40`;
    }

    const itemIcon = document.createElement('span');
    itemIcon.className = 'item-icon';
    itemIcon.textContent = item.emoji;
    itemIconWrapper.appendChild(itemIcon);

    // Show quantity for stackable items
    if (item.quantity && item.quantity > 1) {
        const quantityBadge = document.createElement('span');
        quantityBadge.className = 'quantity-badge';
        quantityBadge.textContent = item.quantity;
        itemIconWrapper.appendChild(quantityBadge);
    }

    itemElement.appendChild(itemIconWrapper);

    // Item details (name and basic info)
    const itemInfo = document.createElement('div');
    itemInfo.className = 'item-info';

    const itemName = document.createElement('div');
    itemName.className = 'item-name';
    itemName.textContent = item.name;
    itemInfo.appendChild(itemName);

    // Add a brief description if available
    if (item.description) {
        const itemDesc = document.createElement('div');
        itemDesc.className = 'item-brief-desc';
        itemDesc.textContent = item.description.length > 30
            ? item.description.substring(0, 30) + '...'
            : item.description;
        itemInfo.appendChild(itemDesc);
    }

    itemElement.appendChild(itemInfo);

    // Make the item clickable to show details
    itemElement.addEventListener('click', () => {
        showItemDetails(item, index);
    });

    return itemElement;
}

/**
 * Show detailed information about an item
 * @param {Object} item - The item to display details for
 * @param {number} index - Index in the inventory
 */
function showItemDetails(item, index) {
    // Create or get the item details modal
    let detailsModal = document.getElementById('item-details-modal');
    if (!detailsModal) {
        detailsModal = document.createElement('div');
        detailsModal.id = 'item-details-modal';
        detailsModal.className = 'modal';
        document.querySelector('.game-container').appendChild(detailsModal);
    }

    // Create modal content
    detailsModal.innerHTML = `
        <div class="modal-content item-details-content">
            <div class="modal-header">
                <h2>${item.name}</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="item-details-main">
                    <div class="item-details-icon" style="background-color: ${item.color || 'var(--color-primary)'}">
                        ${item.emoji}
                    </div>
                    <div class="item-details-info">
                        <div class="item-property">
                            <span class="property-label">Type:</span>
                            <span class="property-value">${capitalizeFirstLetter(item.type)}
                                ${item.variant ? `(${capitalizeFirstLetter(item.variant)})` : ''}
                            </span>
                        </div>
                        ${item.quantity ? `
                            <div class="item-property">
                                <span class="property-label">Quantity:</span>
                                <span class="property-value">${item.quantity}</span>
                            </div>
                        ` : ''}
                        ${item.value ? `
                            <div class="item-property">
                                <span class="property-label">Value:</span>
                                <span class="property-value">${item.value} coins</span>
                            </div>
                        ` : ''}
                        ${item.rarity ? `
                            <div class="item-property">
                                <span class="property-label">Rarity:</span>
                                <span class="property-value">${getRarityLabel(item.rarity)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${item.description ? `
                    <div class="item-description">
                        <h3>Description</h3>
                        <p>${item.description}</p>
                    </div>
                ` : ''}
                <div class="item-actions">
                    ${item.type === 'special' ? `
                        <button class="item-action-button use-button">Use</button>
                    ` : ''}
                    <button class="item-action-button discard-button">Discard</button>
                </div>
            </div>
        </div>
    `;

    // Show the modal
    detailsModal.style.display = 'flex';

    // Close button event listener
    detailsModal.querySelector('.close-button').addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    // Click outside to close
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    // Use button functionality
    const useButton = detailsModal.querySelector('.use-button');
    if (useButton) {
        useButton.addEventListener('click', () => {
            useItem(item, index);
            detailsModal.style.display = 'none';
        });
    }

    // Discard button functionality
    const discardButton = detailsModal.querySelector('.discard-button');
    if (discardButton) {
        discardButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to discard ${item.name}?`)) {
                removeFromInventory(gameState, index);
                updateInventoryDisplay();
                detailsModal.style.display = 'none';
                window.uiModule.showNotification(`Discarded ${item.name}`);
            }
        });
    }
}

/**
 * Use an item from the inventory
 * @param {Object} item - The item to use
 * @param {number} index - Index in the inventory
 */
function useItem(item, index) {
    // Different functionality based on item type
    if (item.type === 'special') {
        switch(item.variant) {
            case 'magnet':
                // Future implementation: Activate magnet effect
                window.uiModule.showNotification("Magnet activated! Will attract gems for a short time.");
                break;
            case 'bomb':
                // Future implementation: Activate bomb effect
                window.uiModule.showNotification("Mining bomb ready! Click a cell to break a 3x3 area.");
                break;
            case 'compass':
                // Future implementation: Activate compass effect
                window.uiModule.showNotification("Gem compass active! Nearest gems will sparkle.");
                break;
            case 'pickaxe':
                // Future implementation: Activate pickaxe effect
                window.uiModule.showNotification("Lucky pickaxe active! Increased gem find chance.");
                break;
            case 'chest':
                // Open chest immediately to get random resources
                openTreasureChest();
                break;
            default:
                window.uiModule.showNotification(`Used ${item.name}`);
        }

        // Remove the item after use
        removeFromInventory(gameState, index);
        updateInventoryDisplay();
    }
}

/**
 * Open a treasure chest to get random resources
 */
function openTreasureChest() {
    // Random rewards from chest
    const gems = Math.floor(Math.random() * 3) + 1;
    const stone = Math.floor(Math.random() * 10) + 5;
    const ore = Math.floor(Math.random() * 5) + 1;

    // Add to resources
    gameState.resources.gems += gems;
    gameState.resources.stone += stone;
    gameState.resources.ore += ore;

    // Update resource display
    window.resourcesModule.updateResourceDisplay();

    // Show notification
    window.uiModule.showNotification(`Treasure chest contained: ${gems} 💎 gems, ${stone} 🪨 stone, and ${ore} 🧱 ore!`);
}

/**
 * Get a human-readable rarity label
 * @param {number} rarity - The rarity value (0-1)
 * @returns {string} - Rarity label
 */
function getRarityLabel(rarity) {
    if (rarity >= 0.9) return 'Legendary';
    if (rarity >= 0.7) return 'Rare';
    if (rarity >= 0.5) return 'Uncommon';
    return 'Common';
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - Input string
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export {
    initInventory,
    openInventoryModal,
    closeInventoryModal,
    addToInventory,
    removeFromInventory,
    updateInventoryDisplay
};
