# Claude Inbox

Messages from GPT for Claude to process.

---

## Active Messages

(No messages yet - GPT will write findings here)

---

## Message Templates

### Bug Report Template

```json
{
  "id": "msg-XXX",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "sender": "gpt",
  "recipient": "claude",
  "type": "BUG_REPORT",
  "priority": "low|medium|high|critical",
  "status": "PENDING",
  "subject": "Brief bug description",
  "content": {
    "details": "Full description of the bug",
    "context": {
      "file": "path/to/file.js",
      "line": 123,
      "reproduction_steps": [
        "Step 1: Do this",
        "Step 2: Then this",
        "Step 3: Bug occurs"
      ],
      "expected": "What should happen",
      "actual": "What actually happens",
      "console_errors": [
        "Error message if any"
      ],
      "screenshot_description": "Description of visual issue if applicable"
    }
  },
  "references": [],
  "requires_response": true
}
```

### Test Result Template

```json
{
  "id": "msg-XXX",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "sender": "gpt",
  "recipient": "claude",
  "type": "TEST_RESULT",
  "priority": "medium",
  "status": "PENDING",
  "subject": "Test Results for [Feature/Area]",
  "content": {
    "details": "Summary of testing session",
    "context": {
      "test_url": "http://localhost:4001/space-armada-modular/",
      "test_duration": "X minutes",
      "tests_run": [
        {
          "name": "Test name",
          "result": "PASS|FAIL",
          "notes": "Any observations"
        }
      ],
      "passed": 0,
      "failed": 0,
      "errors": [
        {
          "type": "console|visual|functional",
          "message": "Error description",
          "severity": "low|medium|high|critical"
        }
      ],
      "overall_assessment": "Brief summary of game state"
    }
  },
  "references": ["msg-002"],
  "requires_response": true
}
```

### Question Template

```json
{
  "id": "msg-XXX",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "sender": "gpt",
  "recipient": "claude",
  "type": "QUESTION",
  "priority": "medium",
  "status": "PENDING",
  "subject": "Question about [Topic]",
  "content": {
    "details": "The question",
    "context": {
      "background": "Why this information is needed",
      "related_to": "What part of the project this relates to"
    }
  },
  "references": [],
  "requires_response": true
}
```

### Acknowledgment Template

```json
{
  "id": "msg-XXX",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "sender": "gpt",
  "recipient": "claude",
  "type": "ACK",
  "priority": "low",
  "status": "COMPLETED",
  "subject": "Acknowledged: [Original Subject]",
  "content": {
    "details": "Message received and understood. Beginning work on the task."
  },
  "references": ["msg-XXX"],
  "requires_response": false
}
```

---

## Archived Messages

(No archived messages yet)
