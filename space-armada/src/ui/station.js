// Space Armada - Station UI Module
// Extracted from index.html for modularization
// Contains station menu rendering, shipyard, outfitter, and services tabs

// ============================================================
// DEPENDENCIES (to be imported when fully modularized)
// ============================================================
// - playerState from './game/state.js'
// - SHIPYARD_DATA from './data/ships.js'
// - showMessage, updateUI from main game
// - THREE (Three.js) for shipyard preview
// - cloneModel, applyShipMaterials from rendering module
// - updateWeaponInfo from combat/weapons module
// - getCombatRating from game/ratings module

// ============================================================
// MODULE STATE
// ============================================================

/**
 * Station menu state
 */
let stationMenuOpen = false;
let isDocking = false;
let dockingTimer = null;
let currentDockingStation = null;

/**
 * Shipyard preview state (3D ship viewer)
 */
let shipyardPreviewRenderer = null;
let shipyardPreviewScene = null;
let shipyardPreviewCamera = null;
let shipyardPreviewModel = null;
let shipyardPreviewAnimationId = null;
let selectedShipKey = null;
let shipyardPreviewRotation = 0;
let isShipyardDragging = false;
let shipyardDragStartX = 0;

// ============================================================
// EXTERNAL DEPENDENCIES (set via init)
// ============================================================

let playerState = null;
let SHIPYARD_DATA = null;
let THREE = null;
let showMessage = null;
let updateUI = null;
let cloneModel = null;
let applyShipMaterials = null;
let updateWeaponInfo = null;
let scene = null;
let playerShip = null;
let SHIP_SCALE = 0.4;

/**
 * Initialize station module with external dependencies
 * @param {object} deps - Dependencies object
 */
export function initStationModule(deps) {
    playerState = deps.playerState;
    SHIPYARD_DATA = deps.SHIPYARD_DATA;
    THREE = deps.THREE;
    showMessage = deps.showMessage;
    updateUI = deps.updateUI;
    cloneModel = deps.cloneModel;
    applyShipMaterials = deps.applyShipMaterials;
    updateWeaponInfo = deps.updateWeaponInfo;
    scene = deps.scene;
    playerShip = deps.playerShip;
    if (deps.SHIP_SCALE !== undefined) {
        SHIP_SCALE = deps.SHIP_SCALE;
    }
}

// ============================================================
// STATION MENU FUNCTIONS
// ============================================================

/**
 * Check if station menu is currently open
 * @returns {boolean}
 */
export function isStationMenuOpen() {
    return stationMenuOpen;
}

/**
 * Get docking state information
 * @returns {object} Current docking state
 */
export function getDockingState() {
    return {
        isDocking,
        dockingTimer,
        currentDockingStation
    };
}

/**
 * Set docking state
 * @param {boolean} docking - Whether currently docking
 * @param {object|null} station - Station being docked at
 */
export function setDockingState(docking, station = null) {
    isDocking = docking;
    currentDockingStation = station;
}

/**
 * Set docking timer
 * @param {number|null} timer - Timer ID or null to clear
 */
export function setDockingTimer(timer) {
    dockingTimer = timer;
}

/**
 * Open the station menu
 */
export function openStationMenu() {
    stationMenuOpen = true;
    document.getElementById('stationMenu').style.display = 'block';
    showStationTab('services');
}

/**
 * Close the station menu
 */
export function closeStationMenu() {
    stationMenuOpen = false;
    cleanupShipyardPreview();
    document.getElementById('stationMenu').style.display = 'none';
}

/**
 * Show a specific station tab
 * @param {string} tab - Tab to show ('services', 'shipyard', 'outfitter')
 */
export function showStationTab(tab) {
    // Clean up shipyard preview if switching away from shipyard
    if (tab !== 'shipyard') {
        cleanupShipyardPreview();
    }

    // Update tab buttons
    document.querySelectorAll('#stationMenu .menu-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === tab ||
            (tab === 'services' && btn.textContent === 'SERVICES') ||
            (tab === 'shipyard' && btn.textContent === 'SHIPYARD') ||
            (tab === 'outfitter' && btn.textContent === 'OUTFITTER')) {
            btn.classList.add('active');
        }
    });

    const content = document.getElementById('stationMenuContent');

    if (tab === 'services') {
        renderServicesTab(content);
    } else if (tab === 'shipyard') {
        renderShipyardTab(content);
    } else if (tab === 'outfitter') {
        renderOutfitterTab(content);
    }
}

// ============================================================
// SERVICES TAB
// ============================================================

/**
 * Render the services tab content
 * @param {HTMLElement} content - Container element
 */
export function renderServicesTab(content) {
    const repairNeeded = playerState.maxHull - playerState.hull;
    const repairCost = Math.floor(repairNeeded * 0.4);
    const missilesCost = (playerState.maxMissiles - playerState.missiles) * 10;
    const shieldRepairNeeded = playerState.maxShields - playerState.shields;

    content.innerHTML = `
        <div style="color:#ff0;font-size:14px;margin-bottom:15px;text-align:center;">
            Credits: ${playerState.credits.toLocaleString()}
        </div>

        <div class="service-row">
            <div class="service-info">
                <div class="service-name">Hull Repair</div>
                <div class="service-desc">Repair hull damage (${Math.ceil(repairNeeded)} HP needed)</div>
            </div>
            <button class="service-btn" onclick="stationRepairHull()" ${repairNeeded <= 0 || playerState.credits < repairCost ? 'disabled' : ''}>
                ${repairNeeded <= 0 ? 'FULL' : repairCost + ' CR'}
            </button>
        </div>

        <div class="service-row">
            <div class="service-info">
                <div class="service-name">Recharge Shields</div>
                <div class="service-desc">Restore shields to full (${Math.ceil(shieldRepairNeeded)} needed)</div>
            </div>
            <button class="service-btn" onclick="stationRechargeShields()" ${shieldRepairNeeded <= 0 ? 'disabled' : ''}>
                ${shieldRepairNeeded <= 0 ? 'FULL' : 'FREE'}
            </button>
        </div>

        <div class="service-row">
            <div class="service-info">
                <div class="service-name">Reload Missiles</div>
                <div class="service-desc">Restock missiles (${playerState.missiles}/${playerState.maxMissiles})</div>
            </div>
            <button class="service-btn" onclick="stationReloadMissiles()" ${playerState.missiles >= playerState.maxMissiles || playerState.credits < missilesCost ? 'disabled' : ''}>
                ${playerState.missiles >= playerState.maxMissiles ? 'FULL' : missilesCost + ' CR'}
            </button>
        </div>

        <div class="service-row">
            <div class="service-info">
                <div class="service-name">Refuel Energy</div>
                <div class="service-desc">Refill energy reserves</div>
            </div>
            <button class="service-btn" onclick="stationRefuelEnergy()" ${playerState.energy >= playerState.maxEnergy ? 'disabled' : ''}>
                ${playerState.energy >= playerState.maxEnergy ? 'FULL' : 'FREE'}
            </button>
        </div>

        <div style="margin-top:20px;padding:10px;background:rgba(0,60,80,0.4);border-radius:5px;">
            <div style="color:#0af;font-size:11px;margin-bottom:5px;">CURRENT SHIP</div>
            <div style="color:#fff;font-size:13px;">${SHIPYARD_DATA[playerState.currentShip]?.name || 'UE Fighter'}</div>
            <div style="color:#088;font-size:10px;">Hull: ${playerState.hull}/${playerState.maxHull} | Shields: ${Math.ceil(playerState.shields)}/${playerState.maxShields}</div>
        </div>
    `;
}

// ============================================================
// STATION SERVICE HANDLERS
// ============================================================

/**
 * Repair hull at station
 */
export function stationRepairHull() {
    const repairNeeded = playerState.maxHull - playerState.hull;
    const repairCost = Math.floor(repairNeeded * 0.4);
    if (playerState.credits >= repairCost && repairNeeded > 0) {
        playerState.credits -= repairCost;
        playerState.hull = playerState.maxHull;
        showMessage('HULL REPAIRED');
        showStationTab('services');
        updateUI();
    }
}

/**
 * Recharge shields at station (free)
 */
export function stationRechargeShields() {
    playerState.shields = playerState.maxShields;
    showMessage('SHIELDS RECHARGED');
    showStationTab('services');
    updateUI();
}

/**
 * Reload missiles at station
 */
export function stationReloadMissiles() {
    const missilesCost = (playerState.maxMissiles - playerState.missiles) * 10;
    if (playerState.credits >= missilesCost) {
        playerState.credits -= missilesCost;
        playerState.missiles = playerState.maxMissiles;
        showMessage('MISSILES RELOADED');
        showStationTab('services');
        updateUI();
    }
}

/**
 * Refuel energy at station (free)
 */
export function stationRefuelEnergy() {
    playerState.energy = playerState.maxEnergy;
    showMessage('ENERGY REFUELED');
    showStationTab('services');
    updateUI();
}

// ============================================================
// SHIPYARD PREVIEW SYSTEM (3D)
// ============================================================

/**
 * Initialize the shipyard 3D preview system
 */
export function initShipyardPreview() {
    if (!THREE) return;

    // Create dedicated scene for preview
    shipyardPreviewScene = new THREE.Scene();
    shipyardPreviewScene.background = new THREE.Color(0x000510);

    // Create preview camera - top-down angled view like a showroom
    shipyardPreviewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    shipyardPreviewCamera.position.set(0, 80, 50);
    shipyardPreviewCamera.lookAt(0, 0, 0);

    // Lighting setup for proper texture display
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    shipyardPreviewScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(50, 80, 60);
    shipyardPreviewScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-50, 30, -50);
    shipyardPreviewScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.2);
    rimLight.position.set(0, -30, -80);
    shipyardPreviewScene.add(rimLight);

    // Subtle grid floor for grounding
    const gridHelper = new THREE.GridHelper(80, 8, 0x003344, 0x001122);
    gridHelper.position.y = -35;
    shipyardPreviewScene.add(gridHelper);
}

/**
 * Create WebGL renderer for shipyard preview
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
export function createShipyardRenderer(canvas) {
    if (!THREE) return;

    if (shipyardPreviewRenderer) {
        shipyardPreviewRenderer.dispose();
    }

    shipyardPreviewRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    shipyardPreviewRenderer.setSize(300, 300);
    shipyardPreviewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Load a ship model for preview
 * @param {string} shipKey - Ship key from SHIPYARD_DATA
 */
export function loadShipForPreview(shipKey) {
    if (!THREE || !cloneModel) return;

    const ship = SHIPYARD_DATA[shipKey];
    if (!ship) return;

    // Remove existing preview model
    if (shipyardPreviewModel) {
        shipyardPreviewScene.remove(shipyardPreviewModel);
        shipyardPreviewModel = null;
    }

    // Clone model from cache
    const modelName = ship.model;
    const glbModel = cloneModel(modelName);

    if (glbModel) {
        // Step 1: Create turntable container FIRST
        const turntable = new THREE.Group();

        // Step 2: Calculate original bounding box
        const box = new THREE.Box3().setFromObject(glbModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Step 3: Scale model to fit preview
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 50;
        const scale = targetSize / maxDim;
        glbModel.scale.set(scale, scale, scale);

        // Step 4: Apply same rotation as in-game ships
        // GLB models are Z-up, need rotation for Y-up Three.js
        glbModel.rotation.x = -Math.PI / 2;
        glbModel.rotation.z = Math.PI;

        // Step 5: Apply faction-appropriate materials/colors
        if (applyShipMaterials) {
            applyShipMaterials(glbModel, modelName);
        }

        // Step 6: Center model at origin
        glbModel.position.set(
            -center.x * scale,
            -center.y * scale,
            -center.z * scale
        );

        // Step 7: Add model to turntable
        turntable.add(glbModel);

        shipyardPreviewModel = turntable;
        shipyardPreviewRotation = 0;
        shipyardPreviewScene.add(shipyardPreviewModel);
    }

    selectedShipKey = shipKey;
    updateShipPreviewDetails();
}

/**
 * Update the ship preview details panel
 */
export function updateShipPreviewDetails() {
    const ship = SHIPYARD_DATA[selectedShipKey];
    if (!ship) return;

    const isOwned = playerState.currentShip === selectedShipKey;
    const canAfford = playerState.credits >= ship.price;

    const nameEl = document.getElementById('shipPreviewName');
    const statsEl = document.getElementById('shipPreviewStats');
    const descEl = document.getElementById('shipPreviewDesc');
    const buyBtn = document.getElementById('shipPreviewBuyBtn');

    if (nameEl) nameEl.textContent = ship.name;
    if (statsEl) statsEl.innerHTML = `Hull: ${ship.hull} | Shields: ${ship.shields}<br>Speed: ${ship.speed}`;
    if (descEl) descEl.textContent = ship.desc;

    if (buyBtn) {
        buyBtn.classList.remove('owned');
        if (isOwned) {
            buyBtn.textContent = 'CURRENT SHIP';
            buyBtn.disabled = true;
            buyBtn.classList.add('owned');
        } else {
            buyBtn.textContent = `BUY - ${ship.price.toLocaleString()} CR`;
            buyBtn.disabled = !canAfford;
        }
    }
}

/**
 * Animation loop for shipyard preview
 */
export function animateShipyardPreview() {
    if (!shipyardPreviewRenderer || !document.getElementById('shipPreviewCanvas')) {
        if (shipyardPreviewAnimationId) {
            cancelAnimationFrame(shipyardPreviewAnimationId);
            shipyardPreviewAnimationId = null;
        }
        return;
    }

    shipyardPreviewAnimationId = requestAnimationFrame(animateShipyardPreview);

    // Auto-rotate if not dragging
    if (shipyardPreviewModel && !isShipyardDragging) {
        shipyardPreviewRotation += 0.008;
        shipyardPreviewModel.rotation.y = shipyardPreviewRotation;
    }

    shipyardPreviewRenderer.render(shipyardPreviewScene, shipyardPreviewCamera);
}

/**
 * Start the shipyard preview animation
 */
export function startShipyardPreview() {
    if (!shipyardPreviewScene) {
        initShipyardPreview();
    }
    animateShipyardPreview();
}

/**
 * Stop the shipyard preview animation
 */
export function stopShipyardPreview() {
    if (shipyardPreviewAnimationId) {
        cancelAnimationFrame(shipyardPreviewAnimationId);
        shipyardPreviewAnimationId = null;
    }
}

/**
 * Clean up shipyard preview resources
 */
export function cleanupShipyardPreview() {
    stopShipyardPreview();
    if (shipyardPreviewRenderer) {
        shipyardPreviewRenderer.dispose();
        shipyardPreviewRenderer = null;
    }
    if (shipyardPreviewModel && shipyardPreviewScene) {
        shipyardPreviewScene.remove(shipyardPreviewModel);
        shipyardPreviewModel = null;
    }
}

/**
 * Setup drag controls for preview canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
export function setupPreviewDragControls(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        isShipyardDragging = true;
        shipyardDragStartX = e.clientX;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isShipyardDragging && shipyardPreviewModel) {
            const deltaX = e.clientX - shipyardDragStartX;
            shipyardPreviewRotation += deltaX * 0.01;
            shipyardPreviewModel.rotation.y = shipyardPreviewRotation;
            shipyardDragStartX = e.clientX;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isShipyardDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isShipyardDragging = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        isShipyardDragging = true;
        shipyardDragStartX = e.touches[0].clientX;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (isShipyardDragging && shipyardPreviewModel) {
            const deltaX = e.touches[0].clientX - shipyardDragStartX;
            shipyardPreviewRotation += deltaX * 0.01;
            shipyardPreviewModel.rotation.y = shipyardPreviewRotation;
            shipyardDragStartX = e.touches[0].clientX;
        }
    });

    canvas.addEventListener('touchend', () => {
        isShipyardDragging = false;
    });
}

/**
 * Select a ship for preview
 * @param {string} shipKey - Ship key
 */
export function selectShipForPreview(shipKey) {
    // Update selection UI
    document.querySelectorAll('.ship-card-compact').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.shipKey === shipKey) {
            card.classList.add('selected');
        }
    });

    // Load model for preview
    loadShipForPreview(shipKey);
}

/**
 * Purchase the currently selected ship
 */
export function purchaseSelectedShip() {
    if (selectedShipKey) {
        purchaseShip(selectedShipKey);
        // Refresh the details after purchase
        updateShipPreviewDetails();
        // Refresh ship list to update owned status
        const content = document.getElementById('stationMenuContent');
        if (content) {
            renderShipyardTab(content);
        }
    }
}

// ============================================================
// SHIPYARD TAB
// ============================================================

/**
 * Render the shipyard tab with 3D preview
 * @param {HTMLElement} content - Container element
 */
export function renderShipyardTab(content) {
    const categories = {
        fighter: { name: 'FIGHTERS', ships: [] },
        medium: { name: 'MEDIUM SHIPS', ships: [] },
        heavy: { name: 'HEAVY SHIPS', ships: [] },
        capital: { name: 'CAPITAL SHIPS', ships: [] }
    };

    // Sort ships into categories
    Object.entries(SHIPYARD_DATA).forEach(([key, ship]) => {
        categories[ship.category].ships.push({ key, ...ship });
    });

    // Default to current ship or first available
    const defaultShip = selectedShipKey || playerState.currentShip || 'ue_fighter';

    let html = `
        <div style="color:#ff0;font-size:14px;margin-bottom:10px;text-align:center;">
            Credits: ${playerState.credits.toLocaleString()}
        </div>
        <div class="shipyard-container">
            <div class="shipyard-list">
    `;

    // Render compact ship cards for each category
    Object.values(categories).forEach(cat => {
        if (cat.ships.length === 0) return;

        html += `<div class="ship-category">${cat.name}</div>`;

        cat.ships.forEach(ship => {
            const isOwned = playerState.currentShip === ship.key;
            const canAfford = playerState.credits >= ship.price;
            const isSelected = ship.key === defaultShip;
            let cardClass = 'ship-card-compact';
            if (isSelected) cardClass += ' selected';
            if (isOwned) cardClass += ' owned';
            if (!canAfford && !isOwned) cardClass += ' cant-afford';

            html += `
                <div class="${cardClass}"
                     data-ship-key="${ship.key}"
                     onclick="selectShipForPreview('${ship.key}')">
                    <span class="ship-name">${ship.name}</span>
                    <span class="ship-price ${isOwned ? 'owned-label' : ''}">
                        ${isOwned ? 'OWNED' : ship.price.toLocaleString() + ' CR'}
                    </span>
                </div>
            `;
        });
    });

    html += `
            </div>
            <div class="shipyard-preview">
                <canvas id="shipPreviewCanvas" class="ship-preview-canvas" width="300" height="300"></canvas>
                <div class="ship-preview-details">
                    <div id="shipPreviewName" class="ship-preview-name">Select a Ship</div>
                    <div id="shipPreviewStats" class="ship-preview-stats">-</div>
                    <div id="shipPreviewDesc" class="ship-preview-desc">-</div>
                    <button id="shipPreviewBuyBtn" class="ship-preview-buy"
                            onclick="purchaseSelectedShip()">SELECT SHIP</button>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;

    // Initialize preview after DOM is updated
    setTimeout(() => {
        const canvas = document.getElementById('shipPreviewCanvas');
        if (canvas) {
            createShipyardRenderer(canvas);
            setupPreviewDragControls(canvas);
            startShipyardPreview();
            loadShipForPreview(defaultShip);
        }
    }, 0);
}

// ============================================================
// SHIP PURCHASE
// ============================================================

/**
 * Purchase a ship from the shipyard
 * @param {string} shipKey - Ship key
 */
export function purchaseShip(shipKey) {
    const ship = SHIPYARD_DATA[shipKey];
    if (!ship) return;

    // Already own this ship
    if (playerState.currentShip === shipKey) {
        showMessage('ALREADY YOUR SHIP');
        return;
    }

    // Can't afford
    if (playerState.credits < ship.price) {
        showMessage('INSUFFICIENT CREDITS');
        return;
    }

    // Purchase the ship
    playerState.credits -= ship.price;
    playerState.currentShip = shipKey;

    // Update ship stats based on the new ship
    playerState.maxHull = ship.hull;
    playerState.hull = ship.hull;
    playerState.maxShields = ship.shields;
    playerState.shields = ship.shields;

    // Update the player ship model
    updatePlayerShipModel(shipKey);

    showMessage(`PURCHASED: ${ship.name}`);
    showStationTab('shipyard');
    updateUI();
}

/**
 * Update player ship 3D model when changing ships
 * @param {string} shipKey - Ship key
 */
export function updatePlayerShipModel(shipKey) {
    if (!THREE || !cloneModel || !scene) return;

    const ship = SHIPYARD_DATA[shipKey];
    if (!ship) return;

    // Remove old player ship
    if (playerShip) {
        scene.remove(playerShip);
    }

    // Create new player ship with the new model
    const group = new THREE.Group();
    const modelName = ship.model;
    const glbModel = cloneModel(modelName);

    if (glbModel) {
        glbModel.rotation.x = -Math.PI / 2;
        glbModel.rotation.z = Math.PI;

        // Add engine glow effect
        const engineGlowGeom = new THREE.SphereGeometry(3, 8, 8);
        const engineMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const engineGlow = new THREE.Mesh(engineGlowGeom, engineMat);
        engineGlow.position.set(0, 0, 25);
        engineGlow.name = 'engineGlow';

        // Add direction indicator
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        const beamGeom = new THREE.CylinderGeometry(0.5, 1, 30, 6);
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.set(0, 0, -50);
        beam.rotation.x = Math.PI / 2;
        beam.name = 'directionLine';

        const arrowGeom = new THREE.ConeGeometry(3, 8, 6);
        const arrowMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const arrow = new THREE.Mesh(arrowGeom, arrowMat);
        arrow.position.set(0, 0, -67);
        arrow.rotation.x = -Math.PI / 2;
        arrow.name = 'directionArrow';

        group.add(glbModel);
        group.add(engineGlow);
        group.add(beam);
        group.add(arrow);

        group.scale.set(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE);
    } else {
        // Fallback - create a simple ship
        const geom = new THREE.ConeGeometry(10, 30, 6);
        const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = Math.PI / 2;
        group.add(mesh);
    }

    // Set render order high so player renders above stations
    group.renderOrder = 100;
    group.traverse(child => {
        if (child.isMesh) {
            child.renderOrder = 100;
        }
    });

    // Update the reference and position
    playerShip = group;
    playerShip.position.set(playerState.x, 0, playerState.y);
    scene.add(playerShip);

    return playerShip;
}

// ============================================================
// OUTFITTER TAB
// ============================================================

/**
 * Render the outfitter tab (redirects to upgrades menu)
 * @param {HTMLElement} content - Container element
 */
export function renderOutfitterTab(content) {
    content.innerHTML = `
        <div style="color:#ff0;font-size:14px;margin-bottom:15px;text-align:center;">
            Credits: ${playerState.credits.toLocaleString()}
        </div>
        <div style="color:#088;text-align:center;padding:20px;">
            Visit the UPGRADES menu (TAB) to upgrade your ship systems.<br><br>
            <span style="color:#0af;">Current Ship Level: ${playerState.shipLevel}</span>
        </div>
    `;
}

// ============================================================
// UPGRADE PANEL
// ============================================================

/**
 * Weapon type definitions for upgrade system
 */
export const WEAPON_TYPES = {
    pulse: { name: 'Pulse Cannon', desc: 'Fast-firing energy weapon', color: '#0ff' },
    spread: { name: 'Spread Shot', desc: 'Fires 3-5 projectiles in a cone', color: '#ff0' },
    beam: { name: 'Beam Laser', desc: 'Continuous damage beam', color: '#0f0' },
    heavy: { name: 'Heavy Cannon', desc: 'Slow but devastating shots', color: '#f80' },
    plasma: { name: 'Plasma Launcher', desc: 'Exploding plasma balls', color: '#f0f' },
    rapidfire: { name: 'Rapid Fire', desc: 'Very fast but weak shots', color: '#8ff' }
};

/**
 * Toggle upgrade panel visibility
 */
export function toggleUpgradePanel() {
    const panel = document.getElementById('upgradePanel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        updateUpgradePanel();
        panel.style.display = 'block';
    }
}

/**
 * Update the upgrade panel content
 */
export function updateUpgradePanel() {
    // Ship upgrades
    const shipUpgrades = [
        { id: 'hull', name: 'Hull Plating', baseCost: 40, desc: '+20 Max Hull', category: 'ship' },
        { id: 'shields', name: 'Shield Capacity', baseCost: 50, desc: '+15 Max Shields', category: 'ship' },
        { id: 'energy', name: 'Energy Core', baseCost: 35, desc: '+20 Max Energy', category: 'ship' },
        { id: 'thrust', name: 'Engine Power', baseCost: 60, desc: '+40 Thrust, +30 Speed', category: 'ship' },
        { id: 'shieldRegen', name: 'Shield Regen', baseCost: 55, desc: '+1.5 Shield/sec', category: 'ship' }
    ];

    // Weapon upgrades
    const weaponUpgrades = [
        { id: 'primaryDamage', name: 'Pulse Power', baseCost: 50, desc: '+5 Pulse damage', category: 'weapon' },
        { id: 'spreadShot', name: 'Spread Shot', baseCost: 100, desc: 'Unlock: 3-shot spread (key 2)', category: 'weapon', unlock: true, maxLevel: 3 },
        { id: 'beamWeapon', name: 'Beam Laser', baseCost: 150, desc: 'Unlock: Continuous beam (key 3)', category: 'weapon', unlock: true, maxLevel: 3 },
        { id: 'heavyCannon', name: 'Heavy Cannon', baseCost: 120, desc: 'Unlock: Slow but powerful (key 4)', category: 'weapon', unlock: true, maxLevel: 3 },
        { id: 'turretDamage', name: 'Turret Power', baseCost: 65, desc: '+4 Turret damage', category: 'weapon' },
        { id: 'homingStrength', name: 'Homing Missiles', baseCost: 80, desc: 'Better tracking, +20 damage', category: 'weapon' },
        { id: 'missileDamage', name: 'Warhead Upgrade', baseCost: 90, desc: '+25 Missile damage', category: 'weapon' },
        { id: 'rapidFire', name: 'Rapid Fire Mode', baseCost: 75, desc: 'Faster fire rate for all weapons', category: 'weapon' }
    ];

    const list = document.getElementById('upgradeList');
    list.innerHTML = `
        <div style="color:#ff0;margin-bottom:10px;font-size:13px;">Credits: ${playerState.credits}</div>
        <div style="color:#0ff;font-size:11px;margin-bottom:8px;border-bottom:1px solid #044;padding-bottom:5px;">SHIP SYSTEMS</div>
    `;

    // Ship upgrades section
    shipUpgrades.forEach(upg => {
        const level = playerState.upgrades[upg.id] || 0;
        const cost = upg.baseCost + level * 25;
        const canAfford = playerState.credits >= cost;

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.style.opacity = canAfford ? '1' : '0.5';
        div.innerHTML = `
            <div>
                <span class="name">${upg.name}</span>
                <span class="level" style="margin-left:10px;color:#0a0;">Lv.${level}</span>
                <div style="font-size:10px;color:#080;">${upg.desc}</div>
            </div>
            <span class="cost">${cost} CR</span>
        `;

        if (canAfford) {
            div.onclick = () => purchaseUpgrade(upg.id, cost, upg);
        }

        list.appendChild(div);
    });

    // Weapon upgrades section
    const weaponHeader = document.createElement('div');
    weaponHeader.style = 'color:#f80;font-size:11px;margin:12px 0 8px 0;border-bottom:1px solid #440;padding-bottom:5px;';
    weaponHeader.textContent = 'WEAPONS';
    list.appendChild(weaponHeader);

    weaponUpgrades.forEach(upg => {
        const level = playerState.upgrades[upg.id] || 0;
        const maxLevel = upg.maxLevel || 10;
        const atMax = level >= maxLevel;
        const cost = upg.baseCost + level * (upg.unlock ? 50 : 25);
        const canAfford = playerState.credits >= cost && !atMax;

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.style.opacity = canAfford ? '1' : (atMax ? '0.7' : '0.5');

        let statusText = atMax ? 'MAX' : `Lv.${level}`;
        let statusColor = atMax ? '#ff0' : (level > 0 && upg.unlock ? '#0f0' : '#0a0');

        div.innerHTML = `
            <div>
                <span class="name">${upg.name}</span>
                <span class="level" style="margin-left:10px;color:${statusColor};">${statusText}</span>
                <div style="font-size:10px;color:#860;">${upg.desc}</div>
            </div>
            <span class="cost">${atMax ? 'MAXED' : cost + ' CR'}</span>
        `;

        if (canAfford) {
            div.onclick = () => purchaseUpgrade(upg.id, cost, upg);
        }

        list.appendChild(div);
    });

    // Current weapon display
    const weaponInfo = document.createElement('div');
    weaponInfo.style = 'color:#0ff;font-size:10px;margin-top:12px;text-align:center;border-top:1px solid #044;padding-top:8px;';
    const weapons = ['Pulse (1)',
        playerState.upgrades.spreadShot > 0 ? 'Spread (2)' : '-',
        playerState.upgrades.beamWeapon > 0 ? 'Beam (3)' : '-',
        playerState.upgrades.heavyCannon > 0 ? 'Heavy (4)' : '-'];
    weaponInfo.innerHTML = `Weapons: ${weapons.filter(w => w !== '-').join(' | ')}`;
    list.appendChild(weaponInfo);
}

/**
 * Purchase an upgrade
 * @param {string} id - Upgrade ID
 * @param {number} cost - Cost in credits
 * @param {object} upg - Upgrade definition object
 */
export function purchaseUpgrade(id, cost, upg) {
    if (playerState.credits >= cost) {
        playerState.credits -= cost;
        playerState.upgrades[id] = (playerState.upgrades[id] || 0) + 1;
        playerState.shipLevel++;

        if (id === 'hull') {
            playerState.maxHull += 20;
            playerState.hull += 20;
        } else if (id === 'shields') {
            playerState.maxShields += 15;
            playerState.shields += 15;
        } else if (id === 'energy') {
            playerState.maxEnergy += 20;
        } else if (upg && upg.unlock && playerState.upgrades[id] === 1) {
            // First level of unlock weapons - show special message
            showMessage(`WEAPON UNLOCKED: ${upg.name.toUpperCase()}`);
            if (updateWeaponInfo) {
                updateWeaponInfo();
            }
            updateUpgradePanel();
            updateUI();
            return;
        }

        showMessage(`UPGRADED: ${id.toUpperCase()}`);
        updateUpgradePanel();
        updateUI();
    }
}

// ============================================================
// WINDOW EXPORTS (for onclick handlers in HTML)
// ============================================================

/**
 * Register functions on window for HTML onclick handlers
 */
export function registerWindowFunctions() {
    if (typeof window !== 'undefined') {
        window.showStationTab = showStationTab;
        window.closeStationMenu = closeStationMenu;
        window.stationRepairHull = stationRepairHull;
        window.stationRechargeShields = stationRechargeShields;
        window.stationReloadMissiles = stationReloadMissiles;
        window.stationRefuelEnergy = stationRefuelEnergy;
        window.selectShipForPreview = selectShipForPreview;
        window.purchaseSelectedShip = purchaseSelectedShip;
        window.purchaseShip = purchaseShip;
        window.toggleUpgradePanel = toggleUpgradePanel;
    }
}

// ============================================================
// GETTERS FOR MODULE STATE
// ============================================================

/**
 * Get selected ship key
 * @returns {string|null}
 */
export function getSelectedShipKey() {
    return selectedShipKey;
}

/**
 * Set selected ship key
 * @param {string} key - Ship key
 */
export function setSelectedShipKey(key) {
    selectedShipKey = key;
}

/**
 * Get player ship reference (updated after purchase)
 * @returns {THREE.Group|null}
 */
export function getPlayerShip() {
    return playerShip;
}

/**
 * Set player ship reference
 * @param {THREE.Group} ship - Player ship object
 */
export function setPlayerShip(ship) {
    playerShip = ship;
}
