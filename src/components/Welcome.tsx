import { useState, useEffect } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

// OpenClaw SVG Logo Component
function OpenClawLogo() {
  return (
    <div className="relative">
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 120 120" 
        className="drop-shadow-[0_0_30px_rgba(255,77,77,0.5)] claw-spinner"
      >
        {/* Lobster Body */}
        <ellipse cx="60" cy="70" rx="25" ry="18" fill="url(#bodyGradient)" />
        
        {/* Lobster Head */}
        <ellipse cx="60" cy="45" rx="18" ry="15" fill="url(#bodyGradient)" />
        
        {/* Eyes */}
        <circle cx="55" cy="40" r="4" fill="#050810" />
        <circle cx="65" cy="40" r="4" fill="#050810" />
        <circle cx="55" cy="39" r="2" fill="#00e5cc" />
        <circle cx="65" cy="39" r="2" fill="#00e5cc" />
        
        {/* Left Claw */}
        <g transform="rotate(-30 35 55)">
          <ellipse cx="35" cy="55" rx="12" ry="6" fill="url(#clawGradient)" />
          <path d="M25 52 L20 48 L22 50 L27 54 Z" fill="url(#clawGradient)" />
          <path d="M25 58 L20 62 L22 60 L27 56 Z" fill="url(#clawGradient)" />
        </g>
        
        {/* Right Claw */}
        <g transform="rotate(30 85 55)">
          <ellipse cx="85" cy="55" rx="12" ry="6" fill="url(#clawGradient)" />
          <path d="M95 52 L100 48 L98 50 L93 54 Z" fill="url(#clawGradient)" />
          <path d="M95 58 L100 62 L98 60 L93 56 Z" fill="url(#clawGradient)" />
        </g>
        
        {/* Antennae */}
        <line x1="55" y1="30" x2="52" y2="20" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="30" x2="68" y2="20" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" />
        <circle cx="52" cy="20" r="2" fill="#00e5cc" />
        <circle cx="68" cy="20" r="2" fill="#00e5cc" />
        
        {/* Tail segments */}
        <ellipse cx="60" cy="88" rx="20" ry="8" fill="url(#tailGradient)" />
        <ellipse cx="60" cy="96" rx="16" ry="6" fill="url(#tailGradient)" />
        <ellipse cx="60" cy="102" rx="12" ry="4" fill="url(#tailGradient)" />
        
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="clawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6666" />
            <stop offset="100%" stopColor="#cc3333" />
          </linearGradient>
          <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cc3333" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Glowing ring */}
      <div className="absolute inset-0 rounded-full border-2 border-claw/30 animate-pulse-glow"></div>
    </div>
  )
}

function QuirkyLoadingMessages() {
  const messages = [
    "Calibrating lobster sensors...",
    "Teaching AI to speak human...",
    "Downloading more personality...",
    "Initializing chaos protocols...",
    "Consulting the digital crustaceans...",
    "Warming up the neural networks...",
    "Loading sarcasm modules...",
    "Preparing dad joke database..."
  ]
  
  const [currentMessage, setCurrentMessage] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="terminal-text text-xs text-center h-6">
      <span className="dots-loading">{messages[currentMessage]}</span>
    </div>
  )
}

export default function Welcome() {
  const setScreen = useSetupStore((s) => s.setScreen)
  const [existingConfig, setExistingConfig] = useState<{ exists: boolean; provider?: string; channel?: string } | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    ipcInvoke('check-existing-config').then((result) => {
      setExistingConfig(result)
      setChecking(false)
    }).catch(() => setChecking(false))
  }, [])

  const handleConnectExisting = () => {
    if (existingConfig?.exists) {
      // Skip to manager if config exists
      setScreen('manager')
    } else {
      setScreen('system-check')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in text-center px-8 relative z-10">
      {/* ASCII Art Header */}
      <div className="terminal-text text-[10px] leading-tight mb-4 opacity-60">
        <pre>{`
╔═══════════════════════════════════════╗
║     OPENCLAW LAUNCHER INITIALIZED     ║
║        >>> QUIRKY MODE ACTIVE <<<     ║
╚═══════════════════════════════════════╝
        `}</pre>
      </div>

      {/* Logo */}
      <OpenClawLogo />

      {/* Title with glitch effect */}
      <h1 className="text-4xl font-bold tracking-tight mb-2 font-mono">
        Welcome to <span className="glitch-text text-claw" data-text="OpenClaw">OpenClaw</span>
      </h1>
      
      {/* Tagline */}
      <div className="text-cyan font-mono text-lg mb-6 typewriter">
        Your AI, Your Rules
      </div>

      <p className="text-base text-muted mb-8 max-w-md font-mono">
        Personal AI agent setup in minutes. No terminal wizardry required.
        <br />
        <span className="text-xs text-terminal-green">(But we kept the cool green text)</span>
      </p>

      {/* Setup checklist with terminal styling */}
      <div className="space-y-3 text-left text-muted mb-8 text-sm font-mono max-w-md">
        {[
          'Install OpenClaw on your machine',
          'Connect your AI provider (Anthropic, OpenAI...)',
          'Set up your chat channel (Telegram, Discord...)',
          'Equip your agent with skills & personality'
        ].map((item, index) => (
          <div key={item} className="flex items-center gap-3 terminal-prompt">
            <span className="text-terminal-green animate-pulse">⚡</span>
            <span className="flex-1">{item}</span>
            <span className="text-xs text-cyan">STEP {index + 1}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <button
          onClick={() => setScreen('system-check')}
          className="pixel-button px-8 py-4 rounded-lg text-white font-bold text-lg interactive-glow"
        >
          <span className="flex items-center gap-3">
            🚀 INITIALIZE AGENT
            <span className="text-sm animate-terminal-cursor">_</span>
          </span>
        </button>
        
        <button
          onClick={handleConnectExisting}
          className="terminal-card px-6 py-2 rounded-lg text-sm hover:text-claw transition-colors font-mono border"
        >
          {checking ? (
            <QuirkyLoadingMessages />
          ) : existingConfig?.exists ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              Agent detected - Reconnect
              <span className="text-xs text-cyan">[{existingConfig.provider}]</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-muted">›</span>
              Already have OpenClaw? Connect existing
            </span>
          )}
        </button>
      </div>

      {/* Fun footer */}
      <div className="text-xs text-muted font-mono opacity-70">
        <span className="text-claw">Warning:</span> This installer has personality. 
        <br />
        Side effects may include: joy, confusion, and mild lobster obsession.
      </div>

      {/* Animated ASCII decoration */}
      <div className="absolute bottom-4 left-4 text-claw/30 text-xs font-mono opacity-50">
        <pre>{`    /\\   /\\
   (  . .)
    )   (
   (  v  )
  ^^     ^^`}</pre>
      </div>

      <div className="absolute bottom-4 right-4 text-cyan/30 text-xs font-mono opacity-50">
        <pre>{`    ┌─┐
    │ │
    └─┘
     │
    /│\\
   / │ \\`}</pre>
      </div>
    </div>
  )
}