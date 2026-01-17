// Space Armada - Constants Module
// Extracted from index.html for modularization

// Path to GLB model files
export const MODEL_PATH = 'assets/models/';

// Mapping from game ship types to GLB model files
export const SHIP_MODELS = {
    // Player ship
    player: 'UE Fighter.glb',

    // UE/Human ships (United Earth, Terran Confederacy, etc)
    ue_fighter: 'UE Fighter.glb',
    ue_freighter: 'UE Freighter.glb',
    ue_carrier: 'UE Carrier.glb',
    human_fighter: 'UE Fighter.glb',
    human_heavy: 'UE Freighter.glb',
    human_capital: 'UE Carrier.glb',

    // Voinian ships
    voinian_fighter: 'Voinian Heavy Fighter.glb',
    voinian_heavy: 'Voinian Cruiser.glb',
    voinian_capital: 'Voinian Dreadnaught.glb',
    voinian_frigate: 'Voinian Frigate.glb',

    // Crescent ships (Azdgari, Zidagar, Igadzra strands)
    crescent_fighter: 'Crescent Fighter.glb',
    crescent_heavy: 'Crescent Warship.glb',
    crescent_capital: 'Azdgari Warship.glb',
    azdgari_fighter: 'Azdara.glb',
    azdgari_heavy: 'Azdgari Arada.glb',
    azdgari_capital: 'Azdgari Warship.glb',
    igadzra_fighter: 'Igadzra Arada.glb',
    igadzra_heavy: 'Igazra.glb',
    zidagar_fighter: 'Lazira.glb',

    // Miranu ships
    miranu_fighter: 'Miranu Courier.glb',
    miranu_heavy: 'Miranu Gunship.glb',
    miranu_capital: 'Miranu Freighter II.glb',
    miranu_freighter: 'Miranu Freighter.glb',

    // Emalgha ships
    emalgha_fighter: 'Emalgha Fighter.glb',
    emalgha_heavy: 'Emalgha Freighter.glb',
    emalgha_capital: 'Emalgha Freighter.glb',

    // Generic/Pirate ships
    pirate_fighter: 'Krait.glb',
    pirate_heavy: 'Turncoat.glb',
    pirate_capital: 'Helian.glb',

    // Cargo/Freighters
    freighter: 'Cargo Freighter.glb',
    freight_courier: 'Freight Courier.glb',

    // Small ships
    shuttle: 'Shuttle.glb',
    scoutship: 'Scoutship.glb',
    escape_pod: 'Escape Pod.glb',

    // Special Arada variants
    arada: 'Arada.glb',
};

// Faction-specific colors and material properties for ships
export const SHIP_FACTION_COLORS = {
    // === UNITED EARTH / HUMAN ===
    'UE Fighter.glb':           { faction: 'ue', primary: 0xd1d5db, accent: 0x3b82f6, engine: 0x00ffff, metalness: 0.8, roughness: 0.3 },
    'UE Freighter.glb':         { faction: 'ue', primary: 0xd1d5db, accent: 0x3b82f6, engine: 0x00ffff, metalness: 0.7, roughness: 0.4 },
    'UE Carrier.glb':           { faction: 'ue', primary: 0xd1d5db, accent: 0x3b82f6, engine: 0x00ffff, metalness: 0.75, roughness: 0.35 },
    'Scoutship.glb':            { faction: 'ue', primary: 0xe5e7eb, accent: 0x60a5fa, engine: 0x38bdf8, metalness: 0.7, roughness: 0.4 },
    'Shuttle.glb':              { faction: 'ue', primary: 0xf3f4f6, accent: 0x94a3b8, engine: 0x60a5fa, metalness: 0.6, roughness: 0.5 },
    'Escape Pod.glb':           { faction: 'ue', primary: 0xffffff, accent: 0xef4444, engine: 0xfca5a5, metalness: 0.5, roughness: 0.6 },

    // === VOINIAN ===
    'Voinian Heavy Fighter.glb': { faction: 'voinian', primary: 0x78350f, accent: 0xd97706, engine: 0xf59e0b, metalness: 0.6, roughness: 0.6 },
    'Voinian Frigate.glb':       { faction: 'voinian', primary: 0x7c2d12, accent: 0xea580c, engine: 0xfb923c, metalness: 0.55, roughness: 0.65 },
    'Voinian Cruiser.glb':       { faction: 'voinian', primary: 0x713f12, accent: 0xca8a04, engine: 0xfacc15, metalness: 0.5, roughness: 0.7 },
    'Voinian Dreadnaught.glb':   { faction: 'voinian', primary: 0x451a03, accent: 0xb45309, engine: 0xf59e0b, metalness: 0.5, roughness: 0.7 },

    // === CRESCENT (Base) ===
    'Crescent Fighter.glb':      { faction: 'crescent', primary: 0x6b21a8, accent: 0xc084fc, engine: 0xe879f9, metalness: 0.85, roughness: 0.2 },
    'Crescent Warship.glb':      { faction: 'crescent', primary: 0x581c87, accent: 0xa855f7, engine: 0xd946ef, metalness: 0.85, roughness: 0.25 },

    // === AZDGARI (Green) ===
    'Azdara.glb':                { faction: 'azdgari', primary: 0x166534, accent: 0x22c55e, engine: 0x4ade80, metalness: 0.8, roughness: 0.25 },
    'Azdgari Arada.glb':         { faction: 'azdgari', primary: 0x15803d, accent: 0x34d399, engine: 0x6ee7b7, metalness: 0.8, roughness: 0.25 },
    'Azdgari Warship.glb':       { faction: 'azdgari', primary: 0x14532d, accent: 0x10b981, engine: 0x34d399, metalness: 0.8, roughness: 0.3 },

    // === IGADZRA (Yellow/Orange) ===
    'Igadzra Arada.glb':         { faction: 'igadzra', primary: 0xb45309, accent: 0xfbbf24, engine: 0xfde047, metalness: 0.8, roughness: 0.25 },
    'Igazra.glb':                { faction: 'igadzra', primary: 0x92400e, accent: 0xf59e0b, engine: 0xfcd34d, metalness: 0.8, roughness: 0.3 },

    // === ZIDAGAR (Purple) ===
    'Lazira.glb':                { faction: 'zidagar', primary: 0x6b21a8, accent: 0xa855f7, engine: 0xc084fc, metalness: 0.85, roughness: 0.2 },

    // === MIRANU (Gold) ===
    'Miranu Courier.glb':        { faction: 'miranu', primary: 0xb45309, accent: 0xfcd34d, engine: 0xfef08a, metalness: 0.75, roughness: 0.35 },
    'Miranu Freighter.glb':      { faction: 'miranu', primary: 0xa16207, accent: 0xfbbf24, engine: 0xfde68a, metalness: 0.7, roughness: 0.4 },
    'Miranu Freighter II.glb':   { faction: 'miranu', primary: 0x854d0e, accent: 0xeab308, engine: 0xfacc15, metalness: 0.7, roughness: 0.4 },
    'Miranu Gunship.glb':        { faction: 'miranu', primary: 0x92400e, accent: 0xf59e0b, engine: 0xfbbf24, metalness: 0.75, roughness: 0.35 },

    // === EMALGHA (Organic Green) ===
    'Emalgha Fighter.glb':       { faction: 'emalgha', primary: 0x365314, accent: 0x84cc16, engine: 0xa3e635, metalness: 0.4, roughness: 0.7 },
    'Emalgha Freighter.glb':     { faction: 'emalgha', primary: 0x3f6212, accent: 0x65a30d, engine: 0x84cc16, metalness: 0.35, roughness: 0.75 },

    // === GENERIC/PIRATE ===
    'Krait.glb':                 { faction: 'pirate', primary: 0x374151, accent: 0xf97316, engine: 0xfb923c, metalness: 0.6, roughness: 0.5 },
    'Turncoat.glb':              { faction: 'pirate', primary: 0x4b5563, accent: 0xef4444, engine: 0xf87171, metalness: 0.55, roughness: 0.55 },
    'Helian.glb':                { faction: 'pirate', primary: 0x52525b, accent: 0xeab308, engine: 0xfde047, metalness: 0.6, roughness: 0.5 },
    'Cargo Freighter.glb':       { faction: 'neutral', primary: 0x6b7280, accent: 0x9ca3af, engine: 0x60a5fa, metalness: 0.5, roughness: 0.6 },
    'Freight Courier.glb':       { faction: 'neutral', primary: 0x71717a, accent: 0xa1a1aa, engine: 0x38bdf8, metalness: 0.55, roughness: 0.55 },
    'Arada.glb':                 { faction: 'neutral', primary: 0x78716c, accent: 0xa8a29e, engine: 0x22d3ee, metalness: 0.65, roughness: 0.45 },
};

// Faction to model type mapping
export const FACTION_SHIP_MAPPING = {
    // Human factions use UE ships
    terranConfederacy: { fighter: 'human_fighter', heavy: 'human_heavy', boss: 'human_capital' },
    unitedEarth: { fighter: 'ue_fighter', heavy: 'ue_freighter', boss: 'ue_carrier' },
    secondRebellion: { fighter: 'human_fighter', heavy: 'human_heavy', boss: 'human_capital' },
    cau: { fighter: 'human_fighter', heavy: 'human_heavy', boss: 'human_capital' },
    bhu: { fighter: 'human_fighter', heavy: 'human_heavy', boss: 'human_capital' },
    galacticPolice: { fighter: 'human_fighter', heavy: 'human_heavy', boss: 'human_capital' },
    freeCompanies: { fighter: 'freighter', heavy: 'freight_courier', boss: 'ue_carrier' },
    helionova: { fighter: 'scoutship', heavy: 'shuttle', boss: 'human_capital' },
    seti: { fighter: 'scoutship', heavy: 'human_heavy', boss: 'human_capital' },

    // Voinian faction
    voinian: { fighter: 'voinian_fighter', heavy: 'voinian_heavy', boss: 'voinian_capital' },
    emalgha: { fighter: 'emalgha_fighter', heavy: 'emalgha_heavy', boss: 'emalgha_capital' },
    hinwar: { fighter: 'shuttle', heavy: 'miranu_fighter', boss: 'miranu_heavy' },

    // Crescent factions
    gadzair: { fighter: 'azdgari_fighter', heavy: 'azdgari_heavy', boss: 'azdgari_capital' },
    simnuvia: { fighter: 'crescent_fighter', heavy: 'crescent_heavy', boss: 'crescent_capital' },
    kliaphin: { fighter: 'igadzra_fighter', heavy: 'igadzra_heavy', boss: 'crescent_capital' },
    miranu: { fighter: 'miranu_fighter', heavy: 'miranu_heavy', boss: 'miranu_capital' },
    talramuv: { fighter: 'zidagar_fighter', heavy: 'crescent_heavy', boss: 'crescent_capital' },

    // Katuri (hostile aliens - use aggressive Voinian style)
    katuri: { fighter: 'voinian_fighter', heavy: 'voinian_heavy', boss: 'voinian_capital' },
    theAliens: { fighter: 'azdgari_fighter', heavy: 'igadzra_heavy', boss: 'azdgari_capital' },

    // Pirates and renegades
    pirates: { fighter: 'pirate_fighter', heavy: 'pirate_heavy', boss: 'pirate_capital' },
    renegades: { fighter: 'pirate_fighter', heavy: 'pirate_heavy', boss: 'pirate_capital' },
};
