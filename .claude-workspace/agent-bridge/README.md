# Agent Bridge

A Python-based system for bidirectional communication between Claude and GPT agents.

## Overview

This bridge provides:
1. **HTTP API Server** (`bridge_server.py`) - Message queue for agent communication
2. **Claude to GPT** (`claude_to_gpt.py`) - Script for Claude to send prompts to GPT-4
3. **GPT to Claude** (`gpt_to_claude.py`) - Script for GPT to send prompts to Claude

## Setup

### 1. Install Dependencies

```bash
cd /home/daa/neji/.claude-workspace/agent-bridge
pip install -r requirements.txt
```

### 2. Set API Keys

```bash
# For GPT communication
export OPENAI_API_KEY='your-openai-api-key'

# For Claude communication
export ANTHROPIC_API_KEY='your-anthropic-api-key'
```

## Usage

### Direct Agent Communication (Recommended)

#### Claude calling GPT:
```bash
python claude_to_gpt.py "Test the game and report any bugs you find"
```

#### GPT calling Claude:
```bash
python gpt_to_claude.py "I found these bugs: 1. Menu doesn't respond..."
```

#### With file input:
```bash
python claude_to_gpt.py --file prompt.txt
python gpt_to_claude.py --file report.txt
```

#### Raw output (no headers):
```bash
python claude_to_gpt.py -r "What is 2+2?"
```

### Message Queue Server (Optional)

Start the bridge server for asynchronous message passing:

```bash
python bridge_server.py
```

Server runs on `http://127.0.0.1:5555`

#### API Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API documentation |
| `/message` | POST | Send a message between agents |
| `/messages/<agent>` | GET | Get pending messages for an agent |
| `/clear/<agent>` | POST | Clear messages for an agent |
| `/status` | GET | Current queue status |
| `/history` | GET | Full message history |

#### Example API Usage:

```bash
# Send a message from Claude to GPT
curl -X POST http://127.0.0.1:5555/message \
  -H "Content-Type: application/json" \
  -d '{"from": "claude", "to": "gpt", "content": "Please review this code"}'

# Get messages for GPT
curl http://127.0.0.1:5555/messages/gpt

# Check status
curl http://127.0.0.1:5555/status

# Clear messages for Claude
curl -X POST http://127.0.0.1:5555/clear/claude
```

## Configuration

Edit `config.py` to customize:
- Server host and port
- Model names
- System prompts
- API timeouts
- Max tokens

## Files

| File | Description |
|------|-------------|
| `bridge_server.py` | Flask HTTP server for message queue |
| `claude_to_gpt.py` | Send prompts from Claude to GPT-4 |
| `gpt_to_claude.py` | Send prompts from GPT to Claude |
| `config.py` | Configuration settings |
| `requirements.txt` | Python dependencies |

## Troubleshooting

### "API key not set" error
Make sure you've exported the appropriate environment variable:
```bash
export OPENAI_API_KEY='sk-...'
export ANTHROPIC_API_KEY='sk-ant-...'
```

### Connection errors
- Check if the bridge server is running (if using message queue)
- Verify your API keys are valid
- Check network connectivity

### Import errors
Install dependencies:
```bash
pip install -r requirements.txt
```

## Example Workflow

1. Claude starts a task and needs GPT's help:
```bash
python claude_to_gpt.py "I need you to test the game at game.html and report any bugs"
```

2. GPT responds with findings and asks Claude to fix them:
```bash
python gpt_to_claude.py "I found 3 bugs: 1) Score doesn't reset, 2) ..."
```

3. Claude fixes and asks GPT to verify:
```bash
python claude_to_gpt.py "I've fixed the issues. Please verify the fixes work correctly"
```
