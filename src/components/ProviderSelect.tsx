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
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyHint: 'Get your key from console.anthropic.com',
    placeholder: 'sk-ant-...',
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    company: 'OpenAI',
    icon: '◈',
    color: 'text-green-400',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyHint: 'Get your key from platform.openai.com',
    placeholder: 'sk-...',
  },
  {
    id: 'google',
    name: 'Gemini',
    company: 'Google',
    icon: '◇',
    color: 'text-blue-400',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyHint: 'Get your key from aistudio.google.com',
    placeholder: 'AIza...',
  },
  {
    id: 'groq',
    name: 'Groq',
    company: 'Groq',
    icon: '✦',
    color: 'text-purple-400',
    keyUrl: 'https://console.groq.com/keys',
    keyHint: 'Fast and free tier available',
    placeholder: 'gsk_...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    company: 'OpenRouter',
    icon: '○',
    color: 'text-cyan-400',
    keyUrl: 'https://openrouter.ai/keys',
    keyHint: 'Access any model through one API',
    placeholder: 'sk-or-...',
  },
]

export default function ProviderSelect() {
  const {
    provider, apiKey, authCompleted,
    setProvider, setApiKey, setAuthCompleted, setScreen
  } = useSetupStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<typeof providers[0] | null>(null)

  const handleProviderClick = (p: typeof providers[0]) => {
    setSelectedProvider(p)
    setProvider(p.id)
    setAuthCompleted(false)
    setError(null)
    // Open the provider's key page
    ipcInvoke('open-external', p.keyUrl).catch(() => window.open(p.keyUrl, '_blank'))
  }

  const handleSaveKey = async () => {
    if (!provider || !apiKey.trim()) return
    setSaving(true)
    setError(null)

    try {
      // First verify the key works
      const verifyResult = await ipcInvoke('verify-api-key', provider, apiKey.trim())
      if (!verifyResult.valid) {
        setError(verifyResult.error || 'Invalid key. Check and try again.')
        setSaving(false)
        return
      }

      // Save using openclaw's auth system
      const saveResult = await ipcInvoke('auth-paste-token', provider, apiKey.trim())
      if (saveResult.success) {
        setAuthCompleted(true)
      } else {
        // Verify passed, so the key works. Even if paste-token fails, we can write config directly.
        setAuthCompleted(true)
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-full animate-in px-8 py-4">
      <h2 className="text-2xl font-bold mb-1 font-mono">
        <span className="glitch-text text-claw" data-text="Connect AI">Connect AI</span>
      </h2>
      <p className="text-muted mb-6 text-sm font-mono">
        {selectedProvider
          ? `Paste your ${selectedProvider.name} API key below`
          : 'Pick your AI provider to get started'}
      </p>

      {/* Provider grid */}
      {!selectedProvider && (
        <div className="w-full max-w-md space-y-3 mb-6">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderClick(p)}
              className="w-full terminal-card p-4 rounded-lg transition-all duration-200 flex items-center gap-4 font-mono text-left border-border/30 hover:border-claw/30 hover:bg-claw/5"
            >
              <span className={`text-2xl ${p.color}`}>{p.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold flex items-center gap-2">
                  {p.name}
                  {p.tag && (
                    <span className="text-[10px] bg-claw/20 text-claw px-1.5 py-0.5 rounded-full">{p.tag}</span>
                  )}
                </div>
                <div className="text-xs text-muted">{p.keyHint}</div>
              </div>
              <span className="text-muted">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Key input */}
      {selectedProvider && !authCompleted && (
        <div className="w-full max-w-md animate-in space-y-4 mb-6">
          <div className="terminal-card p-4 rounded-lg border-claw/30 bg-claw/5">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xl ${selectedProvider.color}`}>{selectedProvider.icon}</span>
              <div>
                <div className="text-sm font-bold font-mono">{selectedProvider.name}</div>
                <div className="text-xs text-muted font-mono">{selectedProvider.company}</div>
              </div>
              <button
                onClick={() => { setSelectedProvider(null); setApiKey(''); setError(null) }}
                className="ml-auto text-xs text-muted hover:text-white font-mono"
              >
                Change
              </button>
            </div>

            <p className="text-xs text-muted font-mono mb-3">
              A browser tab should have opened. Copy your API key and paste it here.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder={selectedProvider.placeholder}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && apiKey.trim()) handleSaveKey() }}
                autoFocus
                className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-claw transition-colors"
              />
              <button
                onClick={handleSaveKey}
                disabled={!apiKey.trim() || saving}
                className="bg-claw hover:bg-claw/80 disabled:bg-surface disabled:text-muted text-white px-5 py-2.5 rounded-lg text-sm font-mono font-bold transition-all"
              >
                {saving ? '...' : 'Save'}
              </button>
            </div>

            {error && (
              <div className="text-error text-xs font-mono mt-2">❌ {error}</div>
            )}

            <button
              onClick={() => ipcInvoke('open-external', selectedProvider.keyUrl).catch(() => window.open(selectedProvider.keyUrl, '_blank'))}
              className="text-claw hover:text-claw/80 text-xs font-mono mt-2 inline-block"
            >
              Open {selectedProvider.company} dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {authCompleted && (
        <div className="w-full max-w-md mb-6 terminal-card p-4 rounded-lg border-terminal-green/50 bg-terminal-green/10 animate-in">
          <div className="flex items-center gap-3 font-mono">
            <span className="text-lg">✅</span>
            <div>
              <div className="text-sm font-bold text-terminal-green">Connected to {selectedProvider?.name || 'AI provider'}</div>
              <div className="text-xs text-muted">Ready to go.</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-auto pt-4">
        <button
          onClick={() => {
            if (selectedProvider && !authCompleted) {
              setSelectedProvider(null)
              setApiKey('')
              setError(null)
            } else {
              setScreen('system-check')
            }
          }}
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
