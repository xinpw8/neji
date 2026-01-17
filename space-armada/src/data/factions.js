// Space Armada - Factions Data Module
// Extracted from index.html for modularization
// Contains faction visual styles and related functions

// Note: Texture creation functions (createUEHullTexture, createKaturiTexture, etc.)
// will need to be imported from a textures module once extracted.
// For now, this module exports the style data structure that references them.

// Faction visual styles - colors and texture assignments
// The 'texture' property references texture creation functions that will be
// imported from the rendering/textures module in a later phase
export const FACTION_STYLES = {
    // Human Industrial (UE-style) - Blue/Gray
    terranConfederacy: { textureKey: 'ue', primary: 0x4a5568, accent: 0x3b82f6, engine: 0x00ffff, emissive: 0x1e3a8a },
    unitedEarth: { textureKey: 'ue', primary: 0x4a5568, accent: 0x0ea5e9, engine: 0x00ddff, emissive: 0x1e3a8a },
    bhu: { textureKey: 'ue', primary: 0x78716c, accent: 0xfbbf24, engine: 0xffaa00, emissive: 0x854d0e },
    galacticPolice: { textureKey: 'ue', primary: 0xf8fafc, accent: 0x3b82f6, engine: 0x60a5fa, emissive: 0x1e40af },
    freeCompanies: { textureKey: 'ue', primary: 0x52525b, accent: 0x22c55e, engine: 0x4ade80, emissive: 0x166534 },

    // Katuri - Aggressive Red/Black
    katuri: { textureKey: 'katuri', primary: 0x7f1d1d, accent: 0xef4444, engine: 0xff4444, emissive: 0xdc2626 },

    // Crescent/Gadzair - Crystal Purple/Teal
    gadzair: { textureKey: 'crescent', primary: 0x6b21a8, accent: 0x14b8a6, engine: 0xa855f7, emissive: 0x7c3aed },
    simnuvia: { textureKey: 'crescent', primary: 0x0d9488, accent: 0x06b6d4, engine: 0x22d3ee, emissive: 0x0891b2 },

    // Voinian - Heavy Brown/Rust
    voinian: { textureKey: 'voinian', primary: 0x78350f, accent: 0xd97706, engine: 0xf59e0b, emissive: 0xb45309 },
    emalgha: { textureKey: 'voinian', primary: 0x365314, accent: 0x84cc16, engine: 0xa3e635, emissive: 0x4d7c0f },

    // Pirates - Cobbled Gray/Orange
    pirates: { textureKey: 'pirate', primary: 0x374151, accent: 0xf97316, engine: 0xfb923c, emissive: 0xea580c },
    renegades: { textureKey: 'pirate', primary: 0x1f2937, accent: 0xef4444, engine: 0xf87171, emissive: 0xb91c1c },

    // Miranu - Golden Traders
    miranu: { textureKey: 'miranu', primary: 0xd97706, accent: 0xfcd34d, engine: 0xfde68a, emissive: 0xb45309 },

    // Rebels - Red/White
    secondRebellion: { textureKey: 'ue', primary: 0x991b1b, accent: 0xffffff, engine: 0xfca5a5, emissive: 0xdc2626 },
    cau: { textureKey: 'ue', primary: 0x166534, accent: 0x86efac, engine: 0x4ade80, emissive: 0x22c55e },

    // Alien/Mystery - Green Bioluminescent
    theAliens: { textureKey: 'alien', primary: 0x064e3b, accent: 0x10b981, engine: 0x34d399, emissive: 0x059669 },
    seti: { textureKey: 'alien', primary: 0x0c4a6e, accent: 0x0ea5e9, engine: 0x38bdf8, emissive: 0x0284c7 },

    // Other factions
    helionova: { textureKey: 'crescent', primary: 0x581c87, accent: 0xc084fc, engine: 0xd8b4fe, emissive: 0x7e22ce },
    kliaphin: { textureKey: 'crescent', primary: 0x4c1d95, accent: 0xa78bfa, engine: 0xc4b5fd, emissive: 0x6d28d9 },
    talramuv: { textureKey: 'miranu', primary: 0x854d0e, accent: 0xfde047, engine: 0xfef08a, emissive: 0xca8a04 },
    hinwar: { textureKey: 'ue', primary: 0x155e75, accent: 0x67e8f9, engine: 0xa5f3fc, emissive: 0x0891b2 }
};

/**
 * Get visual style for a faction
 * @param {string} faction - The faction identifier
 * @returns {object} Style object with colors and texture key
 */
export function getFactionStyle(faction) {
    return FACTION_STYLES[faction] || FACTION_STYLES.pirates;
}

/**
 * Get the hex color value for a faction's primary color
 * @param {string} faction - The faction identifier
 * @returns {number} Hex color value
 */
export function getFactionPrimaryColor(faction) {
    const style = getFactionStyle(faction);
    return style.primary;
}

/**
 * Get the hex color value for a faction's accent color
 * @param {string} faction - The faction identifier
 * @returns {number} Hex color value
 */
export function getFactionAccentColor(faction) {
    const style = getFactionStyle(faction);
    return style.accent;
}

/**
 * Get the hex color value for a faction's engine glow color
 * @param {string} faction - The faction identifier
 * @returns {number} Hex color value
 */
export function getFactionEngineColor(faction) {
    const style = getFactionStyle(faction);
    return style.engine;
}

// List of all faction identifiers
export const FACTION_IDS = Object.keys(FACTION_STYLES);

// Faction groupings for gameplay logic
export const FACTION_GROUPS = {
    human: ['terranConfederacy', 'unitedEarth', 'bhu', 'galacticPolice', 'freeCompanies', 'secondRebellion', 'cau'],
    crescent: ['gadzair', 'simnuvia', 'helionova', 'kliaphin', 'talramuv'],
    voinian: ['voinian', 'emalgha'],
    hostile: ['katuri', 'theAliens', 'pirates', 'renegades'],
    neutral: ['miranu', 'hinwar', 'seti']
};

/**
 * Check if a faction belongs to a specific group
 * @param {string} faction - The faction identifier
 * @param {string} group - The group name
 * @returns {boolean}
 */
export function isFactionInGroup(faction, group) {
    return FACTION_GROUPS[group]?.includes(faction) || false;
}
