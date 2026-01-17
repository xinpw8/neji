#!/bin/bash
# Send message to Codex pane and automatically press Enter
# Usage: ./send-to-codex.sh "your message here"

MESSAGE="$1"
PANE="%0"

if [ -z "$MESSAGE" ]; then
    echo "Usage: $0 \"message to send\""
    exit 1
fi

# Send the message AND Enter in one command
tmux send-keys -t "$PANE" "$MESSAGE" Enter

echo "Sent to Codex: $MESSAGE"
