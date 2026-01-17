// Space Armada - Game Loop Module
// Extracted from index.html for modularization
// Contains main game loop, delta time utilities, and frame rate management

// ============================================================
// TIMING STATE
// ============================================================

/**
 * Last timestamp from requestAnimationFrame
 * Used for calculating delta time
 */
let lastTimestamp = 0;

/**
 * Accumulated time for fixed timestep updates
 */
let accumulator = 0;

/**
 * Main animation frame request ID
 * Used for canceling the loop
 */
let animationFrameId = null;

/**
 * Whether the loop is currently running
 */
let loopRunning = false;

// ============================================================
// TIMING CONSTANTS
// ============================================================

/**
 * Fixed timestep for physics/game updates (60 FPS)
 */
export const FIXED_TIMESTEP = 1 / 60;

/**
 * Maximum delta time to prevent spiral of death
 * If frame takes longer than this, we cap dt to avoid physics instability
 */
export const MAX_DELTA_TIME = 0.25;

/**
 * Target frame rate
 */
export const TARGET_FPS = 60;

/**
 * Frame time in milliseconds
 */
export const FRAME_TIME_MS = 1000 / TARGET_FPS;

// ============================================================
// DELTA TIME UTILITIES
// ============================================================

/**
 * Calculate delta time from timestamps
 * @param {number} currentTime - Current timestamp in milliseconds
 * @param {number} previousTime - Previous timestamp in milliseconds
 * @returns {number} Delta time in seconds, capped to MAX_DELTA_TIME
 */
export function calculateDeltaTime(currentTime, previousTime) {
    const dt = (currentTime - previousTime) / 1000;
    return Math.min(dt, MAX_DELTA_TIME);
}

/**
 * Get current time using performance.now()
 * @returns {number} Current time in milliseconds
 */
export function getCurrentTime() {
    return performance.now();
}

/**
 * Get current time in seconds
 * @returns {number} Current time in seconds
 */
export function getCurrentTimeSeconds() {
    return performance.now() / 1000;
}

// ============================================================
// FRAME RATE CONTROL
// ============================================================

/**
 * Frame timing statistics
 */
const frameStats = {
    frameCount: 0,
    totalTime: 0,
    minFrameTime: Infinity,
    maxFrameTime: 0,
    lastFpsUpdate: 0,
    currentFps: 0
};

/**
 * Update frame statistics
 * @param {number} deltaTime - Delta time for this frame in seconds
 */
export function updateFrameStats(deltaTime) {
    frameStats.frameCount++;
    frameStats.totalTime += deltaTime;
    frameStats.minFrameTime = Math.min(frameStats.minFrameTime, deltaTime);
    frameStats.maxFrameTime = Math.max(frameStats.maxFrameTime, deltaTime);

    // Update FPS every second
    const now = getCurrentTimeSeconds();
    if (now - frameStats.lastFpsUpdate >= 1.0) {
        frameStats.currentFps = frameStats.frameCount / (now - frameStats.lastFpsUpdate);
        frameStats.frameCount = 0;
        frameStats.lastFpsUpdate = now;
    }
}

/**
 * Get current FPS
 * @returns {number} Current frames per second
 */
export function getCurrentFps() {
    return frameStats.currentFps;
}

/**
 * Get average frame time
 * @returns {number} Average frame time in seconds
 */
export function getAverageFrameTime() {
    return frameStats.frameCount > 0
        ? frameStats.totalTime / frameStats.frameCount
        : 0;
}

/**
 * Reset frame statistics
 */
export function resetFrameStats() {
    frameStats.frameCount = 0;
    frameStats.totalTime = 0;
    frameStats.minFrameTime = Infinity;
    frameStats.maxFrameTime = 0;
    frameStats.lastFpsUpdate = getCurrentTimeSeconds();
    frameStats.currentFps = 0;
}

/**
 * Get all frame statistics
 * @returns {object} Frame statistics object
 */
export function getFrameStats() {
    return { ...frameStats };
}

// ============================================================
// UPDATE CALLBACKS
// ============================================================

/**
 * Registered update callbacks
 * These are called every frame when the game is running
 */
const updateCallbacks = {
    physics: [],      // Physics updates (fixed timestep)
    gameplay: [],     // Gameplay updates (player, enemies, projectiles)
    ui: [],           // UI updates (minimap, HUD)
    render: []        // Pre-render updates
};

/**
 * Register an update callback
 * @param {string} type - Callback type: 'physics', 'gameplay', 'ui', or 'render'
 * @param {function} callback - Function to call with (deltaTime) parameter
 * @param {number} [priority=0] - Higher priority callbacks run first
 */
export function registerUpdateCallback(type, callback, priority = 0) {
    if (!updateCallbacks[type]) {
        console.warn(`Unknown callback type: ${type}`);
        return;
    }
    updateCallbacks[type].push({ callback, priority });
    updateCallbacks[type].sort((a, b) => b.priority - a.priority);
}

/**
 * Unregister an update callback
 * @param {string} type - Callback type
 * @param {function} callback - Function to remove
 */
export function unregisterUpdateCallback(type, callback) {
    if (!updateCallbacks[type]) return;
    const index = updateCallbacks[type].findIndex(entry => entry.callback === callback);
    if (index !== -1) {
        updateCallbacks[type].splice(index, 1);
    }
}

/**
 * Run all callbacks of a specific type
 * @param {string} type - Callback type
 * @param {number} deltaTime - Delta time to pass to callbacks
 */
export function runCallbacks(type, deltaTime) {
    if (!updateCallbacks[type]) return;
    for (const entry of updateCallbacks[type]) {
        try {
            entry.callback(deltaTime);
        } catch (error) {
            console.error(`Error in ${type} callback:`, error);
        }
    }
}

/**
 * Clear all callbacks of a specific type
 * @param {string} [type] - Callback type, or undefined to clear all
 */
export function clearCallbacks(type) {
    if (type) {
        if (updateCallbacks[type]) {
            updateCallbacks[type] = [];
        }
    } else {
        Object.keys(updateCallbacks).forEach(key => {
            updateCallbacks[key] = [];
        });
    }
}

// ============================================================
// MAIN LOOP MANAGEMENT
// ============================================================

/**
 * Main loop configuration
 */
const loopConfig = {
    useFixedTimestep: false,  // Use fixed timestep for physics
    maxUpdatesPerFrame: 5,     // Prevent spiral of death
    onUpdate: null,            // Main update function
    onRender: null,            // Main render function
    isGameRunning: null        // Function to check if game is running
};

/**
 * Configure the main loop
 * @param {object} config - Configuration options
 * @param {function} [config.onUpdate] - Main update function (dt) => void
 * @param {function} [config.onRender] - Main render function () => void
 * @param {function} [config.isGameRunning] - Function returning boolean
 * @param {boolean} [config.useFixedTimestep] - Use fixed timestep updates
 */
export function configureLoop(config) {
    Object.assign(loopConfig, config);
}

/**
 * Internal animate function
 * This is the core loop that requestAnimationFrame calls
 * @param {number} timestamp - Current timestamp from RAF
 */
function animateInternal(timestamp) {
    if (!loopRunning) return;

    // Schedule next frame immediately
    animationFrameId = requestAnimationFrame(animateInternal);

    // Calculate delta time
    const dt = lastTimestamp === 0
        ? FIXED_TIMESTEP
        : calculateDeltaTime(timestamp, lastTimestamp);
    lastTimestamp = timestamp;

    // Update frame statistics
    updateFrameStats(dt);

    // Check if game is running
    const gameActive = loopConfig.isGameRunning
        ? loopConfig.isGameRunning()
        : true;

    if (gameActive) {
        if (loopConfig.useFixedTimestep) {
            // Fixed timestep with accumulator
            accumulator += dt;
            let updates = 0;

            while (accumulator >= FIXED_TIMESTEP && updates < loopConfig.maxUpdatesPerFrame) {
                // Run physics callbacks
                runCallbacks('physics', FIXED_TIMESTEP);

                // Run main update if provided
                if (loopConfig.onUpdate) {
                    loopConfig.onUpdate(FIXED_TIMESTEP);
                }

                accumulator -= FIXED_TIMESTEP;
                updates++;
            }

            // Run gameplay callbacks (variable timestep)
            runCallbacks('gameplay', dt);
        } else {
            // Variable timestep (original behavior)
            // Use fixed dt for consistency (matches original code)
            const fixedDt = FIXED_TIMESTEP;

            // Run physics callbacks
            runCallbacks('physics', fixedDt);

            // Run main update if provided
            if (loopConfig.onUpdate) {
                loopConfig.onUpdate(fixedDt);
            }

            // Run gameplay callbacks
            runCallbacks('gameplay', fixedDt);
        }

        // Run UI callbacks
        runCallbacks('ui', dt);
    }

    // Run render callbacks
    runCallbacks('render', dt);

    // Call main render if provided
    if (loopConfig.onRender) {
        loopConfig.onRender();
    }
}

/**
 * Start the main game loop
 */
export function startLoop() {
    if (loopRunning) return;

    loopRunning = true;
    lastTimestamp = 0;
    accumulator = 0;
    resetFrameStats();

    animationFrameId = requestAnimationFrame(animateInternal);
}

/**
 * Stop the main game loop
 */
export function stopLoop() {
    loopRunning = false;

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

/**
 * Check if the loop is running
 * @returns {boolean}
 */
export function isLoopRunning() {
    return loopRunning;
}

/**
 * Pause the loop temporarily
 * Unlike stopLoop, this preserves state for resuming
 */
export function pauseLoop() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

/**
 * Resume a paused loop
 */
export function resumeLoop() {
    if (!loopRunning) return;
    if (animationFrameId !== null) return; // Already running

    lastTimestamp = 0; // Reset timestamp to avoid huge dt
    animationFrameId = requestAnimationFrame(animateInternal);
}

// ============================================================
// SIMPLE LOOP (for compatibility with original code)
// ============================================================

/**
 * Create a simple animate function matching the original game's pattern
 * This is for easier integration during the modularization process
 *
 * @param {object} options - Options object
 * @param {function} options.onUpdate - Update function called with dt
 * @param {function} options.onRender - Render function called each frame
 * @param {function} options.isRunning - Function returning whether game is active
 * @returns {function} The animate function
 */
export function createSimpleLoop(options) {
    const { onUpdate, onRender, isRunning } = options;

    function animate() {
        requestAnimationFrame(animate);

        const dt = FIXED_TIMESTEP;

        if (isRunning && isRunning()) {
            if (onUpdate) {
                onUpdate(dt);
            }
        }

        if (onRender) {
            onRender();
        }
    }

    return animate;
}

/**
 * Run a simple game loop with the original pattern
 * @param {function} updateFn - Update function (dt) => void
 * @param {function} renderFn - Render function () => void
 * @param {function} isRunningFn - Function returning game running state
 */
export function runSimpleLoop(updateFn, renderFn, isRunningFn) {
    const animate = createSimpleLoop({
        onUpdate: updateFn,
        onRender: renderFn,
        isRunning: isRunningFn
    });
    animate();
}

// ============================================================
// TIMING UTILITIES
// ============================================================

/**
 * Create a throttled function that runs at most once per interval
 * @param {function} fn - Function to throttle
 * @param {number} intervalMs - Minimum interval between calls in milliseconds
 * @returns {function} Throttled function
 */
export function throttle(fn, intervalMs) {
    let lastCall = 0;

    return function(...args) {
        const now = performance.now();
        if (now - lastCall >= intervalMs) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}

/**
 * Create a rate limiter for actions (like firing weapons)
 * @param {number} ratePerSecond - Maximum calls per second
 * @returns {function} Function that returns true if action is allowed
 */
export function createRateLimiter(ratePerSecond) {
    let lastActionTime = 0;
    const minInterval = 1 / ratePerSecond;

    return function() {
        const now = getCurrentTimeSeconds();
        if (now - lastActionTime >= minInterval) {
            lastActionTime = now;
            return true;
        }
        return false;
    };
}

/**
 * Create a cooldown timer
 * @param {number} cooldownSeconds - Cooldown duration in seconds
 * @returns {object} Cooldown timer with start(), isReady(), and getRemaining()
 */
export function createCooldown(cooldownSeconds) {
    let startTime = 0;
    let duration = cooldownSeconds;

    return {
        /**
         * Start the cooldown
         */
        start() {
            startTime = getCurrentTimeSeconds();
        },

        /**
         * Check if cooldown is complete
         * @returns {boolean}
         */
        isReady() {
            return getCurrentTimeSeconds() - startTime >= duration;
        },

        /**
         * Get remaining cooldown time
         * @returns {number} Remaining time in seconds
         */
        getRemaining() {
            const elapsed = getCurrentTimeSeconds() - startTime;
            return Math.max(0, duration - elapsed);
        },

        /**
         * Get cooldown progress (0 to 1)
         * @returns {number}
         */
        getProgress() {
            const elapsed = getCurrentTimeSeconds() - startTime;
            return Math.min(1, elapsed / duration);
        },

        /**
         * Update the cooldown duration
         * @param {number} newDuration - New duration in seconds
         */
        setDuration(newDuration) {
            duration = newDuration;
        }
    };
}

/**
 * Create an interval timer for periodic actions
 * @param {number} intervalSeconds - Interval duration in seconds
 * @returns {object} Interval timer
 */
export function createIntervalTimer(intervalSeconds) {
    let lastTick = getCurrentTimeSeconds();
    let interval = intervalSeconds;

    return {
        /**
         * Check if interval has elapsed and reset if so
         * @returns {boolean} True if interval elapsed
         */
        tick() {
            const now = getCurrentTimeSeconds();
            if (now - lastTick >= interval) {
                lastTick = now;
                return true;
            }
            return false;
        },

        /**
         * Get time until next tick
         * @returns {number} Seconds until next tick
         */
        getTimeUntilTick() {
            const elapsed = getCurrentTimeSeconds() - lastTick;
            return Math.max(0, interval - elapsed);
        },

        /**
         * Reset the timer
         */
        reset() {
            lastTick = getCurrentTimeSeconds();
        },

        /**
         * Update the interval
         * @param {number} newInterval - New interval in seconds
         */
        setInterval(newInterval) {
            interval = newInterval;
        }
    };
}

// ============================================================
// EXPORTS SUMMARY
// ============================================================
//
// Timing Constants:
//   FIXED_TIMESTEP, MAX_DELTA_TIME, TARGET_FPS, FRAME_TIME_MS
//
// Delta Time Utilities:
//   calculateDeltaTime, getCurrentTime, getCurrentTimeSeconds
//
// Frame Rate Control:
//   updateFrameStats, getCurrentFps, getAverageFrameTime,
//   resetFrameStats, getFrameStats
//
// Update Callbacks:
//   registerUpdateCallback, unregisterUpdateCallback,
//   runCallbacks, clearCallbacks
//
// Loop Management:
//   configureLoop, startLoop, stopLoop, isLoopRunning,
//   pauseLoop, resumeLoop
//
// Simple Loop (compatibility):
//   createSimpleLoop, runSimpleLoop
//
// Timing Utilities:
//   throttle, createRateLimiter, createCooldown, createIntervalTimer
