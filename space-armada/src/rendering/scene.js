// Space Armada - Scene Setup Module
// Extracted from index.html for modularization
// Contains scene, camera, renderer, and lighting initialization

import * as THREE from 'three';

// ============================================================
// SCENE CONFIGURATION
// ============================================================

/**
 * Scene configuration constants
 */
export const SCENE_CONFIG = {
    // Main scene colors
    backgroundColor: 0x000005,
    fogColor: 0x000010,
    fogDensity: 0.0003,

    // Camera settings
    viewSize: 450,
    nearPlane: 1,
    farPlane: 2000,
    cameraHeight: 800,

    // Starfield settings
    starfieldLayers: 3,
    baseStarCount: 200,
    starsPerLayer: 100,
    sectorMultiplier: 4,

    // Nebula settings
    nebulaCount: 5,
    nebulaBaseSize: 400,
    nebulaSizeVariance: 300,
    nebulaOpacityBase: 0.1,
    nebulaOpacityVariance: 0.1,
    nebulaSaturation: 0.5,
    nebulaLightness: 0.15,

    // Shipyard preview
    shipyardBackgroundColor: 0x000510
};

/**
 * Lighting configuration for main scene
 */
export const LIGHTING_CONFIG = {
    ambient: {
        color: 0x404050,
        intensity: 0.6
    },
    main: {
        color: 0xffffff,
        intensity: 1,
        position: { x: 100, y: 500, z: 100 }
    },
    fill: {
        color: 0x4488ff,
        intensity: 0.3,
        position: { x: -100, y: 300, z: -100 }
    }
};

/**
 * Lighting configuration for shipyard preview
 */
export const SHIPYARD_LIGHTING_CONFIG = {
    ambient: {
        color: 0x404060,
        intensity: 0.6
    },
    key: {
        color: 0xffffff,
        intensity: 1.0,
        position: { x: 50, y: 80, z: 60 }
    },
    fill: {
        color: 0x4488ff,
        intensity: 0.3,
        position: { x: -50, y: 30, z: -50 }
    },
    rim: {
        color: 0x00ffff,
        intensity: 0.2,
        position: { x: 0, y: -30, z: -80 }
    }
};

// ============================================================
// MAIN SCENE INITIALIZATION
// ============================================================

/**
 * Create and configure the main game scene
 * @returns {THREE.Scene} Configured scene object
 */
export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
    scene.fog = new THREE.FogExp2(SCENE_CONFIG.fogColor, SCENE_CONFIG.fogDensity);
    return scene;
}

/**
 * Create orthographic camera for top-down view
 * @param {number} aspect - Aspect ratio (width / height)
 * @returns {THREE.OrthographicCamera} Configured camera
 */
export function createCamera(aspect) {
    const viewSize = SCENE_CONFIG.viewSize;
    const camera = new THREE.OrthographicCamera(
        -viewSize * aspect, viewSize * aspect,
        viewSize, -viewSize,
        SCENE_CONFIG.nearPlane, SCENE_CONFIG.farPlane
    );
    camera.position.set(0, SCENE_CONFIG.cameraHeight, 0);
    camera.lookAt(0, 0, 0);
    return camera;
}

/**
 * Create WebGL renderer with optimal settings
 * @param {Object} options - Renderer options
 * @param {boolean} options.antialias - Enable antialiasing (default: true)
 * @param {HTMLCanvasElement} options.canvas - Optional canvas element
 * @returns {THREE.WebGLRenderer} Configured renderer
 */
export function createRenderer(options = {}) {
    const renderer = new THREE.WebGLRenderer({
        antialias: options.antialias !== false,
        canvas: options.canvas,
        alpha: options.alpha || false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
}

/**
 * Configure renderer size for fullscreen
 * @param {THREE.WebGLRenderer} renderer - Renderer to configure
 */
export function configureFullscreenRenderer(renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================
// LIGHTING SETUP
// ============================================================

/**
 * Add standard game lighting to scene
 * @param {THREE.Scene} scene - Scene to add lights to
 * @returns {Object} Object containing light references
 */
export function addGameLighting(scene) {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(
        LIGHTING_CONFIG.ambient.color,
        LIGHTING_CONFIG.ambient.intensity
    );
    scene.add(ambientLight);

    // Main directional light (key light)
    const mainLight = new THREE.DirectionalLight(
        LIGHTING_CONFIG.main.color,
        LIGHTING_CONFIG.main.intensity
    );
    mainLight.position.set(
        LIGHTING_CONFIG.main.position.x,
        LIGHTING_CONFIG.main.position.y,
        LIGHTING_CONFIG.main.position.z
    );
    scene.add(mainLight);

    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(
        LIGHTING_CONFIG.fill.color,
        LIGHTING_CONFIG.fill.intensity
    );
    fillLight.position.set(
        LIGHTING_CONFIG.fill.position.x,
        LIGHTING_CONFIG.fill.position.y,
        LIGHTING_CONFIG.fill.position.z
    );
    scene.add(fillLight);

    return {
        ambient: ambientLight,
        main: mainLight,
        fill: fillLight
    };
}

/**
 * Create a light from configuration
 * @param {string} type - Light type ('ambient', 'directional', 'point', 'spot')
 * @param {Object} config - Light configuration
 * @returns {THREE.Light} Configured light
 */
export function createLight(type, config) {
    let light;

    switch (type) {
        case 'ambient':
            light = new THREE.AmbientLight(config.color, config.intensity);
            break;
        case 'directional':
            light = new THREE.DirectionalLight(config.color, config.intensity);
            if (config.position) {
                light.position.set(config.position.x, config.position.y, config.position.z);
            }
            break;
        case 'point':
            light = new THREE.PointLight(config.color, config.intensity, config.distance || 0, config.decay || 2);
            if (config.position) {
                light.position.set(config.position.x, config.position.y, config.position.z);
            }
            break;
        case 'spot':
            light = new THREE.SpotLight(config.color, config.intensity, config.distance || 0, config.angle || Math.PI / 3, config.penumbra || 0, config.decay || 2);
            if (config.position) {
                light.position.set(config.position.x, config.position.y, config.position.z);
            }
            break;
        default:
            throw new Error(`Unknown light type: ${type}`);
    }

    return light;
}

// ============================================================
// STARFIELD CREATION
// ============================================================

/**
 * Create multi-layered starfield for parallax effect
 * @param {THREE.Scene} scene - Scene to add starfield to
 * @param {number} sectorSize - Size of the game sector
 * @returns {THREE.Points[]} Array of star point clouds
 */
export function createStarfield(scene, sectorSize) {
    const starLayers = [];

    for (let layer = 0; layer < SCENE_CONFIG.starfieldLayers; layer++) {
        const count = SCENE_CONFIG.baseStarCount + layer * SCENE_CONFIG.starsPerLayer;
        const positions = [];
        const colors = [];

        for (let i = 0; i < count; i++) {
            // Spread stars across a large area
            positions.push(
                (Math.random() - 0.5) * sectorSize * SCENE_CONFIG.sectorMultiplier,
                -20 - layer * 30,  // Deeper layers further down
                (Math.random() - 0.5) * sectorSize * SCENE_CONFIG.sectorMultiplier
            );

            // Vary star colors with slight blue tint
            const brightness = 0.3 + Math.random() * 0.7;
            colors.push(
                brightness,
                brightness,
                brightness + Math.random() * 0.2
            );
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 3 - layer * 0.5,  // Closer layers have larger stars
            vertexColors: true,
            transparent: true,
            opacity: 0.8 - layer * 0.2  // Deeper layers more faded
        });

        const stars = new THREE.Points(geometry, material);
        stars.userData.layer = layer;
        scene.add(stars);
        starLayers.push(stars);
    }

    return starLayers;
}

/**
 * Create nebula clouds for background atmosphere
 * @param {THREE.Scene} scene - Scene to add nebulae to
 * @param {number} sectorSize - Size of the game sector
 * @returns {THREE.Mesh[]} Array of nebula meshes
 */
export function createNebulae(scene, sectorSize) {
    const nebulae = [];

    for (let i = 0; i < SCENE_CONFIG.nebulaCount; i++) {
        const width = SCENE_CONFIG.nebulaBaseSize + Math.random() * SCENE_CONFIG.nebulaSizeVariance;
        const height = SCENE_CONFIG.nebulaBaseSize + Math.random() * SCENE_CONFIG.nebulaSizeVariance;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(
                Math.random(),  // Random hue
                SCENE_CONFIG.nebulaSaturation,
                SCENE_CONFIG.nebulaLightness
            ),
            transparent: true,
            opacity: SCENE_CONFIG.nebulaOpacityBase + Math.random() * SCENE_CONFIG.nebulaOpacityVariance,
            side: THREE.DoubleSide
        });

        const nebula = new THREE.Mesh(geometry, material);
        nebula.position.set(
            (Math.random() - 0.5) * sectorSize * 2,
            -50,
            (Math.random() - 0.5) * sectorSize * 2
        );
        nebula.rotation.x = -Math.PI / 2;  // Lay flat

        scene.add(nebula);
        nebulae.push(nebula);
    }

    return nebulae;
}

/**
 * Create complete starfield with nebulae
 * @param {THREE.Scene} scene - Scene to add background to
 * @param {number} sectorSize - Size of the game sector
 * @returns {Object} Object containing star and nebula arrays
 */
export function createSpaceBackground(scene, sectorSize) {
    return {
        stars: createStarfield(scene, sectorSize),
        nebulae: createNebulae(scene, sectorSize)
    };
}

// ============================================================
// SHIPYARD PREVIEW SCENE
// ============================================================

/**
 * Create dedicated scene for shipyard ship preview
 * @returns {THREE.Scene} Configured preview scene
 */
export function createShipyardPreviewScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_CONFIG.shipyardBackgroundColor);
    return scene;
}

/**
 * Create camera for shipyard preview (perspective for showroom feel)
 * @returns {THREE.PerspectiveCamera} Configured preview camera
 */
export function createShipyardPreviewCamera() {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 80, 50);  // Top-down angled view
    camera.lookAt(0, 0, 0);
    return camera;
}

/**
 * Add showroom lighting to shipyard preview scene
 * @param {THREE.Scene} scene - Preview scene to light
 * @returns {Object} Object containing light references
 */
export function addShipyardPreviewLighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
        SHIPYARD_LIGHTING_CONFIG.ambient.color,
        SHIPYARD_LIGHTING_CONFIG.ambient.intensity
    );
    scene.add(ambientLight);

    // Key light (main illumination)
    const keyLight = new THREE.DirectionalLight(
        SHIPYARD_LIGHTING_CONFIG.key.color,
        SHIPYARD_LIGHTING_CONFIG.key.intensity
    );
    keyLight.position.set(
        SHIPYARD_LIGHTING_CONFIG.key.position.x,
        SHIPYARD_LIGHTING_CONFIG.key.position.y,
        SHIPYARD_LIGHTING_CONFIG.key.position.z
    );
    scene.add(keyLight);

    // Fill light (soften shadows)
    const fillLight = new THREE.DirectionalLight(
        SHIPYARD_LIGHTING_CONFIG.fill.color,
        SHIPYARD_LIGHTING_CONFIG.fill.intensity
    );
    fillLight.position.set(
        SHIPYARD_LIGHTING_CONFIG.fill.position.x,
        SHIPYARD_LIGHTING_CONFIG.fill.position.y,
        SHIPYARD_LIGHTING_CONFIG.fill.position.z
    );
    scene.add(fillLight);

    // Rim light (edge highlighting)
    const rimLight = new THREE.DirectionalLight(
        SHIPYARD_LIGHTING_CONFIG.rim.color,
        SHIPYARD_LIGHTING_CONFIG.rim.intensity
    );
    rimLight.position.set(
        SHIPYARD_LIGHTING_CONFIG.rim.position.x,
        SHIPYARD_LIGHTING_CONFIG.rim.position.y,
        SHIPYARD_LIGHTING_CONFIG.rim.position.z
    );
    scene.add(rimLight);

    return {
        ambient: ambientLight,
        key: keyLight,
        fill: fillLight,
        rim: rimLight
    };
}

/**
 * Add grid floor to shipyard preview for visual grounding
 * @param {THREE.Scene} scene - Preview scene
 * @returns {THREE.GridHelper} Grid helper object
 */
export function addShipyardGrid(scene) {
    const gridHelper = new THREE.GridHelper(80, 8, 0x003344, 0x001122);
    gridHelper.position.y = -35;
    scene.add(gridHelper);
    return gridHelper;
}

/**
 * Create WebGL renderer for shipyard preview canvas
 * @param {HTMLCanvasElement} canvas - Canvas element for rendering
 * @param {number} size - Size of the preview (width and height)
 * @returns {THREE.WebGLRenderer} Configured renderer
 */
export function createShipyardPreviewRenderer(canvas, size = 300) {
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
}

/**
 * Initialize complete shipyard preview system
 * @param {HTMLCanvasElement} canvas - Canvas for rendering
 * @param {number} size - Preview size
 * @returns {Object} Object with scene, camera, renderer, lights, grid
 */
export function initShipyardPreview(canvas, size = 300) {
    const scene = createShipyardPreviewScene();
    const camera = createShipyardPreviewCamera();
    const renderer = createShipyardPreviewRenderer(canvas, size);
    const lights = addShipyardPreviewLighting(scene);
    const grid = addShipyardGrid(scene);

    return {
        scene,
        camera,
        renderer,
        lights,
        grid
    };
}

// ============================================================
// WINDOW RESIZE HANDLING
// ============================================================

/**
 * Handle window resize for camera and renderer
 * @param {THREE.OrthographicCamera} camera - Orthographic camera to update
 * @param {THREE.WebGLRenderer} renderer - Renderer to resize
 */
export function handleResize(camera, renderer) {
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = SCENE_CONFIG.viewSize;

    camera.left = -viewSize * aspect;
    camera.right = viewSize * aspect;
    camera.top = viewSize;
    camera.bottom = -viewSize;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Create resize handler function bound to camera and renderer
 * @param {THREE.OrthographicCamera} camera - Camera to update on resize
 * @param {THREE.WebGLRenderer} renderer - Renderer to resize
 * @returns {Function} Event handler function
 */
export function createResizeHandler(camera, renderer) {
    return () => handleResize(camera, renderer);
}

// ============================================================
// COMPLETE SCENE INITIALIZATION
// ============================================================

/**
 * Initialize complete game scene with all components
 * @param {HTMLElement} container - DOM element to append renderer to
 * @param {number} sectorSize - Size of game sector for starfield
 * @returns {Object} Object containing all scene components
 */
export function initGameScene(container, sectorSize) {
    const aspect = window.innerWidth / window.innerHeight;

    // Create core components
    const scene = createScene();
    const camera = createCamera(aspect);
    const renderer = createRenderer();

    // Configure renderer
    configureFullscreenRenderer(renderer);
    container.appendChild(renderer.domElement);

    // Add lighting
    const lights = addGameLighting(scene);

    // Create space background
    const background = createSpaceBackground(scene, sectorSize);

    // Setup resize handler
    const resizeHandler = createResizeHandler(camera, renderer);
    window.addEventListener('resize', resizeHandler);

    return {
        scene,
        camera,
        renderer,
        lights,
        background,
        resizeHandler,

        // Cleanup function
        dispose: () => {
            window.removeEventListener('resize', resizeHandler);
            renderer.dispose();
        }
    };
}

// ============================================================
// ADDITIONAL SCENE FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Create a single nebula (alias for createNebulae)
 * @param {THREE.Scene} scene - Scene to add nebula to
 * @param {number} sectorSize - Size of sector
 */
export function createNebula(scene, sectorSize) {
    return createNebulae(scene, sectorSize);
}

/**
 * Update camera position to follow target
 * @param {THREE.Camera} camera - Camera to update
 * @param {THREE.Vector3|Object} target - Target position to follow
 * @param {Object} options - Options (height, smoothing)
 */
export function updateCamera(camera, target, options = {}) {
    if (!camera || !target) return;

    const height = options.height || 500;
    const smoothing = options.smoothing || 0.1;

    // Get target position
    const targetX = target.x || (target.position?.x ?? 0);
    const targetZ = target.z || (target.position?.z ?? 0);

    // Smooth interpolation to target
    camera.position.x += (targetX - camera.position.x) * smoothing;
    camera.position.z += (targetZ - camera.position.z) * smoothing;
    camera.position.y = height;

    // Look at target
    camera.lookAt(targetX, 0, targetZ);
}

/**
 * Resize renderer to match window
 * @param {THREE.WebGLRenderer} renderer - Renderer to resize
 * @param {THREE.Camera} camera - Camera to update aspect ratio
 * @param {HTMLElement} canvas - Canvas element for dimensions
 */
export function resizeRenderer(renderer, camera, canvas) {
    if (!renderer || !camera) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    if (camera.isPerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

/**
 * Dispose scene and free resources
 * @param {THREE.Scene} scene - Scene to dispose
 * @param {THREE.WebGLRenderer} renderer - Renderer to dispose
 */
export function disposeScene(scene, renderer) {
    if (scene) {
        scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    if (renderer) {
        renderer.dispose();
    }
}
