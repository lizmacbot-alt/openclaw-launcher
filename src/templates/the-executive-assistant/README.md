# 🏢 The Executive Assistant — OpenClaw Agent Template

> Your AI chief of staff. Manages your calendar, triages your inbox, preps your meetings, and keeps your day on rails — so you can focus on decisions, not logistics.

## What's Included

| File | Purpose |
|---|---|
| `SOUL.md` | Agent personality — proactive, organized, anticipates needs |
| `AGENTS.md` | Behavior rules — memory, heartbeats, safety, workflow |
| `USER.md` | **← CUSTOMIZE THIS** — your schedule, contacts, priorities |
| `IDENTITY.md` | Agent name and identity |
| `TOOLS.md` | Environment setup notes + recommended skills |
| `HEARTBEAT.md` | Proactive monitoring — calendar, email, meeting prep, briefings |
| `MEMORY.md` | Long-term memory seed — contacts, preferences, patterns |

## Quick Setup (5 minutes)

### 1. Copy files to your OpenClaw workspace
```bash
cp -r the-executive-assistant/* ~/.openclaw/workspace/
```

### 2. Customize USER.md
Open `USER.md` and fill in:
- Your name, timezone, work hours
- Communication preferences and style
- Key contacts (direct reports, board, investors, etc.)
- Current priorities and active projects

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

### 5. Say "good morning"
Your agent will respond with a morning briefing. From there, it learns your rhythm.

## What It Does Out of the Box

✅ **Morning briefing** — Calendar overview, email highlights, today's priorities
✅ **Email triage** — Categorizes as 🔴 urgent / 🟡 important / 🟢 FYI, drafts responses
✅ **Meeting prep** — Agenda, attendee context, talking points, relevant docs
✅ **Follow-up tracking** — Captures action items from meetings, nudges on overdue items
✅ **Travel coordination** — Itinerary tracking, timezone math, travel-day scheduling
✅ **End-of-day summary** — What got done, what's still open, tomorrow's preview
✅ **Proactive scheduling** — Suggests time blocks, flags conflicts, protects focus time
✅ **Document prep** — Drafts briefs, summaries, and templates from context

## Who This Is For

- **Founders** juggling fundraising, product, and team management
- **Executives** with 20+ meetings a week and an overflowing inbox
- **Solo operators** who need structure but can't justify a full-time EA
- Anyone who's ever thought "I need a chief of staff but can't afford one"

## Pro Tips

- **Start with one week of observation** — Let the agent learn your patterns before tweaking
- **Forward important emails** — The more context it has, the better it anticipates
- **Use it for meeting follow-ups** — After a call, tell it what was discussed. It'll track the rest.
- **Review the end-of-day summary** — Catches things that slipped through the cracks
- **Customize HEARTBEAT.md** — Adjust check frequency and briefing times to your schedule

## Support

Questions? Issues? Visit [our site] or open a discussion.

---
*Made by Liz 🦞 — I run my own OpenClaw 24/7 and obsess over making the perfect configs.*
