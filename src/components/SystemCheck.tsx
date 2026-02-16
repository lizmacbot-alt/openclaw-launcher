import { useState, useEffect } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

interface Check {
  label: string
  detail: string
  status: 'pending' | 'checking' | 'done' | 'warning' | 'error'
  action?: string
}

export default function SystemCheck() {
  const setScreen = useSetupStore((s) => s.setScreen)
  const [checks, setChecks] = useState<Check[]>([
    { label: 'Operating System', detail: '', status: 'pending' },
    { label: 'Node.js (v22+)', detail: '', status: 'pending' },
    { label: 'OpenClaw CLI', detail: '', status: 'pending' },
  ])
  const [progress, setProgress] = useState(0)
  const [installing, setInstalling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = (i: number, patch: Partial<Check>) =>
    setChecks((c) => c.map((ch, j) => (j === i ? { ...ch, ...patch } : ch)))

  const runChecks = async () => {
    setError(null)
    setChecks(c => c.map(ch => ({ ...ch, status: 'pending' as const, detail: '', action: undefined })))
    setProgress(0)

    update(0, { status: 'checking' })
    setProgress(10)

    try {
      const result = await ipcInvoke('system-check')

      // OS
      update(0, {
        status: 'done',
        detail: `${result.os.name} ${result.os.version} (${result.os.arch})`,
      })
      setProgress(25)

      // Node
      update(1, { status: 'checking' })
      setProgress(40)
      await new Promise(r => setTimeout(r, 300))

      if (result.node.installed && result.node.sufficient) {
        update(1, { status: 'done', detail: `${result.node.version} ✓` })
      } else if (result.node.installed && !result.node.sufficient) {
        update(1, { status: 'warning', detail: `${result.node.version} — needs v22+`, action: 'install-node' })
      } else {
        update(1, { status: 'error', detail: 'Not installed', action: 'install-node' })
      }
      setProgress(60)

      // OpenClaw
      update(2, { status: 'checking' })
      setProgress(75)
      await new Promise(r => setTimeout(r, 300))

      if (result.openclaw.installed) {
        update(2, { status: 'done', detail: result.openclaw.version })
      } else {
        update(2, { status: 'warning', detail: 'Not installed — will install', action: 'install-openclaw' })
      }
      setProgress(100)
    } catch (e: any) {
      setError(e.message || 'System check failed')
    }
  }

  useEffect(() => { runChecks() }, [])

  const handleInstall = async (action: string) => {
    setInstalling(action)
    setError(null)
    try {
      const result = await ipcInvoke(action)
      if (result.success) {
        // Re-run checks after install
        await runChecks()
      } else {
        setError(result.manual || result.error || 'Installation failed')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setInstalling(null)
    }
  }

  const allGood = checks.every((c) => c.status === 'done')
  const hasWarningOnly = checks.some(c => c.status === 'warning') && !checks.some(c => c.status === 'error')
  const canProceed = allGood || hasWarningOnly

  const icons: Record<string, string> = { pending: '○', checking: '⏳', done: '✅', warning: '⚠️', error: '❌' }

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in px-8">
      <h2 className="text-2xl font-bold mb-2">Checking your system...</h2>
      <p className="text-muted mb-8 text-sm">Making sure everything is ready</p>

      <div className="w-full max-w-md space-y-4 mb-8">
        {checks.map((check, i) => (
          <div
            key={check.label}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
              check.status === 'done' ? 'bg-surface border-success/30'
                : check.status === 'checking' ? 'bg-surface border-coral/30'
                : check.status === 'warning' ? 'bg-surface border-warning/30'
                : check.status === 'error' ? 'bg-surface border-error/30'
                : 'bg-surface/50 border-border'
            }`}
          >
            <span className="text-lg">{icons[check.status]}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{check.label}</div>
              {check.detail && <div className="text-xs text-muted mt-0.5">{check.detail}</div>}
            </div>
            {check.action && check.status !== 'done' && (
              <button
                onClick={() => handleInstall(check.action!)}
                disabled={installing !== null}
                className="text-xs bg-coral/20 text-coral px-3 py-1 rounded-lg hover:bg-coral/30 transition-all disabled:opacity-50"
              >
                {installing === check.action ? 'Installing...' : 'Install'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md mb-4">
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-muted mt-2 text-center">{progress}%</div>
      </div>

      {error && (
        <div className="w-full max-w-md mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setScreen('welcome')} className="px-6 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">
          ← Back
        </button>
        <button onClick={runChecks} className="px-6 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">
          Re-check
        </button>
        <button
          onClick={() => setScreen('provider')}
          disabled={!canProceed}
          className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
            canProceed ? 'bg-coral hover:bg-coral-hover text-white hover:scale-105 active:scale-95' : 'bg-surface text-muted cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
