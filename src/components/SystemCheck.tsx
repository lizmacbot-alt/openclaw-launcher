import { useState, useEffect, useRef } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

type CheckStatus = 'pending' | 'checking' | 'installing' | 'done' | 'error'

interface Check {
  label: string
  detail: string
  status: CheckStatus
}

function CheckRow({ status, label, detail }: Check) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (status === 'checking' || status === 'installing') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.')
      }, 400)
      return () => clearInterval(interval)
    }
  }, [status])

  const icons: Record<CheckStatus, string> = {
    pending: '◯',
    checking: '⚡',
    installing: '📦',
    done: '✅',
    error: '❌'
  }

  const colors: Record<CheckStatus, string> = {
    pending: 'text-muted',
    checking: 'text-cyan',
    installing: 'text-warning',
    done: 'text-terminal-green',
    error: 'text-error'
  }

  const borderColors: Record<CheckStatus, string> = {
    pending: 'border-border/30',
    checking: 'border-cyan/30 bg-cyan/5',
    installing: 'border-warning/30 bg-warning/5',
    done: 'border-terminal-green/30 bg-terminal-green/5',
    error: 'border-error/30 bg-error/5'
  }

  return (
    <div className={`terminal-card p-4 rounded-lg transition-all duration-300 ${borderColors[status]}`}>
      <div className="flex items-center gap-4 font-mono">
        <span className={`text-lg ${colors[status]} ${(status === 'checking' || status === 'installing') ? 'animate-pulse' : ''}`}>
          {icons[status]}
        </span>
        <div className="flex-1">
          <div className="text-sm font-bold">
            <span className="text-muted">$&gt;</span> {label}
            {(status === 'checking' || status === 'installing') && <span className="text-cyan">{dots}</span>}
          </div>
          {detail && (
            <div className={`text-xs mt-1 ${colors[status]}`}>
              <span className="text-muted">└─&gt;</span> {detail}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SystemCheck() {
  const setScreen = useSetupStore((s) => s.setScreen)
  const [checks, setChecks] = useState<Check[]>([
    { label: 'Operating System', detail: '', status: 'pending' },
    { label: 'Node.js Runtime (v22+)', detail: '', status: 'pending' },
    { label: 'OpenClaw CLI', detail: '', status: 'pending' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [logsCopied, setLogsCopied] = useState(false)
  const checksEndRef = useRef<HTMLDivElement>(null)

  const update = (i: number, patch: Partial<Check>) =>
    setChecks((c) => c.map((ch, j) => (j === i ? { ...ch, ...patch } : ch)))

  const runChecks = async () => {
    setError(null)
    setDone(false)
    setChecks(c => c.map(ch => ({ ...ch, status: 'pending' as const, detail: '' })))

    try {
      // 1. System check
      update(0, { status: 'checking', detail: 'Scanning...' })
      const result = await ipcInvoke('system-check')

      // OS
      update(0, {
        status: 'done',
        detail: `${result.os.name} ${result.os.version} (${result.os.arch})`,
      })

      // 2. Node.js
      update(1, { status: 'checking', detail: 'Looking for Node.js...' })
      await delay(300)

      if (result.node.installed && result.node.sufficient) {
        update(1, { status: 'done', detail: result.node.version })
      } else {
        // Auto-install Node.js
        const msg = result.node.installed
          ? `Found ${result.node.version}, upgrading to v22+...`
          : 'Not found. Installing...'
        update(1, { status: 'installing', detail: msg })

        const installResult = await ipcInvoke('install-node')
        if (installResult.success) {
          // Re-check version
          const recheck = await ipcInvoke('system-check')
          if (recheck.node.installed && recheck.node.sufficient) {
            update(1, { status: 'done', detail: recheck.node.version })
          } else {
            update(1, { status: 'error', detail: 'Installed but version check failed. Restart the app and try again.' })
            setError('Node.js was installed but may need a terminal restart to be detected.')
            return
          }
        } else {
          update(1, { status: 'error', detail: installResult.manual || 'Auto-install failed.' })
          setError(installResult.manual || 'Could not install Node.js automatically. Install Node.js v22+ from nodejs.org and reopen the app.')
          return
        }
      }

      // 3. OpenClaw CLI
      update(2, { status: 'checking', detail: 'Looking for OpenClaw...' })
      await delay(300)

      if (result.openclaw.installed) {
        update(2, { status: 'done', detail: result.openclaw.version })
      } else {
        // Auto-install OpenClaw
        update(2, { status: 'installing', detail: 'Installing openclaw@latest...' })

        const installResult = await ipcInvoke('install-openclaw')
        if (installResult.success) {
          const recheck = await ipcInvoke('system-check')
          if (recheck.openclaw.installed) {
            update(2, { status: 'done', detail: recheck.openclaw.version })
          } else {
            update(2, { status: 'error', detail: 'Installed but not detected. Restart the app.' })
            setError('OpenClaw was installed but not detected. Try restarting the app.')
            return
          }
        } else {
          update(2, { status: 'error', detail: installResult.manual || 'Auto-install failed.' })
          setError(installResult.manual || 'Could not install OpenClaw. Run: npm install -g openclaw@latest')
          return
        }
      }

      // All good
      setDone(true)

    } catch (e: any) {
      setError(e.message || 'System check failed.')
    }
  }

  useEffect(() => {
    checksEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [checks, error])

  useEffect(() => { runChecks() }, [])

  // Auto-advance after 1.5s when everything passes
  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => setScreen('provider'), 1500)
      return () => clearTimeout(timer)
    }
  }, [done, setScreen])

  const allGood = checks.every((c) => c.status === 'done')
  const hasError = checks.some(c => c.status === 'error')
  const isWorking = checks.some(c => c.status === 'checking' || c.status === 'installing')

  return (
    <div className="flex flex-col items-center justify-center min-h-full animate-in px-8 py-6">
      <h2 className="text-2xl font-bold mb-2 font-mono">
        <span className="glitch-text text-claw" data-text="System Check">System Check</span>
      </h2>
      <p className="text-muted mb-8 text-sm font-mono">
        {isWorking ? 'Setting up your environment...' :
         allGood ? 'Everything looks good.' :
         hasError ? 'Something needs your attention.' :
         'Checking requirements...'}
      </p>

      <div className="w-full max-w-md space-y-3 mb-8">
        {checks.map((check) => (
          <CheckRow key={check.label} {...check} />
        ))}
      </div>

      {error && (
        <div className="w-full max-w-md mb-6 terminal-card p-4 rounded-lg border-error/30 bg-error/10">
          <div className="text-xs text-error font-mono">{error}</div>
        </div>
      )}

      {allGood && (
        <div className="w-full max-w-md mb-6 terminal-card p-4 rounded-lg border-terminal-green/50 bg-terminal-green/10">
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-terminal-green font-bold">All set. Continuing...</span>
          </div>
        </div>
      )}

      <div ref={checksEndRef} />

      {/* Copy debug logs button */}
      <button
        onClick={async () => {
          try {
            const logs = await ipcInvoke('get-debug-logs')
            await navigator.clipboard.writeText(logs || 'No logs available')
            setLogsCopied(true)
            setTimeout(() => setLogsCopied(false), 2000)
          } catch { /* ignore */ }
        }}
        className="text-[10px] text-muted/40 hover:text-muted font-mono mb-4 transition-colors"
      >
        {logsCopied ? 'Copied!' : 'Copy debug logs'}
      </button>

      <div className="flex gap-3">
        <button
          onClick={() => setScreen('welcome')}
          className="px-6 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
        >
          ← Back
        </button>

        {hasError && (
          <button
            onClick={runChecks}
            className="px-6 py-3 rounded-lg border border-claw/30 text-claw hover:bg-claw/10 transition-all font-mono interactive-glow"
          >
            Retry
          </button>
        )}

        {allGood && (
          <button
            onClick={() => setScreen('provider')}
            className="px-8 py-3 rounded-lg font-bold font-mono pixel-button text-white"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
