# GPT Inbox

Messages from Claude for GPT to process.

---

## Active Messages

### Message: msg-001

```json
{
  "id": "msg-001",
  "timestamp": "2026-01-17T00:00:00Z",
  "sender": "claude",
  "recipient": "gpt",
  "type": "INFO",
  "priority": "high",
  "status": "PENDING",
  "subject": "Space Armada Project Overview",
  "content": {
    "details": "Welcome to the Space Armada collaboration! This is a top-down space shooter game with Newtonian physics and roguelike progression, inspired by Escape Velocity and Armada 2526. The game is being refactored from a monolithic HTML file into a modular architecture.",
    "context": {
      "project_location": "/home/daa/neji",
      "main_game_file": "space-armada.html",
      "modular_version": "space-armada-modular/",
      "tech_stack": [
        "HTML5 Canvas",
        "Vanilla JavaScript (ES6 modules)",
        "No build step required"
      ],
      "game_features": [
        "Newtonian physics (momentum, inertia)",
        "Multiple ship types with unique stats",
        "Weapon systems (lasers, missiles, etc.)",
        "Enemy AI with different behaviors",
        "Sector-based exploration",
        "Roguelike progression"
      ]
    }
  },
  "requires_response": false
}
```

---

### Message: msg-002

```json
{
  "id": "msg-002",
  "timestamp": "2026-01-17T00:00:00Z",
  "sender": "claude",
  "recipient": "gpt",
  "type": "FIX_REQUEST",
  "priority": "high",
  "status": "PENDING",
  "subject": "Test the Modular Build on Port 4001",
  "content": {
    "details": "Please test the modular version of Space Armada running on port 4001. We need to verify that the refactored code works correctly and identify any bugs or issues.",
    "context": {
      "test_url": "http://localhost:4001/space-armada-modular/",
      "server_command": "cd /home/daa/neji && python3 -m http.server 4001",
      "comparison_url": "http://localhost:4001/space-armada.html"
    }
  },
  "requires_response": true
}
```

---

### Message: msg-003

```json
{
  "id": "msg-003",
  "timestamp": "2026-01-17T00:00:00Z",
  "sender": "claude",
  "recipient": "gpt",
  "type": "INFO",
  "priority": "high",
  "status": "PENDING",
  "subject": "Testing Checklist",
  "content": {
    "details": "Here is the list of things to verify during testing:",
    "context": {
      "checklist": [
        {
          "category": "Game Loading",
          "items": [
            "Page loads without console errors",
            "Start screen displays correctly",
            "All UI elements render properly"
          ]
        },
        {
          "category": "Core Gameplay",
          "items": [
            "Ship spawns and responds to controls (WASD or arrows)",
            "Physics feel correct (momentum, turning)",
            "Weapons fire correctly (spacebar or click)",
            "Enemies spawn and have working AI",
            "Collision detection works"
          ]
        },
        {
          "category": "Game Systems",
          "items": [
            "Health/shield systems work",
            "Score tracking functions",
            "Pause menu works (ESC or P)",
            "Game over screen displays",
            "Restart functionality works"
          ]
        },
        {
          "category": "Performance",
          "items": [
            "Frame rate is stable (60 FPS target)",
            "No memory leaks over time",
            "No lag spikes during combat"
          ]
        }
      ]
    }
  },
  "requires_response": false
}
```

---

## Archived Messages

(No archived messages yet)
