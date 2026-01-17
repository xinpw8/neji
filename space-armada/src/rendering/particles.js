// Space Armada - Particles Module
// Extracted from index.html for modularization
// Contains particle effects, explosions, and visual effects

import * as THREE from 'three';

// ============================================================
// PARTICLE CONFIGURATION
// ============================================================

/**
 * Default particle count multiplier for explosions
 */
export const PARTICLES_PER_EXPLOSION = 25;

/**
 * Explosion particle configuration
 */
export const EXPLOSION_CONFIG = {
    minSize: 2,
    maxSize: 6,
    baseHue: 0.05,        // Orange-red fire colors
    hueRange: 0.08,
    minSpeed: 80,
    maxSpeed: 280,
    minLife: 0.4,
    maxLife: 1.0,
    heightBase: 3,
    heightRange: 6
};

/**
 * Particle fade/shrink rates
 */
export const PARTICLE_DECAY = {
    shrinkRate: 0.96,     // Multiply scale each frame
    fadeWithLife: true    // Opacity = remaining life
};

// ============================================================
// EXPLOSION EFFECTS
// ============================================================

/**
 * Create an explosion effect at the specified position
 * Spawns multiple particles that spread outward and fade
 * @param {number} x - X position
 * @param {number} y - Y position (world Z coordinate)
 * @param {number} size - Size multiplier (default 1)
 * @param {THREE.Scene} scene - Three.js scene to add particles to
 * @param {Array} particlesArray - Array to store particle references
 */
export function createExplosion(x, y, size = 1, scene, particlesArray) {
    const particleCount = Math.floor(PARTICLES_PER_EXPLOSION * size);
    const config = EXPLOSION_CONFIG;

    for (let i = 0; i < particleCount; i++) {
        // Random particle size based on explosion size
        const pSize = config.minSize + Math.random() * (config.maxSize - config.minSize) * size;
        const geom = new THREE.SphereGeometry(pSize, 6, 6);

        // Fire color with random hue variation (orange to yellow)
        const hue = config.baseHue + Math.random() * config.hueRange;
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, 1, 0.5 + Math.random() * 0.3),
            transparent: true,
            opacity: 1
        });

        const particle = new THREE.Mesh(geom, mat);
        particle.position.set(
            x,
            config.heightBase + Math.random() * config.heightRange,
            y
        );

        // Random direction and speed
        const angle = Math.random() * Math.PI * 2;
        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed) * size;

        const particleData = {
            mesh: particle,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: config.minLife + Math.random() * (config.maxLife - config.minLife)
        };

        particlesArray.push(particleData);
        scene.add(particle);
    }
}

/**
 * Create a small spark effect (used for beam hits)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Array} particlesArray - Array to store particle references
 */
export function createSpark(x, y, scene, particlesArray) {
    createExplosion(x, y, 0.1, scene, particlesArray);
}

/**
 * Create a hit effect when projectile impacts
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size multiplier (0.2-0.8 typical)
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Array} particlesArray - Array to store particle references
 */
export function createHitEffect(x, y, size, scene, particlesArray) {
    createExplosion(x, y, size, scene, particlesArray);
}

// ============================================================
// PARTICLE UPDATE
// ============================================================

/**
 * Update a single particle's position, opacity, and scale
 * @param {object} particle - Particle object with mesh, vx, vy, life
 * @param {number} dt - Delta time in seconds
 * @returns {boolean} True if particle is still alive
 */
export function updateParticle(particle, dt) {
    // Update position
    particle.mesh.position.x += particle.vx * dt;
    particle.mesh.position.z += particle.vy * dt;

    // Decrease life
    particle.life -= dt;

    // Update visual properties
    particle.mesh.material.opacity = Math.max(0, particle.life);
    particle.mesh.scale.multiplyScalar(PARTICLE_DECAY.shrinkRate);

    return particle.life > 0;
}

/**
 * Update all particles in array, removing dead ones
 * @param {Array} particlesArray - Array of particle objects
 * @param {number} dt - Delta time in seconds
 * @param {THREE.Scene} scene - Three.js scene for removal
 * @returns {Array} Filtered array with only living particles
 */
export function updateParticles(particlesArray, dt, scene) {
    if (!Array.isArray(particlesArray)) return [];
    return particlesArray.filter(p => {
        const alive = updateParticle(p, dt);
        if (!alive) {
            scene.remove(p.mesh);
        }
        return alive;
    });
}

/**
 * Remove a particle from scene and dispose resources
 * @param {object} particle - Particle object
 * @param {THREE.Scene} scene - Three.js scene
 */
export function removeParticle(particle, scene) {
    scene.remove(particle.mesh);
    if (particle.mesh.geometry) {
        particle.mesh.geometry.dispose();
    }
    if (particle.mesh.material) {
        particle.mesh.material.dispose();
    }
}

/**
 * Clear all particles from scene
 * @param {Array} particlesArray - Array of particle objects
 * @param {THREE.Scene} scene - Three.js scene
 */
export function clearAllParticles(particlesArray, scene) {
    particlesArray.forEach(p => removeParticle(p, scene));
    particlesArray.length = 0;
}

// ============================================================
// TRAIL EFFECTS
// ============================================================

/**
 * Engine trail configuration
 */
export const TRAIL_CONFIG = {
    color: 0x00aaff,
    opacity: 0.6,
    size: 3,
    life: 0.3,
    blending: THREE.AdditiveBlending
};

/**
 * Create an engine trail particle at position
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} vx - Inherited X velocity from ship
 * @param {number} vy - Inherited Y velocity from ship
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Array} particlesArray - Array to store particle references
 * @param {number} color - Optional trail color override
 */
export function createTrailParticle(x, y, vx, vy, scene, particlesArray, color = TRAIL_CONFIG.color) {
    const geom = new THREE.SphereGeometry(TRAIL_CONFIG.size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: TRAIL_CONFIG.opacity,
        blending: TRAIL_CONFIG.blending
    });

    const particle = new THREE.Mesh(geom, mat);
    particle.position.set(x, 4, y);

    particlesArray.push({
        mesh: particle,
        vx: -vx * 0.3, // Trail moves opposite to ship direction
        vy: -vy * 0.3,
        life: TRAIL_CONFIG.life
    });

    scene.add(particle);
}

// ============================================================
// SHIELD HIT EFFECTS
// ============================================================

/**
 * Shield hit effect configuration
 */
export const SHIELD_HIT_CONFIG = {
    color: 0x00ffff,
    particleCount: 8,
    speed: 50,
    life: 0.2,
    size: 1.5
};

/**
 * Create a shield hit effect (blue particles in a ring)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Array} particlesArray - Array to store particle references
 */
export function createShieldHitEffect(x, y, scene, particlesArray) {
    const config = SHIELD_HIT_CONFIG;

    for (let i = 0; i < config.particleCount; i++) {
        const angle = (i / config.particleCount) * Math.PI * 2;
        const geom = new THREE.SphereGeometry(config.size, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particle = new THREE.Mesh(geom, mat);
        particle.position.set(x, 5, y);

        particlesArray.push({
            mesh: particle,
            vx: Math.cos(angle) * config.speed,
            vy: Math.sin(angle) * config.speed,
            life: config.life
        });

        scene.add(particle);
    }
}

// ============================================================
// DEBRIS EFFECTS
// ============================================================

/**
 * Debris configuration for destroyed ships
 */
export const DEBRIS_CONFIG = {
    count: 6,
    minSize: 3,
    maxSize: 8,
    speed: 100,
    life: 2.0,
    tumbleSpeed: 5
};

/**
 * Create debris particles when a ship is destroyed
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size multiplier based on ship size
 * @param {number} color - Ship color for debris tinting
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Array} particlesArray - Array to store particle references
 */
export function createDebris(x, y, size, color, scene, particlesArray) {
    const config = DEBRIS_CONFIG;
    const count = Math.floor(config.count * size);

    for (let i = 0; i < count; i++) {
        const pSize = config.minSize + Math.random() * (config.maxSize - config.minSize) * size;
        const geom = new THREE.BoxGeometry(pSize, pSize * 0.5, pSize * 0.3);
        const mat = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.6,
            roughness: 0.4
        });

        const particle = new THREE.Mesh(geom, mat);
        particle.position.set(x, 5, y);

        const angle = Math.random() * Math.PI * 2;
        const speed = config.speed * (0.5 + Math.random() * 0.5) * size;

        particlesArray.push({
            mesh: particle,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: config.life,
            tumbleX: (Math.random() - 0.5) * config.tumbleSpeed,
            tumbleY: (Math.random() - 0.5) * config.tumbleSpeed,
            tumbleZ: (Math.random() - 0.5) * config.tumbleSpeed,
            isDebris: true
        });

        scene.add(particle);
    }
}

/**
 * Update debris particle with tumbling rotation
 * @param {object} debris - Debris particle object
 * @param {number} dt - Delta time in seconds
 * @returns {boolean} True if debris is still alive
 */
export function updateDebris(debris, dt) {
    // Update position
    debris.mesh.position.x += debris.vx * dt;
    debris.mesh.position.z += debris.vy * dt;

    // Tumble rotation
    if (debris.tumbleX !== undefined) {
        debris.mesh.rotation.x += debris.tumbleX * dt;
        debris.mesh.rotation.y += debris.tumbleY * dt;
        debris.mesh.rotation.z += debris.tumbleZ * dt;
    }

    // Decrease life
    debris.life -= dt;

    // Fade out near end of life
    if (debris.life < 0.5) {
        debris.mesh.material.opacity = debris.life * 2;
        debris.mesh.material.transparent = true;
    }

    return debris.life > 0;
}

// ============================================================
// ADDITIONAL PARTICLE FUNCTIONS (for main.js compatibility)
// ============================================================

// Internal particle tracking
let allParticles = [];

/**
 * Create muzzle flash effect
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} angle - Direction angle
 * @param {object} scene - Three.js scene
 * @returns {object} Muzzle flash particle
 */
export function createMuzzleFlash(x, y, angle, scene) {
    const flash = {
        x, y, angle,
        type: 'flash',
        life: 0.1,
        size: 15,
        color: 0xffff00
    };
    allParticles.push(flash);
    return flash;
}

/**
 * Create engine trail particles
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} angle - Direction angle
 * @param {number} color - Trail color
 * @param {object} scene - Three.js scene
 * @returns {object} Trail particle
 */
export function createEngineTrail(x, y, angle, color = 0x00ffff, scene = null) {
    const trail = {
        x, y, angle,
        type: 'trail',
        life: 0.5,
        size: 5,
        color
    };
    allParticles.push(trail);
    return trail;
}

/**
 * Create shield impact effect
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} angle - Impact angle
 * @param {object} scene - Three.js scene
 * @returns {object} Shield impact particle
 */
export function createShieldImpact(x, y, angle, scene) {
    const impact = {
        x, y, angle,
        type: 'shield',
        life: 0.3,
        size: 30,
        color: 0x00ffff
    };
    allParticles.push(impact);
    return impact;
}

/**
 * Clear all particles (alias for clearAllParticles)
 * @param {object} scene - Three.js scene
 */
export function clearParticles(scene) {
    clearAllParticles(allParticles, scene);
    allParticles = [];
}

/**
 * Get count of active particles
 * @returns {number} Number of active particles
 */
export function getActiveParticleCount() {
    return allParticles.length;
}
