// Space Armada - Input Controls Module
// Extracted from index.html for modularization
// Contains keyboard, mouse, and touch input handling

// ============================================================
// INPUT STATE
// ============================================================

/**
 * Tracks currently pressed keys
 * Key: KeyboardEvent.code (e.g., 'KeyW', 'Space', 'ShiftLeft')
 * Value: boolean (true if pressed)
 */
export const keys = {};

/**
 * Mouse position in screen coordinates
 */
export let mouseX = 0;
export let mouseY = 0;

/**
 * Mouse position in world coordinates
 * Updated when mouse moves, based on camera position
 */
export let mouseWorldX = 0;
export let mouseWorldY = 0;

/**
 * Shipyard preview drag state
 */
export let isShipyardDragging = false;
export let shipyardDragStartX = 0;
export let shipyardPreviewRotation = 0;

// ============================================================
// KEY BINDINGS CONFIGURATION
// ============================================================

/**
 * Key binding configuration for game controls
 * Maps action names to key codes for easy rebinding
 */
export const KEY_BINDINGS = {
    // Movement
    moveUp: ['KeyW', 'ArrowUp'],
    moveDown: ['KeyS', 'ArrowDown'],
    moveLeft: ['KeyA', 'ArrowLeft'],
    moveRight: ['KeyD', 'ArrowRight'],
    boost: ['ShiftLeft', 'ShiftRight'],

    // Combat
    firePrimary: ['Space'],
    fireMissile: ['KeyF'],
    targetNearest: ['KeyT'],

    // Weapons selection
    weapon1: ['Digit1'],
    weapon2: ['Digit2'],
    weapon3: ['Digit3'],
    weapon4: ['Digit4'],

    // UI
    toggleUpgrades: ['Tab'],
    toggleMissions: ['KeyM'],
    hailShip: ['KeyH'],
    closeMenu: ['Escape']
};

/**
 * Check if a specific action's key is currently pressed
 * @param {string} action - Action name from KEY_BINDINGS
 * @returns {boolean} True if any key for this action is pressed
 */
export function isActionPressed(action) {
    const bindings = KEY_BINDINGS[action];
    if (!bindings) return false;
    return bindings.some(key => keys[key]);
}

/**
 * Check if a specific key code is pressed
 * @param {string} keyCode - KeyboardEvent.code value
 * @returns {boolean}
 */
export function isKeyPressed(keyCode) {
    return keys[keyCode] === true;
}

// ============================================================
// STATE SETTERS (for controlled mutation)
// ============================================================

/**
 * Set mouse screen position
 * @param {number} x - Screen X coordinate
 * @param {number} y - Screen Y coordinate
 */
export function setMousePosition(x, y) {
    mouseX = x;
    mouseY = y;
}

/**
 * Set mouse world position
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 */
export function setMouseWorldPosition(x, y) {
    mouseWorldX = x;
    mouseWorldY = y;
}

/**
 * Set shipyard dragging state
 * @param {boolean} dragging
 */
export function setShipyardDragging(dragging) {
    isShipyardDragging = dragging;
}

/**
 * Set shipyard drag start X position
 * @param {number} x
 */
export function setShipyardDragStartX(x) {
    shipyardDragStartX = x;
}

/**
 * Set shipyard preview rotation
 * @param {number} rotation
 */
export function setShipyardPreviewRotation(rotation) {
    shipyardPreviewRotation = rotation;
}

/**
 * Add to shipyard preview rotation
 * @param {number} delta - Amount to add to rotation
 */
export function addShipyardPreviewRotation(delta) {
    shipyardPreviewRotation += delta;
}

// ============================================================
// EVENT LISTENER SETUP
// ============================================================

/**
 * Set up keyboard event listeners
 * @param {object} handlers - Object with handler functions
 * @param {function} handlers.onKeyDown - Called on keydown with event
 * @param {function} [handlers.onKeyUp] - Called on keyup with event
 */
export function setupKeyboardListeners(handlers = {}) {
    document.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (handlers.onKeyDown) {
            handlers.onKeyDown(e);
        }
    });

    document.addEventListener('keyup', e => {
        keys[e.code] = false;
        if (handlers.onKeyUp) {
            handlers.onKeyUp(e);
        }
    });
}

/**
 * Set up mouse event listeners
 * @param {object} handlers - Object with handler functions
 * @param {function} handlers.onMouseMove - Called on mousemove with (x, y)
 * @param {function} handlers.onMouseDown - Called on mousedown with event
 * @param {function} [handlers.onMouseUp] - Called on mouseup with event
 */
export function setupMouseListeners(handlers = {}) {
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (handlers.onMouseMove) {
            handlers.onMouseMove(e.clientX, e.clientY, e);
        }
    });

    document.addEventListener('mousedown', e => {
        if (handlers.onMouseDown) {
            handlers.onMouseDown(e);
        }
    });

    document.addEventListener('mouseup', e => {
        if (handlers.onMouseUp) {
            handlers.onMouseUp(e);
        }
    });
}

/**
 * Set up drag controls for a canvas element (e.g., shipyard preview)
 * @param {HTMLCanvasElement} canvas - Canvas element to attach listeners to
 * @param {object} handlers - Object with handler functions
 * @param {function} handlers.onDragStart - Called when drag starts with x position
 * @param {function} handlers.onDrag - Called during drag with deltaX
 * @param {function} handlers.onDragEnd - Called when drag ends
 */
export function setupDragControls(canvas, handlers = {}) {
    if (!canvas) return;

    // Mouse drag
    canvas.addEventListener('mousedown', (e) => {
        isShipyardDragging = true;
        shipyardDragStartX = e.clientX;
        if (handlers.onDragStart) {
            handlers.onDragStart(e.clientX);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isShipyardDragging) {
            const deltaX = e.clientX - shipyardDragStartX;
            shipyardDragStartX = e.clientX;
            if (handlers.onDrag) {
                handlers.onDrag(deltaX);
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        isShipyardDragging = false;
        if (handlers.onDragEnd) {
            handlers.onDragEnd();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isShipyardDragging = false;
        if (handlers.onDragEnd) {
            handlers.onDragEnd();
        }
    });

    // Touch drag
    canvas.addEventListener('touchstart', (e) => {
        isShipyardDragging = true;
        shipyardDragStartX = e.touches[0].clientX;
        if (handlers.onDragStart) {
            handlers.onDragStart(e.touches[0].clientX);
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (isShipyardDragging) {
            const deltaX = e.touches[0].clientX - shipyardDragStartX;
            shipyardDragStartX = e.touches[0].clientX;
            if (handlers.onDrag) {
                handlers.onDrag(deltaX);
            }
        }
    });

    canvas.addEventListener('touchend', () => {
        isShipyardDragging = false;
        if (handlers.onDragEnd) {
            handlers.onDragEnd();
        }
    });
}

/**
 * Set up window resize listener
 * @param {function} handler - Called on window resize
 */
export function setupResizeListener(handler) {
    window.addEventListener('resize', handler);
}

// ============================================================
// MOVEMENT INPUT PROCESSING
// ============================================================

/**
 * Get movement direction from currently pressed keys
 * Returns normalized direction vector for WASD/arrow key input
 * @returns {{x: number, y: number, isMoving: boolean}}
 */
export function getMovementInput() {
    let moveX = 0;
    let moveY = 0;
    let isMoving = false;

    if (isActionPressed('moveUp')) {
        moveY = -1;
        isMoving = true;
    }
    if (isActionPressed('moveDown')) {
        moveY = 1;
        isMoving = true;
    }
    if (isActionPressed('moveLeft')) {
        moveX = -1;
        isMoving = true;
    }
    if (isActionPressed('moveRight')) {
        moveX = 1;
        isMoving = true;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= len;
        moveY /= len;
    }

    return { x: moveX, y: moveY, isMoving };
}

/**
 * Check if boost key is pressed
 * @returns {boolean}
 */
export function isBoostPressed() {
    return isActionPressed('boost');
}

/**
 * Check if primary fire key is pressed
 * @returns {boolean}
 */
export function isPrimaryFirePressed() {
    return isActionPressed('firePrimary');
}

// ============================================================
// MOUSE WORLD COORDINATE CONVERSION
// ============================================================

/**
 * Convert mouse screen coordinates to world coordinates
 * Call this after mouse moves or camera updates
 * @param {object} params - Parameters for conversion
 * @param {DOMRect} params.canvasRect - Canvas bounding rect
 * @param {number} params.playerX - Player X position in world
 * @param {number} params.playerY - Player Y position in world
 * @param {number} params.viewSize - Camera view size (default 450)
 * @param {number} params.aspect - Aspect ratio (width/height)
 */
export function updateMouseWorldCoordinates({ canvasRect, playerX, playerY, viewSize = 450, aspect }) {
    const ndcX = ((mouseX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const ndcY = -((mouseY - canvasRect.top) / canvasRect.height) * 2 + 1;

    mouseWorldX = playerX + ndcX * viewSize * aspect;
    mouseWorldY = playerY - ndcY * viewSize;
}

/**
 * Get angle from player position to mouse world position
 * @param {number} playerX - Player X position
 * @param {number} playerY - Player Y position
 * @returns {number} Angle in radians
 */
export function getAngleToMouse(playerX, playerY) {
    return Math.atan2(
        mouseWorldY - playerY,
        mouseWorldX - playerX
    );
}

// ============================================================
// INPUT STATE RESET
// ============================================================

/**
 * Clear all pressed keys
 * Call this when game loses focus or state resets
 */
export function clearAllKeys() {
    for (const key in keys) {
        delete keys[key];
    }
}

/**
 * Reset all input state to defaults
 */
export function resetInputState() {
    clearAllKeys();
    mouseX = 0;
    mouseY = 0;
    mouseWorldX = 0;
    mouseWorldY = 0;
    isShipyardDragging = false;
    shipyardDragStartX = 0;
    shipyardPreviewRotation = 0;
}
