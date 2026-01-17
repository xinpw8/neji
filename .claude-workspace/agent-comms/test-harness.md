# Test Harness Instructions for GPT

This document provides instructions for testing the Space Armada modular build.

## Prerequisites

- Access to terminal/command line
- Python 3 installed (for the dev server)
- A web browser with developer tools

## Starting the Development Server

### Command to Run

```bash
cd /home/daa/neji && python3 -m http.server 4001
```

### Expected Output

```
Serving HTTP on 0.0.0.0 port 4001 (http://0.0.0.0:4001/) ...
```

Keep this terminal open while testing.

## URLs to Test

| URL | Description |
|-----|-------------|
| `http://localhost:4001/space-armada-modular/` | Modular version (main test target) |
| `http://localhost:4001/space-armada.html` | Original monolithic version (for comparison) |

## Testing Procedure

### 1. Initial Page Load

**What to do:**
1. Open `http://localhost:4001/space-armada-modular/` in the browser
2. Open Developer Tools (F12 or Ctrl+Shift+I)
3. Check the Console tab for errors

**What to look for:**
- Console errors (red messages)
- Failed network requests (in Network tab)
- JavaScript exceptions
- Module loading failures

**How to report:**
- Screenshot or copy any console errors
- Note the exact error message and stack trace
- Note which file/module failed to load

### 2. Start Screen Test

**What to do:**
1. Verify the start screen renders
2. Check that all UI elements are visible
3. Look for any visual glitches

**What to look for:**
- Title displays correctly
- Start button/instructions visible
- No overlapping elements
- Proper colors and styling

### 3. Gameplay Test

**Controls:**
- **WASD** or **Arrow Keys**: Move/rotate ship
- **Spacebar** or **Left Click**: Fire weapons
- **ESC** or **P**: Pause game
- **E**: Interact (if applicable)

**What to do:**
1. Start a new game
2. Test all movement controls
3. Test weapon firing
4. Let enemies spawn and engage
5. Test collision with enemies/projectiles
6. Get hit to test damage system
7. Die to test game over screen
8. Restart and verify reset works

**What to look for:**
- Ship responds to controls smoothly
- Physics feel correct (momentum preserved)
- Weapons fire in correct direction
- Enemies move and attack
- Collisions register properly
- Health/shield updates correctly
- Score increments
- Game over triggers at 0 health

### 4. Performance Test

**What to do:**
1. Play for at least 2 minutes
2. Monitor frame rate in DevTools (Performance tab)
3. Watch memory usage
4. Trigger lots of enemies/projectiles

**What to look for:**
- Consistent 60 FPS (or close)
- No increasing memory usage (leak)
- No lag spikes
- No frozen frames

### 5. Edge Case Tests

**Test these scenarios:**
- Rapid key presses
- Holding multiple keys
- Clicking outside game area
- Resizing browser window
- Pausing and unpausing rapidly
- Dying immediately after respawn

## Reporting Findings

### For Bugs

Write to `/home/daa/neji/.claude-workspace/agent-comms/claude-inbox.md`:

1. Use the BUG_REPORT template from that file
2. Include:
   - Clear reproduction steps
   - Expected vs actual behavior
   - Any console errors
   - Screenshot description if visual

### For Test Results

Write to `/home/daa/neji/.claude-workspace/agent-comms/claude-inbox.md`:

1. Use the TEST_RESULT template
2. Include:
   - Which tests passed/failed
   - Overall assessment
   - Any concerning observations

### Update Status

After reporting, update `/home/daa/neji/.claude-workspace/agent-comms/status.json`:

1. Change `gpt_status` to reflect current state
2. Update `last_updated` timestamp
3. Move items between `pending_items`, `completed_items`, or `blocked_items`

## Common Issues and Solutions

### Server Won't Start

```bash
# Check if port is in use
lsof -i :4001

# Kill process using port
kill -9 <PID>

# Try different port
python3 -m http.server 4002
```

### Module Loading Errors

- Check browser supports ES6 modules
- Verify all files exist in space-armada-modular/
- Check for typos in import paths

### CORS Errors

- Must use http://localhost, not file://
- Ensure server is running

### Game Doesn't Start

- Check console for errors
- Verify canvas element exists
- Check if game loop is starting

## Communication Protocol

1. Read your inbox: `gpt-inbox.md`
2. Write to Claude's inbox: `claude-inbox.md`
3. Update shared state: `status.json`
4. Reference the protocol: `protocol.md`

## Quick Reference

| File | Purpose |
|------|---------|
| `protocol.md` | Communication format documentation |
| `gpt-inbox.md` | Messages for GPT (your tasks) |
| `claude-inbox.md` | Messages for Claude (your reports) |
| `status.json` | Current collaboration state |
| `test-harness.md` | This file - testing instructions |
