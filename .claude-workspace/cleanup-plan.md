# Cleanup Plan for Neji Project

## Files to DELETE (after verification)

```bash
# Duplicate game HTML files
rm /home/daa/neji/space-armada.html
rm /home/daa/neji/fish-royale.html
rm /home/daa/neji/odell-lake.html
rm /home/daa/neji/maze.html
rm /home/daa/neji/game.html

# Optional
rm /home/daa/neji/fish-royale-final.png
```

## Files to KEEP

**Critical:**
- `CLAUDE.md`, `package.json`, `node_modules/`, `favicon.ico`

**Development tools:**
- `model-viewer.html`, `model-comparison.html`
- `capture-*.js`, `comprehensive-ev-test.js`, `verify-ev-system.js`

**Reference:**
- `ev_bible.md`, `ev_bible_analysis.md`
- `evo_assets/evo_models/Blender/` (31 .blend files)
- `evo_assets/reference_renders/`

---

## Verification Checklist (BEFORE deleting)

- [ ] http://localhost:4000/space-armada/ - loads, shipyard works
- [ ] http://localhost:4000/fish-royale/ - loads
- [ ] http://localhost:4000/odell-lake/ - loads
- [ ] http://localhost:4000/maze-adventure/ - loads
- [ ] http://localhost:4000/catch-the-stars/ - loads

---

## Missing Pieces

1. No root `index.html` landing page
2. Development tools may need path updates
