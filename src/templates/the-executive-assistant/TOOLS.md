# TOOLS.md — Your Setup Notes

> Add your environment-specific details here.

## Email
- **Provider:** [Gmail, Outlook, etc.]
- **How configured:** [himalaya, gog CLI, etc.]
- **Multiple accounts?** [e.g., "work: ceo@company.com, personal: name@gmail.com"]

## Calendar
- **Provider:** [Google Calendar, Outlook, Apple Calendar]
- **How configured:** [gog CLI, etc.]
- **Shared calendars:** [e.g., "Company calendar, Board calendar"]

## CRM / Contacts
- **Platform:** [HubSpot, Salesforce, Notion, spreadsheet, none]
- **API access:** [yes/no, how]
- **Notes:** [how you track contacts and relationships]

## Meeting Notes
- **Tool:** [Notion, Google Docs, local files, etc.]
- **Recording/transcription:** [Otter.ai, Fireflies, Grain, none]
- **Notes:** [where meeting notes live, how they're organized]

## Task / Project Management
- **Tool:** [Linear, Asana, Notion, Todoist, etc.]
- **How configured:** [API, CLI, manual]

## Recommended Skills to Install
These ClawHub skills pair well with The Executive Assistant template:

```bash
# Email + Calendar (Google Workspace)
clawhub install openclaw/skills/gog

# Email (IMAP — works with any provider)
clawhub install openclaw/skills/himalaya

# Web research (for attendee/company context)
# (built-in web_search usually sufficient)

# GitHub (if you review PRs or track engineering work)
clawhub install openclaw/skills/github
```

## Notes
- Add API endpoints, SSH hosts, or other specifics here
- This file is your cheat sheet — put anything your agent needs to know about your infra
