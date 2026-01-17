# Neji Games Collection - Specification

## Overview
A collection of browser-based games inspired by classic titles, built with modern web technologies.

## Games in Collection
1. **Space Armada** - Top-down space shooter inspired by Escape Velocity and Armada 2
2. **Fish Royale 3D** - 3D underwater survival game using Three.js
3. **Odell Lake** - Fish survival game inspired by the classic educational game
4. **Epic Maze Adventure** - Multi-level maze game with 12 themed worlds
5. **Catch the Stars** - Basket-catching game

---

## Space Armada Specification

### Vision
A polished, modular space trading/combat game with:
- Newtonian physics combat
- Roguelike progression
- Multiple factions and ships
- 3D ship models with proper textures from EV Nova assets

### Technical Requirements

#### Architecture
- **NOT** a monolithic HTML file
- Modular JavaScript/TypeScript structure
- Separate concerns: rendering, game logic, UI, data
- Build system for bundling (Vite, esbuild, or similar)

#### Rendering
- Three.js for 3D rendering
- WebGL 2.0 minimum
- Consider WebGPU for future-proofing
- Proper texture loading for GLB models

#### Asset Pipeline
- GLB models in `assets/models/`
- Textures in `assets/textures/`
- Audio in `assets/audio/`
- Data files (ships, weapons, factions) in `data/`

#### Deployment Options
- Static web hosting (primary)
- Optional: WASM compilation for performance-critical paths
- PWA support for offline play

### Shipyard UI Requirements
- Split-panel layout: ship list (40%) + 3D preview (60%)
- Ships rotate on horizontal plane (Y-axis)
- Ships appear on a "pedestal" or platform
- Proper textures displayed on all models
- Drag-to-rotate interaction
- All 31+ ship models viewable

### Ship Model Requirements
- Use original EV Nova textures (open-sourced by Ambrosia)
- Consistent scale across all models
- Proper material properties (metalness, roughness)
- Engine glow effects

---

## Project Structure Target

```
neji/
├── .claude-workspace/
│   ├── spec.md              # This file - ultimate specification
│   ├── plan.md              # Current work plan
│   └── manifest.md          # Agent action log
├── space-armada/
│   ├── src/
│   │   ├── main.js          # Entry point
│   │   ├── game/            # Game logic
│   │   ├── rendering/       # Three.js rendering
│   │   ├── ui/              # UI components
│   │   └── data/            # Ship/weapon definitions
│   ├── assets/
│   │   ├── models/          # GLB files
│   │   └── textures/        # Texture files
│   ├── index.html
│   └── package.json
├── fish-royale/
│   └── ...
├── odell-lake/
│   └── ...
├── maze-adventure/
│   └── ...
└── catch-the-stars/
    └── ...
```

---

## Quality Standards

1. **Readability**: Any file < 500 lines preferred, 1000 max
2. **Modularity**: Single responsibility per module
3. **Documentation**: JSDoc comments on public APIs
4. **Type Safety**: TypeScript preferred, or thorough JSDoc types
5. **Testing**: Unit tests for game logic
6. **Performance**: 60 FPS target on mid-range hardware

---

## Claude Agent Protocol

Any Claude agent working on this project should:
1. Read `.claude-workspace/spec.md` (this file) for ultimate goals
2. Read `.claude-workspace/plan.md` for current tasks
3. Log actions to `.claude-workspace/manifest.md`
4. Follow the project structure and quality standards
5. Communicate clearly what was done and what remains
