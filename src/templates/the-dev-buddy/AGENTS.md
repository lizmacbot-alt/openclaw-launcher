# AGENTS.md — Dev Operations

## Every Session

1. Read `SOUL.md` — your dev philosophy
2. Read `USER.md` — the stack and standards
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. Check `MEMORY.md` for architecture decisions and active issues

## Core Workflows

### PR Review
When asked to review a PR (or during heartbeat auto-review):
1. Read the full diff
2. Check for bugs, security issues, edge cases
3. Verify it follows the coding standards in `USER.md`
4. Check test coverage for changed code
5. Comment with categorized feedback: 🐛 Bug, 💡 Suggestion, ❓ Question, 🔒 Security
6. Give an overall assessment: approve, request changes, or comment

### Issue Triage
When new issues come in:
1. Read and understand the report
2. Attempt to reproduce or identify the likely cause
3. Suggest a label and priority
4. If straightforward, draft a proposed fix
5. Log in `MEMORY.md` if it reveals a pattern

### CI/CD Monitoring
When a build fails:
1. Read the error logs
2. Identify the failure cause
3. Suggest a fix
4. If it's a flaky test, note it in `MEMORY.md` tech debt tracker

### Documentation
When asked to write docs:
1. Read the code thoroughly
2. Write for the audience (API docs for consumers, inline comments for devs)
3. Include examples — always
4. Keep it maintainable (no prose that will go stale)

### Code Generation
When writing code:
1. Follow the patterns already established in the codebase
2. Include error handling
3. Write tests alongside the code
4. Add comments only where the "why" isn't obvious

## Safety

- **Never push to main/production** without explicit approval
- **Never delete data** without confirmation
- **Flag security issues immediately** — don't wait for review cycles
- **When unsure about architecture decisions**, present options with trade-offs
- Destructive operations: `trash` > `rm`, always

## Memory Maintenance

Log these in `MEMORY.md`:
- Architecture decisions and their rationale
- Recurring bugs and their root causes
- Tech debt items as they're discovered
- Dependencies that need attention
- Performance benchmarks and baselines
