// Space Armada - GLB Model Loading Module
// Handles Three.js GLTFLoader, model caching, and ship model management

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
    MODEL_PATH,
    SHIP_MODELS,
    SHIP_FACTION_COLORS,
    FACTION_SHIP_MAPPING
} from '../data/constants.js';

// ============================================================
// MODEL LOADING STATE
// ============================================================

/** Cache for loaded GLB models */
const modelCache = new Map();

/** Whether all essential models have been preloaded */
let modelsLoaded = false;

/** Loading progress percentage (0-100) */
let modelLoadProgress = 0;

/** GLTF loader instance (initialized lazily) */
let gltfLoader = null;

// ============================================================
// LOADER INITIALIZATION
// ============================================================

/**
 * Get or create the GLTF loader instance
 * @returns {GLTFLoader} The loader instance
 */
export function getGLTFLoader() {
    if (!gltfLoader) {
        gltfLoader = new GLTFLoader();
    }
    return gltfLoader;
}

/**
 * Initialize the model loading system
 * Call this before using any model loading functions
 */
export function initModelLoader() {
    gltfLoader = new GLTFLoader();
    console.log('GLTFLoader initialized');
}

// ============================================================
// MODEL LOADING FUNCTIONS
// ============================================================

/**
 * Load a single GLB model from the assets folder
 * @param {string} modelName - The filename of the model (e.g., 'UE Fighter.glb')
 * @returns {Promise<THREE.Group|null>} The loaded model or null on error
 */
export async function loadGLBModel(modelName) {
    // Return cached model if available
    if (modelCache.has(modelName)) {
        return modelCache.get(modelName);
    }

    // Ensure loader is initialized
    const loader = getGLTFLoader();

    return new Promise((resolve, reject) => {
        const url = MODEL_PATH + modelName;
        console.log(`Loading model from: ${url}`);

        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;

                // Log model structure for debugging
                console.log(`Model ${modelName} structure:`, model);

                // Center the model and normalize scale
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);

                console.log(`Model ${modelName} dimensions:`, size, 'max:', maxDim);

                // Normalize to ~60 units (reasonable ship size)
                const targetSize = 60;
                const scale = targetSize / maxDim;
                model.scale.set(scale, scale, scale);

                // Center the model
                model.position.sub(center.multiplyScalar(scale));

                // Ensure materials are properly visible
                model.traverse((child) => {
                    if (child.isMesh) {
                        // Make sure materials render both sides and are visible
                        if (child.material) {
                            child.material.side = THREE.DoubleSide;
                            child.material.needsUpdate = true;
                            // Ensure emissive properties don't wash out colors
                            if (child.material.emissive) {
                                child.material.emissiveIntensity = 0.1;
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Store in cache
                modelCache.set(modelName, model);
                console.log(`Successfully loaded model: ${modelName}`);
                resolve(model);
            },
            (progress) => {
                // Progress callback
                if (progress.total > 0) {
                    const percent = (progress.loaded / progress.total * 100).toFixed(1);
                    console.log(`Loading ${modelName}: ${percent}%`);
                }
            },
            (error) => {
                console.error(`Failed to load model ${modelName}:`, error);
                console.error(`URL attempted: ${url}`);
                resolve(null); // Return null on error, fallback to procedural
            }
        );
    });
}

// ============================================================
// MODEL CLONING & MATERIALS
// ============================================================

/**
 * Clone a cached model for use in the scene
 * Deep clones materials to allow independent coloring
 * @param {string} modelName - The name of the cached model to clone
 * @returns {THREE.Group|null} The cloned model or null if not cached
 */
export function cloneModel(modelName) {
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
 * Apply faction-appropriate materials to a ship model
 * Uses SHIP_FACTION_COLORS to set colors and material properties
 * @param {THREE.Group} model - The model to apply materials to
 * @param {string} modelName - The model filename for color lookup
 */
export function applyShipMaterials(model, modelName) {
    const colorData = SHIP_FACTION_COLORS[modelName];
    if (!colorData) return;

    model.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material = child.material.clone();
            if (child.material.color) {
                child.material.color.setHex(colorData.primary);
            }
            child.material.metalness = colorData.metalness;
            child.material.roughness = colorData.roughness;
            child.material.needsUpdate = true;
        }
    });
}

// ============================================================
// PRELOADING SYSTEM
// ============================================================

/** List of all models to preload for the shipyard and game */
const MODELS_TO_PRELOAD = [
    // Fighters
    'UE Fighter.glb',
    'Scoutship.glb',
    'Shuttle.glb',
    'Voinian Heavy Fighter.glb',
    'Crescent Fighter.glb',
    'Azdara.glb',
    'Krait.glb',
    'Emalgha Fighter.glb',
    'Miranu Courier.glb',
    'Escape Pod.glb',
    // Medium ships
    'Arada.glb',
    'Turncoat.glb',
    'Azdgari Arada.glb',
    'Igadzra Arada.glb',
    'Lazira.glb',
    'Helian.glb',
    // Heavy ships
    'UE Freighter.glb',
    'Voinian Frigate.glb',
    'Voinian Cruiser.glb',
    'Miranu Freighter.glb',
    'Miranu Freighter II.glb',
    'Miranu Gunship.glb',
    'Emalgha Freighter.glb',
    'Cargo Freighter.glb',
    'Freight Courier.glb',
    'Azdgari Warship.glb',
    'Crescent Warship.glb',
    // Capital ships
    'Igazra.glb',
    'UE Carrier.glb',
    'Voinian Dreadnaught.glb',
];

/**
 * Preload all essential GLB ship models
 * Call this during game initialization to avoid loading during gameplay
 * @returns {Promise<void>} Resolves when all models are loaded
 */
export async function preloadModels() {
    console.log('Preloading GLB ship models...');

    let loaded = 0;
    for (const model of MODELS_TO_PRELOAD) {
        await loadGLBModel(model);
        loaded++;
        modelLoadProgress = (loaded / MODELS_TO_PRELOAD.length) * 100;
    }

    modelsLoaded = true;
    console.log(`Preloaded ${loaded} models`);
}

/**
 * Preload models with a progress callback
 * @param {string[]|function} modelsOrProgress - Either array of model names OR progress callback
 * @param {function(number, number): void} [onProgress] - Called with (loaded, total) when first arg is array
 * @returns {Promise<void>} Resolves when all models are loaded
 */
export async function preloadModelsWithProgress(modelsOrProgress, onProgress) {
    console.log('Preloading GLB ship models...');

    // Support both call patterns:
    // 1. preloadModelsWithProgress(callback) - original
    // 2. preloadModelsWithProgress(modelNames, callback) - from main.js
    let models, progressCallback;
    if (typeof modelsOrProgress === 'function') {
        models = MODELS_TO_PRELOAD;
        progressCallback = modelsOrProgress;
    } else if (Array.isArray(modelsOrProgress)) {
        models = modelsOrProgress;
        progressCallback = onProgress;
    } else {
        models = MODELS_TO_PRELOAD;
        progressCallback = null;
    }

    let loaded = 0;
    const total = models.length;
    for (const model of models) {
        try {
            await loadGLBModel(model);
        } catch (e) {
            console.warn(`Failed to load model ${model}:`, e);
        }
        loaded++;
        modelLoadProgress = (loaded / total) * 100;
        if (progressCallback) {
            // Support both (percentage) and (loaded, total) callback patterns
            if (progressCallback.length >= 2) {
                progressCallback(loaded, total);
            } else {
                progressCallback(modelLoadProgress);
            }
        }
    }

    modelsLoaded = true;
    console.log(`Preloaded ${loaded} models`);
}

// ============================================================
// FACTION-BASED MODEL SELECTION
// ============================================================

/**
 * Get the appropriate model filename for a faction and ship type
 * @param {string} faction - The faction identifier (e.g., 'voinian', 'pirates')
 * @param {string} shipType - The ship type ('fighter', 'heavy', or 'boss')
 * @returns {string} The GLB model filename
 */
export function getModelForFaction(faction, shipType) {
    const mapping = FACTION_SHIP_MAPPING[faction] || FACTION_SHIP_MAPPING.pirates;
    const modelKey = mapping[shipType] || mapping.fighter;
    return SHIP_MODELS[modelKey] || SHIP_MODELS.pirate_fighter;
}

// ============================================================
// CACHE MANAGEMENT
// ============================================================

/**
 * Check if a model is already cached
 * @param {string} modelName - The model filename to check
 * @returns {boolean} True if the model is cached
 */
export function isModelCached(modelName) {
    return modelCache.has(modelName);
}

/**
 * Get a cached model directly (without cloning)
 * Use cloneModel() if you need an independent copy
 * @param {string} modelName - The model filename
 * @returns {THREE.Group|undefined} The cached model or undefined
 */
export function getCachedModel(modelName) {
    return modelCache.get(modelName);
}

/**
 * Clear the model cache
 * Use with caution - will require reloading all models
 */
export function clearModelCache() {
    modelCache.clear();
    modelsLoaded = false;
    modelLoadProgress = 0;
    console.log('Model cache cleared');
}

/**
 * Get the current number of cached models
 * @returns {number} Number of models in the cache
 */
export function getCacheSize() {
    return modelCache.size;
}

// ============================================================
// STATE GETTERS
// ============================================================

/**
 * Check if all essential models have been preloaded
 * @returns {boolean} True if preloading is complete
 */
export function areModelsLoaded() {
    return modelsLoaded;
}

/**
 * Get the current model loading progress
 * @returns {number} Progress percentage (0-100)
 */
export function getModelLoadProgress() {
    return modelLoadProgress;
}

/**
 * Get the list of models that will be preloaded
 * @returns {string[]} Array of model filenames
 */
export function getPreloadModelList() {
    return [...MODELS_TO_PRELOAD];
}

// ============================================================
// ADDITIONAL MODEL FUNCTIONS (for main.js compatibility)
// ============================================================

/**
 * Get a previously loaded model
 * @param {string} modelName - Model filename
 * @returns {Object|null} Model or null if not loaded
 */
export function getLoadedModel(modelName) {
    return getCachedModel(modelName);
}

/**
 * Check if a model is loaded
 * @param {string} modelName - Model filename
 * @returns {boolean}
 */
export function isModelLoaded(modelName) {
    return isModelCached(modelName);
}

/**
 * Dispose a single model
 * @param {string} modelName - Model to dispose
 */
export function disposeModel(modelName) {
    const model = modelCache.get(modelName);
    if (model) {
        model.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        modelCache.delete(modelName);
    }
}

/**
 * Dispose all loaded models
 */
export function disposeAllModels() {
    for (const [name] of modelCache) {
        disposeModel(name);
    }
}
