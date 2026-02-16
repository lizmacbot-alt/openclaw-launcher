import { useEffect, useState } from 'react'
import { useSetupStore } from '../stores/setup-store'

export default function SetupComplete() {
  const { channel, provider, selectedTemplates, setScreen, setAgentRunning } = useSetupStore()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setAgentRunning(true)
    setTimeout(() => setShowContent(true), 400)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in px-8 text-center">
      <div className={`text-6xl mb-4 transition-all duration-500 ${showContent ? 'scale-100' : 'scale-0'}`}>🎉</div>
      <h2 className="text-3xl font-bold mb-2">Your agent is ready!</h2>
      <p className="text-muted mb-8 text-sm max-w-md">
        Template loaded · Connected to {channel || 'your channel'} · Powered by {provider || 'AI'}
      </p>

      <div className="bg-surface border border-border rounded-xl p-6 mb-8 max-w-sm w-full">
        <div className="text-sm text-muted mb-3">Summary</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Provider</span><span className="capitalize">{provider || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted">Channel</span><span className="capitalize">{channel || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted">Templates</span><span>{selectedTemplates.length}</span></div>
          <div className="flex justify-between"><span className="text-muted">Status</span><span className="text-success">● Running</span></div>
        </div>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => setScreen('manager')}
          className="w-full bg-coral hover:bg-coral-hover text-white font-semibold py-3 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          Open Agent Manager →
        </button>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">
            Open Dashboard
          </button>
          <button className="flex-1 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">
            View Logs
          </button>
        </div>
      </div>
    </div>
  )
}
