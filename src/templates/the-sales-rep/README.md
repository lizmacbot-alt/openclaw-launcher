# 🎯 The Sales Rep — OpenClaw Agent Template

> Turn your OpenClaw into an AI sales partner that researches leads, drafts outreach, manages your pipeline, and makes sure no deal slips through the cracks.

## What's Included

| File | Purpose |
|---|---|
| `SOUL.md` | Agent personality — sharp, data-driven, persistent, sales-savvy |
| `AGENTS.md` | Behavior rules — memory, heartbeats, safety, workflow |
| `USER.md` | **← CUSTOMIZE THIS** — your product, ICP, sales process, quotas |
| `IDENTITY.md` | Agent name and identity |
| `TOOLS.md` | Environment setup notes + recommended skills |
| `HEARTBEAT.md` | Proactive monitoring — pipeline, follow-ups, deal alerts, forecast |
| `MEMORY.md` | Long-term memory seed — accounts, deals, objections, win/loss |

## Quick Setup (5 minutes)

### 1. Copy files to your OpenClaw workspace
```bash
cp -r the-sales-rep/* ~/.openclaw/workspace/
```

### 2. Customize USER.md
Open `USER.md` and fill in:
- Your name, role, and what you sell
- Your ideal customer profile (ICP)
- Your sales process and deal stages
- Your CRM details and quota

### 3. Install recommended skills
```bash
# For Gmail + Calendar (meeting scheduling, email outreach)
clawhub install openclaw/skills/gog

# For IMAP email
clawhub install openclaw/skills/himalaya
```

### 4. Restart your gateway
```bash
openclaw gateway restart
```

### 5. Start selling!
Message your agent: "Pull up my pipeline" or "Research [Company] before my call tomorrow."

## What It Does Out of the Box

✅ **Lead research** — Company intel, org charts, recent news, tech stack, trigger events
✅ **Outreach drafting** — Cold emails, warm follow-ups, breakup emails, full sequences
✅ **Pipeline management** — Stale deal alerts, next-step reminders, stage tracking
✅ **Meeting prep** — Stakeholder mapping, talking points, competitive landmines to avoid
✅ **Forecast & reporting** — Weekly pipeline review, commit vs. best case, deal velocity
✅ **Objection handling** — Pattern recognition, response frameworks, playbook building
✅ **CRM hygiene** — Reminds you to update stages, log calls, add notes
✅ **Competitive intel** — Tracks competitors, builds battle cards, spots positioning gaps

## What Makes This Different

Most sales tools give you data. This gives you a thinking partner.

Your agent learns your deals, remembers what objections come up, knows which accounts need attention, and tells you things you'd miss staring at a dashboard. It's like having a sharp sales ops analyst sitting next to you — except it never takes PTO and it actually reads your CRM notes.

## Pro Tips

- **Feed it context** — After every call, tell your agent what happened. It builds a memory that compounds.
- **Use it for meeting prep** — "Prep me for my call with [Company] tomorrow" is worth the entire template.
- **Weekly pipeline review** — Do it with your agent every Monday. It'll catch deals you forgot about.
- **Build the objection playbook** — Every time you overcome an objection, log it. Your agent will pattern-match and suggest responses.
- **Start with 5-10 key accounts** — Don't dump your entire CRM. Start focused, expand as the agent learns.

## Support

Questions? Issues? Visit [our site] or open a discussion.

---
*Made by Liz 🦞 — I run my own OpenClaw 24/7 and obsess over making the perfect configs.*
