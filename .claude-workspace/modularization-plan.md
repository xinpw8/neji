# Space Armada Code Modularization Plan

## Executive Summary

Plan to break the monolithic 8,968-line `space-armada/index.html` into proper modules.

---

## Current Code Sections (with line numbers)

| Section | Lines | Description | Size |
|---------|-------|-------------|------|
| HTML/CSS | 1-988 | Styles, UI elements | ~988 lines |
| HTML DOM | 989-1203 | Body structure | ~214 lines |
| Constants | 1209-1217 | Game config constants | ~9 lines |
| EV Ship Stats | 1226-1426 | Ship stats, AI, damage | ~200 lines |
| Factions | 1431-1702 | Faction definitions | ~271 lines |
| Storylines | 1704-1769 | Storyline data | ~65 lines |
| Mission Templates | 1772-1833 | Mission data | ~61 lines |
| Faction Dialogue | 1836-1990 | Dialogue strings | ~154 lines |
| Faction State | 1993-2488 | Faction logic | ~495 lines |
| Game State Vars | 2491-2822 | Global variables | ~331 lines |
| EV Target UI | 2828-3353 | Target panel, comm | ~525 lines |
| Textures | 3356-3997 | Canvas textures | ~641 lines |
| Player Ship | 4008-4703 | Player ship creation | ~695 lines |
| Faction Styles | 4705-4898 | Faction ship styles | ~193 lines |
| Enemy Ships | 4901-6033 | Enemy ship creation | ~1132 lines |
| Station | 6035-6110 | Station creation | ~75 lines |
| Projectiles | 6112-6256 | Projectile system | ~144 lines |
| World Gen | 6285-6628 | Procedural spawning | ~343 lines |
| Init/Scene | 6630-6845 | Scene setup | ~215 lines |
| Weapons | 6918-7177 | Weapon systems | ~259 lines |
| Player Update | 7179-7368 | Player movement | ~189 lines |
| Enemy Update | 7370-7476 | Enemy AI | ~106 lines |
| Docking | 7680-7718 | Docking system | ~38 lines |
| Shipyard Data | 7720-7879 | Ship definitions | ~159 lines |
| Station UI | 7881-8032 | Station menu | ~151 lines |
| Shipyard Preview | 8033-8398 | 3D preview system | ~365 lines |
| Upgrade System | 8482-8642 | Upgrade panel | ~160 lines |
| UI Updates | 8644-8917 | HUD, minimap | ~273 lines |
| Game Loop | 8919-8966 | Main loop | ~47 lines |

---

## Proposed Module Structure

```
space-armada/
├── src/
│   ├── main.ts                     # Entry point
│   │
│   ├── config/
│   │   └── constants.ts            # Game constants
│   │
│   ├── data/
│   │   ├── ships.ts                # SHIPYARD_DATA, EV_SHIP_STATS
│   │   ├── factions.ts             # FACTIONS definitions
│   │   ├── missions.ts             # MISSION_TEMPLATES
│   │   ├── dialogue.ts             # FACTION_DIALOGUE
│   │   └── weapons.ts              # WEAPON_TYPES
│   │
│   ├── game/
│   │   ├── state.ts                # playerState, factionState
│   │   ├── physics.ts              # Movement, collision
│   │   ├── combat.ts               # applyEVDamage
│   │   ├── ai.ts                   # Enemy AI behaviors
│   │   ├── spawning.ts             # World generation
│   │   └── docking.ts              # Station docking
│   │
│   ├── entities/
│   │   ├── player.ts               # Player ship
│   │   ├── enemies.ts              # Enemy ships
│   │   ├── projectiles.ts          # Projectiles
│   │   ├── stations.ts             # Stations
│   │   └── particles.ts            # Effects
│   │
│   ├── rendering/
│   │   ├── scene.ts                # Three.js setup
│   │   ├── textures.ts             # Procedural textures
│   │   ├── models.ts               # GLB loading
│   │   └── ships/                  # Ship geometry by faction
│   │
│   ├── systems/
│   │   ├── weapons.ts              # Weapon firing
│   │   └── upgrades.ts             # Upgrade logic
│   │
│   ├── ui/
│   │   ├── hud.ts                  # In-game HUD
│   │   ├── station-menu.ts         # Station tabs
│   │   ├── shipyard-preview.ts     # 3D preview
│   │   └── target-panel.ts         # EV target display
│   │
│   └── input/
│       └── controls.ts             # Keyboard/mouse
│
├── assets/models/                  # GLB files
├── styles/main.css                 # Extracted CSS
├── index.html
├── package.json
└── vite.config.ts
```

---

## Extraction Sequence (Dependency Order)

### Phase 1: Infrastructure (Low Risk)
1. constants.ts - No dependencies
2. styles/main.css - Extract CSS
3. index.html - Minimal structure

### Phase 2: Data Modules (Low Risk)
4. data/ships.ts
5. data/factions.ts
6. data/dialogue.ts
7. data/missions.ts
8. data/weapons.ts

### Phase 3: State Management (Medium Risk)
9. game/state.ts - Export getters/setters

### Phase 4: Core Systems (Medium Risk)
10. game/combat.ts
11. utils/math.ts
12. systems/reputation.ts

### Phase 5: Rendering Foundation (Medium Risk)
13. rendering/scene.ts
14. rendering/textures.ts
15. rendering/models.ts

### Phase 6: Entity Creation (High Complexity)
16. rendering/ships/*.ts - Split by faction
17. entities/player.ts
18. entities/enemies.ts
19. entities/stations.ts
20. entities/projectiles.ts
21. entities/particles.ts

### Phase 7: Game Logic (High Risk)
22. game/physics.ts
23. game/ai.ts
24. game/spawning.ts
25. game/docking.ts

### Phase 8: UI Components (Medium Risk)
26. ui/hud.ts
27. ui/station-menu.ts
28. ui/shipyard-preview.ts

### Phase 9: Main Loop (High Risk)
29. input/controls.ts
30. main.ts

---

## Testing Strategy

After each module extraction:
1. Run game in browser
2. Verify no console errors
3. Test relevant feature
4. Check for visual regressions

Integration checkpoints:
- After Phase 2: All data imports work
- After Phase 5: Scene renders
- After Phase 6: Ships appear
- After Phase 8: Combat works
- After Phase 9: Full game plays

---

## Potential Breaking Points

1. **Global Variable Access**: Create central state store with getters
2. **Window Object Bindings**: Keep in main.ts
3. **DOM References**: Create refs module initialized once
4. **Three.js Scene Access**: Export from scene.ts
5. **Circular Dependencies**: Use dependency injection
