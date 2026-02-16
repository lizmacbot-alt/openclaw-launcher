import { useState, useEffect } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

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
    <div className="flex flex-col items-center justify-center h-full animate-in text-center px-8">
      <img
        src="./assets/openclaw-icon-512.png"
        alt="OpenClaw"
        className="w-24 h-24 mb-6 drop-shadow-[0_0_30px_rgba(232,131,124,0.3)]"
      />
      <h1 className="text-4xl font-bold tracking-tight mb-3">
        Welcome to <span className="text-coral">OpenClaw</span>
      </h1>
      <p className="text-lg text-muted mb-8 max-w-md">
        Your personal AI agent, ready in minutes. No terminal required.
      </p>
      <div className="space-y-3 text-left text-muted mb-10 text-sm">
        {['Install OpenClaw on your machine', 'Connect your AI provider (Anthropic, OpenAI...)', 'Set up your chat channel (Telegram, Discord...)', 'Pick a personality template for your agent'].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="text-coral">✓</span><span>{item}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setScreen('system-check')}
        className="bg-coral hover:bg-coral-hover text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 pulse-glow"
      >
        Get Started →
      </button>
      <button
        onClick={handleConnectExisting}
        className="mt-4 text-muted hover:text-white text-sm transition-colors flex items-center gap-2"
      >
        {checking ? (
          <span className="opacity-50">Checking...</span>
        ) : existingConfig?.exists ? (
          <>
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            Existing config detected — Connect
          </>
        ) : (
          'Already have OpenClaw? Connect Existing'
        )}
      </button>
    </div>
  )
}
