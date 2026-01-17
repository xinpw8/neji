// Space Armada - HUD/UI Module
// Extracted from index.html for modularization
// Contains HUD updates, minimap rendering, status displays, and messaging

// ============================================================
// DOM ELEMENT DEPENDENCIES
// ============================================================
// This module requires the following DOM elements to be present:
//
// HUD Bars & Values:
//   - #hullVal, #hullBar       - Hull health display
//   - #shieldVal, #shieldBar   - Shield display
//   - #energyVal, #energyBar   - Energy display
//   - #credits                 - Credits counter
//   - #kills                   - Kill counter
//   - #missiles                - Missile counter
//   - #combatRating            - Combat rating display
//
// Sector Info:
//   - #sectorNum               - Current sector coordinates
//   - #enemyCount              - Enemy count in sector
//   - #threatLevel             - Threat level indicator
//
// Weapon Info:
//   - #weaponInfo              - Weapon info container
//   - #weaponInfo .weapon-name - Current weapon name
//   - #weaponInfo .weapon-type - Current weapon type
//
// Heading Indicator:
//   - #headingCanvas           - Canvas for heading compass
//
// Minimap/Radar:
//   - #minimap                 - Minimap container
//   - #minimapCanvas           - Canvas for radar display
//
// Target Panel:
//   - #evTargetPanel           - Target info panel
//   - #targetName              - Target vessel name
//   - #targetFaction           - Target faction name
//   - #targetHullVal           - Target hull percentage
//   - #targetShieldVal         - Target shield percentage
//   - #targetHullBar           - Target hull bar
//   - #targetShieldBar         - Target shield bar
//   - #targetDistance          - Distance to target
//   - #targetViewFront         - Front wireframe canvas
//   - #targetViewSide          - Side wireframe canvas
//
// Messages:
//   - #message                 - Floating message element
//
// Game Over:
//   - #finalSectors            - Final sectors display
//   - #finalKills              - Final kills display
//   - #finalCredits            - Final credits display
//   - #finalLevel              - Final ship level display
//   - #gameOverScreen          - Game over overlay
//
// Docking:
//   - #dockingIndicator        - Docking proximity indicator

// ============================================================
// COMBAT RATINGS
// ============================================================

/**
 * Combat Rating thresholds (from EV bible)
 * Determines player combat rank based on kills
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
 * @returns {object} Combat rating object with kills, name, color
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
// MESSAGE DISPLAY
// ============================================================

/**
 * Show a floating message on screen
 * @param {string} text - Message text to display
 * @param {number} duration - Duration in ms (default 2000)
 */
export function showMessage(text, duration = 2000) {
    const msg = document.getElementById('message');
    if (!msg) return;
    msg.textContent = text;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), duration);
}

// ============================================================
// MAIN HUD UPDATE
// ============================================================

/**
 * Update main HUD elements (health bars, credits, kills, etc)
 * @param {object} playerState - Current player state object
 */
export function updateUI(playerState) {
    // Hull, shield, energy values
    const hullVal = document.getElementById('hullVal');
    const shieldVal = document.getElementById('shieldVal');
    const energyVal = document.getElementById('energyVal');

    if (hullVal) hullVal.textContent = `${Math.ceil(playerState.hull)}/${playerState.maxHull}`;
    if (shieldVal) shieldVal.textContent = `${Math.ceil(playerState.shields)}/${playerState.maxShields}`;
    if (energyVal) energyVal.textContent = `${Math.ceil(playerState.energy)}/${playerState.maxEnergy}`;

    // Credits and kills
    const creditsEl = document.getElementById('credits');
    const killsEl = document.getElementById('kills');
    const missilesEl = document.getElementById('missiles');

    if (creditsEl) creditsEl.textContent = playerState.credits;
    if (killsEl) killsEl.textContent = playerState.kills;
    if (missilesEl) missilesEl.textContent = playerState.missiles;

    // Health bars
    const hullBar = document.getElementById('hullBar');
    const shieldBar = document.getElementById('shieldBar');
    const energyBar = document.getElementById('energyBar');

    if (hullBar) hullBar.style.width = (playerState.hull / playerState.maxHull * 100) + '%';
    if (shieldBar) shieldBar.style.width = (playerState.shields / playerState.maxShields * 100) + '%';
    if (energyBar) energyBar.style.width = (playerState.energy / playerState.maxEnergy * 100) + '%';

    // Combat rating
    const combatRating = getCombatRating(playerState.kills);
    const ratingElement = document.getElementById('combatRating');
    if (ratingElement) {
        ratingElement.textContent = combatRating.name;
        ratingElement.style.color = combatRating.color;
    }
}

// ============================================================
// SECTOR INFO UPDATE
// ============================================================

/**
 * Update sector information display
 * @param {object} playerState - Current player state
 * @param {Array} enemies - Array of enemy objects
 */
export function updateSectorInfo(playerState, enemies) {
    const sectorNum = document.getElementById('sectorNum');
    const enemyCount = document.getElementById('enemyCount');
    const threatLevel = document.getElementById('threatLevel');

    if (sectorNum) {
        sectorNum.textContent = `${playerState.currentSector.x}-${playerState.currentSector.y}`;
    }

    if (enemyCount) {
        enemyCount.textContent = enemies.filter(e => e.health > 0).length;
    }

    // Calculate threat based on distance from origin
    const difficulty = Math.abs(playerState.currentSector.x) + Math.abs(playerState.currentSector.y);
    let threat = 'LOW';
    let color = '#0f0';
    if (difficulty >= 2) { threat = 'MEDIUM'; color = '#ff0'; }
    if (difficulty >= 4) { threat = 'HIGH'; color = '#f80'; }
    if (difficulty >= 6) { threat = 'EXTREME'; color = '#f00'; }

    if (threatLevel) {
        threatLevel.textContent = threat;
        threatLevel.style.color = color;
    }
}

// ============================================================
// WEAPON INFO UPDATE
// ============================================================

/**
 * Weapon names for display
 */
const WEAPON_NAMES = ['PULSE CANNON', 'SPREAD SHOT', 'BEAM LASER', 'HEAVY CANNON'];

/**
 * Weapon type descriptions
 */
const WEAPON_TYPES = ['PRIMARY - FORWARD MOUNT', 'SPREAD - FORWARD MOUNT', 'CONTINUOUS BEAM', 'HEAVY - FORWARD MOUNT'];

/**
 * Update weapon info display
 * @param {number} currentWeapon - Index of current weapon (0-3)
 */
export function updateWeaponInfo(currentWeapon) {
    const weapon = currentWeapon || 0;
    const nameEl = document.querySelector('#weaponInfo .weapon-name');
    const typeEl = document.querySelector('#weaponInfo .weapon-type');

    if (nameEl) nameEl.textContent = WEAPON_NAMES[weapon];
    if (typeEl) typeEl.textContent = WEAPON_TYPES[weapon];
}

// ============================================================
// HEADING INDICATOR
// ============================================================

/**
 * Update heading indicator compass display
 * @param {CanvasRenderingContext2D} ctx - Canvas context for heading display
 * @param {number} rotation - Player rotation in radians
 */
export function updateHeadingIndicator(ctx, rotation) {
    if (!ctx || typeof ctx.fillRect !== 'function') return;

    const cx = 50, cy = 50;
    const radius = 40;

    // Clear
    ctx.fillStyle = 'rgba(0, 20, 20, 0.9)';
    ctx.fillRect(0, 0, 100, 100);

    // Outer ring
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal direction marks and labels
    ctx.fillStyle = '#0f0';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // N, E, S, W markers
    const directions = [
        { label: 'N', angle: -Math.PI / 2 },
        { label: 'E', angle: 0 },
        { label: 'S', angle: Math.PI / 2 },
        { label: 'W', angle: Math.PI }
    ];

    directions.forEach(dir => {
        const x = cx + Math.cos(dir.angle) * (radius + 8);
        const y = cy + Math.sin(dir.angle) * (radius + 8);
        ctx.fillText(dir.label, x, y);

        // Tick marks
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(dir.angle) * (radius - 5), cy + Math.sin(dir.angle) * (radius - 5));
        ctx.lineTo(cx + Math.cos(dir.angle) * radius, cy + Math.sin(dir.angle) * radius);
        ctx.stroke();
    });

    // Ship direction indicator (arrow pointing where ship is facing)
    const shipAngle = rotation;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(shipAngle + Math.PI / 2);

    // Arrow body
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(0, -30);  // Tip
    ctx.lineTo(-8, 10);  // Left base
    ctx.lineTo(0, 2);    // Inner notch
    ctx.lineTo(8, 10);   // Right base
    ctx.closePath();
    ctx.fill();

    // Arrow outline
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // Center dot
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Heading in degrees (display)
    let headingDeg = Math.round((-rotation * 180 / Math.PI + 90) % 360);
    if (headingDeg < 0) headingDeg += 360;

    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 12px Courier New';
    ctx.fillText(headingDeg + '\u00B0', cx, cy + radius + 20);
}

// ============================================================
// MINIMAP / RADAR
// ============================================================

/**
 * Update minimap/radar display
 * @param {CanvasRenderingContext2D} ctx - Canvas context for minimap
 * @param {object} playerState - Current player state
 * @param {Array} stations - Array of station objects
 * @param {Array} enemies - Array of enemy objects
 * @param {Array} pickups - Array of pickup objects
 * @param {object|null} currentTarget - Currently targeted enemy
 * @param {object} FACTIONS - Faction definitions object
 */
export function updateMinimap(ctx, playerState, stations, enemies, pickups, currentTarget, FACTIONS) {
    if (!ctx || typeof ctx.fillRect !== 'function') return;

    const scale = 0.06; // Adjusted for smaller minimap
    const cx = 70, cy = 70; // Center of 140x140 canvas

    // EV-style dark green background
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, 140, 140);

    // Create circular clipping mask for radar look
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    ctx.clip();

    // Inner darker area
    ctx.fillStyle = '#000800';
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();

    // EV-style radar range rings
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    for (let r = 20; r <= 60; r += 20) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Cross-hairs (scanner grid)
    ctx.strokeStyle = '#002200';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 65);
    ctx.lineTo(cx, cy + 65);
    ctx.moveTo(cx - 65, cy);
    ctx.lineTo(cx + 65, cy);
    ctx.stroke();

    // Stations - wireframe squares
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    stations.forEach(s => {
        const x = cx + (s.x - playerState.x) * scale;
        const y = cy + (s.y - playerState.y) * scale;
        // Check if within radar range
        const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (dist < 65) {
            ctx.strokeRect(x - 4, y - 4, 8, 8);
            // Inner diamond
            ctx.beginPath();
            ctx.moveTo(x, y - 2);
            ctx.lineTo(x + 2, y);
            ctx.lineTo(x, y + 2);
            ctx.lineTo(x - 2, y);
            ctx.closePath();
            ctx.stroke();
        }
    });

    // Enemies - wireframe markers
    enemies.forEach(e => {
        if (e.health <= 0) return;
        const x = cx + (e.x - playerState.x) * scale;
        const y = cy + (e.y - playerState.y) * scale;
        const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (dist > 65) return;  // Outside radar range

        // Use faction color or threat color
        if (e.faction && FACTIONS[e.faction]) {
            ctx.strokeStyle = FACTIONS[e.faction].color;
        } else {
            ctx.strokeStyle = e.type === 'boss' ? '#ff00ff' : e.type === 'heavy' ? '#ff8800' : '#ff4444';
        }
        ctx.lineWidth = 1.5;

        const size = e.type === 'boss' ? 5 : e.type === 'heavy' ? 4 : 3;

        // Wireframe diamond marker
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.stroke();

        // Highlight current target
        if (currentTarget === e) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    });

    // Pickups - small wireframe crosses
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    pickups.forEach(p => {
        const x = cx + (p.x - playerState.x) * scale;
        const y = cy + (p.y - playerState.y) * scale;
        const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (dist > 65) return;

        ctx.beginPath();
        ctx.moveTo(x - 2, y);
        ctx.lineTo(x + 2, y);
        ctx.moveTo(x, y - 2);
        ctx.lineTo(x, y + 2);
        ctx.stroke();
    });

    // Player - wireframe ship marker
    ctx.restore();  // Remove clip
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerState.rotation + Math.PI / 2);

    // Outer wireframe (smaller for new minimap)
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.stroke();

    // Inner fill for visibility
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Radar range outer ring
    ctx.strokeStyle = '#00aa00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    ctx.stroke();
}

// ============================================================
// TARGET PANEL
// ============================================================

/**
 * Target type display names
 */
const TARGET_TYPE_NAMES = {
    'fighter': 'Light Fighter',
    'heavy': 'Heavy Cruiser',
    'boss': 'Capital Ship',
    'freighter': 'Freighter',
    'courier': 'Courier'
};

/**
 * Update target panel with current target info
 * @param {object|null} currentTarget - Currently targeted enemy
 * @param {object} playerState - Current player state
 * @param {object} FACTIONS - Faction definitions object
 * @returns {boolean} True if target is valid, false if cleared
 */
export function updateTargetPanel(currentTarget, playerState, FACTIONS) {
    const panel = document.getElementById('evTargetPanel');

    if (!currentTarget || currentTarget.destroyed || (currentTarget.health <= 0 && !currentTarget.disabled)) {
        if (panel) panel.style.display = 'none';
        return false;
    }

    if (panel) panel.style.display = 'block';

    // Show disabled status
    let targetName = TARGET_TYPE_NAMES[currentTarget.type] || 'Unknown Vessel';
    if (currentTarget.disabled) {
        targetName += ' [DISABLED]';
    }

    const nameEl = document.getElementById('targetName');
    if (nameEl) nameEl.textContent = targetName;

    const faction = currentTarget.faction ? FACTIONS[currentTarget.faction] : null;
    const factionEl = document.getElementById('targetFaction');
    if (factionEl) {
        factionEl.textContent = faction ? faction.name : 'Unknown Faction';
        factionEl.style.color = faction ? faction.color : '#008800';
    }

    // EV-style shield and armor display
    const shieldPercent = currentTarget.maxShield > 0
        ? Math.ceil((currentTarget.shield / currentTarget.maxShield) * 100) : 0;
    const armorPercent = currentTarget.maxArmor > 0
        ? Math.ceil((currentTarget.armor / currentTarget.maxArmor) * 100) : 0;

    const hullValEl = document.getElementById('targetHullVal');
    const shieldValEl = document.getElementById('targetShieldVal');
    const hullBarEl = document.getElementById('targetHullBar');
    const shieldBarEl = document.getElementById('targetShieldBar');

    if (hullValEl) hullValEl.textContent = armorPercent + '%';
    if (shieldValEl) shieldValEl.textContent = shieldPercent + '%';
    if (hullBarEl) hullBarEl.style.width = armorPercent + '%';
    if (shieldBarEl) shieldBarEl.style.width = shieldPercent + '%';

    // Calculate distance
    const dx = currentTarget.x - playerState.x;
    const dy = currentTarget.y - playerState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const distanceEl = document.getElementById('targetDistance');
    if (distanceEl) distanceEl.textContent = Math.round(distance) + 'm';

    return true;
}

/**
 * Clear target and hide panel
 */
export function clearTarget() {
    const panel = document.getElementById('evTargetPanel');
    if (panel) panel.style.display = 'none';
}

// ============================================================
// GAME OVER SCREEN
// ============================================================

/**
 * Update game over screen with final stats
 * @param {object} playerState - Final player state
 */
export function updateGameOverScreen(playerState) {
    const sectorsEl = document.getElementById('finalSectors');
    const killsEl = document.getElementById('finalKills');
    const creditsEl = document.getElementById('finalCredits');
    const levelEl = document.getElementById('finalLevel');
    const screenEl = document.getElementById('gameOverScreen');
    const crosshairEl = document.getElementById('crosshair');

    if (sectorsEl) sectorsEl.textContent = playerState.distanceTraveled || 0;
    if (killsEl) killsEl.textContent = playerState.kills;
    if (creditsEl) creditsEl.textContent = playerState.credits;
    if (levelEl) levelEl.textContent = playerState.shipLevel;
    if (screenEl) screenEl.style.display = 'flex';
    if (crosshairEl) crosshairEl.style.display = 'none';
}

// ============================================================
// DOCKING INDICATOR
// ============================================================

/**
 * Show docking indicator
 */
export function showDockingIndicator() {
    const indicator = document.getElementById('dockingIndicator');
    if (indicator) indicator.style.display = 'block';
}

/**
 * Hide docking indicator
 */
export function hideDockingIndicator() {
    const indicator = document.getElementById('dockingIndicator');
    if (indicator) indicator.style.display = 'none';
}

// ============================================================
// UI VISIBILITY TOGGLES
// ============================================================

/**
 * Show gameplay UI elements
 */
export function showGameplayUI() {
    const elements = ['ui', 'minimap', 'weaponInfo', 'crosshair'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = id === 'ui' ? 'block' : (id === 'crosshair' ? 'block' : 'block');
    });
}

/**
 * Hide start screen
 */
export function hideStartScreen() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.style.display = 'none';
}

/**
 * Update crosshair position
 * @param {number} x - Screen X position
 * @param {number} y - Screen Y position
 */
export function updateCrosshair(x, y) {
    const crosshair = document.getElementById('crosshair');
    if (crosshair) {
        crosshair.style.left = x + 'px';
        crosshair.style.top = y + 'px';
    }
}

// ============================================================
// ADDITIONAL HUD FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Hide message display
 */
export function hideMessage() {
    const msg = document.getElementById('message');
    if (msg) msg.style.display = 'none';
}

/**
 * Alias for updateWeaponInfo
 */
export function updateWeaponDisplay(weapon) {
    updateWeaponInfo(weapon);
}

/**
 * Show start screen
 */
export function showStartScreen() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.style.display = 'flex';
}

/**
 * Hide gameplay UI
 */
export function hideGameplayUI() {
    const ui = document.getElementById('ui');
    const minimap = document.getElementById('minimap');
    const weaponInfo = document.getElementById('weaponInfo');
    const targetInfo = document.getElementById('targetInfo');

    if (ui) ui.style.display = 'none';
    if (minimap) minimap.style.display = 'none';
    if (weaponInfo) weaponInfo.style.display = 'none';
    if (targetInfo) targetInfo.style.display = 'none';
}

/**
 * Show game over screen
 * @param {object} stats - Game stats (credits, kills, survivalTime)
 */
export function showGameOver(stats) {
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
        gameOverScreen.style.display = 'flex';
        const statsDiv = gameOverScreen.querySelector('.stats');
        if (statsDiv && stats) {
            statsDiv.innerHTML = `
                <p>Credits: ${stats.credits || 0}</p>
                <p>Kills: ${stats.kills || 0}</p>
                <p>Survival Time: ${Math.floor(stats.survivalTime || 0)}s</p>
            `;
        }
    }
}

/**
 * Update health bar display
 * @param {number} current - Current health
 * @param {number} max - Maximum health
 */
export function updateHealthBar(current, max) {
    const bar = document.getElementById('healthBar');
    if (bar) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        bar.style.width = pct + '%';
    }
}

/**
 * Update shield bar display
 * @param {number} current - Current shields
 * @param {number} max - Maximum shields
 */
export function updateShieldBar(current, max) {
    const bar = document.getElementById('shieldBar');
    if (bar) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        bar.style.width = pct + '%';
    }
}

/**
 * Update energy bar display
 * @param {number} current - Current energy
 * @param {number} max - Maximum energy
 */
export function updateEnergyBar(current, max) {
    const bar = document.getElementById('energyBar');
    if (bar) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        bar.style.width = pct + '%';
    }
}

/**
 * Initialize HUD elements
 */
export function initHUD() {
    // Initialize any HUD state
    console.log('HUD initialized');
}

/**
 * Dispose/cleanup HUD
 */
export function disposeHUD() {
    // Clean up HUD elements
    hideMessage();
    clearTarget();
}
