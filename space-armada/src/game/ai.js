// Space Armada - AI System Module
// Extracted from index.html for modularization
// Contains enemy AI behavior definitions, state machine logic, and targeting utilities

// ============================================================
// AI BEHAVIOR TYPES (from EV Bible)
// ============================================================

/**
 * AI Behavior definitions based on Escape Velocity game design
 * 1: Wimpy Trader - runs away when attacked
 * 2: Brave Trader - fights back but flees when attacker out of range
 * 3: Warship - seeks enemies, fights to the end
 * 4: Interceptor - aggressive, scans for targets
 */
export const AI_BEHAVIORS = {
    wimpyTrader: {
        aggression: 0,        // Never initiates combat
        fleeThreshold: 0.9,   // Flees at 90% health
        pursuitRange: 0,      // Doesn't pursue
        preferredRange: 500   // Tries to stay far from threats
    },
    braveTrader: {
        aggression: 0.3,      // Occasional aggression
        fleeThreshold: 0.5,   // Flees at 50% health
        pursuitRange: 300,    // Limited pursuit
        preferredRange: 200   // Medium engagement range
    },
    warship: {
        aggression: 0.8,      // High aggression
        fleeThreshold: 0.15,  // Only flees at 15% health
        pursuitRange: 600,    // Long pursuit range
        preferredRange: 150   // Close combat preference
    },
    interceptor: {
        aggression: 1.0,      // Maximum aggression
        fleeThreshold: 0.1,   // Only flees at 10% health
        pursuitRange: 800,    // Very long pursuit range
        preferredRange: 100   // Point-blank combat
    }
};

// ============================================================
// AI STATES
// ============================================================

/**
 * Possible AI states for enemy ships
 */
export const AI_STATES = {
    PATROL: 'patrol',     // Neutral movement, not engaged
    CHASE: 'chase',       // Pursuing target
    ATTACK: 'attack',     // Engaged in combat at preferred range
    FLEE: 'flee'          // Running away from threat
};

// ============================================================
// AI STATE MACHINE
// ============================================================

/**
 * Determine the next AI state based on current conditions
 * @param {Object} enemy - The enemy ship object
 * @param {Object} target - The target (player) position {x, y}
 * @param {Object} aiBehavior - The AI behavior profile
 * @returns {string} The new AI state
 */
export function determineAIState(enemy, target, aiBehavior = AI_BEHAVIORS.interceptor) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const healthPercent = enemy.health / enemy.maxHealth;

    // Check flee condition first (highest priority)
    if (healthPercent < aiBehavior.fleeThreshold) {
        return AI_STATES.FLEE;
    }

    // Low aggression ships patrol when target is out of pursuit range
    if (dist > aiBehavior.pursuitRange && aiBehavior.aggression < 0.5) {
        return AI_STATES.PATROL;
    }

    // Chase if target is beyond preferred engagement range
    if (dist > aiBehavior.preferredRange + 100) {
        return AI_STATES.CHASE;
    }

    // Default to attack when in range
    return AI_STATES.ATTACK;
}

/**
 * Calculate target rotation angle for an enemy
 * Rotates toward target for attack/chase, away for flee
 * @param {Object} enemy - Enemy ship with x, y, rotation properties
 * @param {Object} target - Target position {x, y}
 * @param {string} state - Current AI state
 * @returns {number} Target rotation in radians
 */
export function calculateTargetRotation(enemy, target, state) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const targetAngle = Math.atan2(dy, dx);

    // Flee state: rotate away from target
    if (state === AI_STATES.FLEE) {
        return targetAngle + Math.PI;
    }

    return targetAngle;
}

/**
 * Update enemy rotation smoothly toward target angle
 * @param {number} currentRotation - Current rotation in radians
 * @param {number} targetRotation - Target rotation in radians
 * @param {number} turnRate - Turn rate multiplier (ship stat)
 * @param {number} dt - Delta time in seconds
 * @returns {number} New rotation in radians
 */
export function updateRotation(currentRotation, targetRotation, turnRate, dt) {
    let angleDiff = targetRotation - currentRotation;

    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Turn rate: 1.0 = base turn speed of 2.0 rad/s
    const turnSpeed = (turnRate || 1.0) * 2.0;
    const maxTurn = turnSpeed * dt;

    return currentRotation + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);
}

// ============================================================
// AI MOVEMENT DECISIONS
// ============================================================

/**
 * Calculate thrust direction based on AI state
 * @param {Object} enemy - Enemy ship object
 * @param {Object} target - Target position {x, y}
 * @param {string} state - Current AI state
 * @param {Object} aiBehavior - AI behavior profile
 * @returns {Object} Thrust multiplier {forward: number, lateral: number}
 */
export function calculateThrustDecision(enemy, target, state, aiBehavior) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const preferredDist = aiBehavior.preferredRange;

    switch (state) {
        case AI_STATES.FLEE:
            // Full speed escape (boosted thrust)
            return { forward: 1.2, lateral: 0 };

        case AI_STATES.CHASE:
            // Normal thrust toward target
            return { forward: 1.0, lateral: 0 };

        case AI_STATES.ATTACK:
            if (dist > preferredDist) {
                // Close the gap
                return { forward: 1.0, lateral: 0 };
            } else if (dist < preferredDist * 0.6) {
                // Too close - back off
                return { forward: -0.5, lateral: 0 };
            }
            // In sweet spot - minimal adjustment
            return { forward: 0.1, lateral: 0 };

        case AI_STATES.PATROL:
        default:
            // Drift slowly
            return { forward: 0.2, lateral: 0 };
    }
}

/**
 * Apply movement to enemy based on AI decisions
 * @param {Object} enemy - Enemy ship object
 * @param {Object} thrust - Thrust decision {forward, lateral}
 * @param {number} dt - Delta time in seconds
 * @returns {Object} Updated velocity {vx, vy}
 */
export function applyAIMovement(enemy, thrust, dt) {
    const baseSpeed = 150 * (enemy.speed || 1.0);
    const maxSpeed = 200 * (enemy.speed || 1.0);

    // Apply thrust
    let vx = enemy.vx + Math.cos(enemy.rotation) * baseSpeed * thrust.forward * dt;
    let vy = enemy.vy + Math.sin(enemy.rotation) * baseSpeed * thrust.forward * dt;

    // Clamp to max speed
    const currentSpeed = Math.sqrt(vx * vx + vy * vy);
    if (currentSpeed > maxSpeed) {
        vx = (vx / currentSpeed) * maxSpeed;
        vy = (vy / currentSpeed) * maxSpeed;
    }

    // Apply drag
    vx *= 0.98;
    vy *= 0.98;

    return { vx, vy };
}

// ============================================================
// AI COMBAT DECISIONS
// ============================================================

/**
 * Determine if enemy should fire at target
 * @param {Object} enemy - Enemy ship object
 * @param {Object} target - Target position {x, y}
 * @param {string} state - Current AI state
 * @param {number} maxRange - Maximum firing range (default 500)
 * @returns {boolean} True if enemy should fire
 */
export function shouldFire(enemy, target, state, maxRange = 500) {
    // Don't fire if disabled or fleeing
    if (enemy.disabled || state === AI_STATES.FLEE) {
        return false;
    }

    // Only fire in attack state
    if (state !== AI_STATES.ATTACK) {
        return false;
    }

    // Check range
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist < maxRange;
}

/**
 * Get firing parameters based on enemy type
 * @param {string} enemyType - Enemy ship type ('fighter', 'heavy', 'boss')
 * @returns {Object} Firing parameters {fireRate, damage, shotCount, spread}
 */
export function getFiringParameters(enemyType) {
    switch (enemyType) {
        case 'fighter':
            return {
                fireRate: 1.2,
                damage: 8,
                shotCount: 1,
                spread: 0
            };
        case 'heavy':
            return {
                fireRate: 0.6,
                damage: 15,
                shotCount: 1,
                spread: 0
            };
        case 'boss':
            return {
                fireRate: 0.3,
                damage: 25,
                shotCount: 3,
                spread: 0.2
            };
        default:
            return {
                fireRate: 1.0,
                damage: 10,
                shotCount: 1,
                spread: 0
            };
    }
}

// ============================================================
// TARGET SELECTION UTILITIES
// ============================================================

/**
 * Calculate distance between two positions
 * @param {Object} a - First position {x, y}
 * @param {Object} b - Second position {x, y}
 * @returns {number} Distance between positions
 */
export function distanceBetween(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest enemy within range
 * @param {Array} enemies - Array of enemy objects
 * @param {Object} position - Reference position {x, y}
 * @param {number} maxRange - Maximum targeting range (default 800)
 * @returns {Object|null} Nearest enemy or null if none in range
 */
export function findNearestEnemy(enemies, position, maxRange = 800) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const enemy of enemies) {
        if (enemy.health <= 0 || enemy.destroyed) continue;

        const dist = distanceBetween(position, enemy);
        if (dist < nearestDist && dist < maxRange) {
            nearestDist = dist;
            nearest = enemy;
        }
    }

    return nearest;
}

/**
 * Get next target in cycle (for tab-targeting)
 * @param {Array} enemies - Array of enemy objects
 * @param {Object|null} currentTarget - Currently selected target
 * @returns {Object|null} Next target in cycle or null if none available
 */
export function cycleTarget(enemies, currentTarget) {
    const aliveEnemies = enemies.filter(e => e.health > 0 && !e.destroyed);

    if (aliveEnemies.length === 0) {
        return null;
    }

    const currentIndex = currentTarget ? aliveEnemies.indexOf(currentTarget) : -1;
    const nextIndex = (currentIndex + 1) % aliveEnemies.length;

    return aliveEnemies[nextIndex];
}

/**
 * Find enemies within a specified radius
 * @param {Array} enemies - Array of enemy objects
 * @param {Object} position - Center position {x, y}
 * @param {number} radius - Search radius
 * @returns {Array} Array of enemies within radius
 */
export function findEnemiesInRadius(enemies, position, radius) {
    return enemies.filter(enemy => {
        if (enemy.health <= 0 || enemy.destroyed) return false;
        return distanceBetween(position, enemy) <= radius;
    });
}

/**
 * Sort enemies by distance from position
 * @param {Array} enemies - Array of enemy objects
 * @param {Object} position - Reference position {x, y}
 * @returns {Array} Sorted array (closest first)
 */
export function sortByDistance(enemies, position) {
    return [...enemies].sort((a, b) =>
        distanceBetween(position, a) - distanceBetween(position, b)
    );
}

/**
 * Filter enemies by faction
 * @param {Array} enemies - Array of enemy objects
 * @param {string} faction - Faction ID to filter by
 * @returns {Array} Enemies belonging to specified faction
 */
export function filterByFaction(enemies, faction) {
    return enemies.filter(e => e.faction === faction);
}

/**
 * Find the weakest enemy (lowest health percentage)
 * @param {Array} enemies - Array of enemy objects
 * @param {Object} position - Reference position {x, y}
 * @param {number} maxRange - Maximum range to consider
 * @returns {Object|null} Weakest enemy in range or null
 */
export function findWeakestEnemy(enemies, position, maxRange = 800) {
    let weakest = null;
    let lowestHealth = Infinity;

    for (const enemy of enemies) {
        if (enemy.health <= 0 || enemy.destroyed) continue;

        const dist = distanceBetween(position, enemy);
        if (dist > maxRange) continue;

        const healthPercent = enemy.health / enemy.maxHealth;
        if (healthPercent < lowestHealth) {
            lowestHealth = healthPercent;
            weakest = enemy;
        }
    }

    return weakest;
}

// ============================================================
// AI UPDATE FUNCTION
// ============================================================

/**
 * Full AI update for an enemy ship (convenience function)
 * Combines state determination, rotation, and movement
 * @param {Object} enemy - Enemy ship object
 * @param {Object} target - Target (player) state {x, y}
 * @param {number} dt - Delta time in seconds
 * @returns {Object} Updated enemy state {state, rotation, vx, vy, shouldFire}
 */
export function updateEnemyAI(enemy, target, dt) {
    // Get AI behavior (default to interceptor)
    const aiBehavior = enemy.aiBehavior || AI_BEHAVIORS.interceptor;

    // Determine new state
    const state = determineAIState(enemy, target, aiBehavior);

    // Calculate and update rotation
    const targetRot = calculateTargetRotation(enemy, target, state);
    const rotation = updateRotation(enemy.rotation, targetRot, enemy.turnRate, dt);

    // Calculate thrust and apply movement
    const thrust = calculateThrustDecision(enemy, target, state, aiBehavior);
    const { vx, vy } = applyAIMovement({ ...enemy, rotation }, thrust, dt);

    // Determine if should fire
    const canFire = shouldFire(enemy, target, state);

    return {
        state,
        rotation,
        vx,
        vy,
        shouldFire: canFire
    };
}

// ============================================================
// COMBAT RATINGS (for reputation/difficulty)
// ============================================================

/**
 * Combat rating thresholds based on kills (from EV Bible)
 */
export const COMBAT_RATINGS = [
    { kills: 0, name: 'Harmless', color: '#666666' },
    { kills: 1, name: 'Mostly Harmless', color: '#888888' },
    { kills: 10, name: 'Poor', color: '#aaaaaa' },
    { kills: 25, name: 'Average', color: '#cccccc' },
    { kills: 50, name: 'Above Average', color: '#00aa00' },
    { kills: 100, name: 'Competent', color: '#00cc00' },
    { kills: 200, name: 'Dangerous', color: '#ffaa00' },
    { kills: 400, name: 'Deadly', color: '#ff6600' },
    { kills: 800, name: 'Elite', color: '#ff0000' },
    { kills: 1600, name: 'Elite II', color: '#ff00ff' },
    { kills: 3200, name: 'Elite III', color: '#00ffff' }
];

/**
 * Get combat rating based on kill count
 * @param {number} kills - Number of kills
 * @returns {Object} Rating object {kills, name, color}
 */
export function getCombatRating(kills) {
    for (let i = COMBAT_RATINGS.length - 1; i >= 0; i--) {
        if (kills >= COMBAT_RATINGS[i].kills) {
            return COMBAT_RATINGS[i];
        }
    }
    return COMBAT_RATINGS[0];
}
