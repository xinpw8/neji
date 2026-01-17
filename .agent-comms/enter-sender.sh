#!/bin/bash
# Background script that sends Enter to Codex pane every 10 seconds
# This ensures messages always get submitted

PANE="%0"
LOG="/home/daa/neji/.agent-comms/enter-sender.log"

echo "$(date): Enter-sender started for pane $PANE" >> "$LOG"

while true; do
    # Check if tmux session exists
    if tmux has-session 2>/dev/null; then
        # Send Enter to Codex pane
        tmux send-keys -t "$PANE" Enter 2>/dev/null
        echo "$(date): Sent Enter to $PANE" >> "$LOG"
    else
        echo "$(date): No tmux session found" >> "$LOG"
    fi
    sleep 10
done
