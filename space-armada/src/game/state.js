// Space Armada - Game State Module
// Extracted from index.html for modularization
// Contains player state, game state, and faction state management

// ============================================================
// PLAYER STATE
// ============================================================

/**
 * Default player state values
 * Used for initialization and reset
 */
export const DEFAULT_PLAYER_STATE = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    rotation: -Math.PI / 2,
    hull: 100, maxHull: 100,
    shields: 50, maxShields: 50,
    energy: 100, maxEnergy: 100,
    credits: 0,
    kills: 0,
    missiles: 5,
    maxMissiles: 5,
    sectorsCleared: 0,
    currentSector: { x: 0, y: 0 },
    shipLevel: 1,
    lockedTarget: null,
    upgrades: {
        hull: 0,
        shields: 0,
        energy: 0,
        thrust: 0,
        primaryDamage: 0,
        turretDamage: 0,
        missileDamage: 0,
        shieldRegen: 0
    }
};

/**
 * Current player state object
 * Mutable state that tracks player progress
 */
export let playerState = { ...DEFAULT_PLAYER_STATE };

/**
 * Reset player state to defaults
 * Performs deep copy to handle nested objects
 */
export function resetPlayerState() {
    playerState = {
        ...DEFAULT_PLAYER_STATE,
        currentSector: { ...DEFAULT_PLAYER_STATE.currentSector },
        upgrades: { ...DEFAULT_PLAYER_STATE.upgrades }
    };
    return playerState;
}

/**
 * Get current player state
 * @returns {object} Current player state
 */
export function getPlayerState() {
    return playerState;
}

/**
 * Update player state with partial values
 * @param {object} updates - Object with state properties to update
 */
export function updatePlayerState(updates) {
    Object.assign(playerState, updates);
}

/**
 * Update player position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function setPlayerPosition(x, y) {
    playerState.x = x;
    playerState.y = y;
}

/**
 * Update player velocity
 * @param {number} vx - X velocity
 * @param {number} vy - Y velocity
 */
export function setPlayerVelocity(vx, vy) {
    playerState.vx = vx;
    playerState.vy = vy;
}

/**
 * Set player rotation
 * @param {number} rotation - Rotation in radians
 */
export function setPlayerRotation(rotation) {
    playerState.rotation = rotation;
}

/**
 * Add credits to player
 * @param {number} amount - Credits to add
 */
export function addCredits(amount) {
    playerState.credits += amount;
}

/**
 * Spend credits if player has enough
 * @param {number} amount - Credits to spend
 * @returns {boolean} True if purchase succeeded
 */
export function spendCredits(amount) {
    if (playerState.credits >= amount) {
        playerState.credits -= amount;
        return true;
    }
    return false;
}

/**
 * Increment kill count
 */
export function incrementKills() {
    playerState.kills++;
}

/**
 * Damage player (applies to shields first, then hull)
 * @param {number} amount - Damage amount
 * @returns {boolean} True if player is still alive
 */
export function damagePlayer(amount) {
    // Shields absorb damage first
    if (playerState.shields > 0) {
        const shieldDamage = Math.min(playerState.shields, amount);
        playerState.shields -= shieldDamage;
        amount -= shieldDamage;
    }
    // Remaining damage goes to hull
    if (amount > 0) {
        playerState.hull -= amount;
    }
    return playerState.hull > 0;
}

/**
 * Heal player hull
 * @param {number} amount - Amount to heal
 */
export function healPlayer(amount) {
    playerState.hull = Math.min(playerState.maxHull, playerState.hull + amount);
}

/**
 * Recharge player shields
 * @param {number} amount - Amount to recharge
 */
export function rechargeShields(amount) {
    playerState.shields = Math.min(playerState.maxShields, playerState.shields + amount);
}

/**
 * Check if player is alive
 * @returns {boolean}
 */
export function isPlayerAlive() {
    return playerState.hull > 0;
}

// ============================================================
// BASE STATS (For computing derived stats from upgrades)
// ============================================================

/**
 * Base ship statistics before upgrades
 */
export const BASE_STATS = {
    thrust: 250,
    maxSpeed: 350,
    rotationSpeed: 2.5,
    primaryFireRate: 0.15,
    primaryDamage: 15,
    turretFireRate: 0.25,
    turretDamage: 12,
    missileDamage: 80,
    shieldRegen: 3
};

/**
 * Calculate current stats with upgrades applied
 * @returns {object} Computed stats object
 */
export function getStats() {
    const rapidBonus = (playerState.upgrades.rapidFire || 0) * 0.02;
    const homingBonus = (playerState.upgrades.homingStrength || 0) * 20;
    return {
        thrust: BASE_STATS.thrust + (playerState.upgrades.thrust || 0) * 40,
        maxSpeed: BASE_STATS.maxSpeed + (playerState.upgrades.thrust || 0) * 30,
        rotationSpeed: BASE_STATS.rotationSpeed,
        primaryFireRate: Math.max(0.06, BASE_STATS.primaryFireRate - (playerState.upgrades.primaryDamage || 0) * 0.01 - rapidBonus),
        primaryDamage: BASE_STATS.primaryDamage + (playerState.upgrades.primaryDamage || 0) * 5,
        turretFireRate: Math.max(0.10, BASE_STATS.turretFireRate - (playerState.upgrades.turretDamage || 0) * 0.015 - rapidBonus),
        turretDamage: BASE_STATS.turretDamage + (playerState.upgrades.turretDamage || 0) * 4,
        missileDamage: BASE_STATS.missileDamage + (playerState.upgrades.missileDamage || 0) * 25 + homingBonus,
        shieldRegen: BASE_STATS.shieldRegen + (playerState.upgrades.shieldRegen || 0) * 1.5
    };
}

// ============================================================
// FACTION STATE
// ============================================================

/**
 * Default faction state values
 */
export const DEFAULT_FACTION_STATE = {
    reputation: {},  // Will be populated with faction IDs and reputation values
    discoveredFactions: new Set(['terranConfederacy', 'pirates']),  // Start with basic knowledge
    activeStorylines: new Set(),
    completedStorylines: new Set(),
    currentMission: null,
    availableMissions: [],
    missionProgress: {},
    currentEncounter: null,
    crystallizedPlasma: 0  // Special resource
};

/**
 * Current faction state
 */
export let factionState = {
    ...DEFAULT_FACTION_STATE,
    reputation: {},
    discoveredFactions: new Set(['terranConfederacy', 'pirates']),
    activeStorylines: new Set(),
    completedStorylines: new Set()
};

/**
 * Reset faction state to defaults
 */
export function resetFactionState() {
    factionState = {
        ...DEFAULT_FACTION_STATE,
        reputation: {},
        discoveredFactions: new Set(['terranConfederacy', 'pirates']),
        activeStorylines: new Set(),
        completedStorylines: new Set(),
        availableMissions: [],
        missionProgress: {}
    };
    return factionState;
}

/**
 * Get current faction state
 * @returns {object}
 */
export function getFactionState() {
    return factionState;
}

/**
 * Get reputation with a specific faction
 * @param {string} factionId - Faction identifier
 * @returns {number} Reputation value (-100 to 100)
 */
export function getReputation(factionId) {
    return factionState.reputation[factionId] || 0;
}

/**
 * Set reputation for a faction
 * @param {string} factionId - Faction identifier
 * @param {number} value - Reputation value
 */
export function setReputation(factionId, value) {
    factionState.reputation[factionId] = Math.max(-100, Math.min(100, value));
}

/**
 * Modify reputation by a delta amount
 * @param {string} factionId - Faction identifier
 * @param {number} delta - Amount to add (can be negative)
 */
export function modifyReputation(factionId, delta) {
    const current = factionState.reputation[factionId] || 0;
    setReputation(factionId, current + delta);
}

/**
 * Get faction attitude based on reputation
 * @param {string} factionId - Faction identifier
 * @returns {string} Attitude: 'allied', 'friendly', 'neutral', 'unfriendly', or 'hostile'
 */
export function getFactionAttitude(factionId) {
    const rep = getReputation(factionId);
    if (rep >= 50) return 'allied';
    if (rep >= 20) return 'friendly';
    if (rep >= -20) return 'neutral';
    if (rep >= -50) return 'unfriendly';
    return 'hostile';
}

/**
 * Check if a faction has been discovered
 * @param {string} factionId - Faction identifier
 * @returns {boolean}
 */
export function isFactionDiscovered(factionId) {
    return factionState.discoveredFactions.has(factionId);
}

/**
 * Discover a new faction
 * @param {string} factionId - Faction identifier
 */
export function discoverFaction(factionId) {
    factionState.discoveredFactions.add(factionId);
}

/**
 * Add crystallized plasma resource
 * @param {number} amount - Amount to add
 */
export function addCrystallizedPlasma(amount) {
    factionState.crystallizedPlasma += amount;
}

// ============================================================
// GAME STATE
// ============================================================

/**
 * Current game running state
 */
export let gameRunning = false;

/**
 * Set game running state
 * @param {boolean} running
 */
export function setGameRunning(running) {
    gameRunning = running;
}

/**
 * Check if game is running
 * @returns {boolean}
 */
export function isGameRunning() {
    return gameRunning;
}

// ============================================================
// GAME CONSTANTS
// ============================================================

/**
 * World and gameplay constants
 */
export const GAME_CONSTANTS = {
    SHIP_SCALE: 0.4,              // Scale down all ships to 40% of original size
    WORLD_CHUNK_SIZE: 1500,       // Size of procedural generation chunks
    SPAWN_RADIUS: 800,            // How far from player to spawn new content
    DESPAWN_RADIUS: 2000,         // How far before content is removed
    SAFE_SPAWN_RADIUS: 400,       // Enemies spawn at least this far from player
    MAX_ENEMIES: 15,              // Maximum enemies at any time
    MAX_STATIONS: 3,              // Maximum stations at any time
    SECTOR_SIZE: 1500             // Keep for compatibility with some functions
};

// ============================================================
// FULL STATE RESET
// ============================================================

/**
 * Reset all game state (player, faction, game running)
 */
export function resetAllState() {
    resetPlayerState();
    resetFactionState();
    resetMissionState();
    setGameRunning(false);
}

// ============================================================
// MISSION STATE (for main.js compatibility)
// ============================================================

/**
 * Default mission state
 */
export const DEFAULT_MISSION_STATE = {
    activeMission: null,
    missionProgress: 0,
    missionTarget: null,
    missionReward: 0,
    completedMissions: []
};

/**
 * Current mission state
 */
export let missionState = { ...DEFAULT_MISSION_STATE };

/**
 * Reset mission state
 */
export function resetMissionState() {
    missionState = { ...DEFAULT_MISSION_STATE };
}

// ============================================================
// ADDITIONAL STATE FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Update faction reputation (alias for modifyReputation)
 * @param {string} factionId - Faction identifier
 * @param {number} delta - Change in reputation
 */
export function updateFactionReputation(factionId, delta) {
    modifyReputation(factionId, delta);
}

/**
 * Get faction reputation (alias for getReputation)
 * @param {string} factionId - Faction identifier
 * @returns {number} Reputation value
 */
export function getFactionReputation(factionId) {
    return getReputation(factionId);
}
