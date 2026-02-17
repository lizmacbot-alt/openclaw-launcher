# 🦞 OpenClaw Launcher

The easy way to set up [OpenClaw](https://openclaw.ai). No terminal, no config files, no headaches.

OpenClaw is an open-source AI agent that lives on your computer. It can talk to you on Telegram, Discord, WhatsApp, or just in the browser. The Launcher handles the entire setup in about 2 minutes.

![OpenClaw Launcher Welcome Screen](https://lizmacliz.com/images/launcher-welcome.png)

## What it does

1. **Checks your system** and auto-installs Node.js if you don't have it
2. **Installs OpenClaw** (the actual agent runtime)
3. **Connects your AI provider** (Claude, ChatGPT, Gemini, Groq, OpenRouter, xAI)
4. **Sets up a chat channel** (Telegram, Discord, WhatsApp, Signal, or browser)
5. **Installs agent templates** so your agent has a personality out of the box
6. **Starts the agent** and you're done

The whole thing is a step-by-step wizard. Click, click, click, you have a personal AI agent running locally.

## Download

Download the latest version from the Releases page:


👉 [**Download from Releases**](https://github.com/lizmacbot-alt/openclaw-launcher/releases) — macOS (.dmg), Windows (.exe), Linux (.AppImage)

## Templates

The Launcher comes with free agent templates you can install during setup:

- **The Starter** (free) - Simple personal assistant, good starting point
- **The Note Taker** (free) - Captures and organizes your notes

More templates (premium) available at [lizmacliz.com/templates](https://lizmacliz.com/templates).

## Development

```bash
git clone https://github.com/lizmacbot-alt/openclaw-launcher.git
cd openclaw-launcher
npm install
npm run dev
```

That opens the app in dev mode with hot reload. The Electron window connects to Vite's dev server.

### Building

```bash
npm run build          # Build the app
npx electron-builder   # Package for your platform
```

### Project structure

```
src/
  components/     # React screens (Welcome, SystemCheck, ProviderSelect, etc.)
  stores/         # Zustand state
  lib/            # IPC helpers
  templates/      # Bundled free templates (.md files)
  globals.css     # Tailwind + custom theme

electron/
  main.ts         # Electron main process, all IPC handlers
  preload.ts      # Context bridge (whitelisted IPC channels only)
```

### Tech

- Electron + React 19 + TypeScript
- Vite for builds
- Tailwind CSS
- Zustand for state
- node-pty for terminal auth flows

## The UI

CRT-inspired dark theme. Scanlines, grid background, pixel-font step indicator, lobster claw cursors. It's a little weird on purpose.

Colors: OpenClaw red (`#e8837c`), terminal green, cyan accents on a near-black background.

## How auth works

Two paths:

1. **Browser login** (recommended): Clicks "Claude" / "ChatGPT" / "Gemini", opens a PTY running `openclaw models auth setup-token`, which handles the OAuth flow. Token gets saved automatically.
2. **API key** (fallback): Pick a provider, open their key page, paste the key. Verified via API call, saved via `openclaw models auth paste-token`.

## Security

- Context isolation enabled, `nodeIntegration: false`
- IPC channels whitelisted in preload (only 18 specific channels allowed)
- CSP headers in production
- URLs validated before `shell.openExternal`
- macOS builds are code-signed and notarized
- API keys never leave your machine (saved to `~/.openclaw/` via the OpenClaw CLI)

## Contributing

Issues and PRs welcome. If you find a bug during setup, click the "📋 logs" button in the bottom-left corner and paste the debug logs in your issue. That helps a lot.

## License

MIT

## Links

- [OpenClaw](https://openclaw.ai) (the agent itself)
- [lizmacliz.com](https://lizmacliz.com) (templates + blog)
- [Gumroad store](https://lizmacliz.gumroad.com) (premium templates)

