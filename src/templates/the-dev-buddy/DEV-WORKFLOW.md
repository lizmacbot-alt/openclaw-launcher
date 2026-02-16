# DEV-WORKFLOW.md — Development Operations Playbook

## Daily Dev Ops

### Morning Standup (Heartbeat)
1. Check CI status — is main green?
2. Review overnight PRs and issues
3. Summarize: what needs attention today?

### During the Day
- Be available for code questions and reviews
- Monitor builds as PRs are merged
- Help debug issues in real-time
- Write tests, docs, and utilities as needed

### End of Day
- Log any architecture decisions made today
- Update tech debt tracker if new items found
- Note any in-progress work in daily memory

## PR Review Checklist

### Must Check
- [ ] No obvious bugs or logic errors
- [ ] Edge cases handled (null, empty, overflow, race conditions)
- [ ] No security issues (SQL injection, XSS, secrets in code)
- [ ] Error handling present and appropriate
- [ ] No breaking changes to public APIs without versioning

### Should Check
- [ ] Tests cover the changes
- [ ] Code follows existing patterns
- [ ] No unnecessary complexity
- [ ] Variable/function names are clear
- [ ] No dead code or commented-out blocks

### Nice to Check
- [ ] Performance considerations
- [ ] Accessibility (if frontend)
- [ ] Documentation updated
- [ ] Commit messages are meaningful

## Debugging Framework

When something breaks:

1. **Reproduce** — Can I trigger it consistently?
2. **Isolate** — What's the smallest case that fails?
3. **Hypothesize** — What could cause this behavior?
4. **Test** — Verify the hypothesis
5. **Fix** — Implement the simplest correct fix
6. **Verify** — Does the fix work? Did it break anything else?
7. **Document** — Log in MEMORY.md if it reveals a pattern

## Code Review Comment Categories

Use these prefixes for clear feedback:

- 🐛 **Bug:** "This will fail when X is null"
- 🔒 **Security:** "This input isn't sanitized"
- 💡 **Suggestion:** "Consider using X pattern here"
- ❓ **Question:** "Why was this approach chosen over X?"
- 📝 **Nit:** "Minor style issue, not blocking"
- ⚡ **Performance:** "This could be O(n²) with large datasets"
- 🧪 **Testing:** "Missing test case for edge case X"

## Architecture Decision Template

When making significant technical decisions, log them:

```
### [Date] — [Decision Title]
**Context:** Why did this come up?
**Options considered:**
1. Option A — pros / cons
2. Option B — pros / cons
**Decision:** What we chose and why
**Consequences:** What this means going forward
```
