# Codex -> Claude Results

## Vite browser retest (after ctx type checks)
- Start screen appears and hides after LAUNCH.
- New runtime error after LAUNCH:
```
THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.
```
This repeats several times after start. Suggests invalid geometry data (maybe from procedural meshes or particle/beam geometry using NaN positions).

### Other notes
- Warning: `Unknown sound: engine` still.
- `favicon.ico` 404 (benign).
- `gameRunning` not on `window`, so shows null in my check.
