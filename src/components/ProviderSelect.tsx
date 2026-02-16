import { useState } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

const providers = [
  { id: 'anthropic', icon: '⬡', name: 'Anthropic', sub: 'Claude', tag: 'Recommended', url: 'https://console.anthropic.com/' },
  { id: 'openai', icon: '◈', name: 'OpenAI', sub: 'GPT-4o', url: 'https://platform.openai.com/' },
  { id: 'google', icon: '◇', name: 'Google', sub: 'Gemini', url: 'https://aistudio.google.com/' },
  { id: 'groq', icon: '✦', name: 'Groq', sub: 'Fast & Free', url: 'https://console.groq.com/' },
  { id: 'openrouter', icon: '○', name: 'OpenRouter', sub: 'Multi-model', url: 'https://openrouter.ai/' },
  { id: 'custom', icon: '⚙', name: 'Custom', sub: 'Any API', url: '' },
]

export default function ProviderSelect() {
  const { provider, apiKey, apiKeyVerified, setProvider, setApiKey, setApiKeyVerified, setScreen } = useSetupStore()
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const verify = async () => {
    if (!provider || !apiKey) return
    setVerifying(true)
    setVerifyError(null)
    try {
      const result = await ipcInvoke('verify-api-key', provider, apiKey)
      if (result.valid) {
        setApiKeyVerified(true)
      } else {
        setVerifyError(result.error || 'Key verification failed')
        setApiKeyVerified(false)
      }
    } catch (e: any) {
      setVerifyError(e.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && apiKey && !verifying) verify()
  }

  const selected = providers.find((p) => p.id === provider)

  const openUrl = (url: string) => {
    ipcInvoke('open-external', url).catch(() => window.open(url, '_blank'))
  }

  return (
    <div className="flex flex-col items-center h-full animate-in px-8 py-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-1">Connect your AI brain</h2>
      <p className="text-muted mb-6 text-sm">Pick your AI provider</p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-6">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`relative p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${
              provider === p.id
                ? 'border-coral bg-coral/10 shadow-lg shadow-coral/10'
                : 'border-border bg-surface hover:border-white/20'
            }`}
          >
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="font-semibold text-sm">{p.name}</div>
            <div className="text-xs text-muted">{p.sub}</div>
            {p.tag && (
              <span className="absolute top-2 right-2 text-[10px] bg-coral/20 text-coral px-1.5 py-0.5 rounded-full">
                {p.tag}
              </span>
            )}
          </button>
        ))}
      </div>

      {provider && (
        <div className="w-full max-w-lg animate-in">
          {selected?.url && (
            <button onClick={() => openUrl(selected.url)} className="text-coral hover:text-coral-hover text-xs mb-3 inline-block">
              Get a key free from {selected.name} →
            </button>
          )}
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste your API key..."
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setApiKeyVerified(false); setVerifyError(null) }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-coral transition-colors"
            />
            <button
              onClick={verify}
              disabled={!apiKey || verifying}
              className="bg-coral hover:bg-coral-hover disabled:bg-surface disabled:text-muted text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[80px]"
            >
              {verifying ? (
                <span className="inline-block animate-pulse">Verifying...</span>
              ) : 'Verify'}
            </button>
          </div>
          {apiKeyVerified && (
            <div className="text-success text-xs mt-2 animate-in">✅ Key verified! {selected?.sub} ready.</div>
          )}
          {verifyError && (
            <div className="text-error text-xs mt-2 animate-in">❌ {verifyError}</div>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-6">
        <button onClick={() => setScreen('system-check')} className="px-6 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">← Back</button>
        <button
          onClick={() => setScreen('channel')}
          disabled={!apiKeyVerified}
          className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${apiKeyVerified ? 'bg-coral hover:bg-coral-hover text-white hover:scale-105 active:scale-95' : 'bg-surface text-muted cursor-not-allowed'}`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
