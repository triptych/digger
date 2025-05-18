/**
 * Grid Module
 * Handles grid generation and cell functionality
 */

import { gameState } from './gameState.js';
import { determineResourceForCell } from './resources.js';

// Will be set by the init function
let diggingGrid = null;
let digDeeperButton = null;

/**
 * Initialize the grid module
 * @param {HTMLElement} gridElement - The grid container element
 * @param {HTMLElement} digDeeperButtonElement - The dig deeper button
 */
function initGrid(gridElement, digDeeperButtonElement) {
    diggingGrid = gridElement;
    digDeeperButton = digDeeperButtonElement;

    // Generate initial grid
    generateGrid();
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
    window.resourcesModule.updateResourceDisplay();

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

        // Also add to inventory using proper inventory function
        window.inventoryModule.addToInventory(gameState, {
            type: 'gem',
            variant: content.variant,
            name: `${capitalizeFirstLetter(content.variant)} Gem`,
            emoji: content.emoji,
            description: `A beautiful ${content.variant} gem found while mining.`,
            value: content.value,
            color: content.color,
            stackable: true,
            quantity: 1
        });

        // Show notification
        window.uiModule.showNotification(`Found a ${content.variant} gem! ${content.emoji}`);

        // Add special effect for gems
        addGlowEffect(cell.element, content.color);
    } else if (content.type === 'special') {
        // It's a special item
        revealElement.classList.add('special-item-reveal');
        revealElement.style.color = content.color;

        // Add to inventory using the proper addToInventory function from inventory.js
        window.inventoryModule.addToInventory(gameState, {
            type: 'special',
            variant: content.variant,
            stackable: false,
            ...content
        });

        // Show notification with rarity sparkles
        window.uiModule.showNotification(`✨ Found a rare ${content.name}! ${content.emoji} ✨`);

        // Add special effect for special items (more pronounced than gems)
        addSpecialItemEffect(cell.element, content);
    } else {
        // It's a regular resource
        revealElement.classList.add('resource-reveal');

        // Add to resources
        gameState.resources[content.variant]++;

        // Also add to inventory using proper inventory function
        window.inventoryModule.addToInventory(gameState, {
            type: 'resource',
            variant: content.variant,
            name: capitalizeFirstLetter(content.variant),
            emoji: content.emoji,
            description: `A piece of ${content.variant} collected from mining.`,
            value: content.value,
            color: content.color,
            stackable: true,
            quantity: 1
        });

        // Show notification for rarer resources
        if (content.variant !== 'stone') {
            window.uiModule.showNotification(`Found ${content.emoji} ${content.variant}!`);
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
        window.uiModule.showNotification(`Layer ${gameState.currentDepth} completed! Dig deeper for more treasures! 🔽`);

        // Calculate rewards for completing the layer
        window.resourcesModule.giveLayerCompletionRewards();
    } else {
        digDeeperButton.classList.remove('dig-deeper-ready');
    }
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

/**
 * Handle clicking the dig deeper button - move to next level
 */
function handleDigDeeper() {
    // Trigger digging deeper animation
    triggerDigDeeperAnimation();

    // After animation, create new level
    setTimeout(() => {
        gameState.currentDepth++;
        generateGrid();

        // Apply difficulty scaling
        window.gameStateModule.applyDifficultyScaling();

        window.uiModule.showNotification(`Digging deeper to level ${gameState.currentDepth}! 🔽`);

        // Disable dig deeper button until new level is completed
        digDeeperButton.disabled = true;
        digDeeperButton.classList.remove('dig-deeper-ready');
    }, 1000);
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
    initGrid,
    generateGrid,
    handleDigDeeper,
    triggerDigDeeperAnimation
};
