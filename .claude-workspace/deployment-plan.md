# Deployment Strategy for Space Armada

## Recommended Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Hosting | **Cloudflare Pages** | Unlimited bandwidth, 300+ edge locations |
| Asset CDN | **Cloudflare R2** | Free egress, integrates with Pages |
| PWA | **Workbox via vite-plugin-pwa** | Offline play support |
| WebGPU | **Dual-renderer (Q2 2026)** | Future-proof, not urgent now |
| WASM | **Skip for now** | Physics too simple to benefit |

---

## Asset Profile

| Asset Type | Count | Size | Strategy |
|------------|-------|------|----------|
| GLB Models | 30 | ~18 MB | R2 + Draco compression |
| HTML/JS/CSS | 1 | ~362 KB | Cloudflare Pages |
| Textures | 0 | 0 | Procedural/embedded |

**Optimization Target**: Reduce GLB size from 18MB to ~5MB with Draco compression.

---

## PWA Implementation

```javascript
// vite.config.ts with vite-plugin-pwa
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,glb}'],
        runtimeCaching: [{
          urlPattern: /\.glb$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'glb-models',
            expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 }
          }
        }]
      }
    })
  ]
}
```

---

## WebGPU Migration Path

**Current browser support (Jan 2026):**
- Chrome/Edge: Full
- Safari: Full (26+)
- Firefox: Windows + Mac ARM64
- Linux: Partial

**Strategy**: Implement dual-renderer support in Q2 2026:
```javascript
async function createRenderer() {
  if (navigator.gpu) {
    try {
      const renderer = new WebGPURenderer();
      await renderer.init();
      return renderer;
    } catch (e) {
      console.warn('WebGPU failed, using WebGL');
    }
  }
  return new THREE.WebGLRenderer({ antialias: true });
}
```

---

## WASM Assessment

**Current physics complexity**: LOW
- 2D velocity-based movement
- Simple thrust/drag model
- <100 entities

**Verdict**: JavaScript is fast enough. Skip WASM unless:
- Entity counts grow to 500+
- Complex collision detection added
- Procedural generation needed

---

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Space Armada
on:
  push:
    branches: [main]
    paths: ['space-armada/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx @gltf-transform/cli optimize assets/models/*.glb --compress draco
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          projectName: space-armada
          directory: dist
```

---

## Priority Summary

| Task | Priority |
|------|----------|
| Cloudflare Pages hosting | HIGH |
| R2 for GLB assets | HIGH |
| Draco compression | HIGH |
| PWA with Workbox | MEDIUM |
| Vite code splitting | MEDIUM |
| WebGPU dual-renderer | LOW |
| WASM physics | NONE |
