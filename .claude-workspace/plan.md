# Current Work Plan

**Last Updated**: 2026-01-15 (Session 4)
**Orchestrator**: Claude Opus 4.5

---

## Orchestration Structure

```
ORCHESTRATOR CLAUDE (this context)
├── Shipyard Domain Planning Claude
│   ├── Implementation Agent(s)
│   └── Testing Agent
├── Project Structure Planning Claude
│   ├── Verification Agent
│   └── Cleanup Agent
├── Modularization Planning Claude
│   ├── Implementation Agent(s)
│   └── Testing Agent
└── (Future) Stack Migration Planning Claude
```

Each Domain Planner:
- Owns their domain end-to-end
- Writes acceptance criteria
- Spawns implementation agents
- Spawns testing agents
- Reports completion status

---

## Completed Work

### Stream 1: Shipyard Rotation Fix - DONE
- [x] Fixed ship rotation to horizontal Y-axis
- [x] Added container group pattern for clean rotation
- [x] Added visual pedestal (metallic platform + glowing ring)
- Modified: `/home/daa/neji/space-armada/index.html`

### Stream 2: Project Reorganization - DONE
- [x] Created separate directories for each game
- [x] Moved all games to proper structure
- [x] Updated asset paths in Space Armada
- [x] Verified all URLs working (HTTP 200)
- [x] Cleaned up 6 old files (906 KB freed)

**New Game URLs:**
- http://localhost:4000/space-armada/
- http://localhost:4000/fish-royale/
- http://localhost:4000/odell-lake/
- http://localhost:4000/maze-adventure/
- http://localhost:4000/catch-the-stars/

### Stream 3: Texture Research - DONE
**Key Finding**: EV Override models used procedural materials, not image textures.
**Solution**: Apply materials in Blender OR apply programmatic materials in Three.js.

---

## Active Work Streams

### Stream 4: Apply Ship Materials/Textures (PRIORITY: HIGH) - COMPLETE
**Status**: COMPLETE - Faction colors implemented

#### Options:
1. **Blender Route**: Open .blend files, apply materials, re-export GLB
2. **Three.js Route**: Apply materials programmatically when loading models

#### Reference Colors (from research):
| Faction | Primary Color | Secondary |
|---------|---------------|-----------|
| UE/Human | Gray/White | Blue accents |
| Voinian | Brown/Rust | Dark metal |
| Crescent | Crystal/Purple | Teal glow |
| Miranu | Gold/Bronze | Warm tones |
| Azdgari | Green/Teal | Cyan glow |
| Emalgha | Organic Green | Wood/Brown |
| Pirates | Mixed/Rusty | Mismatched |

#### Reference Files:
- `/home/daa/neji/evo_assets/reference_renders/*.png` - Original colors
- `/home/daa/neji/evo_assets/evo_models/Blender/*.blend` - Source models

---

### Stream 5: Space Armada Modularization (PRIORITY: MEDIUM)
**Status**: Phase 1 COMPLETE, Phase 2 IN PROGRESS

#### Phase 1 (COMPLETE):
- [x] Analyze current 8000+ line structure
- [x] Design module breakdown
- [x] Extracted 10 initial modules
- [x] Created module infrastructure

#### Phase 2 (IN PROGRESS):
- [ ] Set up build system (Vite recommended)
- [ ] Complete remaining module extractions
- [ ] Test after each extraction

#### Target Structure:
```
space-armada/
├── src/
│   ├── main.js           # Entry point
│   ├── game/
│   │   ├── state.js      # Game state
│   │   ├── physics.js    # Newtonian physics
│   │   ├── combat.js     # Combat system
│   │   └── ai.js         # Enemy AI
│   ├── rendering/
│   │   ├── scene.js      # Three.js setup
│   │   ├── ships.js      # Ship rendering
│   │   └── effects.js    # Particles
│   ├── ui/
│   │   ├── hud.js        # In-game HUD
│   │   ├── station.js    # Station UI
│   │   └── shipyard.js   # Shipyard preview
│   └── data/
│       ├── ships.js      # Ship definitions
│       └── factions.js   # Faction data
├── assets/
│   └── models/           # GLB files
├── index.html
├── package.json
└── vite.config.js
```

---

### Stream 6: Architecture Improvements (PRIORITY: LOW)
**Status**: FUTURE

- [ ] TypeScript migration
- [ ] WebGPU renderer option
- [ ] WASM for physics
- [ ] PWA support

---

## Agent Assignment Protocol

### For Planning Agents:
1. Read this file for current state
2. Check `manifest.md` for recent actions
3. Assign work to sub-agents with clear scope
4. Update this file with progress

### For Implementation Agents:
1. Read assigned task from this file
2. Read `spec.md` for quality standards
3. Implement the task
4. Log actions to `manifest.md`

### For Research Agents:
1. Search for specific information
2. Report findings clearly
3. Log to `manifest.md`

---

---

## Session 4 Progress

**Achievements:**
- [x] Landing page created - Central hub for all games
- [x] Dev tools verified - Project structure validated
- [x] Project cleanup - 6 old files deleted (906 KB freed)
- [x] Modularization Phase 1 - 10 modules extracted and structured
- [ ] Modularization Phase 2 - In progress

**Summary**: Completed Stream 4 (Materials/Textures with faction colors). Advanced Stream 5 Modularization to Phase 1 completion with 10 modules created. Established solid foundation for Phase 2 implementation.

---

## Immediate Next Actions

1. **Complete modularization Phase 2** - Set up Vite build system and extract remaining modules
2. **Test modularized structure** - Verify all 10 modules work correctly together
3. **Polish landing page** - Add game previews and enhanced styling
