/**
 * Resources Module
 * Handles resource generation and management
 */

import { gameState } from './gameState.js';

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
 * Update resource display in the UI
 */
function updateResourceDisplay() {
    // Get DOM elements
    const gemsCounter = document.getElementById('gems-counter');
    const stoneCounter = document.getElementById('stone-counter');

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

    // Also add to inventory
    const { addToInventory } = window.inventoryModule;

    if (stoneReward > 0) {
        addToInventory(gameState, {
            type: 'resource',
            variant: 'stone',
            name: 'Stone',
            emoji: gameState.resourceTypes.stone.emoji,
            description: 'Bonus stone from completing the layer.',
            value: gameState.resourceTypes.stone.value,
            color: gameState.resourceTypes.stone.color,
            stackable: true,
            quantity: stoneReward
        });
    }

    if (gemReward > 0) {
        addToInventory(gameState, {
            type: 'gem',
            variant: 'blue',
            name: 'Blue Gem',
            emoji: gameState.gemTypes.blue.emoji,
            description: 'Bonus gem from completing the layer.',
            value: gameState.gemTypes.blue.value,
            color: gameState.gemTypes.blue.color,
            stackable: true,
            quantity: gemReward
        });
    }

    // Update UI
    updateResourceDisplay();

    // Show reward notification using utility function from UI module
    window.uiModule.showNotification(`Layer ${gameState.currentDepth} Bonus: +${stoneReward} 🪨 and +${gemReward} 💎!`);
}

export {
    determineResourceForCell,
    updateResourceDisplay,
    giveLayerCompletionRewards
};
