# Textures/Materials Plan for Space Armada Ships

## Recommendation: Three.js Runtime Materials

**NOT Blender re-export** - The Three.js approach is recommended because:
1. No external tools required
2. Existing pattern in codebase (`getFactionStyle()`)
3. Dynamic flexibility
4. Lower maintenance

---

## Ship-to-Faction Color Mapping

```javascript
const SHIP_FACTION_COLORS = {
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
```

---

## Implementation Steps

1. Add `SHIP_FACTION_COLORS` constant near line 2577
2. Create `applyShipMaterials(model, modelName, isPreview)` function
3. Create `addEngineGlow(container, model, engineColor, scale)` function
4. Modify `loadShipForPreview()` to call material application

---

## Key Files

- `/home/daa/neji/space-armada/index.html` lines 2520-2577 (SHIP_MODELS)
- `/home/daa/neji/space-armada/index.html` lines 4704-4772 (getFactionStyle pattern)
- `/home/daa/neji/space-armada/index.html` lines 8083-8131 (loadShipForPreview)
