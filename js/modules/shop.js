/**
 * Shop Module
 * Handles shop functionality for upgrades and items
 */

import { gameState, updateState } from './gameState.js';

// Will be set by the init function
let shopModal = null;

// Shop configuration
const shopConfig = {
    items: [
        {
            id: 'pick_upgrade_1',
            name: 'Better Pickaxe',
            description: 'Increases mining power by 1',
            emoji: '⛏️',
            cost: 15,
            category: 'tools',
            requiredLevel: 1,
            maxLevel: 5,
            effect: (state) => {
                state.tool.power += 1;
                state.tool.level += 1;
                return `Mining power increased to ${state.tool.power}!`;
            }
        },
        {
            id: 'pick_upgrade_2',
            name: 'Sturdy Pickaxe',
            description: 'Increases mining power by 2',
            emoji: '⛏️',
            cost: 40,
            category: 'tools',
            requiredLevel: 2,
            maxLevel: 3,
            effect: (state) => {
                state.tool.power += 2;
                state.tool.level += 1;
                return `Mining power increased to ${state.tool.power}!`;
            }
        },
        {
            id: 'pick_upgrade_3',
            name: 'Premium Pickaxe',
            description: 'Increases mining power by 3',
            emoji: '⛏️',
            cost: 75,
            category: 'tools',
            requiredLevel: 3,
            maxLevel: 2,
            effect: (state) => {
                state.tool.power += 3;
                state.tool.level += 1;
                return `Mining power increased to ${state.tool.power}!`;
            }
        },
        {
            id: 'inventory_upgrade_1',
            name: 'Small Bag',
            description: 'Increases inventory capacity by 10 slots',
            emoji: '🎒',
            cost: 25,
            category: 'upgrades',
            requiredLevel: 1,
            maxLevel: 3,
            effect: (state) => {
                state.inventoryMeta.spaceUpgrades += 1;
                return 'Inventory space increased by 10 slots!';
            }
        },
        {
            id: 'inventory_upgrade_2',
            name: 'Medium Bag',
            description: 'Increases inventory capacity by 20 slots',
            emoji: '🎒',
            cost: 60,
            category: 'upgrades',
            requiredLevel: 2,
            maxLevel: 2,
            effect: (state) => {
                state.inventoryMeta.spaceUpgrades += 2;
                return 'Inventory space increased by 20 slots!';
            }
        },
        {
            id: 'inventory_upgrade_3',
            name: 'Large Bag',
            description: 'Increases inventory capacity by 30 slots',
            emoji: '🎒',
            cost: 100,
            category: 'upgrades',
            requiredLevel: 3,
            maxLevel: 1,
            effect: (state) => {
                state.inventoryMeta.spaceUpgrades += 3;
                return 'Inventory space increased by 30 slots!';
            }
        },
        {
            id: 'magnet',
            name: 'Gem Magnet',
            description: 'Attracts nearby gems when digging',
            emoji: '🧲',
            cost: 20,
            category: 'items',
            requiredLevel: 1,
            maxLevel: Infinity,
            effect: (state) => {
                // Add the magnet to inventory
                window.inventoryModule.addToInventory(state, {
                    type: 'special',
                    variant: 'magnet',
                    name: 'Gem Magnet',
                    emoji: '🧲',
                    description: 'Attracts nearby gems when digging',
                    rarity: 0.8,
                    color: '#cc5500',
                    stackable: false
                });
                return 'Gem Magnet added to your inventory!';
            }
        },
        {
            id: 'bomb',
            name: 'Mining Bomb',
            description: 'Breaks surrounding rocks when used',
            emoji: '💣',
            cost: 30,
            category: 'items',
            requiredLevel: 2,
            maxLevel: Infinity,
            effect: (state) => {
                // Add the bomb to inventory
                window.inventoryModule.addToInventory(state, {
                    type: 'special',
                    variant: 'bomb',
                    name: 'Mining Bomb',
                    emoji: '💣',
                    description: 'Breaks surrounding rocks when used',
                    rarity: 0.85,
                    color: '#333333',
                    stackable: false
                });
                return 'Mining Bomb added to your inventory!';
            }
        },
        {
            id: 'gem_compass',
            name: 'Gem Compass',
            description: 'Points to nearby gems',
            emoji: '🧭',
            cost: 50,
            category: 'items',
            requiredLevel: 3,
            maxLevel: Infinity,
            effect: (state) => {
                // Add the compass to inventory
                window.inventoryModule.addToInventory(state, {
                    type: 'special',
                    variant: 'compass',
                    name: 'Gem Compass',
                    emoji: '🧭',
                    description: 'Points to nearby gems',
                    rarity: 0.9,
                    color: '#5f4b8b',
                    stackable: false
                });
                return 'Gem Compass added to your inventory!';
            }
        }
    ],
    categories: [
        {
            id: 'all',
            name: 'All Items',
            emoji: '🔍'
        },
        {
            id: 'tools',
            name: 'Tools',
            emoji: '⛏️'
        },
        {
            id: 'upgrades',
            name: 'Upgrades',
            emoji: '🎒'
        },
        {
            id: 'items',
            name: 'Special Items',
            emoji: '🔮'
        }
    ]
};

/**
 * Initialize the shop module
 * @param {Object} modal - The shop modal element
 */
function initShop(modal) {
    shopModal = modal;

    // Initialize shop state if not present
    if (!gameState.shopMeta) {
        gameState.shopMeta = {
            purchasedItems: {},
            activeCategory: 'all'
        };
    }

    // Set up shop event listeners
    setupShopEventListeners();
}

/**
 * Set up event listeners for shop interactions
 */
function setupShopEventListeners() {
    // Close button for shop modal is handled in UI module
}

/**
 * Open the shop modal
 */
function openShopModal() {
    updateShopDisplay();
    window.uiModule.openModal(shopModal);
}

/**
 * Get available shop items based on the current game state
 * @returns {Array} Available shop items
 */
function getAvailableShopItems() {
    const currentToolLevel = gameState.tool.level;
    const currentDepth = gameState.currentDepth;

    return shopConfig.items.filter(item => {
        // Check if the player meets the level requirement
        const meetsLevelRequirement = item.requiredLevel <= currentToolLevel;

        // Check if the item has reached its maximum purchase limit
        const purchaseCount = gameState.shopMeta.purchasedItems[item.id] || 0;
        const belowMaxLevel = purchaseCount < item.maxLevel;

        // Special case for depth-based items (could expand this logic)
        const meetsDepthRequirement = currentDepth >= item.requiredLevel;

        return meetsLevelRequirement && belowMaxLevel && meetsDepthRequirement;
    });
}

/**
 * Get items by category
 * @param {string} categoryId - Category ID to filter by
 * @returns {Array} - Filtered items
 */
function getItemsByCategory(categoryId) {
    const availableItems = getAvailableShopItems();

    if (categoryId === 'all') {
        return availableItems;
    }

    return availableItems.filter(item => item.category === categoryId);
}

/**
 * Update the shop display
 */
function updateShopDisplay() {
    const shopItems = document.getElementById('shop-items');
    if (!shopItems) return;

    // Clear existing content
    shopItems.innerHTML = '';

    // Add currency display
    const currencySection = document.createElement('div');
    currencySection.className = 'shop-currency';
    currencySection.innerHTML = `
        <div class="currency-amount">
            <span class="currency-icon">💎</span>
            <span class="currency-value">${gameState.resources.gems}</span>
        </div>
        <div class="currency-label">Gems to spend</div>
    `;
    shopItems.appendChild(currencySection);

    // Add category tabs
    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'shop-categories';

    // Add category tabs
    shopConfig.categories.forEach(category => {
        const categoryTab = document.createElement('div');
        categoryTab.className = `category-tab ${gameState.shopMeta.activeCategory === category.id ? 'active' : ''}`;
        categoryTab.innerHTML = `<span>${category.emoji} ${category.name}</span>`;
        categoryTab.addEventListener('click', () => {
            gameState.shopMeta.activeCategory = category.id;
            updateShopDisplay();
        });
        categoriesSection.appendChild(categoryTab);
    });

    shopItems.appendChild(categoriesSection);

    // Get filtered items
    const filteredItems = getItemsByCategory(gameState.shopMeta.activeCategory);

    // Add items display
    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'shop-grid';

    if (filteredItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-shop-message';
        emptyMessage.textContent = 'No items available in this category. Keep digging to unlock more!';
        itemsGrid.appendChild(emptyMessage);
    } else {
        // Display items
        filteredItems.forEach((item) => {
            const itemElement = createShopItemElement(item);
            itemsGrid.appendChild(itemElement);
        });
    }

    shopItems.appendChild(itemsGrid);
}

/**
 * Create a shop item element
 * @param {Object} item - The item to display
 * @returns {HTMLElement} - The created element
 */
function createShopItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'shop-grid-item';

    // Calculate the number of times this item has been purchased
    const purchaseCount = gameState.shopMeta.purchasedItems[item.id] || 0;
    const remainingPurchases = item.maxLevel - purchaseCount;

    // Item icon
    const itemIconWrapper = document.createElement('div');
    itemIconWrapper.className = 'item-icon-wrapper';

    const itemIcon = document.createElement('span');
    itemIcon.className = 'item-icon';
    itemIcon.textContent = item.emoji;
    itemIconWrapper.appendChild(itemIcon);

    // If it's an upgradeable item with multiple levels, show the level
    if (item.maxLevel < Infinity && purchaseCount > 0) {
        const levelBadge = document.createElement('span');
        levelBadge.className = 'level-badge';
        levelBadge.textContent = `Lvl ${purchaseCount}`;
        itemIconWrapper.appendChild(levelBadge);
    }

    itemElement.appendChild(itemIconWrapper);

    // Item details
    const itemInfo = document.createElement('div');
    itemInfo.className = 'item-info';

    const itemName = document.createElement('div');
    itemName.className = 'item-name';
    itemName.textContent = item.name;
    itemInfo.appendChild(itemName);

    const itemDesc = document.createElement('div');
    itemDesc.className = 'item-description';
    itemDesc.textContent = item.description;
    itemInfo.appendChild(itemDesc);

    // Show remaining purchases for upgradeable items
    if (item.maxLevel < Infinity) {
        const remainingText = document.createElement('div');
        remainingText.className = 'remaining-purchases';
        remainingText.textContent = `${remainingPurchases} upgrade${remainingPurchases !== 1 ? 's' : ''} available`;
        itemInfo.appendChild(remainingText);
    }

    itemElement.appendChild(itemInfo);

    // Purchase button
    const costContainer = document.createElement('div');
    costContainer.className = 'item-cost-container';

    const costDisplay = document.createElement('div');
    costDisplay.className = 'item-cost';
    costDisplay.innerHTML = `<span class="cost-icon">💎</span> <span class="cost-value">${item.cost}</span>`;
    costContainer.appendChild(costDisplay);

    const purchaseButton = document.createElement('button');
    purchaseButton.className = 'purchase-button';
    purchaseButton.textContent = 'Buy';
    purchaseButton.disabled = gameState.resources.gems < item.cost;

    if (purchaseButton.disabled) {
        purchaseButton.classList.add('disabled');
        purchaseButton.title = "Not enough gems";
    }

    purchaseButton.addEventListener('click', () => {
        if (gameState.resources.gems >= item.cost) {
            purchaseItem(item);
        } else {
            window.uiModule.showNotification("Not enough gems to buy this item!");
        }
    });

    costContainer.appendChild(purchaseButton);
    itemElement.appendChild(costContainer);

    return itemElement;
}

/**
 * Purchase an item from the shop
 * @param {Object} item - The item to purchase
 */
function purchaseItem(item) {
    // Create confirmation modal
    showPurchaseConfirmation(item, () => {
        // Deduct the cost
        gameState.resources.gems -= item.cost;

        // Track the purchase
        if (!gameState.shopMeta.purchasedItems[item.id]) {
            gameState.shopMeta.purchasedItems[item.id] = 0;
        }
        gameState.shopMeta.purchasedItems[item.id]++;

        // Apply the item effect
        const message = item.effect(gameState);

        // Update displays
        window.resourcesModule.updateResourceDisplay();
        updateShopDisplay();

        // Show notification
        window.uiModule.showNotification(message);
    });
}

/**
 * Show purchase confirmation modal
 * @param {Object} item - The item being purchased
 * @param {Function} confirmCallback - Function to call if purchase is confirmed
 */
function showPurchaseConfirmation(item, confirmCallback) {
    // Create or get the confirmation modal
    let confirmationModal = document.getElementById('confirmation-modal');
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'confirmation-modal';
        confirmationModal.className = 'modal';
        document.querySelector('.game-container').appendChild(confirmationModal);
    }

    // Create modal content
    confirmationModal.innerHTML = `
        <div class="modal-content confirmation-content">
            <div class="modal-header">
                <h2>Confirm Purchase</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="confirmation-message">
                    <p>Are you sure you want to buy <strong>${item.name}</strong> for <strong>${item.cost} 💎</strong>?</p>
                    <p class="confirmation-description">${item.description}</p>
                </div>
                <div class="confirmation-buttons">
                    <button id="confirm-purchase" class="confirmation-button confirm">Buy</button>
                    <button id="cancel-purchase" class="confirmation-button cancel">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Show the modal
    confirmationModal.style.display = 'flex';

    // Set up event listeners
    confirmationModal.querySelector('.close-button').addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    confirmationModal.querySelector('#cancel-purchase').addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    confirmationModal.querySelector('#confirm-purchase').addEventListener('click', () => {
        confirmCallback();
        confirmationModal.style.display = 'none';
    });

    // Click outside to close
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
}

export {
    initShop,
    openShopModal,
    updateShopDisplay,
    purchaseItem
};
