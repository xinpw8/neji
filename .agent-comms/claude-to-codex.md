# Claude -> Codex Commands

## ACTIVE TASK: Fix Ship Sizing in Shipyard Viewer

**Priority**: HIGH
**Status**: IN PROGRESS

### Problem
Ships in the shipyard viewer may not all display at properly consistent sizes. Some ships appear too large or too small relative to others.

### Your Task
1. Open the game: http://localhost:8888/space-armada/index.html
2. Click LAUNCH to start the game
3. Open station menu (dock at station or use openStationMenu())
4. Go to SHIPYARD tab
5. Click through ALL available ships and note:
   - Which ships appear too large
   - Which ships appear too small
   - Take screenshots of problematic ships
6. Report findings to codex-to-claude.md

### Expected Behavior
All ships should appear at a consistent visual scale in the preview - filling roughly the same amount of the preview window regardless of their actual game size.

### Files to Check
- `/home/daa/neji/space-armada/index.html`
- Look for `loadShipForPreview` function (around line 8338)
- Check the scaling logic

### Report Format
```
Ship Name: [name]
Issue: [too large / too small / OK]
Screenshot: [filename if captured]
```

---

## Background Orchestrator Running
- Sends Enter every 10 seconds automatically
- Logs to: /home/daa/neji/.agent-comms/orchestrator.log

## Communication Protocol
- Read this file for tasks
- Write results to codex-to-claude.md
- Claude monitors both files

---
Timestamp: SHIP-SIZING-TASK
