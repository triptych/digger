/**
 * Digger Game - Core JavaScript
 * Mobile-first cozy mining game
 */

// Game state
const gameState = {
    resources: {
        gems: 0,
        stone: 0,
        dirt: 0,
        ore: 0
    },
    currentDepth: 1,
    inventory: [],
    gridSize: 5, // 5x5 grid
    cells: [], // Will hold cell data
    tool: {
        power: 1, // Base digging power
        level: 1  // Tool level
    },
    // Define special items and their properties
    specialItems: {
        magnet: {
            emoji: "🧲",
            name: "Magnet",
            color: "#cc5500",
            description: "Attracts nearby gems when digging",
            rarity: 0.8
        },
        bomb: {
            emoji: "💣",
            name: "Mining Bomb",
            color: "#333333",
            description: "Breaks surrounding rocks when used",
            rarity: 0.85
        },
        compass: {
            emoji: "🧭",
            name: "Gem Compass",
            color: "#5f4b8b",
            description: "Points to nearby gems",
            rarity: 0.9
        },
        pickaxe: {
            emoji: "⛏️",
            name: "Lucky Pickaxe",
            color: "#ffd700",
            description: "Temporarily increases gem find chance",
            rarity: 0.95
        },
        chest: {
            emoji: "🧰",
            name: "Treasure Chest",
            color: "#8b4513",
            description: "Contains multiple resources",
            rarity: 0.75
        }
    },
    // Define resource types and their properties
    resourceTypes: {
        stone: {
            emoji: "🪨",
            color: "#8b7355",
            value: 1,
            weight: 1
        },
        dirt: {
            emoji: "🟤",
            color: "#6b4226",
            value: 1,
            weight: 1.5
        },
        ore: {
            emoji: "🧱",
            color: "#a17168",
            value: 3,
            weight: 1.2
        }
    },
    // Define gem types and their properties
    gemTypes: {
        blue: {
            emoji: "💎",
            color: "var(--color-gem-blue)",
            value: 10,
            rarity: 0.5 // relative rarity (higher = more rare)
        },
        purple: {
            emoji: "💜",
            color: "var(--color-gem-purple)",
            value: 15,
            rarity: 0.7
        },
        green: {
            emoji: "💚",
            color: "var(--color-gem-green)",
            value: 12,
            rarity: 0.6
        },
        red: {
            emoji: "❤️",
            color: "var(--color-gem-red)",
            value: 20,
            rarity: 0.8
        }
    }
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
    // Set tooltip titles for game control buttons
    inventoryButton.setAttribute('title', 'Open your inventory to see collected resources and items');
    shopButton.setAttribute('title', 'Visit the shop to purchase upgrades and special items');
    digDeeperButton.setAttribute('title', 'Dig deeper to the next level after clearing current layer');

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
        // Trigger digging deeper animation
        triggerDigDeeperAnimation();

        // After animation, create new level
        setTimeout(() => {
            gameState.currentDepth++;
            generateGrid();

            // Apply difficulty scaling
            applyDifficultyScaling();

            showNotification(`Digging deeper to level ${gameState.currentDepth}! 🔽`);

            // Disable dig deeper button until new level is completed
            digDeeperButton.disabled = true;
            digDeeperButton.classList.remove('dig-deeper-ready');
        }, 1000);
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

    // Determine cell content
    const cellContent = determineResourceForCell(index);

    // Create cell element with larger touch target area
    const cellElement = document.createElement('div');
    cellElement.className = 'grid-cell';
    cellElement.setAttribute('data-index', index);

    // Cell data
    const cellData = {
        index,
        hardness,
        durability: hardness, // Current health of cell
        content: cellContent,
        element: cellElement,
        broken: false
    };

    // Add touch/click event listeners
    cellElement.addEventListener('click', () => digCell(cellData));
    cellElement.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        digCell(cellData);
    });

    return cellData;
}

/**
 * Determine what resource should be in a cell
 * @param {number} index - Cell index
 * @returns {Object} Resource information
 */
function determineResourceForCell(index) {
    // Base probabilities adjusted for depth
    const depth = gameState.currentDepth;

    // Calculate gem probability (increases with depth)
    const gemProbability = 0.05 + (depth * 0.02);

    // Calculate special item probability (rare, increases very slightly with depth)
    const specialItemProbability = 0.01 + (depth * 0.005);

    // Determine cell content
    if (Math.random() < specialItemProbability) {
        // This cell will have a special item
        return selectRandomSpecialItem();
    } else if (Math.random() < gemProbability) {
        // This cell will have a gem, determine which type
        return selectRandomGem();
    } else {
        // This cell will have a regular resource
        return selectRandomResource();
    }
}

/**
 * Select a random special item based on rarity
 * @returns {Object} Selected special item
 */
function selectRandomSpecialItem() {
    const specialItems = Object.keys(gameState.specialItems);

    // Total up the inverse rarity values to create weighted probabilities
    // (lower rarity value = more common)
    let totalWeight = 0;
    const weights = [];

    for (const itemType of specialItems) {
        const inverseRarity = 1 / gameState.specialItems[itemType].rarity;
        weights.push(inverseRarity);
        totalWeight += inverseRarity;
    }

    // Select a special item type using weighted probability
    let random = Math.random() * totalWeight;
    for (let i = 0; i < specialItems.length; i++) {
        if (random < weights[i]) {
            return {
                type: 'special',
                variant: specialItems[i],
                ...gameState.specialItems[specialItems[i]]
            };
        }
        random -= weights[i];
    }

    // Fallback (should rarely happen)
    return {
        type: 'special',
        variant: 'chest',
        ...gameState.specialItems.chest
    };
}

/**
 * Select a random gem type based on rarity
 * @returns {Object} Selected gem type
 */
function selectRandomGem() {
    const gemTypes = Object.keys(gameState.gemTypes);

    // Total up the inverse rarity values to create weighted probabilities
    // (lower rarity value = more common)
    let totalWeight = 0;
    const weights = [];

    for (const gemType of gemTypes) {
        const inverseRarity = 1 / gameState.gemTypes[gemType].rarity;
        weights.push(inverseRarity);
        totalWeight += inverseRarity;
    }

    // Select a gem type using weighted probability
    let random = Math.random() * totalWeight;
    for (let i = 0; i < gemTypes.length; i++) {
        if (random < weights[i]) {
            return {
                type: 'gem',
                variant: gemTypes[i],
                ...gameState.gemTypes[gemTypes[i]]
            };
        }
        random -= weights[i];
    }

    // Fallback (should rarely happen)
    return {
        type: 'gem',
        variant: 'blue',
        ...gameState.gemTypes.blue
    };
}

/**
 * Select a random resource based on depth and weights
 * @returns {Object} Selected resource
 */
function selectRandomResource() {
    const depth = gameState.currentDepth;
    const resourceTypes = Object.keys(gameState.resourceTypes);

    // Adjust probabilities based on depth
    // More valuable resources become more common as depth increases
    const weights = [];
    let totalWeight = 0;

    // Basic distribution - stone is most common, then dirt, ore increases with depth
    if (depth < 3) {
        weights.push(0.7); // stone
        weights.push(0.25); // dirt
        weights.push(0.05 * depth); // ore (increases with depth)
    } else if (depth < 6) {
        weights.push(0.5); // stone
        weights.push(0.3); // dirt
        weights.push(0.2 * (depth / 3)); // ore (increases with depth)
    } else {
        weights.push(0.4); // stone
        weights.push(0.3); // dirt
        weights.push(0.3); // ore
    }

    totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    // Normalize weights
    for (let i = 0; i < weights.length; i++) {
        weights[i] = weights[i] / totalWeight;
    }

    // Select a resource type using weighted probability
    let random = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < resourceTypes.length; i++) {
        cumulativeWeight += weights[i];
        if (random <= cumulativeWeight) {
            return {
                type: 'resource',
                variant: resourceTypes[i],
                ...gameState.resourceTypes[resourceTypes[i]]
            };
        }
    }

    // Fallback (should rarely happen)
    return {
        type: 'resource',
        variant: 'stone',
        ...gameState.resourceTypes.stone
    };
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
        cell.element.innerHTML = '╱';
    }
    if (progress > 0.5) {
        cell.element.innerHTML = '╳';
    }
    if (progress > 0.75) {
        cell.element.innerHTML = '╳╳';
    }

    // Add ripple effect at click position
    addRippleEffect(cell.element);

    // Add animation class
    cell.element.classList.add('dig-animation');

    // Remove animation class after animation completes
    setTimeout(() => {
        cell.element.classList.remove('dig-animation');
    }, 300);
}

/**
 * Create a ripple effect at the click position
 * @param {HTMLElement} element - The element to add the ripple to
 */
function addRippleEffect(element) {
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    element.appendChild(ripple);

    // Set initial size and position
    const size = Math.max(element.offsetWidth, element.offsetHeight);
    ripple.style.width = ripple.style.height = `${size}px`;

    // Center the ripple by default if no event coordinates
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';

    // Trigger ripple animation
    setTimeout(() => {
        ripple.style.transform = 'translate(-50%, -50%) scale(1)';
        ripple.style.opacity = '0';
    }, 10);

    // Remove the ripple element after animation completes
    setTimeout(() => {
        ripple.remove();
    }, 600);
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
    cell.element.innerHTML = '';

    // Create particle effects
    createBreakParticles(cell.element);

    // Process the cell's content
    processResourceReveal(cell);

    // Update UI
    updateResourceDisplay();

    // Check if all cells are broken to enable "Dig Deeper" button
    checkLayerCompletion();
}

/**
 * Process the resource revealed when breaking a cell
 * @param {Object} cell - Cell data
 */
function processResourceReveal(cell) {
    // Extract content information
    const content = cell.content;

    // Create reveal element
    const revealElement = document.createElement('span');
    revealElement.textContent = content.emoji;

    if (content.type === 'gem') {
        // It's a gem
        revealElement.classList.add('gem-reveal');
        revealElement.style.color = content.color;

        // Add to resources
        gameState.resources.gems++;

        // Show notification
        showNotification(`Found a ${content.variant} gem! ${content.emoji}`);

        // Add special effect for gems
        addGlowEffect(cell.element, content.color);
    } else if (content.type === 'special') {
        // It's a special item
        revealElement.classList.add('special-item-reveal');
        revealElement.style.color = content.color;

        // Add to inventory
        gameState.inventory.push({
            type: 'special',
            variant: content.variant,
            ...content
        });

        // Show notification with rarity sparkles
        showNotification(`✨ Found a rare ${content.name}! ${content.emoji} ✨`);

        // Add special effect for special items (more pronounced than gems)
        addSpecialItemEffect(cell.element, content);
    } else {
        // It's a regular resource
        revealElement.classList.add('resource-reveal');

        // Add to resources
        gameState.resources[content.variant]++;

        // Show notification for rarer resources
        if (content.variant !== 'stone') {
            showNotification(`Found ${content.emoji} ${content.variant}!`);
        }
    }

    // Add the reveal element to the cell
    cell.element.appendChild(revealElement);
}

/**
 * Add special visual effects for special item discovery
 * @param {HTMLElement} element - The cell element
 * @param {Object} item - The special item data
 */
function addSpecialItemEffect(element, item) {
    // Create glowing pulse effect
    addGlowEffect(element, item.color);

    // Create sparkles around the cell
    createSparkles(element);

    // Add subtle shake to surrounding cells
    const index = parseInt(element.getAttribute('data-index'));
    const gridSize = gameState.gridSize;

    // Calculate surrounding cell indices
    const surroundingIndices = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    // Check all 8 surrounding cells
    for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, gridSize - 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, gridSize - 1); c++) {
            const neighborIndex = r * gridSize + c;
            if (neighborIndex !== index) {
                surroundingIndices.push(neighborIndex);
            }
        }
    }

    // Apply effect to surrounding cells
    surroundingIndices.forEach(idx => {
        const cell = document.querySelector(`.grid-cell[data-index="${idx}"]`);
        if (cell) {
            cell.classList.add('special-neighbor-pulse');
            setTimeout(() => {
                cell.classList.remove('special-neighbor-pulse');
            }, 1000);
        }
    });
}

/**
 * Create sparkle effects when discovering a special item
 * @param {HTMLElement} element - The cell element
 */
function createSparkles(element) {
    // Create container for sparkles
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    element.appendChild(sparkleContainer);

    // Create multiple sparkles
    const numSparkles = 15;
    const sparkleCharacters = ['✨', '⭐', '🌟', '💫', '⚡'];

    for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        // Random sparkle character
        sparkle.textContent = sparkleCharacters[Math.floor(Math.random() * sparkleCharacters.length)];

        // Random position around the cell
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 60;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        sparkle.style.transform = `translate(${x}px, ${y}px) scale(${0.5 + Math.random() * 0.5})`;
        sparkle.style.opacity = 0;

        // Add to container
        sparkleContainer.appendChild(sparkle);

        // Animate the sparkle
        setTimeout(() => {
            sparkle.style.opacity = 1;

            setTimeout(() => {
                sparkle.style.opacity = 0;
            }, 500 + Math.random() * 1000);
        }, Math.random() * 500);
    }

    // Remove sparkles after animation completes
    setTimeout(() => {
        sparkleContainer.remove();
    }, 2000);
}

/**
 * Add a glow effect to an element
 * @param {HTMLElement} element - The element to add the glow to
 * @param {string} color - The color of the glow
 */
function addGlowEffect(element, color) {
    // Create glow overlay
    const glow = document.createElement('div');
    glow.className = 'glow-effect';
    glow.style.boxShadow = `0 0 20px 5px ${color}`;
    element.appendChild(glow);

    // Animate and remove after effect completes
    setTimeout(() => {
        glow.remove();
    }, 3000);
}

/**
 * Create particle effects when breaking a cell
 * @param {HTMLElement} element - The cell element
 */
function createBreakParticles(element) {
    // Create container for particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'cell-particles';
    element.appendChild(particleContainer);

    // Create multiple particles
    const numParticles = 10 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random position within the cell
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random movement direction
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;

        // Set initial position
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;

        // Add to container
        particleContainer.appendChild(particle);

        // Animate the particle
        animateParticle(particle, dx, dy);
    }

    // Remove particles after animation completes
    setTimeout(() => {
        particleContainer.remove();
    }, 1000);
}

/**
 * Animate a single particle
 * @param {HTMLElement} particle - The particle element
 * @param {number} dx - X-axis velocity
 * @param {number} dy - Y-axis velocity
 */
function animateParticle(particle, dx, dy) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);
    let opacity = 1;
    let scale = 1;

    function frame() {
        if (opacity <= 0) {
            return;
        }

        // Update position
        x += dx;
        y += dy;

        // Apply gravity
        dy += 0.2;

        // Reduce opacity and scale
        opacity -= 0.05;
        scale -= 0.02;

        // Apply updates
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.opacity = opacity;
        particle.style.transform = `scale(${scale})`;

        // Continue animation
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

/**
 * Check if current layer is completed
 */
function checkLayerCompletion() {
    const allBroken = gameState.cells.every(cell => cell.broken);

    // Enable/disable dig deeper button based on completion
    digDeeperButton.disabled = !allBroken;

    if (allBroken) {
        digDeeperButton.classList.add('dig-deeper-ready');
        showNotification(`Layer ${gameState.currentDepth} completed! Dig deeper for more treasures! 🔽`);

        // Calculate rewards for completing the layer
        giveLayerCompletionRewards();
    } else {
        digDeeperButton.classList.remove('dig-deeper-ready');
    }
}

/**
 * Calculate and give rewards for completing a layer
 */
function giveLayerCompletionRewards() {
    // Base reward based on depth
    const depthBonus = gameState.currentDepth * 2;

    // Bonus resources as rewards
    const stoneReward = Math.floor(5 + (depthBonus * 0.5));
    const gemReward = Math.floor(1 + (depthBonus * 0.1));

    // Add rewards to resources
    gameState.resources.stone += stoneReward;
    gameState.resources.gems += gemReward;

    // Update UI
    updateResourceDisplay();

    // Show reward notification
    showNotification(`Layer ${gameState.currentDepth} Bonus: +${stoneReward} 🪨 and +${gemReward} 💎!`);
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

    // Dirt - always show dirt in inventory to match header display
    const dirtItem = document.createElement('div');
    dirtItem.className = 'inventory-item';
    dirtItem.innerHTML = `<span class="item-icon">🟤</span> Dirt: ${gameState.resources.dirt}`;
    resourcesList.appendChild(dirtItem);

    // Ore - always show ore in inventory to match header display
    const oreItem = document.createElement('div');
    oreItem.className = 'inventory-item';
    oreItem.innerHTML = `<span class="item-icon">🧱</span> Ore: ${gameState.resources.ore}`;
    resourcesList.appendChild(oreItem);

    resourcesSection.appendChild(resourcesList);
    inventoryItems.appendChild(resourcesSection);

    // Add special items section
    const itemsSection = document.createElement('div');
    itemsSection.className = 'inventory-section';

    const itemsTitle = document.createElement('h3');
    itemsTitle.textContent = 'Special Items';
    itemsSection.appendChild(itemsTitle);

    const itemsList = document.createElement('div');
    itemsList.className = 'items-list';

    if (gameState.inventory.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No special items yet. Keep digging to discover rare items!';
        itemsList.appendChild(emptyMessage);
    } else {
        // Display special items from inventory
        gameState.inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item special-inventory-item';
            itemElement.innerHTML = `
                <span class="item-icon" style="color: ${item.color}">${item.emoji}</span>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                </div>
            `;

            // Add item use functionality
            itemElement.addEventListener('click', () => {
                showNotification(`Item use coming soon: ${item.name}`);
                // Future implementation: useSpecialItem(item, index);
            });

            itemsList.appendChild(itemElement);
        });
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
    // Update counter text
    gemsCounter.textContent = `💎 ${gameState.resources.gems}`;
    stoneCounter.textContent = `🪨 ${gameState.resources.stone}`;

    // Set tooltip titles for better usability
    gemsCounter.setAttribute('title', 'Gems');
    stoneCounter.setAttribute('title', 'Stone');

    // Update other resources if their displays exist
    const dirtCounter = document.getElementById('dirt-counter');
    const oreCounter = document.getElementById('ore-counter');

    if (dirtCounter) {
        dirtCounter.textContent = `🟤 ${gameState.resources.dirt}`;
        dirtCounter.setAttribute('title', 'Dirt');
    }

    if (oreCounter) {
        oreCounter.textContent = `🧱 ${gameState.resources.ore}`;
        oreCounter.setAttribute('title', 'Ore');
    }
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
 * Apply difficulty scaling based on current depth
 */
function applyDifficultyScaling() {
    // Increase minimum hardness as depth increases
    gameState.minHardness = Math.max(1, Math.floor(gameState.currentDepth / 2));

    // Increase maximum hardness as depth increases
    gameState.maxHardnessBonus = Math.min(10, Math.floor(gameState.currentDepth / 1.5));

    // Change resource distribution based on depth
    // (This is already implemented in selectRandomResource)
}

/**
 * Trigger dig deeper animation
 */
function triggerDigDeeperAnimation() {
    // Create overlay for transition
    const overlay = document.createElement('div');
    overlay.className = 'dig-deeper-overlay';
    document.body.appendChild(overlay);

    // Add animation
    setTimeout(() => {
        overlay.classList.add('active');

        // Show depth indicator
        const depthIndicator = document.createElement('div');
        depthIndicator.className = 'depth-indicator';
        depthIndicator.textContent = `Depth: ${gameState.currentDepth + 1}`;
        overlay.appendChild(depthIndicator);

        // Remove overlay after animation completes
        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 500);
        }, 800);
    }, 100);
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Add CSS for animations and effects
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
