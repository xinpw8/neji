#!/bin/bash
# Autonomous Orchestrator - Monitors and manages Claude-Codex communication
# Runs in background, sends Enter every 10s, monitors health

CODEX_PANE="%0"
CLAUDE_PANE="%4"
LOG="/home/daa/neji/.agent-comms/orchestrator.log"
COMMS_DIR="/home/daa/neji/.agent-comms"
PID_FILE="$COMMS_DIR/orchestrator.pid"

# Store PID
echo $$ > "$PID_FILE"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG"
}

log "=== Orchestrator Started ==="
log "Codex pane: $CODEX_PANE"
log "Claude pane: $CLAUDE_PANE"

# Main loop
COUNTER=0
while true; do
    COUNTER=$((COUNTER + 1))

    # Every 10 seconds: Send Enter to Codex
    if tmux has-session 2>/dev/null; then
        tmux send-keys -t "$CODEX_PANE" Enter 2>/dev/null

        # Every 60 seconds: Log status
        if [ $((COUNTER % 6)) -eq 0 ]; then
            # Capture Codex context percentage
            CONTEXT=$(tmux capture-pane -t "$CODEX_PANE" -p | grep -o '[0-9]*% context' | head -1)
            log "Codex context: $CONTEXT"

            # Check for new messages in communication files
            if [ -f "$COMMS_DIR/codex-to-claude.md" ]; then
                LAST_MOD=$(stat -c %Y "$COMMS_DIR/codex-to-claude.md" 2>/dev/null)
                log "codex-to-claude.md last modified: $LAST_MOD"
            fi
        fi

        # Every 5 minutes: Health check
        if [ $((COUNTER % 30)) -eq 0 ]; then
            log "=== Health Check ==="
            log "Orchestrator running for $((COUNTER * 10)) seconds"

            # Check if Codex is responsive
            CODEX_OUTPUT=$(tmux capture-pane -t "$CODEX_PANE" -p -S -5 2>/dev/null)
            if [ -n "$CODEX_OUTPUT" ]; then
                log "Codex pane active"
            else
                log "WARNING: Codex pane may be unresponsive"
            fi
        fi
    else
        log "ERROR: No tmux session found"
        sleep 30
    fi

    sleep 10
done
