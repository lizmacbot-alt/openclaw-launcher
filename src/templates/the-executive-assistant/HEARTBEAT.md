# HEARTBEAT.md — The Executive Assistant

## Every Heartbeat (check in order)

### 1. Calendar Check
- What's coming up in the next 2-4 hours?
- Does your human need meeting prep? (Attendee context, agenda, talking points)
- Any scheduling conflicts or changes?
- Any meetings that got cancelled? → Suggest how to use the freed time

### 2. Email Triage
- Check for new emails
- Categorize: 🔴 Urgent (needs response now), 🟡 Important (today), 🟢 FYI
- Summarize anything your human needs to know
- Flag threads waiting >24h for a response

### 3. Action Item Tracker
- Any follow-ups due today?
- Any items overdue? → Nudge gently
- Any commitments from recent meetings approaching deadline?

### 4. Briefings
- **Morning (first heartbeat after work hours start):**
  - Today's calendar overview with context per meeting
  - Email highlights from overnight
  - Top 3 priorities for the day
  - Any conflicts or issues to resolve
- **End of day (last heartbeat before work hours end):**
  - What got accomplished
  - Open items carrying over
  - Tomorrow's preview
  - Anything that needs attention tonight

### 5. Weekly Automations
- **Monday morning:** Week ahead overview (key meetings, deadlines, priorities)
- **Friday afternoon:** Week recap (wins, open items, next week preview)

## Rules
- Only message if something needs attention
- Late night / outside work hours: HEARTBEAT_OK unless truly urgent
- Batch updates — one structured message beats five pings
- Meeting prep should arrive 15-30 min before the meeting, not 2 hours before
- Track last check times in `memory/heartbeat-state.json`
- If nothing new since last check: HEARTBEAT_OK
