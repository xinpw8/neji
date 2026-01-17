// Space Armada - Projectiles Module
// Extracted from index.html for modularization
// Contains projectile creation, weapons, and projectile update logic

import * as THREE from 'three';

// ============================================================
// PROJECTILE CONFIGURATION
// ============================================================

/**
 * Projectile type configurations
 * Defines visual and behavioral properties for each projectile type
 */
export const PROJECTILE_CONFIGS = {
    primary: {
        color: 0x00ffff,
        size: { w: 2, h: 15 },
        speed: 900,
        lifetime: 1.5
    },
    spread: {
        color: 0xffff00,
        size: { w: 1.5, h: 10 },
        speed: 800,
        lifetime: 1.0
    },
    heavy: {
        color: 0xff8800,
        size: { w: 4, h: 25 },
        speed: 600,
        lifetime: 2.5
    },
    turret: {
        color: 0xffaa00,
        size: { w: 2, h: 12 },
        speed: 750,
        lifetime: 1.2
    },
    missile: {
        color: 0xff00ff,
        size: { w: 3, h: 20 },
        speed: 400,
        lifetime: 4
    },
    enemy: {
        color: 0xff0000,
        size: { w: 2, h: 10 },
        speed: 450,
        lifetime: 2
    }
};

/**
 * Default projectile configuration (fallback)
 */
export const DEFAULT_PROJECTILE_CONFIG = {
    color: 0x00ffff,
    size: { w: 2, h: 15 },
    speed: 900,
    lifetime: 1.5
};

// ============================================================
// PROJECTILE FACTORY
// ============================================================

/**
 * Create a projectile with 3D mesh and physics properties
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position (world Z)
 * @param {number} angle - Direction angle in radians
 * @param {string} type - Projectile type (primary, spread, heavy, turret, missile, enemy)
 * @param {number} damage - Damage amount
 * @returns {object} Projectile object with mesh and properties
 */
export function createProjectile(x, y, angle, type = 'primary', damage = 15) {
    const group = new THREE.Group();

    // Get config for this projectile type
    const config = PROJECTILE_CONFIGS[type] || DEFAULT_PROJECTILE_CONFIG;
    const { color, size, speed, lifetime } = config;

    // Create projectile mesh (cylinder)
    const geom = new THREE.CylinderGeometry(size.w, size.w, size.h, 6);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);

    // Glow trail sprite
    const glowMat = new THREE.SpriteMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(size.w * 4, size.w * 4, 1);
    group.add(glow);

    // Position in 3D space (y=5 for height above ground plane)
    group.position.set(x, 5, y);
    group.rotation.y = -angle + Math.PI / 2;

    return {
        mesh: group,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type,
        damage,
        lifetime,
        isPlayer: type !== 'enemy',
        target: null // For missiles
    };
}

/**
 * Create a homing missile projectile
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position
 * @param {number} angle - Initial direction angle
 * @param {object} target - Target enemy object to track
 * @param {number} damage - Damage amount
 * @returns {object} Missile projectile with tracking properties
 */
export function createMissile(x, y, angle, target, damage) {
    const proj = createProjectile(x, y, angle, 'missile', damage);
    proj.target = target;
    proj.turnRate = 3; // Radians per second for homing
    return proj;
}

// ============================================================
// PROJECTILE UPDATE
// ============================================================

/**
 * Update missile tracking (homing behavior)
 * @param {object} proj - Projectile object
 * @param {number} dt - Delta time in seconds
 */
export function updateMissileTracking(proj, dt) {
    if (proj.type !== 'missile' || !proj.target || proj.target.health <= 0) {
        return;
    }

    const dx = proj.target.x - proj.x;
    const dy = proj.target.y - proj.y;
    const targetAngle = Math.atan2(dy, dx);

    let currentAngle = Math.atan2(proj.vy, proj.vx);
    let angleDiff = targetAngle - currentAngle;

    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Turn towards target
    currentAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), proj.turnRate * dt);

    // Update velocity direction
    const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
    proj.vx = Math.cos(currentAngle) * speed;
    proj.vy = Math.sin(currentAngle) * speed;

    // Accelerate slightly (missiles speed up over time)
    proj.vx *= 1.01;
    proj.vy *= 1.01;

    // Update visual rotation
    proj.mesh.rotation.y = -currentAngle + Math.PI / 2;
}

/**
 * Update projectile position
 * @param {object} proj - Projectile object
 * @param {number} dt - Delta time in seconds
 */
export function updateProjectilePosition(proj, dt) {
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.mesh.position.set(proj.x, 5, proj.y);
    proj.lifetime -= dt;
}

/**
 * Check if projectile is still alive (has lifetime remaining)
 * @param {object} proj - Projectile object
 * @returns {boolean} True if projectile is still active
 */
export function isProjectileAlive(proj) {
    return proj.lifetime > 0;
}

/**
 * Remove projectile from scene
 * @param {object} proj - Projectile object
 * @param {THREE.Scene} scene - Three.js scene
 */
export function removeProjectile(proj, scene) {
    scene.remove(proj.mesh);
}

// ============================================================
// DAMAGE CALCULATION
// ============================================================

/**
 * Calculate damage split for EV-style combat
 * Energy damage is effective against shields, mass damage against armor
 * @param {string} projectileType - Type of projectile
 * @param {number} baseDamage - Base damage amount
 * @returns {object} Object with energyDmg and massDmg properties
 */
export function calculateDamageSplit(projectileType, baseDamage) {
    let energyDmg = 0;
    let massDmg = 0;

    switch (projectileType) {
        case 'missile':
            // Missiles: 30% energy, 70% mass (excellent against armor)
            energyDmg = baseDamage * 0.3;
            massDmg = baseDamage * 0.7;
            break;
        case 'turret':
            // Turrets: 50/50 split (balanced)
            energyDmg = baseDamage * 0.5;
            massDmg = baseDamage * 0.5;
            break;
        default:
            // Primary weapons (lasers): 80% energy, 20% mass (excellent against shields)
            energyDmg = baseDamage * 0.8;
            massDmg = baseDamage * 0.2;
            break;
    }

    return { energyDmg, massDmg };
}

/**
 * Get hit radius for different enemy types
 * @param {string} enemyType - Type of enemy (fighter, heavy, boss)
 * @returns {number} Hit detection radius
 */
export function getEnemyHitRadius(enemyType) {
    switch (enemyType) {
        case 'fighter':
            return 18;
        case 'heavy':
            return 30;
        case 'boss':
            return 55;
        default:
            return 18;
    }
}

/**
 * Get explosion size for projectile type
 * @param {string} projectileType - Type of projectile
 * @returns {number} Explosion size multiplier
 */
export function getExplosionSize(projectileType) {
    return projectileType === 'missile' ? 0.8 : 0.3;
}

/**
 * Get explosion size for destroyed enemy
 * @param {string} enemyType - Type of enemy
 * @returns {number} Explosion size multiplier
 */
export function getEnemyExplosionSize(enemyType) {
    switch (enemyType) {
        case 'boss':
            return 3;
        case 'heavy':
            return 1.5;
        default:
            return 0.8;
    }
}

// ============================================================
// WEAPON NAMES AND INFO
// ============================================================

/**
 * Weapon display names
 */
export const WEAPON_NAMES = ['PULSE CANNON', 'SPREAD SHOT', 'BEAM LASER', 'HEAVY CANNON'];

/**
 * Weapon type descriptions
 */
export const WEAPON_TYPES = [
    'PRIMARY - FORWARD MOUNT',
    'SPREAD - FORWARD MOUNT',
    'CONTINUOUS BEAM',
    'HEAVY - FORWARD MOUNT'
];

/**
 * Get weapon display information
 * @param {number} weaponIndex - Weapon index (0-3)
 * @returns {object} Object with name and type properties
 */
export function getWeaponInfo(weaponIndex) {
    const index = Math.max(0, Math.min(3, weaponIndex || 0));
    return {
        name: WEAPON_NAMES[index],
        type: WEAPON_TYPES[index]
    };
}

// ============================================================
// ADDITIONAL PROJECTILE FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Create a beam weapon projectile
 * @param {number} x - Start X position
 * @param {number} y - Start Y position
 * @param {number} angle - Beam angle in radians
 * @param {number} length - Beam length
 * @param {number} damage - Damage per tick
 * @returns {object} Beam projectile object
 */
export function createBeam(x, y, angle, length = 300, damage = 5) {
    return {
        x, y, angle,
        type: 'beam',
        length,
        damage,
        vx: 0,
        vy: 0,
        age: 0,
        lifetime: 0.1, // Short beam pulses
        radius: 5,
        isBeam: true
    };
}

/**
 * Check collision between projectile and an entity
 * @param {object} proj - Projectile with x, y, radius
 * @param {object} entity - Entity with x, y
 * @param {number} entityRadius - Entity collision radius
 * @returns {boolean} True if collision detected
 */
export function checkProjectileCollision(proj, entity, entityRadius) {
    if (!proj || !entity) return false;
    const dx = entity.x - proj.x;
    const dy = entity.y - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (proj.radius || 5) + entityRadius;
}

// Array to track active projectiles for cleanup
let activeProjectiles = [];

/**
 * Register a projectile for tracking
 * @param {object} proj - Projectile to track
 */
export function registerProjectile(proj) {
    activeProjectiles.push(proj);
}

/**
 * Clear all active projectiles
 * @param {object} scene - Three.js scene to remove meshes from
 */
export function clearAllProjectiles(scene) {
    for (const proj of activeProjectiles) {
        if (proj.mesh && scene) {
            scene.remove(proj.mesh);
            if (proj.mesh.geometry) proj.mesh.geometry.dispose();
            if (proj.mesh.material) proj.mesh.material.dispose();
        }
    }
    activeProjectiles = [];
}
