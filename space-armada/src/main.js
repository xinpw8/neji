// Space Armada - Main Entry Point
// Modular version using Vite build system
// This file imports and coordinates all extracted modules

import * as THREE from 'three';

// ============================================================
// DATA MODULES
// ============================================================
import { SHIP_MODELS, SHIP_FACTION_COLORS, MODEL_PATH, FACTION_SHIP_MAPPING } from './data/constants.js';
import { SHIPYARD_DATA, SHIP_CATEGORIES } from './data/ships.js';
import { FACTION_STYLES, getFactionStyle, FACTION_NAMES } from './data/factions.js';

// ============================================================
// GAME STATE
// ============================================================
import {
    playerState,
    resetPlayerState,
    getPlayerState,
    updatePlayerState,
    factionState,
    updateFactionReputation,
    getFactionReputation,
    gameRunning,
    setGameRunning,
    isGameRunning,
    missionState,
    resetMissionState,
    resetAllState,
    GAME_CONSTANTS
} from './game/state.js';

// ============================================================
// GAME LOOP
// ============================================================
import {
    FIXED_TIMESTEP,
    MAX_DELTA_TIME,
    TARGET_FPS,
    calculateDeltaTime,
    getCurrentTime,
    getCurrentTimeSeconds,
    updateFrameStats,
    getCurrentFps,
    startLoop,
    stopLoop,
    pauseLoop,
    resumeLoop,
    isLoopRunning,
    configureLoop,
    registerUpdateCallback,
    unregisterUpdateCallback,
    runCallbacks,
    clearCallbacks,
    createSimpleLoop,
    runSimpleLoop,
    throttle as loopThrottle,
    createRateLimiter,
    createCooldown
} from './game/loop.js';

// ============================================================
// PHYSICS
// ============================================================
import {
    PHYSICS_CONSTANTS,
    applyVelocity,
    applyDrag,
    applyThrust,
    limitSpeed,
    applyNewtonian,
    updateRotation,
    checkCircleCollision,
    checkRectCollision,
    resolveCollision,
    getCollisionNormal,
    applyCollisionResponse,
    calculateImpact,
    isInRange,
    getDistanceSquared
} from './game/physics.js';

// ============================================================
// AI SYSTEM
// ============================================================
import {
    AI_BEHAVIORS,
    AI_STATES,
    COMBAT_RATINGS,
    updateEnemyAI,
    determineAIState,
    shouldFire,
    getAITarget,
    calculateInterceptPoint,
    getFleeDirection,
    updateFormation
} from './game/ai.js';

// ============================================================
// UTILS
// ============================================================
import {
    clamp,
    lerp,
    normalizeAngle,
    angleDifference,
    distance,
    distanceSquared,
    randomRange,
    randomInt,
    randomChoice,
    shuffle,
    normalize,
    dot,
    cross2D,
    rotatePoint,
    degToRad,
    radToDeg,
    smoothstep,
    easeInOut,
    easeOutQuad
} from './utils/math.js';

import {
    formatNumber,
    formatCredits,
    formatTime,
    formatDistance,
    capitalize,
    truncate,
    debounce,
    throttle as helperThrottle,
    generateId,
    deepClone,
    mergeDeep
} from './utils/helpers.js';

// ============================================================
// AUDIO
// ============================================================
import {
    initAudio,
    playSound,
    stopSound,
    stopAllSounds,
    setMasterVolume,
    getMasterVolume,
    isMuted,
    toggleMute
} from './audio/sounds.js';

// ============================================================
// RENDERING - SCENE
// ============================================================
import {
    createScene,
    createCamera,
    createRenderer,
    initGameScene,
    createSpaceBackground,
    createStarfield,
    createNebula,
    updateCamera,
    resizeRenderer,
    disposeScene
} from './rendering/scene.js';

// ============================================================
// RENDERING - TEXTURES
// ============================================================
import {
    createUEHullTexture,
    createCrescentTexture,
    createVoinianTexture,
    createKaturiTexture,
    createPirateTexture,
    createMiranuTexture,
    createAlienTexture,
    createEngineGlowTexture,
    createCockpitTexture,
    createHullTexture,
    createShieldTexture,
    createExplosionTexture,
    clearTextureCache,
    getTextureFromCache
} from './rendering/textures.js';

// ============================================================
// RENDERING - MODELS
// ============================================================
import {
    initModelLoader,
    loadGLBModel,
    cloneModel,
    preloadModels,
    preloadModelsWithProgress,
    getLoadedModel,
    isModelLoaded,
    disposeModel,
    disposeAllModels
} from './rendering/models.js';

// ============================================================
// RENDERING - PARTICLES
// ============================================================
import {
    createExplosion,
    createHitEffect,
    createMuzzleFlash,
    createEngineTrail,
    createShieldImpact,
    updateParticles,
    clearParticles,
    getActiveParticleCount
} from './rendering/particles.js';

// ============================================================
// ENTITIES - SHIPS
// ============================================================
import {
    SHIP_SCALE,
    createPlayerShip,
    createEnemyShip,
    createProceduralPlayerShip,
    createNPCShip,
    updateShipVisuals,
    applyDamageToShip,
    repairShip,
    destroyShip
} from './entities/ships.js';

// ============================================================
// COMBAT - PROJECTILES
// ============================================================
import {
    WEAPON_TYPES,
    createProjectile,
    createMissile,
    createBeam,
    updateProjectilePosition,
    updateMissileTracking,
    isProjectileAlive,
    checkProjectileCollision,
    removeProjectile,
    clearAllProjectiles
} from './combat/projectiles.js';

// ============================================================
// UI - HUD
// ============================================================
import {
    showMessage,
    hideMessage,
    updateUI,
    updateMinimap,
    updateTargetPanel,
    updateWeaponDisplay,
    hideStartScreen,
    showStartScreen,
    showGameplayUI,
    hideGameplayUI,
    showGameOver,
    updateHealthBar,
    updateShieldBar,
    updateEnergyBar,
    getCombatRating as hudGetCombatRating,
    initHUD,
    disposeHUD
} from './ui/hud.js';

// ============================================================
// UI - STATION
// ============================================================
import {
    initStationModule,
    openStationMenu,
    closeStationMenu,
    isStationMenuOpen,
    getDockingState,
    setDockingState,
    canDockWithStation,
    startDocking,
    completeDocking,
    undock,
    registerWindowFunctions as registerStationWindowFunctions
} from './ui/station.js';

// ============================================================
// INPUT
// ============================================================
import {
    keys,
    mouseX,
    mouseY,
    mouseWorldX,
    mouseWorldY,
    isKeyPressed,
    isActionPressed,
    KEY_BINDINGS,
    setupKeyboardListeners,
    setupMouseListeners,
    setupDragControls,
    setupResizeListener,
    getMovementInput,
    isBoostPressed,
    isPrimaryFirePressed,
    setMousePosition,
    setMouseWorldPosition,
    updateMouseWorldCoordinates,
    getAngleToMouse,
    clearAllKeys,
    resetInputState
} from './input/controls.js';

// ============================================================
// GAME RUNTIME STATE
// ============================================================

// Three.js core objects
let scene = null;
let camera = null;
let renderer = null;

// Game entity containers
let playerShip = null;
let enemies = [];
let projectiles = [];
let missiles = [];
let stations = [];
let asteroids = [];
let pickups = [];

// Current target
let currentTarget = null;

// Timing
let lastFireTime = 0;
let gameStartTime = 0;

// Canvas element
let canvas = null;

const shipTextureCreators = {
    ue: createUEHullTexture,
    crescent: createCrescentTexture,
    voinian: createVoinianTexture,
    katuri: createKaturiTexture,
    pirate: createPirateTexture,
    miranu: createMiranuTexture,
    alien: createAlienTexture,
    cockpit: createCockpitTexture,
    hull: createHullTexture
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize the game
 * Sets up Three.js scene, loads models, and prepares game state
 */
async function initGame() {
    console.log('Space Armada - Initializing...');

    // Get or create canvas
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        document.body.appendChild(canvas);
    }

    // Initialize audio system
    initAudio();

    // Initialize model loader with the correct path
    initModelLoader(MODEL_PATH);

    // Create Three.js scene
    const sceneSetup = initGameScene(canvas);
    scene = sceneSetup.scene;
    camera = sceneSetup.camera;
    renderer = sceneSetup.renderer;

    // Initialize station module with dependencies
    initStationModule({
        playerState,
        updatePlayerState,
        getPlayerState,
        showMessage,
        playSound,
        SHIPYARD_DATA,
        SHIP_CATEGORIES,
        getFactionStyle,
        formatCredits
    });

    // Register station window functions for onclick handlers
    registerStationWindowFunctions();

    // Set up input handlers
    setupInputHandlers();

    // Set up window resize handler
    setupResizeListener(() => {
        if (renderer && camera) {
            resizeRenderer(renderer, camera, canvas);
        }
    });

    // Preload ship models
    console.log('Loading ship models...');
    try {
        await preloadModelsWithProgress(
            Object.values(SHIP_MODELS),
            (loaded, total) => {
                console.log(`Loading models: ${loaded}/${total}`);
            }
        );
        console.log('Ship models loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error);
    }

    // Initialize HUD
    initHUD();

    console.log('Game initialization complete');
}

/**
 * Set up keyboard and mouse input handlers
 */
function setupInputHandlers() {
    setupKeyboardListeners({
        onKeyDown: (e) => {
            // Handle special keys
            if (e.code === 'Escape') {
                if (isStationMenuOpen()) {
                    closeStationMenu();
                }
            }
            if (e.code === 'Tab') {
                e.preventDefault();
                // Toggle upgrade menu or target cycling
            }
            if (e.code === 'KeyT') {
                // Target nearest enemy
                targetNearestEnemy();
            }
            if (e.code === 'KeyH') {
                // Hail nearest station
                hailNearestStation();
            }
        }
    });

    setupMouseListeners({
        onMouseMove: (x, y, e) => {
            // Update mouse world coordinates
            if (canvas && playerShip) {
                const rect = canvas.getBoundingClientRect();
                const aspect = rect.width / rect.height;
                updateMouseWorldCoordinates({
                    canvasRect: rect,
                    playerX: playerShip.position.x,
                    playerY: playerShip.position.z,
                    viewSize: 450,
                    aspect: aspect
                });
            }
        },
        onMouseDown: (e) => {
            // Handle mouse click (possibly for firing or targeting)
            if (e.button === 0 && isGameRunning()) {
                // Left click - could be used for targeting
            }
        }
    });
}

// ============================================================
// GAME CONTROL FUNCTIONS
// ============================================================

/**
 * Start a new game
 */
async function startGame() {
    console.log('Starting game...');

    // Reset all game state
    resetAllState();

    // Clear any existing entities
    enemies = [];
    projectiles = [];
    missiles = [];
    stations = [];
    asteroids = [];
    pickups = [];

    // Initialize if not already done
    if (!scene) {
        await initGame();
    }

    // Create player ship
    playerShip = await createPlayerShip({
        THREE,
        modelCache: { get: getLoadedModel },
        SHIP_MODELS,
        textureCreators: shipTextureCreators
    });
    if (playerShip && playerShip.position) {
        playerShip.position.set(0, 0, 0);
    }

    // Hide start screen and show gameplay UI
    hideStartScreen();
    showGameplayUI();

    // Set game as running
    setGameRunning(true);
    gameStartTime = getCurrentTimeSeconds();

    // Configure and start the game loop
    configureLoop({
        onUpdate: gameUpdate,
        onRender: gameRender,
        isGameRunning: isGameRunning
    });
    startLoop();

    // Show start message
    showMessage('Systems online. Good luck, pilot.');

    // Play background music or start sound
    playSound('engine', { loop: true, volume: 0.3 });
}

/**
 * Restart the game after game over
 */
function restartGame() {
    console.log('Restarting game...');

    // Stop current loop
    stopLoop();

    // Clean up existing game objects
    if (scene) {
        clearParticles();
        clearAllProjectiles();
    }

    // Start fresh
    startGame();
}

/**
 * Launch from station (undock)
 */
function launchFromStation() {
    if (!isStationMenuOpen()) return;

    closeStationMenu();
    undock();

    setGameRunning(true);
    showMessage('Launching from station...');
    playSound('engine');
}

/**
 * End the game (player died)
 */
function endGame() {
    setGameRunning(false);
    stopLoop();

    // Stop engine sound
    stopSound('engine');

    // Show game over screen
    const survivalTime = getCurrentTimeSeconds() - gameStartTime;
    showGameOver({
        credits: playerState.credits,
        kills: playerState.kills || 0,
        survivalTime: survivalTime
    });

    playSound('gameOver');
}

// ============================================================
// TARGETING FUNCTIONS
// ============================================================

/**
 * Target the nearest enemy
 */
function targetNearestEnemy() {
    if (!playerShip || enemies.length === 0) {
        currentTarget = null;
        return;
    }

    let nearestDist = Infinity;
    let nearest = null;

    for (const enemy of enemies) {
        if (!enemy || !enemy.mesh) continue;
        const dist = distance(
            playerShip.position.x, playerShip.position.z,
            enemy.mesh.position.x, enemy.mesh.position.z
        );
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = enemy;
        }
    }

    currentTarget = nearest;
    if (nearest) {
        showMessage(`Targeting: ${nearest.name || 'Unknown'}`);
    }
}

/**
 * Hail the nearest station
 */
function hailNearestStation() {
    if (!playerShip || stations.length === 0) {
        showMessage('No stations in range');
        return;
    }

    let nearestDist = Infinity;
    let nearestStation = null;

    for (const station of stations) {
        if (!station || !station.position) continue;
        const dist = distance(
            playerShip.position.x, playerShip.position.z,
            station.position.x, station.position.z
        );
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestStation = station;
        }
    }

    if (nearestStation && nearestDist < GAME_CONSTANTS.DOCKING_RANGE) {
        // Open station menu
        openStationMenu(nearestStation);
        setGameRunning(false);
        playSound('dock');
    } else if (nearestStation) {
        showMessage(`Station too far (${Math.round(nearestDist)}m). Get closer to dock.`);
    } else {
        showMessage('No stations found');
    }
}

// ============================================================
// GAME UPDATE LOOP
// ============================================================

/**
 * Main game update function
 * Called each frame when game is running
 * @param {number} dt - Delta time in seconds
 */
function gameUpdate(dt) {
    if (!isGameRunning() || !playerShip) return;

    // Get player input
    const movement = getMovementInput();
    const boosting = isBoostPressed();

    // Update player physics
    if (movement.isMoving) {
        const thrustForce = boosting
            ? PHYSICS_CONSTANTS.THRUST_FORCE * PHYSICS_CONSTANTS.BOOST_MULTIPLIER
            : PHYSICS_CONSTANTS.THRUST_FORCE;

        applyThrust(playerShip, movement.x, movement.y, thrustForce, dt);
    }

    // Apply drag and velocity
    applyDrag(playerShip, PHYSICS_CONSTANTS.DRAG, dt);
    applyVelocity(playerShip, dt);
    limitSpeed(playerShip, PHYSICS_CONSTANTS.MAX_SPEED);

    // Update player rotation to face mouse
    if (canvas) {
        const targetAngle = getAngleToMouse(
            playerShip.position.x,
            playerShip.position.z
        );
        playerShip.rotation.y = -targetAngle + Math.PI / 2;
    }

    // Handle firing
    if (isPrimaryFirePressed()) {
        const now = getCurrentTimeSeconds();
        const fireRate = playerState.weaponFireRate || 0.2;
        if (now - lastFireTime >= fireRate) {
            firePlayerWeapon();
            lastFireTime = now;
        }
    }

    // Update projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        updateProjectilePosition(proj, dt);

        if (!isProjectileAlive(proj)) {
            if (proj.mesh && scene) {
                scene.remove(proj.mesh);
            }
            projectiles.splice(i, 1);
            continue;
        }

        // Check collisions with enemies (if player projectile)
        if (proj.isPlayerProjectile) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy || !enemy.mesh) continue;

                if (checkCircleCollision(
                    proj.position.x, proj.position.z, proj.radius || 5,
                    enemy.mesh.position.x, enemy.mesh.position.z, enemy.collisionRadius || 20
                )) {
                    // Hit enemy
                    handleProjectileHit(proj, enemy, j);
                    projectiles.splice(i, 1);
                    break;
                }
            }
        }
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy) continue;

        updateEnemyAI(enemy, {
            playerPosition: playerShip.position,
            playerVelocity: playerShip.velocity || { x: 0, z: 0 },
            dt: dt,
            fireCallback: (e) => enemyFire(e)
        });

        // Apply physics to enemy
        applyDrag(enemy, PHYSICS_CONSTANTS.DRAG, dt);
        applyVelocity(enemy, dt);
    }

    // Update missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        updateMissileTracking(missile, missile.target, dt);
        updateProjectilePosition(missile, dt);

        if (!isProjectileAlive(missile)) {
            if (missile.mesh && scene) {
                scene.remove(missile.mesh);
            }
            missiles.splice(i, 1);
        }
    }

    // Update particles
    updateParticles(dt);

    // Update camera to follow player
    if (camera && playerShip) {
        updateCamera(camera, playerShip.position, {
            height: 500,
            smoothing: 0.1
        });
    }

    // Update UI
    updateUI({
        health: playerState.health,
        maxHealth: playerState.maxHealth,
        shield: playerState.shield,
        maxShield: playerState.maxShield,
        energy: playerState.energy,
        maxEnergy: playerState.maxEnergy,
        credits: playerState.credits,
        speed: Math.sqrt(
            (playerShip.velocity?.x || 0) ** 2 +
            (playerShip.velocity?.z || 0) ** 2
        )
    });

    // Update minimap
    updateMinimap({
        playerPosition: playerShip.position,
        enemies: enemies,
        stations: stations,
        asteroids: asteroids
    });

    // Update target panel
    if (currentTarget) {
        updateTargetPanel(currentTarget);
    }
}

/**
 * Fire player's current weapon
 */
function firePlayerWeapon() {
    if (!playerShip || !scene) return;

    const weaponType = playerState.currentWeapon || 'laser';
    const proj = createProjectile({
        type: weaponType,
        position: {
            x: playerShip.position.x,
            y: playerShip.position.y,
            z: playerShip.position.z
        },
        angle: -playerShip.rotation.y + Math.PI / 2,
        isPlayerProjectile: true,
        damage: playerState.weaponDamage || 10
    });

    if (proj && proj.mesh) {
        scene.add(proj.mesh);
        projectiles.push(proj);
    }

    playSound('laser');
}

/**
 * Enemy fires at player
 * @param {object} enemy - The enemy firing
 */
function enemyFire(enemy) {
    if (!enemy || !enemy.mesh || !scene) return;

    const angleToPlayer = Math.atan2(
        playerShip.position.z - enemy.mesh.position.z,
        playerShip.position.x - enemy.mesh.position.x
    );

    const proj = createProjectile({
        type: 'laser',
        position: {
            x: enemy.mesh.position.x,
            y: enemy.mesh.position.y,
            z: enemy.mesh.position.z
        },
        angle: angleToPlayer,
        isPlayerProjectile: false,
        damage: enemy.weaponDamage || 5
    });

    if (proj && proj.mesh) {
        scene.add(proj.mesh);
        projectiles.push(proj);
    }
}

/**
 * Handle projectile hitting an enemy
 */
function handleProjectileHit(projectile, enemy, enemyIndex) {
    // Apply damage
    const damage = projectile.damage || 10;
    enemy.health = (enemy.health || 100) - damage;

    // Create hit effect
    createHitEffect(scene, {
        x: enemy.mesh.position.x,
        y: enemy.mesh.position.y,
        z: enemy.mesh.position.z
    });

    playSound('hit');

    // Check if enemy destroyed
    if (enemy.health <= 0) {
        destroyEnemy(enemy, enemyIndex);
    }
}

/**
 * Destroy an enemy
 */
function destroyEnemy(enemy, index) {
    // Create explosion
    createExplosion(scene, {
        x: enemy.mesh.position.x,
        y: enemy.mesh.position.y,
        z: enemy.mesh.position.z
    }, enemy.explosionSize || 1);

    // Remove from scene
    if (enemy.mesh) {
        scene.remove(enemy.mesh);
    }

    // Remove from array
    enemies.splice(index, 1);

    // Award credits
    const bounty = enemy.bounty || 100;
    updatePlayerState({ credits: playerState.credits + bounty });
    playerState.kills = (playerState.kills || 0) + 1;

    showMessage(`+${bounty} credits`);
    playSound('explosion');

    // Clear target if this was our target
    if (currentTarget === enemy) {
        currentTarget = null;
    }
}

// ============================================================
// GAME RENDER LOOP
// ============================================================

/**
 * Main render function
 * Called each frame to render the scene
 */
function gameRender() {
    if (!renderer || !scene || !camera) return;

    renderer.render(scene, camera);
}

// ============================================================
// WINDOW EXPORTS
// ============================================================

/**
 * Register functions on window for HTML onclick handlers
 */
function registerWindowExports() {
    // Game control
    window.startGame = startGame;
    window.restartGame = restartGame;
    window.launchFromStation = launchFromStation;

    // Station menu (from station module)
    window.openStationMenu = openStationMenu;
    window.closeStationMenu = closeStationMenu;

    // Targeting
    window.targetNearestEnemy = targetNearestEnemy;

    // UI functions
    window.showMessage = showMessage;

    // Audio controls
    window.toggleMute = toggleMute;
    window.setMasterVolume = setMasterVolume;

    // Debug/dev functions
    if (process.env.NODE_ENV === 'development') {
        window.debugGame = {
            scene,
            camera,
            renderer,
            playerShip,
            enemies,
            projectiles,
            playerState,
            getCurrentFps,
            getActiveParticleCount
        };
    }

    console.log('Window exports registered');
}

// ============================================================
// INITIALIZATION ON DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Space Armada - Modular Version');
    console.log('Build system: Vite');
    console.log('Modules loaded successfully');

    // Log available constants to verify imports work
    console.log('Ship models available:', Object.keys(SHIP_MODELS).length);
    console.log('Factions available:', Object.keys(FACTION_STYLES).length);
    console.log('Ship categories:', Object.keys(SHIP_CATEGORIES || {}).length);
    console.log('Game constants:', GAME_CONSTANTS);

    // Register window exports
    registerWindowExports();

    // Initialize the game (loads assets)
    try {
        await initGame();
        console.log('Game ready to start');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }

    // Set up start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
});

// ============================================================
// EXPORTS FOR OTHER MODULES
// ============================================================

export {
    // Game control
    initGame,
    startGame,
    restartGame,
    endGame,
    launchFromStation,

    // Runtime state getters
    scene,
    camera,
    renderer,
    playerShip,
    enemies,
    projectiles,
    missiles,
    stations,
    currentTarget,

    // Update functions
    gameUpdate,
    gameRender,

    // Targeting
    targetNearestEnemy,
    hailNearestStation,

    // Re-export commonly used items
    playerState,
    isGameRunning,
    showMessage,
    playSound
};
