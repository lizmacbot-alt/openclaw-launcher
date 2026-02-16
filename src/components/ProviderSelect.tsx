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

const apiKeyProviders = [
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...', url: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...', url: 'https://platform.openai.com/api-keys' },
  { id: 'google', name: 'Google', placeholder: 'AIza...', url: 'https://aistudio.google.com/apikey' },
  { id: 'groq', name: 'Groq', placeholder: 'gsk_...', url: 'https://console.groq.com/keys' },
  { id: 'openrouter', name: 'OpenRouter', placeholder: 'sk-or-...', url: 'https://openrouter.ai/keys' },
  { id: 'xai', name: 'xAI (Grok)', placeholder: 'xai-...', url: 'https://console.x.ai/' },
]

export default function ProviderSelect() {
  const { apiKey, authCompleted, setProvider, setApiKey, setAuthCompleted, setScreen } = useSetupStore()
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiProvider, setApiProvider] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const verifyApiKey = async () => {
    if (!apiProvider || !apiKey.trim()) return
    setVerifying(true)
    setVerifyError(null)
    try {
      const result = await ipcInvoke('verify-api-key', apiProvider, apiKey.trim())
      if (result.valid) {
        // Save via paste-token
        await ipcInvoke('auth-paste-token', apiProvider, apiKey.trim()).catch(() => {})
        setAuthCompleted(true)
        setShowApiKey(false)
        setStatus('success')
        setActiveProvider(apiProvider)
      } else {
        setVerifyError(result.error || 'Invalid key')
      }
    } catch (e: any) {
      setVerifyError(e.message)
    } finally {
      setVerifying(false)
    }
  }

  // Listen for status updates from the PTY
  useState(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.on) {
      (window as any).electronAPI.on('auth-status', (data: { provider: string; message: string }) => {
        setStatusMsg(data.message)
      })
    }
  })

  const handleLogin = async (p: typeof providers[0]) => {
    setActiveProvider(p.id)
    setProvider(p.id)
    setStatus('running')
    setError(null)
    setStatusMsg('Starting login...')

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
            {statusMsg || 'Setting up login...'}
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

      {/* API Key option (hidden by default) */}
      {!authCompleted && (
        <div className="w-full max-w-md flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-border/20"></div>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="text-[11px] text-muted/50 hover:text-muted font-mono transition-colors"
          >
            {showApiKey ? 'Hide' : 'Or use an API key instead'}
          </button>
          <div className="flex-1 border-t border-border/20"></div>
        </div>
      )}

      {showApiKey && !authCompleted && (
        <div className="w-full max-w-md animate-in space-y-3 mb-4">
          <div className="grid grid-cols-3 gap-2">
            {apiKeyProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => { setApiProvider(p.id); setProvider(p.id); setApiKey(''); setVerifyError(null); ipcInvoke('open-external', p.url).catch(() => {}) }}
                className={`p-2 rounded-lg border text-center text-xs font-mono transition-all ${
                  apiProvider === p.id ? 'border-claw bg-claw/10 text-claw' : 'border-border/30 text-muted hover:border-claw/30'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {apiProvider && (
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={apiKeyProviders.find(p => p.id === apiProvider)?.placeholder || 'Paste API key...'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setVerifyError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && apiKey.trim()) verifyApiKey() }}
                autoFocus
                className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-claw transition-colors"
              />
              <button
                onClick={verifyApiKey}
                disabled={!apiKey.trim() || verifying}
                className="bg-claw hover:bg-claw/80 disabled:bg-surface disabled:text-muted text-white px-5 py-2.5 rounded-lg text-sm font-mono font-bold transition-all"
              >
                {verifying ? '...' : 'Save'}
              </button>
            </div>
          )}

          {verifyError && <div className="text-error text-xs font-mono">❌ {verifyError}</div>}
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
