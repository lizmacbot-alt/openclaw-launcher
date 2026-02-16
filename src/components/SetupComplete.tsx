import { useEffect, useState } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

type Phase = 'config' | 'templates' | 'starting' | 'done' | 'error'

export default function SetupComplete() {
  const { channel, provider, apiKey, channelToken, selectedTemplates, setScreen, setAgentRunning } = useSetupStore()
  const [phase, setPhase] = useState<Phase>('config')
  const [error, setError] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Writing configuration...')

  useEffect(() => {
    runSetup()
  }, [])

  const runSetup = async () => {
    try {
      // 1. Write config
      setPhase('config')
      setStatusText('Writing configuration...')
      const configResult = await ipcInvoke('write-config', {
        provider: provider || 'anthropic',
        apiKey,
        channel: channel || 'telegram',
        channelToken,
        templates: selectedTemplates,
      })
      if (!configResult.success) throw new Error(configResult.error || 'Failed to write config')

      // 2. Install templates
      setPhase('templates')
      setStatusText('Installing templates...')
      const templateResult = await ipcInvoke('install-templates', selectedTemplates)
      if (!templateResult.success) throw new Error(templateResult.error || 'Failed to install templates')

      // 3. Start agent
      setPhase('starting')
      setStatusText('Starting your agent...')
      const startResult = await ipcInvoke('start-agent')
      if (startResult.success) {
        setAgentRunning(true)
      }
      // Don't fail if agent doesn't start — config is still good

      setPhase('done')
      setStatusText('All done!')
    } catch (e: any) {
      setPhase('error')
      setError(e.message || 'Setup failed')
    }
  }

  const phaseIcons: Record<Phase, string> = {
    config: '⚙️', templates: '📦', starting: '🚀', done: '🎉', error: '❌'
  }

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in px-8 text-center">
      <div className={`text-6xl mb-4 transition-all duration-500 ${phase === 'done' ? 'scale-100' : 'scale-90'}`}>
        {phaseIcons[phase]}
      </div>

      {phase === 'error' ? (
        <>
          <h2 className="text-3xl font-bold mb-2 text-error">Setup failed</h2>
          <p className="text-muted mb-4 text-sm max-w-md">{error}</p>
          <button
            onClick={runSetup}
            className="bg-coral hover:bg-coral-hover text-white font-semibold px-6 py-2.5 rounded-full transition-all mb-3"
          >
            Retry
          </button>
          <button onClick={() => setScreen('welcome')} className="text-muted hover:text-white text-sm transition-colors">
            Start Over
          </button>
        </>
      ) : phase === 'done' ? (
        <>
          <h2 className="text-3xl font-bold mb-2">Your agent is ready!</h2>
          <p className="text-muted mb-8 text-sm max-w-md">
            Config written · Templates installed · Powered by {provider || 'AI'}
          </p>

          <div className="bg-surface border border-border rounded-xl p-6 mb-8 max-w-sm w-full">
            <div className="text-sm text-muted mb-3">Summary</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Provider</span><span className="capitalize">{provider || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Channel</span><span className="capitalize">{channel || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Templates</span><span>{selectedTemplates.length}</span></div>
              <div className="flex justify-between"><span className="text-muted">Config</span><span className="text-success">~/.openclaw/config.yaml</span></div>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => setScreen('manager')}
              className="w-full bg-coral hover:bg-coral-hover text-white font-semibold py-3 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Open Agent Manager →
            </button>
            {channel && channel !== 'terminal' && channel !== 'browser' && (
              <button
                onClick={() => ipcInvoke('open-channel', channel, channelToken)}
                className="w-full py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm"
              >
                Open {channel.charAt(0).toUpperCase() + channel.slice(1)} →
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2">Setting up your agent...</h2>
          <p className="text-muted mb-8 text-sm">{statusText}</p>
          <div className="w-full max-w-xs">
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-coral rounded-full transition-all duration-700 ease-out animate-pulse"
                style={{ width: phase === 'config' ? '30%' : phase === 'templates' ? '60%' : '90%' }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
