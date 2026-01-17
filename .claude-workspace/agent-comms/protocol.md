# Agent Communication Protocol

This document defines the communication protocol for GPT and Claude collaboration on the Space Armada project.

## Overview

This is a file-based asynchronous communication system. Each agent monitors their inbox file and writes responses/tasks to the other agent's inbox.

## Message Format

All messages use JSON format with the following structure:

```json
{
  "id": "msg-001",
  "timestamp": "2026-01-17T12:00:00Z",
  "sender": "claude|gpt",
  "recipient": "claude|gpt",
  "type": "BUG_REPORT|FIX_REQUEST|TEST_RESULT|CODE_CHANGE|QUESTION|INFO|ACK",
  "priority": "low|medium|high|critical",
  "status": "PENDING|IN_PROGRESS|COMPLETED|BLOCKED",
  "subject": "Brief description",
  "content": {
    "details": "Full message content",
    "context": {},
    "attachments": []
  },
  "references": ["msg-000"],
  "requires_response": true
}
```

## Task Types

### BUG_REPORT
Used when an agent discovers a bug during testing or code review.

Required fields:
- `content.details`: Description of the bug
- `content.context.file`: File where bug was found (if applicable)
- `content.context.line`: Line number (if applicable)
- `content.context.reproduction_steps`: How to reproduce
- `content.context.expected`: Expected behavior
- `content.context.actual`: Actual behavior

### FIX_REQUEST
Request for the other agent to fix a specific issue.

Required fields:
- `content.details`: What needs to be fixed
- `content.context.files`: Files that may need changes
- `references`: Link to related BUG_REPORT if applicable

### TEST_RESULT
Report of testing activities and their outcomes.

Required fields:
- `content.details`: Summary of testing
- `content.context.tests_run`: List of tests performed
- `content.context.passed`: Number of tests passed
- `content.context.failed`: Number of tests failed
- `content.context.errors`: Array of error details

### CODE_CHANGE
Notification that code has been modified.

Required fields:
- `content.details`: What was changed and why
- `content.context.files_changed`: List of modified files
- `content.context.commit_hash`: Git commit hash if applicable

### QUESTION
Request for information or clarification.

Required fields:
- `content.details`: The question
- `content.context.background`: Why this information is needed

### INFO
General information sharing (no response required).

### ACK
Acknowledgment of received message.

Required fields:
- `references`: ID of message being acknowledged

## Status Values

- **PENDING**: Task has been created but not yet started
- **IN_PROGRESS**: Agent is actively working on this task
- **COMPLETED**: Task has been finished
- **BLOCKED**: Task cannot proceed due to a dependency or issue

## Communication Flow

1. Agent writes message to the other agent's inbox file
2. Agent updates `status.json` to reflect new pending items
3. Receiving agent reads their inbox
4. Receiving agent processes the message
5. Receiving agent sends ACK or response to sender's inbox
6. Receiving agent updates `status.json`

## File Locations

- `/home/daa/neji/.claude-workspace/agent-comms/gpt-inbox.md` - Messages FOR GPT
- `/home/daa/neji/.claude-workspace/agent-comms/claude-inbox.md` - Messages FOR Claude
- `/home/daa/neji/.claude-workspace/agent-comms/status.json` - Current state
- `/home/daa/neji/.claude-workspace/agent-comms/test-harness.md` - Testing instructions

## Conventions

1. Always include timestamps in ISO 8601 format
2. Use incrementing message IDs (msg-001, msg-002, etc.)
3. Reference related messages when applicable
4. Update status.json after any inbox modification
5. Mark messages as COMPLETED when fully handled
6. Archive old messages periodically (move to archive section)

## Priority Guidelines

- **critical**: System is broken, cannot proceed
- **high**: Blocks other work, needs attention soon
- **medium**: Important but not blocking
- **low**: Nice to have, can wait
