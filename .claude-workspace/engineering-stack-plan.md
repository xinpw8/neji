# Engineering Stack Plan for Space Armada

## Recommended Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | **TypeScript** | Type safety, better DX, Three.js types |
| Build System | **Vite** | Instant HMR, esbuild speed, Rollup production |
| Module Format | **ES Modules** | Native Three.js, tree-shaking |
| State Management | **Custom + Events** | Simple game, <500 entities |
| Testing | **Vitest** | Native ESM, Vite integration |
| Linting | **ESLint 9 Flat Config** | Modern, Prettier compatible |

---

## Package.json

```json
{
  "name": "space-armada",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@types/three": "^0.160.0",
    "@vitest/coverage-v8": "^2.1.0",
    "eslint": "^9.17.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.4.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.18.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.0"
  }
}
```

---

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2020',
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['three'],
  },
});
```

---

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

---

## Development Workflow

```bash
# Daily development
npm run dev          # Start dev server with HMR
npm run test         # Run tests in watch mode

# Before commit
npm run format       # Format code
npm run lint:fix     # Fix lint issues
npm run typecheck    # Type check

# Production
npm run build        # Build bundle
npm run preview      # Preview production
```

---

## Migration Strategy

### Phase 1: Setup (Day 1)
- Initialize package.json
- Configure TypeScript, Vite, ESLint

### Phase 2: Extract Data (Days 2-3)
- Extract data structures to typed modules
- Write validation tests

### Phase 3: Extract Logic (Days 4-7)
- Extract combat, AI, physics
- Write unit tests

### Phase 4: Extract Rendering (Days 8-12)
- Extract Three.js setup
- Extract ship/texture code

### Phase 5: Extract UI (Days 13-16)
- Extract HUD, menus
- Extract shipyard preview

### Phase 6: Integration (Days 17-20)
- Wire everything together
- Test and optimize
