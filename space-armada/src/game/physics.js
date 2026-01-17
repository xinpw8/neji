// Space Armada - Physics Module
// Extracted from index.html for modularization
// Contains Newtonian physics calculations, collision detection, and damage systems

import { magnitude, normalize, angleDifference, distance } from '../utils/math.js';

// ============================================================
// PHYSICS CONSTANTS
// ============================================================

/**
 * Physics constants for the game
 * Drag values are per-frame multipliers (applied each frame)
 */
export const PHYSICS_CONSTANTS = {
    // Space drag (friction) - applied per frame
    PLAYER_DRAG: 0.992,           // Player ship drag (low - preserves momentum)
    ENEMY_DRAG: 0.98,             // Enemy ship drag (moderate)
    DISABLED_SHIP_DRAG: 0.95,     // Disabled ship drag (high - slows down quickly)

    // Speed modifiers
    BOOST_SPEED_MULTIPLIER: 1.5,  // Speed multiplier when boosting
    BOOST_ENERGY_COST: 25,        // Energy per second when boosting

    // Collision radii by ship type
    HIT_RADIUS: {
        fighter: 18,
        heavy: 30,
        boss: 55,
        player: 30,
        projectile: 5
    },

    // Docking parameters
    DOCK_RANGE: 80,               // Distance to trigger auto-docking
    DOCK_SPEED_THRESHOLD: 50,     // Max speed to allow docking
    DOCK_VELOCITY_DAMPING: 0.1,   // Velocity multiplier when docking

    // Rotation
    PLAYER_ROTATION_SPEED: 8,     // Radians per second for player rotation

    // Projectile physics
    MISSILE_ACCELERATION: 1.01,   // Per-frame multiplier for missile speed increase

    // Regeneration
    ENERGY_REGEN_RATE: 12,        // Energy per second
};

// ============================================================
// VELOCITY AND POSITION UPDATES
// ============================================================

/**
 * Apply velocity to position with delta time
 * @param {object} entity - Entity with x, y, vx, vy properties
 * @param {number} dt - Delta time in seconds
 */
export function applyVelocity(entity, dt) {
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
}

/**
 * Apply drag (space friction) to velocity
 * @param {object} entity - Entity with vx, vy properties
 * @param {number} dragCoefficient - Drag multiplier (0-1, lower = more drag)
 */
export function applyDrag(entity, dragCoefficient) {
    entity.vx *= dragCoefficient;
    entity.vy *= dragCoefficient;
}

/**
 * Apply thrust to velocity in a given direction
 * @param {object} entity - Entity with vx, vy properties
 * @param {number} thrustPower - Thrust force magnitude
 * @param {number} directionX - X component of normalized direction (-1 to 1)
 * @param {number} directionY - Y component of normalized direction (-1 to 1)
 * @param {number} dt - Delta time in seconds
 */
export function applyThrust(entity, thrustPower, directionX, directionY, dt) {
    entity.vx += directionX * thrustPower * dt;
    entity.vy += directionY * thrustPower * dt;
}

/**
 * Apply thrust in the direction the entity is facing
 * @param {object} entity - Entity with vx, vy, rotation properties
 * @param {number} thrustPower - Thrust force magnitude
 * @param {number} dt - Delta time in seconds
 */
export function applyForwardThrust(entity, thrustPower, dt) {
    entity.vx += Math.cos(entity.rotation) * thrustPower * dt;
    entity.vy += Math.sin(entity.rotation) * thrustPower * dt;
}

/**
 * Apply reverse thrust (braking/backward movement)
 * @param {object} entity - Entity with vx, vy, rotation properties
 * @param {number} thrustPower - Thrust force magnitude
 * @param {number} dt - Delta time in seconds
 */
export function applyReverseThrust(entity, thrustPower, dt) {
    entity.vx -= Math.cos(entity.rotation) * thrustPower * dt;
    entity.vy -= Math.sin(entity.rotation) * thrustPower * dt;
}

// ============================================================
// SPEED LIMITING
// ============================================================

/**
 * Limit entity speed to a maximum value
 * @param {object} entity - Entity with vx, vy properties
 * @param {number} maxSpeed - Maximum speed allowed
 * @returns {number} Current speed after limiting
 */
export function limitSpeed(entity, maxSpeed) {
    const speed = magnitude(entity.vx, entity.vy);
    if (speed > maxSpeed) {
        entity.vx = (entity.vx / speed) * maxSpeed;
        entity.vy = (entity.vy / speed) * maxSpeed;
        return maxSpeed;
    }
    return speed;
}

/**
 * Get current speed of an entity
 * @param {object} entity - Entity with vx, vy properties
 * @returns {number} Current speed
 */
export function getSpeed(entity) {
    return magnitude(entity.vx, entity.vy);
}

/**
 * Stop an entity (set velocity to zero)
 * @param {object} entity - Entity with vx, vy properties
 */
export function stopEntity(entity) {
    entity.vx = 0;
    entity.vy = 0;
}

/**
 * Dampen velocity by a factor
 * @param {object} entity - Entity with vx, vy properties
 * @param {number} factor - Damping factor (0-1)
 */
export function dampenVelocity(entity, factor) {
    entity.vx *= factor;
    entity.vy *= factor;
}

// ============================================================
// ROTATION PHYSICS
// ============================================================

/**
 * Rotate entity towards a target angle with smooth interpolation
 * @param {object} entity - Entity with rotation property (in radians)
 * @param {number} targetAngle - Target angle in radians
 * @param {number} rotationSpeed - Maximum rotation speed (radians/second)
 * @param {number} dt - Delta time in seconds
 * @returns {number} Remaining angle difference
 */
export function rotateTowards(entity, targetAngle, rotationSpeed, dt) {
    const diff = angleDifference(entity.rotation, targetAngle);
    const maxRotation = rotationSpeed * dt;

    if (Math.abs(diff) <= maxRotation) {
        entity.rotation = targetAngle;
        return 0;
    }

    entity.rotation += Math.sign(diff) * maxRotation;
    return diff - Math.sign(diff) * maxRotation;
}

/**
 * Calculate angle to face a target position
 * @param {object} entity - Entity with x, y properties
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 * @returns {number} Angle in radians
 */
export function angleToTarget(entity, targetX, targetY) {
    return Math.atan2(targetY - entity.y, targetX - entity.x);
}

/**
 * Rotate projectile towards target (missile tracking)
 * @param {object} projectile - Projectile with vx, vy, turnRate properties
 * @param {object} target - Target with x, y properties
 * @param {number} dt - Delta time in seconds
 */
export function trackTarget(projectile, target, dt) {
    const targetAngle = Math.atan2(
        target.y - projectile.y,
        target.x - projectile.x
    );

    const currentAngle = Math.atan2(projectile.vy, projectile.vx);
    const diff = angleDifference(currentAngle, targetAngle);

    const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), projectile.turnRate * dt);

    const speed = magnitude(projectile.vx, projectile.vy);
    projectile.vx = Math.cos(newAngle) * speed;
    projectile.vy = Math.sin(newAngle) * speed;
}

/**
 * Accelerate a projectile (used for missiles)
 * @param {object} projectile - Projectile with vx, vy properties
 * @param {number} accelerationFactor - Per-frame multiplier (e.g., 1.01)
 */
export function accelerateProjectile(projectile, accelerationFactor) {
    projectile.vx *= accelerationFactor;
    projectile.vy *= accelerationFactor;
}

// ============================================================
// COLLISION DETECTION
// ============================================================

/**
 * Check collision between two entities using circular hitboxes
 * @param {object} entity1 - First entity with x, y properties
 * @param {object} entity2 - Second entity with x, y properties
 * @param {number} radius1 - Collision radius of first entity
 * @param {number} radius2 - Collision radius of second entity
 * @returns {boolean} True if entities are colliding
 */
export function checkCircleCollision(entity1, entity2, radius1, radius2 = 0) {
    const dist = distance(entity1.x, entity1.y, entity2.x, entity2.y);
    return dist < radius1 + radius2;
}

/**
 * Check if a point is within collision range of an entity
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {object} entity - Entity with x, y properties
 * @param {number} radius - Collision radius
 * @returns {boolean} True if point is within radius
 */
export function checkPointCollision(px, py, entity, radius) {
    const dist = distance(px, py, entity.x, entity.y);
    return dist < radius;
}

/**
 * Get hit radius for a ship type
 * @param {string} shipType - Ship type ('fighter', 'heavy', 'boss', 'player')
 * @returns {number} Collision radius
 */
export function getHitRadius(shipType) {
    return PHYSICS_CONSTANTS.HIT_RADIUS[shipType] || PHYSICS_CONSTANTS.HIT_RADIUS.fighter;
}

/**
 * Check if an entity is within range of another
 * @param {object} entity1 - First entity with x, y properties
 * @param {object} entity2 - Second entity with x, y properties
 * @param {number} range - Maximum distance
 * @returns {boolean} True if within range
 */
export function isWithinRange(entity1, entity2, range) {
    return distance(entity1.x, entity1.y, entity2.x, entity2.y) <= range;
}

/**
 * Check if entity is within line-of-sight (beam weapon check)
 * @param {object} origin - Origin entity with x, y, rotation properties
 * @param {object} target - Target entity with x, y properties
 * @param {number} beamLength - Maximum beam length
 * @param {number} beamWidth - Beam width (collision threshold)
 * @returns {boolean} True if target is in beam path
 */
export function checkBeamCollision(origin, target, beamLength, beamWidth) {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Check if target is within beam range
    if (dist > beamLength) return false;

    // Calculate perpendicular distance from beam line
    const cos = Math.cos(origin.rotation);
    const sin = Math.sin(origin.rotation);

    // Project target position onto beam direction
    const projectionLength = dx * cos + dy * sin;

    // Must be in front of the origin
    if (projectionLength < 0) return false;

    // Calculate perpendicular distance
    const perpDist = Math.abs(dx * sin - dy * cos);

    return perpDist < beamWidth;
}

// ============================================================
// EV-STYLE DAMAGE SYSTEM
// ============================================================

/**
 * AI behavior configurations
 * Based on Escape Velocity Bible
 */
export const AI_BEHAVIORS = {
    wimpyTrader: {
        aggression: 0,          // Never initiates combat
        fleeThreshold: 0.9,     // Flees at 90% health
        pursuitRange: 0,        // Doesn't pursue
        preferredRange: 500     // Tries to stay far
    },
    braveTrader: {
        aggression: 0.3,
        fleeThreshold: 0.5,
        pursuitRange: 300,
        preferredRange: 200
    },
    warship: {
        aggression: 0.8,
        fleeThreshold: 0.15,
        pursuitRange: 600,
        preferredRange: 150
    },
    interceptor: {
        aggression: 1.0,
        fleeThreshold: 0.1,
        pursuitRange: 800,
        preferredRange: 100
    }
};

/**
 * Apply EV-style damage to a target
 * Energy damage hits shields first, mass damage hits armor directly
 * @param {object} target - Target with shield, armor, maxShield, maxArmor, disableThreshold properties
 * @param {number} energyDmg - Energy damage (primarily hits shields)
 * @param {number} massDmg - Mass damage (primarily hits armor)
 * @returns {boolean} True if target was destroyed
 */
export function applyEVDamage(target, energyDmg, massDmg) {
    let remainingEnergy = energyDmg;
    let remainingMass = massDmg;

    // Energy damage hits shields first
    if (target.shield > 0 && remainingEnergy > 0) {
        const shieldDmg = Math.min(target.shield, remainingEnergy);
        target.shield -= shieldDmg;
        remainingEnergy -= shieldDmg;
    }

    // Remaining energy bleeds to armor at 50% effectiveness
    if (remainingEnergy > 0) {
        remainingMass += remainingEnergy * 0.5;
    }

    // Mass damage hits armor directly
    if (target.armor > 0 && remainingMass > 0) {
        target.armor -= remainingMass;
    }

    // Check for disable (threshold is typically 33% armor)
    if (target.armor > 0 && target.armor <= target.maxArmor * (target.disableThreshold || 0.33)) {
        target.disabled = true;
    }

    // Check for destruction
    if (target.armor <= 0) {
        target.armor = 0;
        target.destroyed = true;
    }

    // Update legacy health for compatibility
    target.health = target.shield + target.armor;
    target.maxHealth = target.maxShield + target.maxArmor;

    return target.destroyed;
}

/**
 * Apply standard damage (shields absorb first, then hull)
 * @param {object} target - Target with shields, hull properties
 * @param {number} damage - Total damage amount
 * @param {number} shieldAbsorption - Fraction of damage shields absorb (0-1)
 * @returns {number} Remaining damage after shield absorption
 */
export function applyStandardDamage(target, damage, shieldAbsorption = 0.8) {
    let remainingDamage = damage;

    if (target.shields > 0) {
        const absorbed = Math.min(target.shields, damage * shieldAbsorption);
        target.shields -= absorbed;
        remainingDamage = damage - absorbed;
    }

    target.hull -= remainingDamage;
    return remainingDamage;
}

/**
 * Calculate damage split for different weapon types
 * @param {string} weaponType - 'laser', 'missile', 'turret', or 'beam'
 * @param {number} baseDamage - Base damage amount
 * @returns {{energyDmg: number, massDmg: number}} Damage split
 */
export function calculateDamageSplit(weaponType, baseDamage) {
    switch (weaponType) {
        case 'missile':
            // Missiles: 30% energy, 70% mass (armor piercing)
            return {
                energyDmg: baseDamage * 0.3,
                massDmg: baseDamage * 0.7
            };
        case 'turret':
            // Turrets: 50/50 split
            return {
                energyDmg: baseDamage * 0.5,
                massDmg: baseDamage * 0.5
            };
        case 'beam':
            // Beam weapons: 100% energy (excellent against shields)
            return {
                energyDmg: baseDamage,
                massDmg: 0
            };
        case 'laser':
        default:
            // Primary weapons (lasers): 80% energy, 20% mass
            return {
                energyDmg: baseDamage * 0.8,
                massDmg: baseDamage * 0.2
            };
    }
}

// ============================================================
// REGENERATION
// ============================================================

/**
 * Update shield and armor regeneration for a ship
 * @param {object} ship - Ship with shield, maxShield, shieldRecharge, armor, maxArmor, armorRecharge properties
 * @param {number} dt - Delta time in seconds
 */
export function updateShipRegeneration(ship, dt) {
    if (ship.destroyed || ship.disabled) return;

    // Shield regeneration
    if (ship.shield < ship.maxShield && ship.shieldRecharge > 0) {
        ship.shield = Math.min(ship.maxShield, ship.shield + ship.shieldRecharge * dt);
    }

    // Armor regeneration (rare, usually only capital ships)
    if (ship.armor < ship.maxArmor && ship.armorRecharge > 0) {
        ship.armor = Math.min(ship.maxArmor, ship.armor + ship.armorRecharge * dt);
    }

    // Update legacy health
    ship.health = ship.shield + ship.armor;
}

/**
 * Regenerate player shields
 * @param {object} playerState - Player state with shields, maxShields properties
 * @param {number} regenRate - Regeneration rate per second
 * @param {number} dt - Delta time in seconds
 */
export function regenerateShields(playerState, regenRate, dt) {
    if (playerState.shields < playerState.maxShields) {
        playerState.shields = Math.min(
            playerState.maxShields,
            playerState.shields + regenRate * dt
        );
    }
}

/**
 * Regenerate player energy
 * @param {object} playerState - Player state with energy, maxEnergy properties
 * @param {number} regenRate - Regeneration rate per second
 * @param {number} dt - Delta time in seconds
 */
export function regenerateEnergy(playerState, regenRate, dt) {
    playerState.energy = Math.min(
        playerState.maxEnergy,
        playerState.energy + regenRate * dt
    );
}

// ============================================================
// MOVEMENT INPUT HELPERS
// ============================================================

/**
 * Normalize diagonal movement (prevent faster diagonal speed)
 * @param {number} moveX - X movement input (-1, 0, or 1)
 * @param {number} moveY - Y movement input (-1, 0, or 1)
 * @returns {{x: number, y: number}} Normalized movement vector
 */
export function normalizeMovementInput(moveX, moveY) {
    if (moveX !== 0 && moveY !== 0) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        return { x: moveX / len, y: moveY / len };
    }
    return { x: moveX, y: moveY };
}

/**
 * Process WASD/Arrow key input into movement vector
 * @param {object} keys - Key state object (keyCode: boolean)
 * @returns {{x: number, y: number, isMoving: boolean}} Movement direction and state
 */
export function processMovementKeys(keys) {
    let moveX = 0;
    let moveY = 0;

    if (keys['KeyW'] || keys['ArrowUp']) {
        moveY = -1; // Up on screen = negative Y in world
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        moveY = 1;  // Down on screen = positive Y in world
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
        moveX = -1;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        moveX = 1;
    }

    const normalized = normalizeMovementInput(moveX, moveY);
    return {
        x: normalized.x,
        y: normalized.y,
        isMoving: moveX !== 0 || moveY !== 0
    };
}

// ============================================================
// DOCKING PHYSICS
// ============================================================

/**
 * Check if player can dock at a station
 * @param {object} player - Player state with x, y, vx, vy properties
 * @param {object} station - Station with x, y properties
 * @param {number} dockRange - Maximum distance to dock (default from constants)
 * @param {number} speedThreshold - Maximum speed to dock (default from constants)
 * @returns {boolean} True if docking is possible
 */
export function canDockAtStation(player, station, dockRange = PHYSICS_CONSTANTS.DOCK_RANGE, speedThreshold = PHYSICS_CONSTANTS.DOCK_SPEED_THRESHOLD) {
    const dist = distance(player.x, player.y, station.x, station.y);
    const speed = getSpeed(player);

    return dist < dockRange && speed < speedThreshold;
}

/**
 * Check if player should cancel docking (moved too far or going too fast)
 * @param {object} player - Player state with x, y, vx, vy properties
 * @param {object} station - Station with x, y properties
 * @param {number} cancelRange - Distance at which to cancel docking
 * @param {number} cancelSpeed - Speed at which to cancel docking
 * @returns {boolean} True if docking should be cancelled
 */
export function shouldCancelDocking(player, station, cancelRange = 150, cancelSpeed = 100) {
    const dist = distance(player.x, player.y, station.x, station.y);
    const speed = getSpeed(player);

    return dist > cancelRange || speed > cancelSpeed;
}

// ============================================================
// COMBAT RATINGS (from EV Bible)
// ============================================================

/**
 * Combat rating thresholds
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
 * @returns {{kills: number, name: string, color: string}} Combat rating info
 */
export function getCombatRating(kills) {
    for (let i = COMBAT_RATINGS.length - 1; i >= 0; i--) {
        if (kills >= COMBAT_RATINGS[i].kills) {
            return COMBAT_RATINGS[i];
        }
    }
    return COMBAT_RATINGS[0];
}

// ============================================================
// ADDITIONAL PHYSICS FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Apply Newtonian physics to an entity
 * @param {object} entity - Entity with x, y, vx, vy, ax, ay properties
 * @param {number} dt - Delta time in seconds
 */
export function applyNewtonian(entity, dt) {
    if (entity.ax !== undefined) entity.vx += entity.ax * dt;
    if (entity.ay !== undefined) entity.vy += entity.ay * dt;
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
}

/**
 * Update rotation towards target
 * @param {number} current - Current rotation in radians
 * @param {number} target - Target rotation in radians
 * @param {number} rate - Rotation rate per second
 * @param {number} dt - Delta time
 * @returns {number} New rotation
 */
export function updateRotation(current, target, rate, dt) {
    const diff = angleDifference(current, target);
    const maxRotation = rate * dt;
    if (Math.abs(diff) <= maxRotation) return target;
    return current + Math.sign(diff) * maxRotation;
}

/**
 * Check collision between two rectangles
 * @param {object} rect1 - First rectangle with x, y, width, height
 * @param {object} rect2 - Second rectangle with x, y, width, height
 * @returns {boolean} True if colliding
 */
export function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Resolve collision between two entities (push apart)
 * @param {object} entity1 - First entity
 * @param {object} entity2 - Second entity
 * @param {number} minDist - Minimum distance to maintain
 */
export function resolveCollision(entity1, entity2, minDist) {
    const dx = entity2.x - entity1.x;
    const dy = entity2.y - entity1.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const overlap = minDist - dist;
    if (overlap > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        entity1.x -= nx * overlap * 0.5;
        entity1.y -= ny * overlap * 0.5;
        entity2.x += nx * overlap * 0.5;
        entity2.y += ny * overlap * 0.5;
    }
}

/**
 * Get collision normal between two entities
 * @param {object} entity1 - First entity with x, y
 * @param {object} entity2 - Second entity with x, y
 * @returns {{x: number, y: number}} Normalized collision normal
 */
export function getCollisionNormal(entity1, entity2) {
    const dx = entity2.x - entity1.x;
    const dy = entity2.y - entity1.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / dist, y: dy / dist };
}

/**
 * Apply collision response (bounce)
 * @param {object} entity - Entity with vx, vy
 * @param {{x: number, y: number}} normal - Collision normal
 * @param {number} restitution - Bounce factor (0-1)
 */
export function applyCollisionResponse(entity, normal, restitution = 0.8) {
    const dotProduct = entity.vx * normal.x + entity.vy * normal.y;
    entity.vx -= (1 + restitution) * dotProduct * normal.x;
    entity.vy -= (1 + restitution) * dotProduct * normal.y;
}

/**
 * Calculate impact damage based on relative velocity
 * @param {object} entity1 - First entity with vx, vy, mass
 * @param {object} entity2 - Second entity with vx, vy, mass
 * @returns {number} Impact damage value
 */
export function calculateImpact(entity1, entity2) {
    const relVx = entity1.vx - (entity2.vx || 0);
    const relVy = entity1.vy - (entity2.vy || 0);
    const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);
    const mass1 = entity1.mass || 1;
    const mass2 = entity2.mass || 1;
    return relSpeed * (mass1 + mass2) * 0.1;
}

/**
 * Check if entity is in range of target
 * @param {object} entity - Entity with x, y
 * @param {object} target - Target with x, y
 * @param {number} range - Maximum range
 * @returns {boolean} True if in range
 */
export function isInRange(entity, target, range) {
    return distance(entity.x, entity.y, target.x, target.y) <= range;
}

/**
 * Get squared distance between two entities (faster than distance)
 * @param {object} entity1 - First entity with x, y
 * @param {object} entity2 - Second entity with x, y
 * @returns {number} Squared distance
 */
export function getDistanceSquared(entity1, entity2) {
    const dx = entity2.x - entity1.x;
    const dy = entity2.y - entity1.y;
    return dx * dx + dy * dy;
}
