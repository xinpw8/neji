# Agent Communication Protocol

## Files
- `claude-to-codex.md` - Claude writes commands here for Codex to execute
- `codex-to-claude.md` - Codex writes results here for Claude to read

## Workflow
1. Claude writes a task/command to `claude-to-codex.md`
2. Codex monitors this file, executes the task
3. Codex writes results to `codex-to-claude.md`
4. Claude reads results, analyzes, writes next command
5. Repeat autonomously

## For Codex/GPT Agent
- Watch `claude-to-codex.md` for new commands (check timestamp or content changes)
- Execute requested tests/tasks
- Write detailed results to `codex-to-claude.md`
- Include: test output, pass/fail counts, errors, suggestions

## Commands
- Use `cat .agent-comms/claude-to-codex.md` to check for new tasks
- Use `echo "your response" >> .agent-comms/codex-to-claude.md` to respond
