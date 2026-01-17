/**
 * Space Armada - Texture Generation Module
 * EV:O style procedural textures for ship hulls and effects
 */

import * as THREE from 'three';

// Cache for generated textures to avoid recreation
const textureCache = {};

/**
 * UE/Human Military Hull Texture - Industrial, gunmetal with panel lines
 */
export function createUEHullTexture() {
    if (textureCache.ueHull) return textureCache.ueHull;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base gunmetal gray
    const baseGradient = ctx.createLinearGradient(0, 0, 512, 512);
    baseGradient.addColorStop(0, '#4a5568');
    baseGradient.addColorStop(0.5, '#3d4654');
    baseGradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Major panel lines (darker recessed lines)
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 3;
    // Horizontal major panels
    [64, 192, 320, 448].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
    });
    // Vertical major panels
    [128, 256, 384].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
    });

    // Minor panel lines (subtle)
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    for (let i = 32; i < 512; i += 32) {
        if (i % 64 !== 0) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
        }
    }

    // Panel edge highlights (lighter edge on one side)
    ctx.strokeStyle = '#5a6577';
    ctx.lineWidth = 1;
    [65, 193, 321, 449].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
    });

    // Rivets at panel intersections
    ctx.fillStyle = '#5a6577';
    for (let x = 64; x < 512; x += 64) {
        for (let y = 64; y < 512; y += 64) {
            // Rivet cluster
            ctx.beginPath();
            ctx.arc(x - 8, y - 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 8, y - 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 8, y + 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 8, y + 8, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Blue accent stripes (UE signature)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 180, 512, 4);
    ctx.fillRect(0, 328, 512, 4);

    // Wear marks and battle damage
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const w = 10 + Math.random() * 30;
        const h = 2 + Math.random() * 8;
        ctx.fillRect(x, y, w, h);
    }

    // Scorch marks
    ctx.fillStyle = 'rgba(40,30,20,0.2)';
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, 15 + Math.random() * 25, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.ueHull = texture;
    return texture;
}

/**
 * Crescent/Gadzair Crystal Texture - Organic, gemstone-like
 */
export function createCrescentTexture() {
    if (textureCache.crescent) return textureCache.crescent;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep purple base with gradient
    const baseGradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
    baseGradient.addColorStop(0, '#6b21a8');
    baseGradient.addColorStop(0.5, '#4c1d95');
    baseGradient.addColorStop(1, '#2e1065');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Crystal facet patterns
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    // Organic curved lines
    for (let i = 0; i < 12; i++) {
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(
            startX + 100 - Math.random() * 200, startY + 50,
            startX + 50 - Math.random() * 100, startY + 150,
            startX + 80 - Math.random() * 160, startY + 200
        );
        ctx.stroke();
    }

    // Crystal highlight spots
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 10 + Math.random() * 30;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0.6)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(109, 40, 217, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    // Teal accent crystals
    ctx.fillStyle = 'rgba(20, 184, 166, 0.4)';
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x + 10, y);
        ctx.lineTo(x, y + 15);
        ctx.lineTo(x - 10, y);
        ctx.closePath();
        ctx.fill();
    }

    // Inner glow effect
    const innerGlow = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    innerGlow.addColorStop(0, 'rgba(196, 181, 253, 0.2)');
    innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.crescent = texture;
    return texture;
}

/**
 * Voinian Heavy Armor Texture - Brown/rust, heavy plating
 */
export function createVoinianTexture() {
    if (textureCache.voinian) return textureCache.voinian;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rust brown base
    const baseGradient = ctx.createLinearGradient(0, 0, 512, 512);
    baseGradient.addColorStop(0, '#78350f');
    baseGradient.addColorStop(0.3, '#92400e');
    baseGradient.addColorStop(0.7, '#713f12');
    baseGradient.addColorStop(1, '#451a03');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Heavy armor plate segments (thick lines)
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 6;
    // Horizontal heavy plates
    [85, 170, 255, 340, 425].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
    });
    // Vertical heavy plates (offset pattern)
    for (let row = 0; row < 6; row++) {
        const offset = (row % 2) * 64;
        for (let x = offset; x < 512; x += 128) {
            ctx.beginPath();
            ctx.moveTo(x, row * 85);
            ctx.lineTo(x, (row + 1) * 85);
            ctx.stroke();
        }
    }

    // Plate edge highlights
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2;
    [87, 172, 257, 342, 427].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
    });

    // Heavy bolt patterns
    ctx.fillStyle = '#44403c';
    for (let x = 32; x < 512; x += 64) {
        for (let y = 42; y < 512; y += 85) {
            // Large hexagonal bolts
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const bx = x + Math.cos(angle) * 6;
                const by = y + Math.sin(angle) * 6;
                if (i === 0) ctx.moveTo(bx, by);
                else ctx.lineTo(bx, by);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    // Rust and corrosion effects
    ctx.fillStyle = 'rgba(180, 83, 9, 0.3)';
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const w = 20 + Math.random() * 60;
        const h = 10 + Math.random() * 40;
        ctx.fillRect(x, y, w, h);
    }

    // Dark corrosion spots
    ctx.fillStyle = 'rgba(28, 25, 23, 0.4)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, 8 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.voinian = texture;
    return texture;
}

/**
 * Katuri Texture - Angular, aggressive, red/black
 */
export function createKaturiTexture() {
    if (textureCache.katuri) return textureCache.katuri;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark red-black base
    const baseGradient = ctx.createLinearGradient(0, 0, 512, 512);
    baseGradient.addColorStop(0, '#450a0a');
    baseGradient.addColorStop(0.5, '#7f1d1d');
    baseGradient.addColorStop(1, '#1c1917');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Angular slash patterns
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const x1 = i * 64;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x1 + 256, 512);
        ctx.stroke();
    }

    // Reverse diagonal
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const x1 = 512 - i * 64;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x1 - 256, 512);
        ctx.stroke();
    }

    // Red energy veins
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 5;
    for (let i = 0; i < 15; i++) {
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX, y = startY;
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 80;
            y += Math.random() * 60;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Hot spots/vents
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.5, 'rgba(153, 27, 27, 0.4)');
        gradient.addColorStop(1, 'rgba(69, 10, 10, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 25, y - 25, 50, 50);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.katuri = texture;
    return texture;
}

/**
 * Pirate Texture - Mismatched, cobbled together
 */
export function createPirateTexture() {
    if (textureCache.pirate) return textureCache.pirate;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Patchy multi-colored base
    const colors = ['#374151', '#4b5563', '#6b7280', '#1f2937', '#52525b'];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(x * 64, y * 64, 64, 64);
        }
    }

    // Welded seams (irregular)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    for (let i = 0; i < 15; i++) {
        const x1 = Math.random() * 512;
        const y1 = Math.random() * 512;
        const x2 = x1 + (Math.random() - 0.5) * 150;
        const y2 = y1 + (Math.random() - 0.5) * 150;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Weld splatter
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Patches and repairs
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 400 + 50;
        const y = Math.random() * 400 + 50;
        const w = 30 + Math.random() * 50;
        const h = 20 + Math.random() * 40;
        ctx.strokeRect(x, y, w, h);
        // Cross rivets
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(x + 5, y + 5, 3, 0, Math.PI * 2);
        ctx.arc(x + w - 5, y + 5, 3, 0, Math.PI * 2);
        ctx.arc(x + 5, y + h - 5, 3, 0, Math.PI * 2);
        ctx.arc(x + w - 5, y + h - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Heavy damage and burns
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, 5 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Orange warning stripes
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, 100, 512, 8);
    ctx.fillRect(0, 400, 512, 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.pirate = texture;
    return texture;
}

/**
 * Miranu Texture - Peaceful trader, gold/bronze
 */
export function createMiranuTexture() {
    if (textureCache.miranu) return textureCache.miranu;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm golden base
    const baseGradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
    baseGradient.addColorStop(0, '#fcd34d');
    baseGradient.addColorStop(0.5, '#d97706');
    baseGradient.addColorStop(1, '#92400e');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Smooth curved panel lines
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const y = i * 85 + 42;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(256, y + 20 * Math.sin(i), 512, y);
        ctx.stroke();
    }

    // Decorative circular patterns
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const x = 64 + i * 56;
        const y = 256 + Math.sin(i * 0.8) * 100;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Polished highlights
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
        gradient.addColorStop(0, 'rgba(254, 243, 199, 0.5)');
        gradient.addColorStop(1, 'rgba(253, 230, 138, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 40, y - 40, 80, 80);
    }

    // Cargo bay hatches
    ctx.fillStyle = '#78350f';
    for (let i = 0; i < 4; i++) {
        const x = 80 + i * 100;
        ctx.fillRect(x, 400, 60, 40);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x + 5, 405, 50, 30);
        ctx.fillStyle = '#78350f';
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.miranu = texture;
    return texture;
}

/**
 * Alien/Mystery Texture - Otherworldly green
 */
export function createAlienTexture() {
    if (textureCache.alien) return textureCache.alien;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep space green-black
    const baseGradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
    baseGradient.addColorStop(0, '#065f46');
    baseGradient.addColorStop(0.5, '#064e3b');
    baseGradient.addColorStop(1, '#022c22');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Bioluminescent patterns
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(256, 256, 50 + i * 30, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Organic vein network
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        const startAngle = Math.random() * Math.PI * 2;
        const startR = 50 + Math.random() * 150;
        const startX = 256 + Math.cos(startAngle) * startR;
        const startY = 256 + Math.sin(startAngle) * startR;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX, y = startY;
        for (let j = 0; j < 8; j++) {
            x += (Math.random() - 0.5) * 60;
            y += (Math.random() - 0.5) * 60;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Glowing nodes
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        gradient.addColorStop(0, '#6ee7b7');
        gradient.addColorStop(0.5, '#10b981');
        gradient.addColorStop(1, 'rgba(6, 95, 70, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.alien = texture;
    return texture;
}

/**
 * Engine glow texture with customizable color
 */
export function createEngineGlowTexture(color1 = '#ffffff', color2 = '#00ffff', color3 = '#0088ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.2, color2);
    gradient.addColorStop(0.5, color3);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

/**
 * Cockpit glass texture
 */
export function createCockpitTexture() {
    if (textureCache.cockpit) return textureCache.cockpit;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Dark tinted glass
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 150);
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(50, 100, 150, 0.5)');
    gradient.addColorStop(1, 'rgba(20, 40, 60, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Reflection highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(90, 90, 40, 20, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Frame lines
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(256, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 256);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    textureCache.cockpit = texture;
    return texture;
}

/**
 * Legacy function for backwards compatibility
 */
export function createHullTexture() {
    return createUEHullTexture();
}

/**
 * Clear the texture cache (useful for memory management)
 */
export function clearTextureCache() {
    for (const key in textureCache) {
        if (textureCache[key] && textureCache[key].dispose) {
            textureCache[key].dispose();
        }
        delete textureCache[key];
    }
}

/**
 * Get a texture from cache by key
 */
export function getTextureFromCache(key) {
    return textureCache[key] || null;
}

// ============================================================
// ADDITIONAL TEXTURE FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Create a shield effect texture
 * @param {string} color1 - Primary color (hex string)
 * @param {string} color2 - Secondary color (hex string)
 * @returns {HTMLCanvasElement} Canvas with shield texture
 */
export function createShieldTexture(color1 = '#00ffff', color2 = '#0088ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Create radial gradient for shield bubble effect
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.7, color2 + '40');
    gradient.addColorStop(0.9, color1 + '80');
    gradient.addColorStop(1, color1);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return canvas;
}

/**
 * Create an explosion effect texture
 * @param {string} color1 - Inner color (hex string)
 * @param {string} color2 - Outer color (hex string)
 * @returns {HTMLCanvasElement} Canvas with explosion texture
 */
export function createExplosionTexture(color1 = '#ffffff', color2 = '#ff6600') {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Create radial gradient for explosion fireball
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.3, '#ffff00');
    gradient.addColorStop(0.6, color2);
    gradient.addColorStop(0.9, '#ff0000');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
}
