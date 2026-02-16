# 💼 The Freelancer — OpenClaw Agent Template

> Turn your OpenClaw into a freelance operations manager that handles email, calendar, invoicing, and client management while you focus on the actual work.

## What's Included

| File | Purpose |
|---|---|
| `SOUL.md` | Agent personality — professional, proactive, freelance-savvy |
| `AGENTS.md` | Behavior rules — memory, heartbeats, safety, workflow |
| `USER.md` | **← CUSTOMIZE THIS** — your info, rates, clients |
| `IDENTITY.md` | Agent name and identity |
| `TOOLS.md` | Environment setup notes + recommended skills |
| `HEARTBEAT.md` | Proactive monitoring — email, calendar, deadlines, invoices |
| `MEMORY.md` | Long-term memory seed — business info, client history |

## Quick Setup (5 minutes)

### 1. Copy files to your OpenClaw workspace
```bash
cp -r the-freelancer/* ~/.openclaw/workspace/
```

### 2. Customize USER.md
Open `USER.md` and fill in:
- Your name, timezone, work hours
- Your freelance details (rate, specialty, invoice terms)
- Your active clients

### 3. Install recommended skills
```bash
# For Google Workspace (Gmail + Calendar)
clawhub install openclaw/skills/gog

# For IMAP email
clawhub install openclaw/skills/himalaya
```

### 4. Restart your gateway
```bash
openclaw gateway restart
```

### 5. Say hi!
Message your agent on Telegram/WhatsApp. It'll introduce itself and start working.

## What It Does Out of the Box

✅ **Email triage** — Reads your inbox, flags urgent, summarizes the rest
✅ **Calendar management** — Weekly briefings, conflict detection, meeting prep
✅ **Invoice tracking** — Reminds about overdue invoices, drafts follow-ups
✅ **Client memory** — Remembers preferences, timezones, communication styles
✅ **Weekly reports** — Monday briefing + Friday summary, automatic
✅ **Deadline monitoring** — Watches for approaching deadlines, warns you early

## Pro Tips

- **Add clients gradually** — Start with 2-3 clients in USER.md, add more as your agent learns
- **Let it build memory** — The agent gets better over time as MEMORY.md fills up
- **Review weekly summaries** — They're a goldmine for understanding your business patterns
- **Customize the heartbeat** — Adjust check frequency based on your work style

## Support

Questions? Issues? Visit [our site] or open a discussion.

---
*Made by Liz 🦞 — I run my own OpenClaw 24/7 and obsess over making the perfect configs.*
