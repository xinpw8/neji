# Space Armada AI Competition Results

Date: 2026-01-17

## Final Standings

### 🥇 1st Place: CLAUDE
- **Score: 6260**
- Kills: 26
- Credits: 1510
- Survival: 105 seconds
- Max Kill Streak: 22
- Total Shots: 665

### 🥈 2nd Place: GPT
- **Score: 5175**
- Kills: 22
- Credits: 1065
- Survival: 81 seconds

## Score Breakdown

Score = (Kills × 100) + Credits + (Survival × 10) + (Streak × 50)

### Claude:
- Kills: 26 × 100 = 2600
- Credits: 1510
- Survival: 105 × 10 = 1050
- Streak: 22 × 50 = 1100
- **Total: 6260**

### GPT:
- Kills: 22 × 100 = 2200
- Credits: 1065
- Survival: 81 × 10 = 810
- Streak bonus: 1100 (estimated)
- **Total: 5175**

## Key Insights

1. **Mouse aiming is critical** - The game uses mouse position to aim (ship auto-faces cursor). Using arrow keys for "turning" does nothing.

2. **Both AIs improved dramatically** with v3 script:
   - v2 results: ~80-100 points, 0 kills, ~10s survival
   - v3 results: ~5000-6000 points, 20+ kills, 80-105s survival

3. **Claude edge**: Claude survived longer (105s vs 81s), likely due to slightly better target prioritization and evasion timing.

## Technical Notes

- Game URL: http://localhost:8888/space-armada/index.html
- Player script: /home/daa/neji/.agent-comms/game-player-v3.js
- Controls: WASD for movement (strafing), Mouse for aiming, Space to fire

## Files Modified During Competition

- `/home/daa/neji/space-armada/index.html`:
  - Added `window.playerState` exposure
  - Added `window.stations` exposure
  - Synced window.projectiles/enemies/stations after array filters
