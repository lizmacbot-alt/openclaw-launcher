import { useState } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

const providers = [
  {
    id: 'anthropic',
    name: 'Claude',
    company: 'Anthropic',
    icon: '⬡',
    tag: 'Recommended',
    color: 'text-orange-400',
    desc: 'Uses your Claude account. Opens browser to sign in.',
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    company: 'OpenAI',
    icon: '◈',
    color: 'text-green-400',
    desc: 'Uses your OpenAI account.',
  },
  {
    id: 'google',
    name: 'Gemini',
    company: 'Google',
    icon: '◇',
    color: 'text-blue-400',
    desc: 'Uses your Google account.',
  },
]

export default function ProviderSelect() {
  const { authCompleted, setProvider, setAuthCompleted, setScreen } = useSetupStore()
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)

  const handleLogin = async (p: typeof providers[0]) => {
    setActiveProvider(p.id)
    setProvider(p.id)
    setStatus('running')
    setError(null)

    try {
      const result = await ipcInvoke('auth-setup-token', p.id)
      if (result.success) {
        setStatus('success')
        setAuthCompleted(true)
      } else {
        setStatus('error')
        setError(result.error || 'Login failed. Check the terminal window for details.')
      }
    } catch (e: any) {
      setStatus('error')
      setError(e.message)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-full animate-in px-8 py-4">
      <h2 className="text-2xl font-bold mb-1 font-mono">
        <span className="glitch-text text-claw" data-text="Connect AI">Connect AI</span>
      </h2>
      <p className="text-muted mb-6 text-sm font-mono">
        {status === 'running'
          ? 'A terminal window opened. Follow the prompts there to sign in.'
          : status === 'success'
          ? 'Connected!'
          : 'Sign in with your AI provider. No API key needed.'}
      </p>

      <div className="w-full max-w-md space-y-3 mb-6">
        {providers.map((p) => {
          const isActive = activeProvider === p.id
          const isSuccess = isActive && status === 'success'
          const isRunning = isActive && status === 'running'
          const isError = isActive && status === 'error'

          return (
            <button
              key={p.id}
              onClick={() => handleLogin(p)}
              disabled={status === 'running'}
              className={`w-full terminal-card p-4 rounded-lg transition-all duration-200 flex items-center gap-4 font-mono text-left ${
                isSuccess ? 'border-terminal-green/50 bg-terminal-green/10' :
                isRunning ? 'border-cyan/50 bg-cyan/10' :
                isError ? 'border-error/30 bg-error/5' :
                'border-border/30 hover:border-claw/30 hover:bg-claw/5'
              } ${status === 'running' && !isActive ? 'opacity-40' : ''}`}
            >
              <span className={`text-2xl ${p.color}`}>{p.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold flex items-center gap-2">
                  {p.name}
                  {p.tag && (
                    <span className="text-[10px] bg-claw/20 text-claw px-1.5 py-0.5 rounded-full">{p.tag}</span>
                  )}
                </div>
                <div className="text-xs text-muted">{p.desc}</div>
              </div>
              <div className="text-sm">
                {isSuccess && <span className="text-terminal-green">✅</span>}
                {isRunning && <span className="text-cyan animate-pulse">⏳</span>}
                {isError && <span className="text-error">❌</span>}
                {!isActive && <span className="text-muted">→</span>}
              </div>
            </button>
          )
        })}
      </div>

      {status === 'running' && (
        <div className="w-full max-w-md mb-4 terminal-card p-3 rounded-lg border-cyan/30 bg-cyan/5">
          <div className="text-xs text-cyan font-mono">
            A Terminal window opened with the login flow.
            Complete the sign-in there, then come back here.
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="w-full max-w-md mb-4 terminal-card p-3 rounded-lg border-error/30 bg-error/10">
          <div className="text-xs text-error font-mono">{error}</div>
        </div>
      )}

      {status === 'success' && (
        <div className="w-full max-w-md mb-4 terminal-card p-3 rounded-lg border-terminal-green/50 bg-terminal-green/10">
          <div className="text-xs text-terminal-green font-mono">✅ Signed in. Ready to continue.</div>
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-4">
        <button
          onClick={() => setScreen('system-check')}
          className="px-6 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
        >
          ← Back
        </button>
        <button
          onClick={() => setScreen('channel')}
          disabled={!authCompleted}
          className={`px-8 py-3 rounded-lg font-bold font-mono transition-all ${
            authCompleted
              ? 'pixel-button text-white'
              : 'bg-surface text-muted cursor-not-allowed border border-border'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
