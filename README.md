# OpenClaw Launcher

A beautiful desktop application for installing and managing OpenClaw AI agents.

## Features

- **Easy Installation**: No terminal commands required - install OpenClaw with a few clicks
- **Complete Onboarding**: Step-by-step wizard to set up your AI provider and chat channels
- **Template Marketplace**: Browse and install personality templates for your agent
- **Agent Management**: Start, stop, monitor, and configure your running agent
- **Professional UI**: Dark theme with smooth animations and modern design

## Tech Stack

- **Electron 33+** - Cross-platform desktop app framework
- **React 19** - Modern UI framework with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Framer Motion** - Smooth animations and transitions

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/lizmacbot-alt/openclaw-launcher.git
cd openclaw-launcher

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173` in your browser for development.

### Build

```bash
# Build for production
npm run build

# Package as desktop app
npm run package
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── Welcome.tsx      # Welcome screen
│   ├── SystemCheck.tsx  # System validation
│   ├── ProviderSelect.tsx # AI provider setup
│   ├── ChannelSetup.tsx # Chat channel config
│   ├── TemplateMarketplace.tsx # Template selection
│   ├── SetupComplete.tsx # Success screen
│   └── AgentManager.tsx # Post-setup management
├── stores/
│   └── setup-store.ts   # Zustand state management
├── styles/
│   └── globals.css      # Global styles and Tailwind
└── main.tsx            # React app entry point

electron/
├── main.ts             # Electron main process
└── preload.ts          # IPC bridge
```

## Design System

- **Background**: `#0f0f0f` (near black)
- **Surface**: `#1a1a1a` (cards, inputs)  
- **Border**: `#2a2a2a`
- **Primary**: `#e8837c` (coral)
- **Primary Hover**: `#f09990`
- **Text**: `#f5f5f5`
- **Text Muted**: `#a3a3a3`
- **Font**: Inter with system fallback

## License

MIT