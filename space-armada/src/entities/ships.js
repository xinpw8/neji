/**
 * Space Armada - Ship Factory Module
 * Extracted from index.html for modularization
 *
 * Contains all ship creation/spawning functions including:
 * - cloneModel: Clone cached GLB models
 * - createPlayerShip: Create the player's ship mesh
 * - createEnemyShip: Create enemy ship meshes by faction/type
 * - Procedural ship generators for each faction
 *
 * DEPENDENCIES (must be injected or imported):
 * - THREE: Three.js library
 * - modelCache: Map containing loaded GLB models
 * - SHIP_MODELS: Ship model filename mappings (from data/constants.js)
 * - FACTION_SHIP_MAPPING: Faction to model type mapping (from data/constants.js)
 * - Texture creation functions (from rendering module)
 *
 * @module entities/ships
 */

// Ship scale constant - matches game rendering
export const SHIP_SCALE = 0.4;

/**
 * Apply damage to a ship entity.
 * Placeholder implementation for module compatibility.
 * TODO: Replace with full damage system once modularized.
 *
 * @param {object} ship - Ship entity to damage
 * @param {number} amount - Damage amount
 * @returns {boolean} True if ship is destroyed
 */
export function applyDamageToShip(ship, amount) {
    if (!ship || typeof amount !== 'number') return false;
    if (typeof ship.hull !== 'number') return false;
    ship.hull = Math.max(0, ship.hull - amount);
    return ship.hull <= 0;
}

/**
 * Clone a cached GLB model for use in the game
 * Deep clones materials to allow independent coloring per instance
 *
 * @param {string} modelName - Name of the model file in cache
 * @param {Map} modelCache - Cache of loaded GLB models
 * @param {Object} THREE - Three.js library reference
 * @returns {THREE.Group|null} Cloned model or null if not cached
 */
export function cloneModel(modelName, modelCache, THREE) {
    const cached = modelCache.get(modelName);
    if (!cached) return null;

    const clone = cached.clone();
    // Deep clone materials to allow independent coloring
    clone.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material = child.material.clone();
        }
    });
    return clone;
}

/**
 * Get model name for a faction and ship type combination
 *
 * @param {string} faction - Faction identifier
 * @param {string} shipType - Ship type (fighter, heavy, boss)
 * @param {Object} FACTION_SHIP_MAPPING - Faction to model mapping object
 * @param {Object} SHIP_MODELS - Ship model filenames object
 * @returns {string} GLB model filename
 */
export function getModelForFaction(faction, shipType, FACTION_SHIP_MAPPING, SHIP_MODELS) {
    const mapping = FACTION_SHIP_MAPPING[faction] || FACTION_SHIP_MAPPING.pirates;
    const modelKey = mapping[shipType] || mapping.fighter;
    return SHIP_MODELS[modelKey] || SHIP_MODELS.pirate_fighter;
}

/**
 * Faction visual styles for procedural ship generation
 * Each faction has distinct colors, textures, and engine glows
 */
export const FACTION_STYLES = {
    // Human Industrial (UE-style) - Blue/Gray
    terranConfederacy: { textureType: 'ue', primary: 0x4a5568, accent: 0x3b82f6, engine: 0x00ffff, emissive: 0x1e3a8a },
    unitedEarth: { textureType: 'ue', primary: 0x4a5568, accent: 0x0ea5e9, engine: 0x00ddff, emissive: 0x1e3a8a },
    bhu: { textureType: 'ue', primary: 0x78716c, accent: 0xfbbf24, engine: 0xffaa00, emissive: 0x854d0e },
    galacticPolice: { textureType: 'ue', primary: 0xf8fafc, accent: 0x3b82f6, engine: 0x60a5fa, emissive: 0x1e40af },
    freeCompanies: { textureType: 'ue', primary: 0x52525b, accent: 0x22c55e, engine: 0x4ade80, emissive: 0x166534 },

    // Katuri - Aggressive Red/Black
    katuri: { textureType: 'katuri', primary: 0x7f1d1d, accent: 0xef4444, engine: 0xff4444, emissive: 0xdc2626 },

    // Crescent/Gadzair - Crystal Purple/Teal
    gadzair: { textureType: 'crescent', primary: 0x6b21a8, accent: 0x14b8a6, engine: 0xa855f7, emissive: 0x7c3aed },
    simnuvia: { textureType: 'crescent', primary: 0x0d9488, accent: 0x06b6d4, engine: 0x22d3ee, emissive: 0x0891b2 },

    // Voinian - Heavy Brown/Rust
    voinian: { textureType: 'voinian', primary: 0x78350f, accent: 0xd97706, engine: 0xf59e0b, emissive: 0xb45309 },
    emalgha: { textureType: 'voinian', primary: 0x365314, accent: 0x84cc16, engine: 0xa3e635, emissive: 0x4d7c0f },

    // Pirates - Cobbled Gray/Orange
    pirates: { textureType: 'pirate', primary: 0x374151, accent: 0xf97316, engine: 0xfb923c, emissive: 0xea580c },
    renegades: { textureType: 'pirate', primary: 0x1f2937, accent: 0xef4444, engine: 0xf87171, emissive: 0xb91c1c },

    // Miranu - Golden Traders
    miranu: { textureType: 'miranu', primary: 0xd97706, accent: 0xfcd34d, engine: 0xfde68a, emissive: 0xb45309 },

    // Rebels - Red/White
    secondRebellion: { textureType: 'ue', primary: 0x991b1b, accent: 0xffffff, engine: 0xfca5a5, emissive: 0xdc2626 },
    cau: { textureType: 'ue', primary: 0x166534, accent: 0x86efac, engine: 0x4ade80, emissive: 0x22c55e },

    // Alien/Mystery - Green Bioluminescent
    theAliens: { textureType: 'alien', primary: 0x064e3b, accent: 0x10b981, engine: 0x34d399, emissive: 0x059669 },
    seti: { textureType: 'alien', primary: 0x0c4a6e, accent: 0x0ea5e9, engine: 0x38bdf8, emissive: 0x0284c7 },

    // Other factions
    helionova: { textureType: 'crescent', primary: 0x581c87, accent: 0xc084fc, engine: 0xd8b4fe, emissive: 0x7e22ce },
    kliaphin: { textureType: 'crescent', primary: 0x4c1d95, accent: 0xa78bfa, engine: 0xc4b5fd, emissive: 0x6d28d9 },
    talramuv: { textureType: 'miranu', primary: 0x854d0e, accent: 0xfde047, engine: 0xfef08a, emissive: 0xca8a04 },
    hinwar: { textureType: 'ue', primary: 0x155e75, accent: 0x67e8f9, engine: 0xa5f3fc, emissive: 0x0891b2 }
};

/**
 * Get visual style for a faction
 *
 * @param {string} faction - Faction identifier
 * @param {Object} textureCreators - Object with texture creation functions by type
 * @returns {Object} Style object with texture function, colors, and emissive settings
 */
export function getFactionStyle(faction, textureCreators) {
    const baseStyle = FACTION_STYLES[faction] || FACTION_STYLES.pirates;
    const textureFunc = textureCreators[baseStyle.textureType] || textureCreators.pirate;
    return {
        texture: textureFunc,
        primary: baseStyle.primary,
        accent: baseStyle.accent,
        engine: baseStyle.engine,
        emissive: baseStyle.emissive
    };
}

/**
 * Create the player ship mesh
 * Uses GLB model if available, falls back to procedural generation
 *
 * @param {Object} deps - Dependencies object
 * @param {Object} deps.THREE - Three.js library
 * @param {Map} deps.modelCache - Cache of loaded GLB models
 * @param {Object} deps.SHIP_MODELS - Ship model filenames
 * @param {Object} deps.textureCreators - Texture creation functions
 * @returns {THREE.Group} Player ship group
 */
export function createPlayerShip(deps) {
    const { THREE, modelCache, SHIP_MODELS, textureCreators } = deps;
    const group = new THREE.Group();

    // Try to use GLB model first
    const modelName = SHIP_MODELS.player;
    const glbModel = cloneModel(modelName, modelCache, THREE);

    if (glbModel) {
        // Use the hand-made GLB model
        glbModel.rotation.x = -Math.PI / 2; // Rotate to face forward (nose = -Z)
        glbModel.rotation.z = Math.PI; // Flip to match expected orientation

        // Add engine glow effect
        const engineGlowGeom = new THREE.SphereGeometry(3, 8, 8);
        const engineMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const engineGlow = new THREE.Mesh(engineGlowGeom, engineMat);
        engineGlow.position.set(0, 0, 25); // Behind the ship
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

        // Scale for game
        group.scale.set(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE);

        // Set high render order so player renders above stations
        group.renderOrder = 100;
        group.traverse(child => {
            if (child.isMesh) {
                child.renderOrder = 100;
                child.material.depthTest = true;
            }
        });

        console.log('Using GLB model for player ship');
        return group;
    }

    // Fallback to procedural generation if model not loaded
    console.log('Falling back to procedural player ship');
    return createProceduralPlayerShip(deps);
}

/**
 * Create a procedural player ship (fallback when GLB not available)
 * Detailed UE-style fighter with wings, cockpit, engines
 *
 * @param {Object} deps - Dependencies object
 * @returns {THREE.Group} Procedural player ship group
 */
export function createProceduralPlayerShip(deps) {
    const { THREE, textureCreators } = deps;
    const group = new THREE.Group();

    const hullTexture = textureCreators.ue();
    const cockpitTexture = textureCreators.cockpit ? textureCreators.cockpit() : null;

    // Color palette - UE gunmetal with blue accents
    const hullColor = 0x4a5568;      // Gunmetal gray
    const accentColor = 0x3b82f6;    // Blue highlights
    const darkMetal = 0x2d3748;      // Dark sections
    const lightMetal = 0x64748b;     // Lighter panels

    // === MAIN FUSELAGE ===
    const fuselageShape = new THREE.Shape();
    fuselageShape.moveTo(0, -30);
    fuselageShape.lineTo(8, -25);
    fuselageShape.lineTo(12, -15);
    fuselageShape.lineTo(14, 0);
    fuselageShape.lineTo(14, 15);
    fuselageShape.lineTo(12, 25);
    fuselageShape.lineTo(8, 30);
    fuselageShape.lineTo(-8, 30);
    fuselageShape.lineTo(-12, 25);
    fuselageShape.lineTo(-14, 15);
    fuselageShape.lineTo(-14, 0);
    fuselageShape.lineTo(-12, -15);
    fuselageShape.lineTo(-8, -25);
    fuselageShape.closePath();

    const fuselageGeom = new THREE.ExtrudeGeometry(fuselageShape, {
        steps: 2,
        depth: 10,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
        bevelSegments: 2
    });
    const fuselageMat = new THREE.MeshStandardMaterial({
        map: hullTexture,
        color: hullColor,
        metalness: 0.75,
        roughness: 0.35
    });
    const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
    fuselage.rotation.x = -Math.PI / 2;
    fuselage.position.y = 3;
    group.add(fuselage);

    // Upper hull ridge
    const ridgeGeom = new THREE.BoxGeometry(4, 4, 50);
    const ridgeMat = new THREE.MeshStandardMaterial({
        map: hullTexture,
        color: darkMetal,
        metalness: 0.8,
        roughness: 0.3
    });
    const ridge = new THREE.Mesh(ridgeGeom, ridgeMat);
    ridge.position.set(0, 9, 0);
    group.add(ridge);

    // === NOSE SECTION ===
    const noseGeom = new THREE.ConeGeometry(6, 18, 8);
    const noseMat = new THREE.MeshStandardMaterial({
        color: lightMetal,
        metalness: 0.85,
        roughness: 0.2
    });
    const nose = new THREE.Mesh(noseGeom, noseMat);
    nose.position.set(0, 5, -38);
    nose.rotation.x = -Math.PI / 2;
    group.add(nose);

    // Nose tip sensor
    const sensorTipGeom = new THREE.SphereGeometry(2, 12, 12);
    const sensorTipMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.9,
        roughness: 0.1,
        emissive: accentColor,
        emissiveIntensity: 0.8
    });
    const sensorTip = new THREE.Mesh(sensorTipGeom, sensorTipMat);
    sensorTip.position.set(0, 5, -47);
    group.add(sensorTip);

    // Direction indicator beam
    const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
    });
    const beamGeom = new THREE.CylinderGeometry(0.5, 1, 30, 6);
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.set(0, 5, -65);
    beam.rotation.x = Math.PI / 2;
    beam.name = 'directionLine';
    group.add(beam);

    // Arrow indicator
    const arrowGeom = new THREE.ConeGeometry(3, 8, 6);
    const arrowMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);
    arrow.position.set(0, 5, -82);
    arrow.rotation.x = -Math.PI / 2;
    arrow.name = 'directionArrow';
    group.add(arrow);

    // === COCKPIT ASSEMBLY ===
    const cockpitFrameGeom = new THREE.BoxGeometry(10, 3, 16);
    const cockpitFrameMat = new THREE.MeshStandardMaterial({
        color: darkMetal,
        metalness: 0.8,
        roughness: 0.3
    });
    const cockpitFrame = new THREE.Mesh(cockpitFrameGeom, cockpitFrameMat);
    cockpitFrame.position.set(0, 10, -18);
    group.add(cockpitFrame);

    // Glass canopy
    const canopyGeom = new THREE.SphereGeometry(5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const canopyMat = new THREE.MeshStandardMaterial({
        map: cockpitTexture,
        color: 0x88ddff,
        metalness: 0.95,
        roughness: 0.05,
        transparent: true,
        opacity: 0.75,
        envMapIntensity: 1.2
    });
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 11.5, -18);
    canopy.scale.set(1.0, 0.6, 1.6);
    group.add(canopy);

    // === MAIN WINGS ===
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(35, 10);
    wingShape.lineTo(42, 8);
    wingShape.lineTo(45, 5);
    wingShape.lineTo(40, -5);
    wingShape.lineTo(10, -8);
    wingShape.closePath();

    const wingExtrudeSettings = {
        steps: 1,
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelSegments: 1
    };

    const wingMat = new THREE.MeshStandardMaterial({
        map: hullTexture,
        color: hullColor,
        metalness: 0.7,
        roughness: 0.4
    });

    const leftWingGeom = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
    const leftWing = new THREE.Mesh(leftWingGeom, wingMat);
    leftWing.position.set(-12, 4, 5);
    leftWing.rotation.x = -Math.PI / 2;
    leftWing.rotation.z = Math.PI;
    group.add(leftWing);

    const rightWing = new THREE.Mesh(leftWingGeom, wingMat);
    rightWing.position.set(12, 4, 5);
    rightWing.rotation.x = -Math.PI / 2;
    rightWing.rotation.z = 0;
    rightWing.scale.x = -1;
    group.add(rightWing);

    // === ENGINE NACELLES ===
    const engineHousingGeom = new THREE.CylinderGeometry(6, 8, 30, 12);
    const engineHousingMat = new THREE.MeshStandardMaterial({
        map: hullTexture,
        color: darkMetal,
        metalness: 0.8,
        roughness: 0.3
    });

    // Left engine
    const leftEngineHousing = new THREE.Mesh(engineHousingGeom, engineHousingMat);
    leftEngineHousing.position.set(-16, 3, 18);
    leftEngineHousing.rotation.x = Math.PI / 2;
    group.add(leftEngineHousing);

    // Right engine
    const rightEngineHousing = new THREE.Mesh(engineHousingGeom, engineHousingMat);
    rightEngineHousing.position.set(16, 3, 18);
    rightEngineHousing.rotation.x = Math.PI / 2;
    group.add(rightEngineHousing);

    // Engine glows
    const engineGlowMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const engineGlowGeom = new THREE.SphereGeometry(5, 8, 8);

    const leftGlow = new THREE.Mesh(engineGlowGeom, engineGlowMat);
    leftGlow.position.set(-16, 3, 38);
    leftGlow.name = 'engineGlow';
    group.add(leftGlow);

    const rightGlow = new THREE.Mesh(engineGlowGeom, engineGlowMat);
    rightGlow.position.set(16, 3, 38);
    rightGlow.name = 'engineGlow';
    group.add(rightGlow);

    // === NAVIGATION LIGHTS ===
    const navLightGeom = new THREE.SphereGeometry(1.2, 8, 8);
    const portLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 });
    const portLight = new THREE.Mesh(navLightGeom, portLightMat);
    portLight.position.set(-50, 5.5, 5);
    group.add(portLight);

    const starboardLightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.9 });
    const starboardLight = new THREE.Mesh(navLightGeom, starboardLightMat);
    starboardLight.position.set(50, 5.5, 5);
    group.add(starboardLight);

    // Scale and render order
    group.scale.set(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE);
    group.renderOrder = 100;
    group.traverse(child => {
        if (child.isMesh) {
            child.renderOrder = 100;
        }
    });

    return group;
}

/**
 * Create an enemy ship mesh
 * Uses GLB model if available, falls back to procedural generation
 *
 * @param {string} type - Ship type: 'fighter', 'heavy', or 'boss'
 * @param {string} faction - Faction identifier
 * @param {Object} deps - Dependencies object
 * @param {Object} deps.THREE - Three.js library
 * @param {Map} deps.modelCache - Cache of loaded GLB models
 * @param {Object} deps.SHIP_MODELS - Ship model filenames
 * @param {Object} deps.FACTION_SHIP_MAPPING - Faction mappings
 * @param {Object} deps.textureCreators - Texture creation functions
 * @returns {THREE.Group} Enemy ship group
 */
export function createEnemyShip(type = 'fighter', faction = 'pirates', deps) {
    const { THREE, modelCache, SHIP_MODELS, FACTION_SHIP_MAPPING, textureCreators } = deps;
    const group = new THREE.Group();
    const style = getFactionStyle(faction, textureCreators);

    // Try to use GLB model first
    const modelName = getModelForFaction(faction, type, FACTION_SHIP_MAPPING, SHIP_MODELS);
    const glbModel = cloneModel(modelName, modelCache, THREE);

    if (glbModel) {
        // Use the hand-made GLB model
        glbModel.rotation.x = -Math.PI / 2;
        glbModel.rotation.z = Math.PI;

        // Apply faction colors to the model
        glbModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.color) {
                    child.material.color.lerp(new THREE.Color(style.primary), 0.3);
                }
                child.material.metalness = 0.7;
                child.material.roughness = 0.4;
            }
        });

        // Add engine glow effect with faction color
        const engineGlowGeom = new THREE.SphereGeometry(2.5, 6, 6);
        const engineMat = new THREE.MeshBasicMaterial({
            color: style.engine,
            transparent: true,
            opacity: 0.8
        });
        const engineGlow = new THREE.Mesh(engineGlowGeom, engineMat);
        engineGlow.position.set(0, 0, 20);
        engineGlow.name = 'engineGlow';

        group.add(glbModel);
        group.add(engineGlow);

        // Scale based on ship type
        let scale = SHIP_SCALE;
        if (type === 'heavy') scale *= 1.5;
        if (type === 'boss') scale *= 2.5;
        group.scale.set(scale, scale, scale);

        return group;
    }

    // Fallback to procedural generation if model not loaded
    return createProceduralEnemyShip(type, faction, deps);
}

/**
 * Create a procedural enemy ship (fallback when GLB not available)
 *
 * @param {string} type - Ship type
 * @param {string} faction - Faction identifier
 * @param {Object} deps - Dependencies object
 * @returns {THREE.Group} Procedural enemy ship group
 */
export function createProceduralEnemyShip(type, faction, deps) {
    const { THREE, textureCreators } = deps;
    const group = new THREE.Group();
    const style = getFactionStyle(faction, textureCreators);
    const hullTexture = style.texture();

    // Material setup based on faction
    const hullMat = new THREE.MeshStandardMaterial({
        map: hullTexture,
        color: style.primary,
        metalness: 0.75,
        roughness: 0.35
    });

    const accentMat = new THREE.MeshStandardMaterial({
        color: style.accent,
        metalness: 0.8,
        roughness: 0.25,
        emissive: style.emissive,
        emissiveIntensity: 0.3
    });

    const engineMat = new THREE.MeshBasicMaterial({
        color: style.engine,
        transparent: true,
        opacity: 0.9
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.2
    });

    // Determine ship design based on faction category
    const isHuman = ['terranConfederacy', 'unitedEarth', 'secondRebellion', 'cau', 'bhu', 'galacticPolice', 'freeCompanies', 'helionova', 'seti'].includes(faction);
    const isCrescent = ['gadzair', 'simnuvia', 'kliaphin'].includes(faction);
    const isVoinian = ['voinian', 'emalgha'].includes(faction);
    const isAlien = ['theAliens'].includes(faction);
    const isMiranu = ['miranu', 'talramuv', 'hinwar'].includes(faction);
    const isKaturi = ['katuri'].includes(faction);

    // Build appropriate ship geometry
    if (type === 'fighter') {
        if (isHuman) {
            createHumanFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isKaturi) {
            createKaturiFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isCrescent) {
            createCrescentFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isVoinian) {
            createVoinianFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isMiranu) {
            createMiranuFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isAlien) {
            createAlienFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else {
            createPirateFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        }
    } else if (type === 'heavy') {
        if (isHuman) {
            createHumanHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isKaturi) {
            createKaturiHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isCrescent) {
            createCrescentHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isVoinian) {
            createVoinianHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isMiranu) {
            createMiranuHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isAlien) {
            createAlienHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else {
            createPirateHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        }
    } else if (type === 'boss') {
        if (isHuman) {
            createHumanCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isKaturi) {
            createKaturiCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isCrescent) {
            createCrescentCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isVoinian) {
            createVoinianCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else if (isAlien) {
            createAlienCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        } else {
            createPirateCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE);
        }
    }

    // Scale down all enemy ships
    group.scale.set(SHIP_SCALE, SHIP_SCALE, SHIP_SCALE);

    return group;
}


// ============================================================
// PROCEDURAL SHIP GENERATORS BY FACTION
// ============================================================

/**
 * Create Human Fighter - Industrial military interceptor
 */
export function createHumanFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Fuselage - elongated body
    const fuselageGeom = new THREE.BoxGeometry(10, 6, 28);
    const fuselage = new THREE.Mesh(fuselageGeom, hullMat);
    group.add(fuselage);

    // Nose cone
    const noseGeom = new THREE.ConeGeometry(5, 12, 8);
    const nose = new THREE.Mesh(noseGeom, hullMat);
    nose.position.set(0, 0, -18);
    nose.rotation.x = -Math.PI / 2;
    group.add(nose);

    // Nose tip indicator
    const noseTipGeom = new THREE.SphereGeometry(1.5, 8, 8);
    const noseTip = new THREE.Mesh(noseTipGeom, accentMat);
    noseTip.position.set(0, 0, -24);
    group.add(noseTip);

    // Cockpit canopy
    const cockpitGeom = new THREE.SphereGeometry(3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x88ddff,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.7
    });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.set(0, 4, -8);
    cockpit.scale.set(1, 0.6, 1.4);
    group.add(cockpit);

    // Swept wings
    const wingGeom = new THREE.BoxGeometry(32, 1.5, 12);
    const wings = new THREE.Mesh(wingGeom, hullMat);
    wings.position.set(0, 0, 2);
    group.add(wings);

    // Wing tips
    const wingTipGeom = new THREE.BoxGeometry(4, 1, 6);
    [[-18, 0, -2], [18, 0, -2]].forEach(([x, y, z]) => {
        const tip = new THREE.Mesh(wingTipGeom, accentMat);
        tip.position.set(x, y, z);
        group.add(tip);
    });

    // Gun barrels
    const gunGeom = new THREE.CylinderGeometry(0.8, 1, 12, 6);
    [[-6, 0, -14], [6, 0, -14]].forEach(([x, y, z]) => {
        const gun = new THREE.Mesh(gunGeom, darkMat);
        gun.position.set(x, y, z);
        gun.rotation.x = Math.PI / 2;
        group.add(gun);
    });

    // Engine nacelles
    const engineGeom = new THREE.CylinderGeometry(3, 4, 14, 8);
    [[-8, 0, 12], [8, 0, 12]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
    });

    // Engine glows
    const glowGeom = new THREE.SphereGeometry(3, 8, 8);
    [[-8, 0, 20], [8, 0, 20]].forEach(([x, y, z]) => {
        const glow = new THREE.Mesh(glowGeom, engineMat);
        glow.position.set(x, y, z);
        group.add(glow);
    });

    // Navigation lights
    const navGeom = new THREE.SphereGeometry(0.6, 6, 6);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const redNav = new THREE.Mesh(navGeom, redMat);
    redNav.position.set(-17, 1, 2);
    group.add(redNav);
    const greenNav = new THREE.Mesh(navGeom, greenMat);
    greenNav.position.set(17, 1, 2);
    group.add(greenNav);
}

/**
 * Create Human Heavy ship
 */
export function createHumanHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Main hull - boxier, heavier
    const hullGeom = new THREE.BoxGeometry(22, 10, 45);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Forward section
    const foreGeom = new THREE.BoxGeometry(16, 8, 20);
    const fore = new THREE.Mesh(foreGeom, hullMat);
    fore.position.set(0, 0, -28);
    group.add(fore);

    // Bridge tower
    const bridgeGeom = new THREE.BoxGeometry(10, 8, 12);
    const bridge = new THREE.Mesh(bridgeGeom, hullMat);
    bridge.position.set(0, 9, -10);
    group.add(bridge);

    // Wing pylons
    const pylonGeom = new THREE.BoxGeometry(35, 4, 18);
    const pylons = new THREE.Mesh(pylonGeom, hullMat);
    pylons.position.set(0, -3, 5);
    group.add(pylons);

    // Accent stripes
    const stripeGeom = new THREE.BoxGeometry(0.5, 10, 50);
    [[-10, 0, 0], [10, 0, 0]].forEach(([x, y, z]) => {
        const stripe = new THREE.Mesh(stripeGeom, accentMat);
        stripe.position.set(x, y, z);
        group.add(stripe);
    });

    // Turrets
    const turretBaseGeom = new THREE.CylinderGeometry(3, 4, 3, 8);
    const turretGunGeom = new THREE.CylinderGeometry(1, 1.2, 10, 6);
    [[-8, 9, 5], [8, 9, 5], [0, 7, -35]].forEach(([x, y, z]) => {
        const base = new THREE.Mesh(turretBaseGeom, darkMat);
        base.position.set(x, y, z);
        group.add(base);
        const gun = new THREE.Mesh(turretGunGeom, darkMat);
        gun.position.set(x, y + 2, z - 6);
        gun.rotation.x = Math.PI / 2;
        group.add(gun);
    });

    // Dual heavy engines
    const engineGeom = new THREE.CylinderGeometry(5, 6, 18, 10);
    [[-10, 0, 28], [10, 0, 28]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), engineMat);
        glow.position.set(x, y, z + 12);
        group.add(glow);
    });
}

/**
 * Create Human Capital ship
 */
export function createHumanCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive carrier hull
    const hullGeom = new THREE.BoxGeometry(50, 18, 90);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Command tower
    const towerGeom = new THREE.BoxGeometry(20, 25, 30);
    const tower = new THREE.Mesh(towerGeom, hullMat);
    tower.position.set(0, 20, -15);
    group.add(tower);

    // Flight deck
    const deckGeom = new THREE.BoxGeometry(40, 2, 70);
    const deck = new THREE.Mesh(deckGeom, darkMat);
    deck.position.set(0, 10, 10);
    group.add(deck);

    // Wing extensions
    const wingGeom = new THREE.BoxGeometry(80, 5, 30);
    const wings = new THREE.Mesh(wingGeom, hullMat);
    wings.position.set(0, 0, 20);
    group.add(wings);

    // Multiple engine blocks
    const engineGeom = new THREE.CylinderGeometry(8, 10, 25, 12);
    [[-20, 0, 55], [0, 0, 60], [20, 0, 55], [-35, -5, 50], [35, -5, 50]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(8, 10, 10), engineMat);
        glow.position.set(x, y, z + 15);
        group.add(glow);
    });
}

/**
 * Create Katuri Fighter - Angular aggressive interceptor
 */
export function createKaturiFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Angular aggressive body
    const bodyGeom = new THREE.BoxGeometry(8, 5, 20);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    group.add(body);

    // Sharp nose blade
    const noseGeom = new THREE.BoxGeometry(2, 3, 15);
    const nose = new THREE.Mesh(noseGeom, accentMat);
    nose.position.set(0, 0, -15);
    nose.rotation.z = Math.PI / 4;
    group.add(nose);

    // Angular wings
    const wingGeom = new THREE.BoxGeometry(28, 1, 15);
    const wings = new THREE.Mesh(wingGeom, hullMat);
    wings.position.set(0, 0, 0);
    wings.rotation.z = 0.1;
    group.add(wings);

    // Wing blades
    const bladeGeom = new THREE.BoxGeometry(8, 0.5, 20);
    [[-18, 1, -3], [18, 1, -3]].forEach(([x, y, z]) => {
        const blade = new THREE.Mesh(bladeGeom, accentMat);
        blade.position.set(x, y, z);
        blade.rotation.z = x > 0 ? -0.2 : 0.2;
        group.add(blade);
    });

    // Single powerful engine
    const engineGeom = new THREE.CylinderGeometry(3, 5, 12, 8);
    const engine = new THREE.Mesh(engineGeom, darkMat);
    engine.position.set(0, 0, 14);
    engine.rotation.x = Math.PI / 2;
    group.add(engine);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), engineMat);
    glow.position.set(0, 0, 21);
    group.add(glow);
}

/**
 * Create Katuri Heavy ship
 */
export function createKaturiHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Heavy angular hull
    const hullGeom = new THREE.BoxGeometry(20, 12, 40);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Forward blade prow
    const prowGeom = new THREE.BoxGeometry(12, 8, 25);
    const prow = new THREE.Mesh(prowGeom, hullMat);
    prow.position.set(0, 0, -28);
    group.add(prow);

    // Weapon spines
    const spineGeom = new THREE.BoxGeometry(2, 15, 50);
    [[-8, 5, 0], [8, 5, 0]].forEach(([x, y, z]) => {
        const spine = new THREE.Mesh(spineGeom, accentMat);
        spine.position.set(x, y, z);
        group.add(spine);
    });

    // Twin engines
    const engineGeom = new THREE.CylinderGeometry(5, 7, 15, 8);
    [[-8, 0, 25], [8, 0, 25]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, darkMat);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 8), engineMat);
        glow.position.set(x, y, z + 10);
        group.add(glow);
    });
}

/**
 * Create Katuri Capital ship
 */
export function createKaturiCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive angular dreadnought
    const hullGeom = new THREE.BoxGeometry(50, 20, 100);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Command blade
    const bladeGeom = new THREE.BoxGeometry(10, 30, 40);
    const blade = new THREE.Mesh(bladeGeom, accentMat);
    blade.position.set(0, 20, -20);
    group.add(blade);

    // Weapon arrays
    const arrayGeom = new THREE.BoxGeometry(60, 5, 20);
    const array = new THREE.Mesh(arrayGeom, hullMat);
    array.position.set(0, 10, 20);
    group.add(array);

    // Multiple engines
    const engineGeom = new THREE.CylinderGeometry(10, 12, 20, 10);
    [[-18, 0, 55], [0, 0, 60], [18, 0, 55]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, darkMat);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 10), engineMat);
        glow.position.set(x, y, z + 12);
        group.add(glow);
    });
}

/**
 * Create Crescent Fighter - Organic crystal design
 */
export function createCrescentFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Organic curved body
    const bodyGeom = new THREE.SphereGeometry(8, 12, 8);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    body.scale.set(1, 0.6, 2);
    group.add(body);

    // Crystal nose
    const noseGeom = new THREE.OctahedronGeometry(5, 0);
    const nose = new THREE.Mesh(noseGeom, accentMat);
    nose.position.set(0, 0, -18);
    nose.scale.set(0.6, 0.6, 1.5);
    group.add(nose);

    // Flowing wing curves
    const wingGeom = new THREE.TorusGeometry(18, 2, 8, 16, Math.PI * 0.6);
    const leftWing = new THREE.Mesh(wingGeom, hullMat);
    leftWing.position.set(-5, 0, 3);
    leftWing.rotation.x = Math.PI / 2;
    leftWing.rotation.z = -0.3;
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeom, hullMat);
    rightWing.position.set(5, 0, 3);
    rightWing.rotation.x = Math.PI / 2;
    rightWing.rotation.z = Math.PI + 0.3;
    group.add(rightWing);

    // Crystal weapon pods
    const crystalGeom = new THREE.OctahedronGeometry(3, 0);
    [[-20, 0, 0], [20, 0, 0]].forEach(([x, y, z]) => {
        const crystal = new THREE.Mesh(crystalGeom, accentMat);
        crystal.position.set(x, y, z);
        group.add(crystal);
    });

    // Organic engine
    const engineGeom = new THREE.SphereGeometry(4, 10, 10);
    const engine = new THREE.Mesh(engineGeom, hullMat);
    engine.position.set(0, 0, 14);
    engine.scale.set(1, 1, 1.5);
    group.add(engine);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), engineMat);
    glow.position.set(0, 0, 20);
    group.add(glow);
}

/**
 * Create Crescent Heavy ship
 */
export function createCrescentHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Flowing organic hull
    const hullGeom = new THREE.SphereGeometry(15, 16, 12);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.scale.set(1.2, 0.7, 2.5);
    group.add(hull);

    // Crystal spires
    const spireGeom = new THREE.ConeGeometry(3, 20, 6);
    [[0, 8, -20], [-12, 6, -10], [12, 6, -10]].forEach(([x, y, z]) => {
        const spire = new THREE.Mesh(spireGeom, accentMat);
        spire.position.set(x, y, z);
        spire.rotation.x = -0.3;
        group.add(spire);
    });

    // Sweeping wing arcs
    const arcGeom = new THREE.TorusGeometry(25, 3, 8, 20, Math.PI * 0.7);
    [1, -1].forEach(side => {
        const arc = new THREE.Mesh(arcGeom, hullMat);
        arc.position.set(side * 8, 0, 5);
        arc.rotation.x = Math.PI / 2;
        arc.rotation.z = side > 0 ? -0.4 : Math.PI + 0.4;
        group.add(arc);
    });

    // Crystal nodes
    const nodeGeom = new THREE.IcosahedronGeometry(5, 0);
    [[-22, 0, 8], [22, 0, 8], [0, 10, 0]].forEach(([x, y, z]) => {
        const node = new THREE.Mesh(nodeGeom, accentMat);
        node.position.set(x, y, z);
        group.add(node);
    });

    // Twin organic engines
    const engineGeom = new THREE.SphereGeometry(6, 10, 10);
    [[-10, 0, 30], [10, 0, 30]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.scale.set(1, 1, 1.5);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), engineMat);
        glow.position.set(x, y, z + 8);
        group.add(glow);
    });
}

/**
 * Create Crescent Capital ship
 */
export function createCrescentCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive organic form
    const hullGeom = new THREE.SphereGeometry(35, 20, 16);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.scale.set(1.3, 0.6, 2.5);
    group.add(hull);

    // Grand crystal spire
    const spireGeom = new THREE.ConeGeometry(8, 40, 8);
    const spire = new THREE.Mesh(spireGeom, accentMat);
    spire.position.set(0, 25, -30);
    group.add(spire);

    // Sweeping organic wings
    const wingGeom = new THREE.TorusGeometry(50, 6, 10, 24, Math.PI * 0.6);
    [1, -1].forEach(side => {
        const wing = new THREE.Mesh(wingGeom, hullMat);
        wing.position.set(side * 15, 0, 10);
        wing.rotation.x = Math.PI / 2;
        wing.rotation.z = side > 0 ? -0.3 : Math.PI + 0.3;
        group.add(wing);
    });

    // Major crystal formations
    const crystalGeom = new THREE.OctahedronGeometry(12, 0);
    [[-40, 5, 15], [40, 5, 15], [0, 15, -50], [-30, 10, -30], [30, 10, -30]].forEach(([x, y, z]) => {
        const crystal = new THREE.Mesh(crystalGeom, accentMat);
        crystal.position.set(x, y, z);
        group.add(crystal);
    });

    // Multiple organic engines
    const engineGeom = new THREE.SphereGeometry(10, 12, 12);
    [[-25, 0, 70], [0, 0, 75], [25, 0, 70], [-40, -5, 60], [40, -5, 60]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.scale.set(1, 1, 1.5);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(9, 10, 10), engineMat);
        glow.position.set(x, y, z + 12);
        group.add(glow);
    });
}

/**
 * Create Voinian Fighter - Heavy armored
 */
export function createVoinianFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Blocky armored body
    const bodyGeom = new THREE.BoxGeometry(12, 8, 25);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    group.add(body);

    // Armor plates
    const plateGeom = new THREE.BoxGeometry(14, 2, 20);
    [4, -4].forEach(y => {
        const plate = new THREE.Mesh(plateGeom, hullMat);
        plate.position.set(0, y, 0);
        group.add(plate);
    });

    // Blunt nose
    const noseGeom = new THREE.BoxGeometry(10, 6, 8);
    const nose = new THREE.Mesh(noseGeom, hullMat);
    nose.position.set(0, 0, -15);
    group.add(nose);

    // Heavy weapon mount
    const gunGeom = new THREE.CylinderGeometry(2, 2.5, 15, 8);
    const gun = new THREE.Mesh(gunGeom, darkMat);
    gun.position.set(0, 0, -22);
    gun.rotation.x = Math.PI / 2;
    group.add(gun);

    // Stubby wings
    const wingGeom = new THREE.BoxGeometry(20, 4, 15);
    const wings = new THREE.Mesh(wingGeom, hullMat);
    wings.position.set(0, 0, 0);
    group.add(wings);

    // Wing armor bolts
    const boltGeom = new THREE.CylinderGeometry(0.8, 0.8, 1, 6);
    [[-8, 2.5, -5], [-8, 2.5, 5], [8, 2.5, -5], [8, 2.5, 5]].forEach(([x, y, z]) => {
        const bolt = new THREE.Mesh(boltGeom, accentMat);
        bolt.position.set(x, y, z);
        group.add(bolt);
    });

    // Single heavy engine
    const engineGeom = new THREE.BoxGeometry(8, 6, 10);
    const engine = new THREE.Mesh(engineGeom, darkMat);
    engine.position.set(0, 0, 16);
    group.add(engine);

    const glow = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 2), engineMat);
    glow.position.set(0, 0, 22);
    group.add(glow);
}

/**
 * Create Voinian Heavy ship
 */
export function createVoinianHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive armored hull
    const hullGeom = new THREE.BoxGeometry(30, 15, 55);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Layered armor plating
    for (let i = 0; i < 3; i++) {
        const plateGeom = new THREE.BoxGeometry(32 - i * 2, 3, 50 - i * 5);
        const plate = new THREE.Mesh(plateGeom, hullMat);
        plate.position.set(0, 8 + i * 3, i * 2);
        group.add(plate);
    }

    // Heavy forward ram
    const ramGeom = new THREE.BoxGeometry(20, 12, 25);
    const ram = new THREE.Mesh(ramGeom, hullMat);
    ram.position.set(0, 0, -35);
    group.add(ram);

    // Turret hardpoints
    const turretGeom = new THREE.BoxGeometry(6, 6, 8);
    [[-12, 12, -10], [12, 12, -10], [-12, 12, 15], [12, 12, 15]].forEach(([x, y, z]) => {
        const turret = new THREE.Mesh(turretGeom, darkMat);
        turret.position.set(x, y, z);
        group.add(turret);
        const gun = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 12, 6), darkMat);
        gun.position.set(x, y + 3, z - 8);
        gun.rotation.x = Math.PI / 2;
        group.add(gun);
    });

    // Dual heavy engines
    const engineGeom = new THREE.BoxGeometry(10, 10, 15);
    [[-12, 0, 32], [12, 0, 32]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, darkMat);
        engine.position.set(x, y, z);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 3), engineMat);
        glow.position.set(x, y, z + 10);
        group.add(glow);
    });
}

/**
 * Create Voinian Capital ship
 */
export function createVoinianCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive armored dreadnought
    const hullGeom = new THREE.BoxGeometry(70, 25, 110);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Multiple armor layers
    for (let i = 0; i < 4; i++) {
        const plateGeom = new THREE.BoxGeometry(72 - i * 3, 4, 100 - i * 8);
        const plate = new THREE.Mesh(plateGeom, hullMat);
        plate.position.set(0, 13 + i * 4, i * 3);
        group.add(plate);
    }

    // Armored command citadel
    const citadelGeom = new THREE.BoxGeometry(30, 20, 35);
    const citadel = new THREE.Mesh(citadelGeom, hullMat);
    citadel.position.set(0, 22, -20);
    group.add(citadel);

    // Heavy weapon batteries
    const batteryGeom = new THREE.BoxGeometry(10, 10, 15);
    [[-30, 15, -40], [30, 15, -40], [-30, 15, 10], [30, 15, 10], [0, 22, -50]].forEach(([x, y, z]) => {
        const battery = new THREE.Mesh(batteryGeom, darkMat);
        battery.position.set(x, y, z);
        group.add(battery);
        const gun = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 20, 8), darkMat);
        gun.position.set(x, y + 5, z - 15);
        gun.rotation.x = Math.PI / 2;
        group.add(gun);
    });

    // Massive engines
    const engineGeom = new THREE.BoxGeometry(15, 15, 20);
    [[-25, 0, 60], [0, 0, 65], [25, 0, 60], [-35, -8, 55], [35, -8, 55]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, darkMat);
        engine.position.set(x, y, z);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 4), engineMat);
        glow.position.set(x, y, z + 12);
        group.add(glow);
    });
}

/**
 * Create Pirate Fighter - Cobbled together
 */
export function createPirateFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Asymmetric cobbled body
    const bodyGeom = new THREE.BoxGeometry(10, 7, 22);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    body.rotation.z = 0.1;
    group.add(body);

    // Patched nose
    const noseGeom = new THREE.BoxGeometry(6, 5, 10);
    const nose = new THREE.Mesh(noseGeom, hullMat);
    nose.position.set(0.5, 0, -14);
    group.add(nose);

    // Salvaged cockpit
    const cockpitGeom = new THREE.SphereGeometry(3, 8, 6);
    const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x666688,
        metalness: 0.8,
        roughness: 0.3,
        transparent: true,
        opacity: 0.6
    });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.set(-0.5, 4, -6);
    cockpit.scale.set(1, 0.7, 1.2);
    group.add(cockpit);

    // Mismatched wings
    const leftWingGeom = new THREE.BoxGeometry(18, 1.5, 10);
    const leftWing = new THREE.Mesh(leftWingGeom, hullMat);
    leftWing.position.set(-12, 0.5, 2);
    leftWing.rotation.z = 0.15;
    group.add(leftWing);

    const rightWingGeom = new THREE.BoxGeometry(15, 1.5, 12);
    const rightWing = new THREE.Mesh(rightWingGeom, hullMat);
    rightWing.position.set(11, -0.3, 0);
    rightWing.rotation.z = -0.1;
    group.add(rightWing);

    // Jury-rigged guns
    const gunGeom = new THREE.CylinderGeometry(0.8, 1.2, 10, 6);
    [[-5, 1, -12], [6, -1, -14]].forEach(([x, y, z]) => {
        const gun = new THREE.Mesh(gunGeom, darkMat);
        gun.position.set(x, y, z);
        gun.rotation.x = Math.PI / 2;
        gun.rotation.z = (Math.random() - 0.5) * 0.2;
        group.add(gun);
    });

    // Salvaged engine
    const engineGeom = new THREE.CylinderGeometry(4, 5, 12, 8);
    const engine = new THREE.Mesh(engineGeom, darkMat);
    engine.position.set(0, 0, 14);
    engine.rotation.x = Math.PI / 2;
    engine.rotation.z = 0.1;
    group.add(engine);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), engineMat);
    glow.position.set(0, 0, 21);
    group.add(glow);

    // Warning stripe accent
    const stripeGeom = new THREE.BoxGeometry(0.5, 6, 15);
    const stripe = new THREE.Mesh(stripeGeom, accentMat);
    stripe.position.set(5, 0, 0);
    group.add(stripe);
}

/**
 * Create Pirate Heavy ship
 */
export function createPirateHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Converted freighter hull
    const hullGeom = new THREE.BoxGeometry(25, 12, 45);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Welded armor patches
    for (let i = 0; i < 5; i++) {
        const patchGeom = new THREE.BoxGeometry(
            8 + Math.random() * 6,
            2,
            10 + Math.random() * 8
        );
        const patch = new THREE.Mesh(patchGeom, hullMat);
        patch.position.set(
            (Math.random() - 0.5) * 20,
            7 + Math.random() * 2,
            (Math.random() - 0.5) * 30
        );
        patch.rotation.z = (Math.random() - 0.5) * 0.1;
        group.add(patch);
    }

    // Added weapon turrets
    const turretGeom = new THREE.CylinderGeometry(3, 4, 4, 8);
    [[-10, 9, -10], [10, 9, 10], [0, 9, -20]].forEach(([x, y, z]) => {
        const turret = new THREE.Mesh(turretGeom, darkMat);
        turret.position.set(x, y, z);
        group.add(turret);
        const gun = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 12, 6), darkMat);
        gun.position.set(x, y + 2, z - 8);
        gun.rotation.x = Math.PI / 2;
        group.add(gun);
    });

    // Mismatched engines
    const engine1Geom = new THREE.CylinderGeometry(5, 6, 14, 8);
    const engine1 = new THREE.Mesh(engine1Geom, darkMat);
    engine1.position.set(-8, 0, 26);
    engine1.rotation.x = Math.PI / 2;
    group.add(engine1);

    const engine2Geom = new THREE.BoxGeometry(10, 8, 12);
    const engine2 = new THREE.Mesh(engine2Geom, darkMat);
    engine2.position.set(8, 0, 24);
    group.add(engine2);

    // Engine glows
    [[-8, 0, 34], [8, 0, 31]].forEach(([x, y, z]) => {
        const glow = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), engineMat);
        glow.position.set(x, y, z);
        group.add(glow);
    });
}

/**
 * Create Pirate Capital ship
 */
export function createPirateCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive converted hauler
    const hullGeom = new THREE.BoxGeometry(55, 22, 85);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    group.add(hull);

    // Added command tower
    const towerGeom = new THREE.BoxGeometry(18, 18, 25);
    const tower = new THREE.Mesh(towerGeom, hullMat);
    tower.position.set(-8, 18, -15);
    tower.rotation.y = 0.1;
    group.add(tower);

    // Heavy weapon additions
    const batteryGeom = new THREE.BoxGeometry(12, 8, 12);
    [[-20, 14, -30], [20, 14, -25], [-22, 14, 20], [22, 14, 15], [0, 16, -40]].forEach(([x, y, z]) => {
        const battery = new THREE.Mesh(batteryGeom, darkMat);
        battery.position.set(x, y, z);
        battery.rotation.y = (Math.random() - 0.5) * 0.2;
        group.add(battery);
        const gun = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 18, 8), darkMat);
        gun.position.set(x, y + 4, z - 12);
        gun.rotation.x = Math.PI / 2;
        group.add(gun);
    });

    // Welded wing platforms
    const platformGeom = new THREE.BoxGeometry(35, 4, 30);
    [[-30, -5, 15], [30, -5, 10]].forEach(([x, y, z]) => {
        const platform = new THREE.Mesh(platformGeom, hullMat);
        platform.position.set(x, y, z);
        platform.rotation.z = x > 0 ? 0.1 : -0.1;
        group.add(platform);
    });

    // Multiple salvaged engines
    const engineGeom = new THREE.CylinderGeometry(8, 10, 18, 10);
    [[-18, 0, 48], [0, 0, 52], [18, 0, 48], [-28, -8, 42], [28, -8, 42]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, darkMat);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        engine.rotation.z = (Math.random() - 0.5) * 0.15;
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(8, 10, 10), engineMat);
        glow.position.set(x, y, z + 12);
        group.add(glow);
    });
}

/**
 * Create Miranu Fighter - Rounded trader escort
 */
export function createMiranuFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Rounded trader-style body
    const bodyGeom = new THREE.SphereGeometry(8, 12, 10);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    body.scale.set(1, 0.7, 1.8);
    group.add(body);

    // Golden sensor dome
    const domeGeom = new THREE.SphereGeometry(4, 10, 8);
    const dome = new THREE.Mesh(domeGeom, accentMat);
    dome.position.set(0, 4, -8);
    dome.scale.set(1, 0.6, 1);
    group.add(dome);

    // Smooth wings
    const wingGeom = new THREE.SphereGeometry(12, 10, 8);
    [1, -1].forEach(side => {
        const wing = new THREE.Mesh(wingGeom, hullMat);
        wing.position.set(side * 10, 0, 2);
        wing.scale.set(1, 0.2, 0.8);
        group.add(wing);
    });

    // Engine pod
    const engineGeom = new THREE.SphereGeometry(5, 10, 10);
    const engine = new THREE.Mesh(engineGeom, hullMat);
    engine.position.set(0, 0, 14);
    engine.scale.set(1, 1, 1.3);
    group.add(engine);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), engineMat);
    glow.position.set(0, 0, 20);
    group.add(glow);
}

/**
 * Create Miranu Heavy ship
 */
export function createMiranuHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Rounded freighter hull
    const hullGeom = new THREE.SphereGeometry(20, 16, 12);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.scale.set(1, 0.6, 2);
    group.add(hull);

    // Golden trim
    const trimGeom = new THREE.TorusGeometry(18, 2, 8, 24);
    const trim = new THREE.Mesh(trimGeom, accentMat);
    trim.position.set(0, 0, 0);
    trim.rotation.y = Math.PI / 2;
    group.add(trim);

    // Cargo pods
    const podGeom = new THREE.SphereGeometry(8, 10, 8);
    [[-18, -4, 10], [18, -4, 10]].forEach(([x, y, z]) => {
        const pod = new THREE.Mesh(podGeom, hullMat);
        pod.position.set(x, y, z);
        pod.scale.set(1, 1, 1.5);
        group.add(pod);
    });

    // Twin engines
    const engineGeom = new THREE.SphereGeometry(7, 10, 10);
    [[-10, 0, 35], [10, 0, 35]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.scale.set(1, 1, 1.5);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 8), engineMat);
        glow.position.set(x, y, z + 10);
        group.add(glow);
    });
}

/**
 * Create Alien Fighter - Otherworldly organic
 */
export function createAlienFighter(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Alien organic body
    const bodyGeom = new THREE.SphereGeometry(6, 10, 8);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    body.scale.set(1, 0.8, 2.2);
    group.add(body);

    // Bio-luminescent core
    const coreGeom = new THREE.SphereGeometry(3, 8, 8);
    const core = new THREE.Mesh(coreGeom, accentMat);
    core.position.set(0, 2, -6);
    group.add(core);

    // Tentacle-like wings
    const tentacleGeom = new THREE.CylinderGeometry(1.5, 3, 20, 8);
    [[-8, 0, 0], [8, 0, 0]].forEach(([x, y, z]) => {
        const tentacle = new THREE.Mesh(tentacleGeom, hullMat);
        tentacle.position.set(x, y, z);
        tentacle.rotation.z = x > 0 ? -0.4 : 0.4;
        tentacle.rotation.x = 0.2;
        group.add(tentacle);
    });

    // Organic propulsion
    const propGeom = new THREE.SphereGeometry(4, 8, 8);
    const prop = new THREE.Mesh(propGeom, hullMat);
    prop.position.set(0, 0, 12);
    prop.scale.set(0.8, 0.8, 1.5);
    group.add(prop);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), engineMat);
    glow.position.set(0, 0, 18);
    group.add(glow);
}

/**
 * Create Alien Heavy ship
 */
export function createAlienHeavy(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Larger organic form
    const bodyGeom = new THREE.SphereGeometry(15, 14, 12);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    body.scale.set(1.2, 0.7, 2);
    group.add(body);

    // Multiple bio-cores
    const coreGeom = new THREE.SphereGeometry(5, 10, 8);
    [[0, 8, -10], [-10, 5, 0], [10, 5, 0]].forEach(([x, y, z]) => {
        const core = new THREE.Mesh(coreGeom, accentMat);
        core.position.set(x, y, z);
        group.add(core);
    });

    // Extended tentacles
    const tentGeom = new THREE.CylinderGeometry(2, 4, 30, 8);
    [[-18, 0, 5], [18, 0, 5], [-12, -8, 15], [12, -8, 15]].forEach(([x, y, z]) => {
        const tent = new THREE.Mesh(tentGeom, hullMat);
        tent.position.set(x, y, z);
        tent.rotation.z = x > 0 ? -0.3 : 0.3;
        group.add(tent);
    });

    // Organic engines
    const engineGeom = new THREE.SphereGeometry(8, 10, 10);
    [[-12, 0, 35], [12, 0, 35]].forEach(([x, y, z]) => {
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.scale.set(1, 1, 1.5);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(7, 8, 8), engineMat);
        glow.position.set(x, y, z + 10);
        group.add(glow);
    });
}

/**
 * Create Alien Capital ship
 */
export function createAlienCapital(group, hullMat, accentMat, engineMat, darkMat, style, THREE) {
    // Massive alien mothership
    const bodyGeom = new THREE.SphereGeometry(40, 20, 16);
    const body = new THREE.Mesh(bodyGeom, hullMat);
    body.scale.set(1.3, 0.6, 2);
    group.add(body);

    // Central eye/command node
    const eyeGeom = new THREE.SphereGeometry(15, 16, 12);
    const eye = new THREE.Mesh(eyeGeom, accentMat);
    eye.position.set(0, 15, -30);
    group.add(eye);

    // Bio-luminescent veins
    const veinGeom = new THREE.CylinderGeometry(2, 3, 80, 6);
    [[0, 10, 0], [-30, 5, 10], [30, 5, 10]].forEach(([x, y, z]) => {
        const vein = new THREE.Mesh(veinGeom, accentMat);
        vein.position.set(x, y, z);
        vein.rotation.x = Math.PI / 2;
        group.add(vein);
    });

    // Tentacle extensions
    const tentGeom = new THREE.CylinderGeometry(3, 5, 50, 8);
    [[-40, 0, -20], [40, 0, -20], [-35, -10, 20], [35, -10, 20], [0, -15, -40]].forEach(([x, y, z]) => {
        const tent = new THREE.Mesh(tentGeom, hullMat);
        tent.position.set(x, y, z);
        tent.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        tent.rotation.z = (Math.random() - 0.5) * 0.3;
        group.add(tent);
    });

    // Multiple organic engines
    [[-30, 0, 70], [0, 0, 80], [30, 0, 70], [-40, -10, 60], [40, -10, 60]].forEach(([x, y, z]) => {
        const engineGeom = new THREE.SphereGeometry(12, 12, 10);
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.position.set(x, y, z);
        engine.scale.set(1, 1, 1.5);
        group.add(engine);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 10), engineMat);
        glow.position.set(x, y, z + 15);
        group.add(glow);
    });
}

// ============================================================
// ADDITIONAL SHIP FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Create an NPC ship (non-enemy, civilian/ally)
 * @param {string} type - Ship type
 * @param {string} faction - Faction name
 * @param {object} deps - Dependencies
 * @returns {object} Ship entity
 */
export function createNPCShip(type, faction, deps) {
    // NPC ships use same creation as enemies but with different behavior
    return createEnemyShip(type, faction, deps);
}

/**
 * Update visual state of a ship
 * @param {object} ship - Ship entity with mesh
 * @param {object} state - Visual state (damage level, shields, etc)
 */
export function updateShipVisuals(ship, state) {
    if (!ship || !ship.mesh) return;

    // Update damage visual (darken hull)
    if (state && typeof state.damageRatio === 'number') {
        const darken = 1 - (state.damageRatio * 0.5);
        if (ship.mesh.traverse) {
            ship.mesh.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.color.multiplyScalar(darken);
                }
            });
        }
    }

    // Update shield visual
    if (ship.shieldMesh && state) {
        ship.shieldMesh.visible = (state.shields || 0) > 0;
    }
}

/**
 * Repair a ship's hull
 * @param {object} ship - Ship entity
 * @param {number} amount - Amount to repair
 */
export function repairShip(ship, amount) {
    if (!ship) return;
    ship.hull = Math.min((ship.hull || 0) + amount, ship.maxHull || 100);
}

/**
 * Destroy a ship (visual effect and cleanup)
 * @param {object} ship - Ship entity
 * @param {object} scene - Three.js scene
 */
export function destroyShip(ship, scene) {
    if (!ship) return;

    // Remove mesh from scene
    if (ship.mesh && scene) {
        scene.remove(ship.mesh);

        // Dispose geometry and materials
        if (ship.mesh.traverse) {
            ship.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }

    // Mark as destroyed
    ship.destroyed = true;
    ship.mesh = null;
}
