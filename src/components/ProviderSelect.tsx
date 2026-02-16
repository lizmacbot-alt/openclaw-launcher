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
    loginMethod: 'claude-cli',
    authChoice: 'claude-cli',
    color: 'text-orange-400',
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    company: 'OpenAI',
    icon: '◈',
    loginMethod: 'oauth',
    authChoice: 'oauth',
    color: 'text-green-400',
  },
  {
    id: 'google',
    name: 'Gemini',
    company: 'Google',
    icon: '◇',
    loginMethod: 'google-gemini-cli',
    authChoice: 'google-gemini-cli',
    color: 'text-blue-400',
  },
]

const apiKeyProviders = [
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { id: 'google', name: 'Google (Gemini)', placeholder: 'AIza...' },
  { id: 'groq', name: 'Groq', placeholder: 'gsk_...' },
  { id: 'openrouter', name: 'OpenRouter', placeholder: 'sk-or-...' },
  { id: 'xai', name: 'xAI (Grok)', placeholder: 'xai-...' },
]

export default function ProviderSelect() {
  const {
    provider, authMethod, apiKey, apiKeyVerified, authCompleted,
    setProvider, setAuthMethod, setApiKey, setApiKeyVerified, setAuthCompleted, setScreen
  } = useSetupStore()
  const [loginStatus, setLoginStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const handleLogin = async (p: typeof providers[0]) => {
    setProvider(p.id)
    setAuthMethod('login')
    setLoginStatus('running')
    setLoginError(null)

    try {
      const result = await ipcInvoke('auth-login', p.id, p.authChoice)
      if (result.success) {
        setLoginStatus('success')
        setAuthCompleted(true)
      } else {
        setLoginStatus('error')
        setLoginError(result.error || 'Login failed')
      }
    } catch (e: any) {
      setLoginStatus('error')
      setLoginError(e.message || 'Login failed')
    }
  }

  const verifyApiKey = async () => {
    if (!provider || !apiKey) return
    setVerifying(true)
    setVerifyError(null)
    try {
      const result = await ipcInvoke('verify-api-key', provider, apiKey)
      if (result.valid) {
        setApiKeyVerified(true)
        setAuthCompleted(true)
      } else {
        setVerifyError(result.error || 'Invalid key')
        setApiKeyVerified(false)
      }
    } catch (e: any) {
      setVerifyError(e.message)
    } finally {
      setVerifying(false)
    }
  }

  const canProceed = authCompleted || apiKeyVerified

  return (
    <div className="flex flex-col items-center min-h-full animate-in px-8 py-4">
      <h2 className="text-2xl font-bold mb-1 font-mono">
        <span className="glitch-text text-claw" data-text="Connect AI">Connect AI</span>
      </h2>
      <p className="text-muted mb-6 text-sm font-mono">Sign in with your AI account. No API key needed.</p>

      {/* Login buttons */}
      <div className="w-full max-w-md space-y-3 mb-6">
        {providers.map((p) => {
          const isSelected = provider === p.id && authMethod === 'login'
          const isSuccess = isSelected && loginStatus === 'success'
          const isRunning = isSelected && loginStatus === 'running'
          const isError = isSelected && loginStatus === 'error'

          return (
            <button
              key={p.id}
              onClick={() => handleLogin(p)}
              disabled={loginStatus === 'running'}
              className={`w-full terminal-card p-4 rounded-lg transition-all duration-200 flex items-center gap-4 font-mono text-left ${
                isSuccess ? 'border-terminal-green/50 bg-terminal-green/10' :
                isRunning ? 'border-cyan/50 bg-cyan/10 animate-pulse' :
                isError ? 'border-error/30 bg-error/5' :
                'border-border/30 hover:border-claw/30 hover:bg-claw/5'
              }`}
            >
              <span className={`text-2xl ${p.color}`}>{p.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold flex items-center gap-2">
                  Sign in with {p.name}
                  {p.tag && (
                    <span className="text-[10px] bg-claw/20 text-claw px-1.5 py-0.5 rounded-full">{p.tag}</span>
                  )}
                </div>
                <div className="text-xs text-muted">{p.company}</div>
              </div>
              <div className="text-sm">
                {isSuccess && <span className="text-terminal-green">✅</span>}
                {isRunning && <span className="text-cyan animate-spin">⚡</span>}
                {isError && <span className="text-error">❌</span>}
                {!isSelected && <span className="text-muted">→</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Login error */}
      {loginStatus === 'error' && loginError && (
        <div className="w-full max-w-md mb-4 terminal-card p-3 rounded-lg border-error/30 bg-error/10">
          <div className="text-xs text-error font-mono">{loginError}</div>
        </div>
      )}

      {/* Login success */}
      {loginStatus === 'success' && (
        <div className="w-full max-w-md mb-4 terminal-card p-3 rounded-lg border-terminal-green/50 bg-terminal-green/10">
          <div className="text-xs text-terminal-green font-mono">Connected! Ready to go.</div>
        </div>
      )}

      {/* Divider */}
      <div className="w-full max-w-md flex items-center gap-3 mb-4">
        <div className="flex-1 border-t border-border/30"></div>
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="text-[11px] text-muted/60 hover:text-muted font-mono transition-colors"
        >
          {showApiKey ? 'Hide API key option' : 'Or use an API key instead'}
        </button>
        <div className="flex-1 border-t border-border/30"></div>
      </div>

      {/* API Key section (collapsed by default) */}
      {showApiKey && (
        <div className="w-full max-w-md animate-in space-y-3 mb-4">
          <div className="grid grid-cols-3 gap-2">
            {apiKeyProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => { setProvider(p.id); setAuthMethod('apikey'); setAuthCompleted(false); setApiKeyVerified(false) }}
                className={`p-2 rounded-lg border text-center text-xs font-mono transition-all ${
                  provider === p.id && authMethod === 'apikey'
                    ? 'border-claw bg-claw/10 text-claw'
                    : 'border-border/30 text-muted hover:border-claw/30'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {provider && authMethod === 'apikey' && (
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={apiKeyProviders.find(p => p.id === provider)?.placeholder || 'Paste API key...'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setApiKeyVerified(false); setVerifyError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && apiKey) verifyApiKey() }}
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-claw transition-colors"
              />
              <button
                onClick={verifyApiKey}
                disabled={!apiKey || verifying}
                className="bg-claw hover:bg-claw/80 disabled:bg-surface disabled:text-muted text-white px-4 py-2.5 rounded-lg text-sm font-mono transition-all"
              >
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
          )}

          {apiKeyVerified && (
            <div className="text-terminal-green text-xs font-mono">✅ Key verified!</div>
          )}
          {verifyError && (
            <div className="text-error text-xs font-mono">❌ {verifyError}</div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-auto pt-4">
        <button
          onClick={() => setScreen('system-check')}
          className="px-6 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
        >
          ← Back
        </button>
        <button
          onClick={() => setScreen('channel')}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-bold font-mono transition-all ${
            canProceed
              ? 'pixel-button text-white'
              : 'bg-surface text-muted cursor-not-allowed border border-border'
          }`}
        >
          {canProceed ? 'Continue →' : 'Sign in to continue →'}
        </button>
      </div>
    </div>
  )
}
