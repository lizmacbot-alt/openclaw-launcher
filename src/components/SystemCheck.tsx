import { useState, useEffect } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

interface Check {
  label: string
  detail: string
  status: 'pending' | 'checking' | 'done' | 'warning' | 'error'
  action?: string
}

const funnyCheckingMessages = [
  "Poking the system with a stick...",
  "Asking your computer nicely...",
  "Checking if the hamster is still running...",
  "Consulting the digital spirits...",
  "Turning it off and on again...",
  "Looking under the hood...",
  "Making sure nothing is on fire...",
  "Checking the flux capacitor..."
]

const quirkyLoadingStates = [
  "Initializing system probe...",
  "Scanning for digital life forms...",
  "Testing reality coherence...",
  "Calibrating expectation engines...",
  "Loading system personality...",
  "Checking cosmic radiation levels...",
  "Verifying quantum entanglement...",
  "Activating sensor arrays..."
]

function TerminalLine({ status, label, detail, action, onAction, isInstalling }: {
  status: string; label: string; detail: string; action?: string; onAction?: (action: string) => void; isInstalling: boolean;
}) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (status === 'checking') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.')
      }, 500)
      return () => clearInterval(interval)
    }
  }, [status])

  const statusIcons: Record<string, string> = {
    pending: '◯',
    checking: '⚡',
    done: '✅',
    warning: '⚠️',
    error: '❌'
  }

  const statusColors: Record<string, string> = {
    pending: 'text-muted',
    checking: 'text-cyan animate-pulse',
    done: 'text-terminal-green',
    warning: 'text-warning',
    error: 'text-error'
  }

  return (
    <div className={`terminal-card p-4 rounded-lg transition-all duration-300 ${
      status === 'done' ? 'border-terminal-green/30 bg-terminal-green/5' :
      status === 'checking' ? 'border-cyan/30 bg-cyan/5' :
      status === 'warning' ? 'border-warning/30 bg-warning/5' :
      status === 'error' ? 'border-error/30 bg-error/5' :
      'border-border/30'
    }`}>
      <div className="flex items-center gap-4 font-mono">
        <span className={`text-lg ${statusColors[status]}`}>
          {statusIcons[status]}
        </span>
        
        <div className="flex-1">
          <div className="text-sm font-bold">
            <span className="text-muted">$&gt;</span> {label}
            {status === 'checking' && <span className="text-cyan">{dots}</span>}
          </div>
          
          {detail && (
            <div className={`text-xs mt-1 ${
              status === 'done' ? 'text-terminal-green' :
              status === 'checking' ? 'text-cyan' :
              status === 'warning' ? 'text-warning' :
              status === 'error' ? 'text-error' :
              'text-muted'
            }`}>
              {status === 'checking' ? (
                <span className="terminal-prompt">
                  {funnyCheckingMessages[Math.floor(Math.random() * funnyCheckingMessages.length)]}
                </span>
              ) : (
                <>
                  <span className="text-muted">└─&gt;</span> {detail}
                </>
              )}
            </div>
          )}
        </div>
        
        {action && status !== 'done' && (
          <button
            onClick={() => onAction?.(action)}
            disabled={isInstalling}
            className={`text-xs px-3 py-1 rounded border transition-all font-mono ${
              isInstalling 
                ? 'bg-surface text-muted border-border cursor-not-allowed' 
                : 'bg-claw/10 text-claw border-claw/30 hover:bg-claw/20 interactive-glow'
            }`}
          >
            {isInstalling ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⚡</span> Installing...
              </span>
            ) : (
              '🔧 Fix'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function SystemTerminal({ progress, currentCheck }: { progress: number; currentCheck: string }) {
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> System diagnostic initialized...',
    '> Loading OpenClaw compatibility layer...'
  ])

  useEffect(() => {
    if (currentCheck) {
      setTerminalLines(prev => [
        ...prev,
        `> ${currentCheck}`
      ].slice(-6)) // Keep only last 6 lines
    }
  }, [currentCheck])

  return (
    <div className="terminal-card p-4 rounded-xl bg-bg/80 border border-terminal-green/30 font-mono text-sm max-w-md w-full mb-6">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-terminal-green/20">
        <span className="w-2 h-2 rounded-full bg-claw animate-pulse"></span>
        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" style={{ animationDelay: '0.5s' }}></span>
        <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" style={{ animationDelay: '1s' }}></span>
        <span className="text-xs text-muted ml-2">openclaw-diagnostics.exe</span>
      </div>
      
      <div className="min-h-[120px] space-y-1">
        {terminalLines.map((line, i) => (
          <div key={i} className="text-terminal-green text-xs opacity-80">
            {line}
            {i === terminalLines.length - 1 && (
              <span className="animate-terminal-cursor">_</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-terminal-green/20">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="terminal-progress h-2 rounded-full" style={{ '--progress': `${progress}%` } as any}>
        </div>
      </div>
    </div>
  )
}

export default function SystemCheck() {
  const setScreen = useSetupStore((s) => s.setScreen)
  const [checks, setChecks] = useState<Check[]>([
    { label: 'Operating System Compatibility', detail: '', status: 'pending' },
    { label: 'Node.js Runtime (v22+)', detail: '', status: 'pending' },
    { label: 'OpenClaw CLI Framework', detail: '', status: 'pending' },
  ])
  const [progress, setProgress] = useState(0)
  const [installing, setInstalling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentCheck, setCurrentCheck] = useState('')

  const update = (i: number, patch: Partial<Check>) =>
    setChecks((c) => c.map((ch, j) => (j === i ? { ...ch, ...patch } : ch)))

  const runChecks = async () => {
    setError(null)
    setChecks(c => c.map(ch => ({ ...ch, status: 'pending' as const, detail: '', action: undefined })))
    setProgress(0)

    // Start checks with random quirky messages
    const startMessage = quirkyLoadingStates[Math.floor(Math.random() * quirkyLoadingStates.length)]
    setCurrentCheck(startMessage)
    
    await new Promise(r => setTimeout(r, 800))

    update(0, { status: 'checking' })
    setCurrentCheck('Examining your digital ecosystem...')
    setProgress(10)

    try {
      const result = await ipcInvoke('system-check')

      // OS Check
      await new Promise(r => setTimeout(r, 600))
      update(0, {
        status: 'done',
        detail: `${result.os.name} ${result.os.version} (${result.os.arch}) - Looking good!`,
      })
      setCurrentCheck('OS check passed - System is alive and kicking!')
      setProgress(25)

      // Node.js Check
      await new Promise(r => setTimeout(r, 400))
      update(1, { status: 'checking' })
      setCurrentCheck('Searching for Node.js in the digital wilderness...')
      setProgress(40)
      
      await new Promise(r => setTimeout(r, 700))
      if (result.node.installed && result.node.sufficient) {
        update(1, { status: 'done', detail: `${result.node.version} - Perfect! Ready to run JavaScript magic ✨` })
        setCurrentCheck('Node.js found and ready for action!')
      } else if (result.node.installed && !result.node.sufficient) {
        update(1, { status: 'warning', detail: `${result.node.version} detected, but needs upgrade to v22+`, action: 'install-node' })
        setCurrentCheck('Node.js needs a software smoothie (upgrade)...')
      } else {
        update(1, { status: 'error', detail: 'Node.js not found - needed for the magic to work', action: 'install-node' })
        setCurrentCheck('Houston, we have a Node problem...')
      }
      setProgress(60)

      // OpenClaw Check
      await new Promise(r => setTimeout(r, 400))
      update(2, { status: 'checking' })
      setCurrentCheck('Summoning the OpenClaw CLI spirits...')
      setProgress(75)
      
      await new Promise(r => setTimeout(r, 600))
      if (result.openclaw.installed) {
        update(2, { status: 'done', detail: `${result.openclaw.version} - The lobster is ready to pinch! 🦞` })
        setCurrentCheck('OpenClaw CLI detected - All systems nominal!')
      } else {
        update(2, { status: 'warning', detail: 'OpenClaw CLI not found - will install automatically', action: 'install-openclaw' })
        setCurrentCheck('OpenClaw CLI missing - no worries, we can fix that!')
      }
      
      setProgress(100)
      setCurrentCheck('System diagnostic complete - Ready for takeoff! 🚀')
      
    } catch (e: any) {
      setError(e.message || 'System check failed - but we can try again!')
      setCurrentCheck('Error detected - but hey, that is what debugging is for...')
    }
  }

  useEffect(() => { runChecks() }, [])

  const handleInstall = async (action: string) => {
    setInstalling(action)
    setError(null)
    setCurrentCheck('Installing required components - brewing fresh software...')
    
    try {
      const result = await ipcInvoke(action)
      if (result.success) {
        setCurrentCheck('Installation successful - re-running diagnostics...')
        await runChecks()
      } else {
        setError(result.manual || result.error || 'Installation failed - manual installation may be required')
        setCurrentCheck('Installation hiccup detected...')
      }
    } catch (e: any) {
      setError(e.message)
      setCurrentCheck('Error during installation - the digital gremlins are at it again...')
    } finally {
      setInstalling(null)
    }
  }

  const allGood = checks.every((c) => c.status === 'done')
  const hasWarningOnly = checks.some(c => c.status === 'warning') && !checks.some(c => c.status === 'error')
  const canProceed = allGood || hasWarningOnly

  return (
    <div className="flex flex-col items-center justify-center min-h-full animate-in px-8 py-6">
      {/* ASCII Header */}
      <div className="terminal-text text-[10px] leading-tight mb-4 opacity-60">
        <pre>{`
╔═══════════════════════════════╗
║     SYSTEM DIAGNOSTIC v1.0    ║
║    Checking the digital       ║
║    foundations...             ║
╚═══════════════════════════════╝
        `}</pre>
      </div>

      <h2 className="text-2xl font-bold mb-2 font-mono">
        <span className="glitch-text text-claw" data-text="System Analysis">System Analysis</span>
      </h2>
      <p className="text-muted mb-6 text-sm font-mono terminal-prompt">
        Making sure your digital environment is ready for AI awesomeness
      </p>

      {/* Terminal Output */}
      <SystemTerminal progress={progress} currentCheck={currentCheck} />

      {/* Check Results */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {checks.map((check, i) => (
          <TerminalLine
            key={check.label}
            status={check.status}
            label={check.label}
            detail={check.detail}
            action={check.action}
            onAction={handleInstall}
            isInstalling={installing !== null}
          />
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-md mb-6 terminal-card p-4 rounded-lg border-error/30 bg-error/10">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-error animate-pulse">⚠️</span>
            <span className="text-error font-bold">DIAGNOSTIC ERROR:</span>
          </div>
          <div className="text-xs text-error mt-2 font-mono">
            {error}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {progress === 100 && (
        <div className={`w-full max-w-md mb-6 terminal-card p-4 rounded-lg border transition-all ${
          allGood 
            ? 'border-terminal-green/50 bg-terminal-green/10' 
            : hasWarningOnly 
            ? 'border-warning/50 bg-warning/10'
            : 'border-error/50 bg-error/10'
        }`}>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-2xl animate-float">
              {allGood ? '🎉' : hasWarningOnly ? '🤔' : '😅'}
            </span>
            <div>
              <div className="font-bold">
                {allGood && <span className="text-terminal-green">All systems go! Ready to deploy.</span>}
                {hasWarningOnly && <span className="text-warning">Minor issues detected but we can proceed.</span>}
                {!canProceed && <span className="text-error">Issues found - manual intervention needed.</span>}
              </div>
              <div className="text-xs text-muted mt-1">
                {allGood && "Your system is perfectly configured for OpenClaw."}
                {hasWarningOnly && "Some components will be installed automatically."}
                {!canProceed && "Please resolve the errors above to continue."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button 
          onClick={() => setScreen('welcome')} 
          className="px-6 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
        >
          ← Back to Base
        </button>
        
        <button 
          onClick={runChecks} 
          className="px-6 py-3 rounded-lg border border-claw/30 text-claw hover:bg-claw/10 transition-all font-mono interactive-glow"
          disabled={installing !== null}
        >
          {installing ? '🔄 Installing...' : '🔄 Re-scan'}
        </button>
        
        <button
          onClick={() => setScreen('provider')}
          disabled={!canProceed || installing !== null}
          className={`px-8 py-3 rounded-lg font-bold font-mono transition-all ${
            canProceed && !installing 
              ? 'pixel-button text-white' 
              : 'bg-surface text-muted cursor-not-allowed border border-border'
          }`}
        >
          {!canProceed ? 'Fix issues first →' : 'Proceed to AI Setup →'}
        </button>
      </div>

      {/* Fun footer */}
      <div className="text-xs text-muted font-mono opacity-50 mt-6 text-center">
        Fun fact: This diagnostic scanned {Math.floor(Math.random() * 1337) + 500} system components 
        <br />
        and found exactly {Math.floor(Math.random() * 10)} digital dust bunnies.
      </div>
    </div>
  )
}