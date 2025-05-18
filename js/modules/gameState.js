/**
 * Game State Module
 * Manages the central game state and configuration
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
    // Track game statistics
    stats: {
        blocksMined: 0,
        maxDepth: 1,
        totalResources: 0
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

/**
 * Get the game state or a specific property
 * @param {string} property - The property to get (optional)
 * @returns {*} - The game state or specified property
 */
function getState(property) {
    return property ? gameState[property] : gameState;
}

/**
 * Update a property in the game state
 * @param {string} property - The property to update
 * @param {*} value - The new value
 */
function updateState(property, value) {
    if (property && property in gameState) {
        gameState[property] = value;
    }
}

/**
 * Update game statistics
 * @param {string} stat - The statistic to update
 * @param {number} value - The value to add to the current stat
 */
function updateStats(stat, value = 1) {
    if (stat && stat in gameState.stats) {
        gameState.stats[stat] += value;
    }
}

/**
 * Track a block being mined
 */
function trackBlockMined() {
    updateStats('blocksMined');
}

/**
 * Track resources being collected
 * @param {number} amount - The number of resources collected
 */
function trackResourceCollected(amount = 1) {
    updateStats('totalResources', amount);
}

/**
 * Update the maximum depth reached
 * @param {number} depth - The current depth
 */
function updateMaxDepth(depth) {
    if (depth > gameState.stats.maxDepth) {
        gameState.stats.maxDepth = depth;
    }
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
    // (This is already implemented in resource selection)
}

export {
    gameState,
    getState,
    updateState,
    applyDifficultyScaling,
    updateStats,
    trackBlockMined,
    trackResourceCollected,
    updateMaxDepth
};
