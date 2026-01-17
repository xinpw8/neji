"""
Agent Bridge Server - HTTP API for bidirectional agent communication.

Provides endpoints for Claude and GPT agents to exchange messages.
Run with: python bridge_server.py
"""

import json
import threading
from datetime import datetime
from collections import defaultdict
from flask import Flask, request, jsonify

from config import BRIDGE_HOST, BRIDGE_PORT

app = Flask(__name__)

# Thread-safe message queues for each agent
message_queues = defaultdict(list)
queue_lock = threading.Lock()

# Message history for debugging
message_history = []


def get_timestamp():
    """Get current timestamp in ISO format."""
    return datetime.utcnow().isoformat() + "Z"


@app.route('/message', methods=['POST'])
def send_message():
    """
    Send a message from one agent to another.

    Request body:
    {
        "from": "claude" | "gpt",
        "to": "claude" | "gpt",
        "content": "message content"
    }

    Returns:
    {
        "status": "success",
        "message_id": int,
        "timestamp": str
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        sender = data.get('from')
        recipient = data.get('to')
        content = data.get('content')

        # Validate required fields
        if not sender:
            return jsonify({"error": "Missing 'from' field"}), 400
        if not recipient:
            return jsonify({"error": "Missing 'to' field"}), 400
        if not content:
            return jsonify({"error": "Missing 'content' field"}), 400

        # Validate agent names
        valid_agents = ['claude', 'gpt']
        if sender not in valid_agents:
            return jsonify({"error": f"Invalid sender '{sender}'. Must be one of: {valid_agents}"}), 400
        if recipient not in valid_agents:
            return jsonify({"error": f"Invalid recipient '{recipient}'. Must be one of: {valid_agents}"}), 400

        # Create message
        with queue_lock:
            message_id = len(message_history) + 1
            message = {
                "id": message_id,
                "from": sender,
                "to": recipient,
                "content": content,
                "timestamp": get_timestamp(),
                "read": False
            }

            # Add to recipient's queue
            message_queues[recipient].append(message)

            # Add to history
            message_history.append(message)

        return jsonify({
            "status": "success",
            "message_id": message_id,
            "timestamp": message["timestamp"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/messages/<agent>', methods=['GET'])
def get_messages(agent):
    """
    Get pending messages for an agent.

    URL params:
    - agent: "claude" | "gpt"

    Query params:
    - clear: "true" to clear messages after retrieval (default: false)

    Returns:
    {
        "agent": str,
        "messages": [...],
        "count": int
    }
    """
    try:
        valid_agents = ['claude', 'gpt']
        if agent not in valid_agents:
            return jsonify({"error": f"Invalid agent '{agent}'. Must be one of: {valid_agents}"}), 400

        clear_after = request.args.get('clear', 'false').lower() == 'true'

        with queue_lock:
            messages = list(message_queues[agent])

            # Mark as read
            for msg in message_queues[agent]:
                msg['read'] = True

            if clear_after:
                message_queues[agent] = []

        return jsonify({
            "agent": agent,
            "messages": messages,
            "count": len(messages)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/clear/<agent>', methods=['POST'])
def clear_messages(agent):
    """
    Clear all pending messages for an agent.

    URL params:
    - agent: "claude" | "gpt"

    Returns:
    {
        "status": "success",
        "cleared_count": int
    }
    """
    try:
        valid_agents = ['claude', 'gpt']
        if agent not in valid_agents:
            return jsonify({"error": f"Invalid agent '{agent}'. Must be one of: {valid_agents}"}), 400

        with queue_lock:
            cleared_count = len(message_queues[agent])
            message_queues[agent] = []

        return jsonify({
            "status": "success",
            "cleared_count": cleared_count
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/status', methods=['GET'])
def get_status():
    """
    Get current queue status.

    Returns:
    {
        "status": "running",
        "queues": {
            "claude": {"pending": int, "unread": int},
            "gpt": {"pending": int, "unread": int}
        },
        "total_messages": int,
        "timestamp": str
    }
    """
    try:
        with queue_lock:
            queues = {}
            for agent in ['claude', 'gpt']:
                messages = message_queues[agent]
                unread = sum(1 for m in messages if not m.get('read', False))
                queues[agent] = {
                    "pending": len(messages),
                    "unread": unread
                }

        return jsonify({
            "status": "running",
            "queues": queues,
            "total_messages": len(message_history),
            "timestamp": get_timestamp()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/history', methods=['GET'])
def get_history():
    """
    Get full message history (for debugging).

    Query params:
    - limit: max number of messages (default: 100)

    Returns:
    {
        "messages": [...],
        "count": int
    }
    """
    try:
        limit = int(request.args.get('limit', 100))

        with queue_lock:
            messages = list(message_history[-limit:])

        return jsonify({
            "messages": messages,
            "count": len(messages)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API documentation."""
    return jsonify({
        "name": "Agent Bridge Server",
        "version": "1.0.0",
        "endpoints": {
            "POST /message": "Send a message between agents",
            "GET /messages/<agent>": "Get pending messages for an agent",
            "POST /clear/<agent>": "Clear messages for an agent",
            "GET /status": "Get current queue status",
            "GET /history": "Get full message history"
        }
    })


if __name__ == '__main__':
    print(f"Starting Agent Bridge Server on http://{BRIDGE_HOST}:{BRIDGE_PORT}")
    print("Press Ctrl+C to stop")
    app.run(host=BRIDGE_HOST, port=BRIDGE_PORT, debug=False, threaded=True)
