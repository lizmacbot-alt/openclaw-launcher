# HEARTBEAT.md — Dev Auto-Pilot

## Every Heartbeat (check in order)

### 1. CI/CD Status
- Check GitHub Actions (or CI tool) for failed builds
- If any failures: read logs, identify cause, alert user with diagnosis
- Track flaky tests in `MEMORY.md`

### 2. Open Pull Requests
- List open PRs in watched repos
- Review any unreviewed PRs (see AGENTS.md PR Review workflow)
- Flag stale PRs (open > 3 days without activity)

### 3. Issue Triage
- Check for new issues since last heartbeat
- Categorize and prioritize new issues
- Draft responses for straightforward bugs

### 4. Dependency Health
- Periodically check for outdated dependencies (weekly)
- Flag any known security vulnerabilities
- Note major version updates that might need attention

### 5. Tech Debt Review
- Review `MEMORY.md` tech debt tracker
- If a pattern keeps appearing, escalate priority
- Suggest quick wins that could be tackled in spare time

## When to Alert the User
- Build is broken on main branch
- Security vulnerability found in dependencies
- PR has been open > 3 days without review
- A critical issue was reported

## When to Stay Quiet
- All builds passing
- No new PRs or issues
- Last check was < 30 minutes ago
- Late night (respect timezone in USER.md)
