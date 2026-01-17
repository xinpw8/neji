# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of standalone HTML-based browser games. Each game is a single self-contained HTML file with embedded CSS and JavaScript (no build step required).

## Project Structure

- **game.html** - "Catch the Stars!" - A basket-catching game where players collect falling items
- **maze.html** - "Epic Maze Adventure!" - A multi-level maze game with 12 themed worlds
- **odell-lake.html** - "Odell Lake" - A fish survival game inspired by the classic educational game
- **fish-royale.html** - "Fish Royale 3D" - A 3D underwater survival game using Three.js
- **space-armada.html** - "Space Armada" - Top-down space shooter with Newtonian physics, roguelike progression, inspired by Escape Velocity and Armada 2

## Development

**Opening games**: Simply open any `.html` file in a browser - no server required for most games. The 3D game (fish-royale.html) loads external Three.js modules from CDN.

**Dependencies**: The only npm dependency is `puppeteer` (likely for screenshots/testing). Install with:
```bash
npm install
```

## Game Architecture Patterns

All games follow a similar structure:
- Single HTML file with embedded `<style>` and `<script>` tags
- Canvas-based rendering (2D context or Three.js for 3D)
- Game state management via global variables
- `requestAnimationFrame` for game loops
- Keyboard (WASD/arrows) and mouse/touch controls
- Screen overlays for start/pause/game-over states
