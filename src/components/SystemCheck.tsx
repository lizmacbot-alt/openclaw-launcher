import { useState, useEffect } from 'react'
import { useSetupStore } from '../stores/setup-store'

interface Check {
  label: string
  detail: string
  status: 'pending' | 'checking' | 'done' | 'warning'
}

export default function SystemCheck() {
  const setScreen = useSetupStore((s) => s.setScreen)
  const [checks, setChecks] = useState<Check[]>([
    { label: 'Operating System', detail: '', status: 'pending' },
    { label: 'Node.js', detail: '', status: 'pending' },
    { label: 'OpenClaw', detail: '', status: 'pending' },
  ])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = (i: number, patch: Partial<Check>) =>
      setChecks((c) => c.map((ch, j) => (j === i ? { ...ch, ...patch } : ch)))

    const timers = [
      setTimeout(() => { update(0, { status: 'checking' }); setProgress(10) }, 300),
      setTimeout(() => {
        const os = navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Win') ? 'Windows' : 'Linux'
        update(0, { status: 'done', detail: `${os} (supported)` }); setProgress(25)
      }, 1000),
      setTimeout(() => { update(1, { status: 'checking' }); setProgress(35) }, 1200),
      setTimeout(() => { update(1, { status: 'done', detail: 'v22.1.0 (ready)' }); setProgress(55) }, 2200),
      setTimeout(() => { update(2, { status: 'checking' }); setProgress(60) }, 2500),
      setTimeout(() => setProgress(75), 3200),
      setTimeout(() => setProgress(90), 3800),
      setTimeout(() => { update(2, { status: 'done', detail: 'v1.2.0 installed' }); setProgress(100) }, 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const allDone = checks.every((c) => c.status === 'done')
  const icons = { pending: '○', checking: '⏳', done: '✅', warning: '⚠️' }

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in px-8">
      <h2 className="text-2xl font-bold mb-2">Checking your system...</h2>
      <p className="text-muted mb-8 text-sm">Making sure everything is ready</p>

      <div className="w-full max-w-md space-y-4 mb-8">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
              check.status === 'done'
                ? 'bg-surface border-success/30'
                : check.status === 'checking'
                ? 'bg-surface border-coral/30'
                : 'bg-surface/50 border-border'
            }`}
          >
            <span className="text-lg">{icons[check.status]}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{check.label}</div>
              {check.detail && <div className="text-xs text-muted mt-0.5">{check.detail}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-muted mt-2 text-center">{progress}%</div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setScreen('welcome')} className="px-6 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">
          ← Back
        </button>
        <button
          onClick={() => setScreen('provider')}
          disabled={!allDone}
          className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
            allDone ? 'bg-coral hover:bg-coral-hover text-white hover:scale-105 active:scale-95' : 'bg-surface text-muted cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
