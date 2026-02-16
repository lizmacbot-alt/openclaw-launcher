import { useState, useEffect, useRef } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

function StatusIndicator({ running, uptime }: { running: boolean; uptime: number }) {
  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`
    if (h > 0) return `${h}h ${m % 60}m`
    if (m > 0) return `${m}m ${s % 60}s`
    return `${s}s`
  }

  return (
    <div className={`terminal-card p-4 rounded-xl border-2 ${
      running ? 'border-terminal-green/50 bg-terminal-green/10' : 'border-error/50 bg-error/10'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`text-3xl animate-float ${running ? 'animate-pulse' : 'opacity-50'}`}>
          {running ? '🟢' : '🔴'}
        </div>
        <div>
          <div className={`font-bold font-mono text-lg ${running ? 'text-terminal-green' : 'text-error'}`}>
            AGENT {running ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="text-sm font-mono text-muted">
            {running ? (
              <>
                <span className="text-terminal-green">↗</span> Uptime: {formatUptime(uptime)}
              </>
            ) : (
              <>
                <span className="text-error">↓</span> System standby
              </>
            )}
          </div>
        </div>
        <div className="ml-auto">
          <div className={`w-4 h-4 rounded-full border-2 ${
            running ? 'bg-terminal-green border-terminal-green animate-pulse' : 'bg-error border-error'
          }`}></div>
        </div>
      </div>
    </div>
  )
}

function SystemStats({ provider, channel, selectedTemplates, running }: {
  provider: string | null; channel: string | null; selectedTemplates: string[]; running: boolean;
}) {
  const stats = [
    { 
      label: 'AI BRAIN', 
      value: provider?.toUpperCase() || 'ANTHROPIC', 
      icon: '🧠', 
      color: 'text-cyan',
      status: running ? 'CONNECTED' : 'STANDBY'
    },
    { 
      label: 'COMM CHANNEL', 
      value: channel?.toUpperCase() || 'TELEGRAM', 
      icon: '📡', 
      color: 'text-pixel-blue',
      status: running ? 'ACTIVE' : 'INACTIVE'
    },
    { 
      label: 'SKILL MODULES', 
      value: `${selectedTemplates.length} LOADED`, 
      icon: '⚙️', 
      color: 'text-warning',
      status: running ? 'PROCESSING' : 'IDLE'
    },
    { 
      label: 'RUNTIME', 
      value: 'NODE.JS', 
      icon: '⚡', 
      color: 'text-terminal-green',
      status: running ? 'OPTIMAL' : 'PAUSED'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={stat.label} className="terminal-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                {stat.icon}
              </span>
              <span className="text-xs font-mono text-muted">
                {stat.label}
              </span>
            </div>
            <div className={`text-xs font-mono px-2 py-1 rounded border ${
              running ? 'border-terminal-green/30 text-terminal-green bg-terminal-green/10' :
              'border-muted/30 text-muted bg-surface/50'
            }`}>
              {stat.status}
            </div>
          </div>
          
          <div className={`font-bold font-mono text-sm ${stat.color}`}>
            {stat.value}
          </div>
          
          <div className={`w-full h-1 rounded-full mt-2 ${
            running ? 'bg-terminal-green/30' : 'bg-muted/20'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                running ? stat.color.replace('text-', 'bg-') : 'bg-muted/50'
              }`}
              style={{ width: running ? '100%' : '20%' }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ControlPanel({ running, onStart, onStop, onRestart, onRefresh, loading, error }: {
  running: boolean; onStart: () => void; onStop: () => void; onRestart: () => void;
  onRefresh: () => void; loading: string | null; error: string | null;
}) {
  const controls = [
    {
      id: 'start',
      label: running ? 'STOP AGENT' : 'START AGENT',
      icon: running ? '⏸️' : '▶️',
      action: running ? onStop : onStart,
      color: running ? 'bg-error/20 text-error hover:bg-error/30' : 'bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30',
      loading: loading === (running ? 'stop' : 'start')
    },
    {
      id: 'restart',
      label: 'RESTART',
      icon: '🔄',
      action: onRestart,
      color: 'bg-warning/20 text-warning hover:bg-warning/30',
      loading: loading === 'restart'
    },
    {
      id: 'refresh',
      label: 'REFRESH',
      icon: '↻',
      action: onRefresh,
      color: 'bg-cyan/20 text-cyan hover:bg-cyan/30',
      loading: false
    }
  ]

  return (
    <div className="terminal-card p-6 rounded-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎛️</span>
        <div>
          <h3 className="font-bold font-mono text-lg text-claw">CONTROL PANEL</h3>
          <div className="text-xs text-muted font-mono">Agent lifecycle management</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 terminal-card p-3 rounded-lg border-error/30 bg-error/10 error-shake">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-error">⚠️</span>
            <span className="text-error font-bold">SYSTEM ERROR:</span>
          </div>
          <div className="text-xs text-error mt-1 font-mono">
            {error}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {controls.map((control) => (
          <button
            key={control.id}
            onClick={control.action}
            disabled={loading !== null}
            className={`flex-1 px-4 py-3 rounded-lg font-mono font-bold text-sm transition-all border border-transparent hover:border-white/20 interactive-glow ${
              control.color
            } ${loading !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={control.loading ? 'animate-spin' : ''}>{control.icon}</span>
              {control.loading ? 'PROCESSING...' : control.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function QuickActions({ channel, onNavigate }: { channel: string | null; onNavigate: (screen: any) => void }) {
  const actions = [
    { 
      id: 'marketplace', 
      icon: '🛒', 
      title: 'SKILL MARKETPLACE', 
      desc: 'Browse and install new capabilities', 
      action: () => onNavigate('templates'),
      color: 'hover:border-claw/50 hover:bg-claw/10'
    },
    { 
      id: 'settings', 
      icon: '⚙️', 
      title: 'SYSTEM CONFIG', 
      desc: 'Modify AI provider and channels', 
      action: () => onNavigate('provider'),
      color: 'hover:border-cyan/50 hover:bg-cyan/10'
    },
    { 
      id: 'dashboard', 
      icon: '🌐', 
      title: 'WEB CONSOLE', 
      desc: 'Full-featured web interface', 
      action: () => ipcInvoke('open-external', 'http://localhost:18789'),
      color: 'hover:border-pixel-blue/50 hover:bg-pixel-blue/10'
    },
    { 
      id: 'chat', 
      icon: channel === 'telegram' ? '📱' : channel === 'discord' ? '💬' : '🗨️', 
      title: `${(channel || 'CHAT').toUpperCase()} CLIENT`, 
      desc: `Open ${channel || 'chat'} application`, 
      action: () => ipcInvoke('open-channel', channel),
      color: 'hover:border-terminal-green/50 hover:bg-terminal-green/10',
      disabled: !channel || channel === 'terminal' || channel === 'browser'
    }
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">🚀</span>
        <h3 className="font-bold font-mono text-lg text-claw">QUICK ACTIONS</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={action.disabled}
            className={`terminal-card p-4 rounded-xl text-left transition-all duration-300 group ${
              action.disabled ? 'opacity-50 cursor-not-allowed' : `${action.color} interactive-glow`
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl group-hover:animate-float">{action.icon}</span>
              <span className="text-xs font-mono text-muted">
                {action.disabled ? 'N/A' : 'READY'}
              </span>
            </div>
            <div className="font-bold font-mono text-sm mb-1">{action.title}</div>
            <div className="text-xs text-muted font-mono">{action.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AgentManager() {
  const { agentRunning, setAgentRunning, provider, channel, selectedTemplates, setScreen } = useSetupStore()
  const [statusDetail, setStatusDetail] = useState('Checking...')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uptime, setUptime] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkStatus = async () => {
    try {
      const result = await ipcInvoke('agent-status')
      setAgentRunning(result.running)
      setStatusDetail(result.detail || (result.running ? 'Running' : 'Stopped'))
    } catch {
      setAgentRunning(false)
      setStatusDetail('Unable to check status')
    }
  }

  useEffect(() => {
    checkStatus()
    const poll = setInterval(checkStatus, 10000)
    return () => clearInterval(poll)
  }, [])

  useEffect(() => {
    if (agentRunning) {
      setUptime(0)
      intervalRef.current = setInterval(() => setUptime(u => u + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setUptime(0)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [agentRunning])

  const handleStart = async () => {
    setActionLoading('start')
    setError(null)
    try {
      const result = await ipcInvoke('start-agent')
      if (result.success) {
        setAgentRunning(true)
        setStatusDetail('Running')
      } else {
        setError(result.error || 'Failed to start agent')
      }
    } catch (e: any) { setError(e.message) }
    finally { setActionLoading(null) }
  }

  const handleStop = async () => {
    setActionLoading('stop')
    setError(null)
    try {
      const result = await ipcInvoke('stop-agent')
      if (result.success) {
        setAgentRunning(false)
        setStatusDetail('Stopped')
      } else {
        setError(result.error || 'Failed to stop agent')
      }
    } catch (e: any) { setError(e.message) }
    finally { setActionLoading(null) }
  }

  const handleRestart = async () => {
    setActionLoading('restart')
    setError(null)
    try {
      await ipcInvoke('stop-agent')
      await new Promise(r => setTimeout(r, 1000))
      const result = await ipcInvoke('start-agent')
      if (result.success) {
        setAgentRunning(true)
        setStatusDetail('Running')
      } else {
        setError(result.error || 'Failed to restart agent')
      }
    } catch (e: any) { setError(e.message) }
    finally { setActionLoading(null) }
  }

  return (
    <div className="flex flex-col min-h-full animate-in px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-float">🦞</div>
          <div>
            <h1 className="text-2xl font-bold font-mono">
              <span className="glitch-text text-claw" data-text="OPENCLAW">OPENCLAW</span>
              <span className="text-muted"> COMMAND CENTER</span>
            </h1>
            <div className="text-xs font-mono text-muted">
              Agent Control Interface • v1.0.0-beta
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setScreen('welcome')}
          className="terminal-card px-4 py-2 rounded-lg text-xs font-mono border hover:border-claw/50 text-muted hover:text-white transition-all"
        >
          🔄 NEW DEPLOYMENT
        </button>
      </div>

      {/* Status Overview */}
      <StatusIndicator running={agentRunning} uptime={uptime} />
      
      {/* System Stats */}
      <div className="my-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">📊</span>
          <h3 className="font-bold font-mono text-lg text-claw">SYSTEM STATUS</h3>
        </div>
        <SystemStats 
          provider={provider}
          channel={channel}
          selectedTemplates={selectedTemplates}
          running={agentRunning}
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        running={agentRunning}
        onStart={handleStart}
        onStop={handleStop}
        onRestart={handleRestart}
        onRefresh={checkStatus}
        loading={actionLoading}
        error={error}
      />

      {/* Quick Actions */}
      <QuickActions channel={channel} onNavigate={setScreen} />

      {/* Footer Info */}
      <div className="text-center pt-6 border-t border-border">
        <div className="text-xs text-muted font-mono space-y-1">
          <div>OpenClaw Launcher • Digital assistant deployment platform</div>
          <div>Config: <span className="text-terminal-green">~/.openclaw/config.yaml</span></div>
          <div className="opacity-60">
            {agentRunning ? '⚡ System operational' : '💤 System in standby mode'}
          </div>
        </div>
      </div>

      {/* ASCII Art decoration */}
      <div className="absolute top-20 right-8 text-claw/10 text-[8px] font-mono opacity-30 pointer-events-none">
        <pre>{`
╔══════════════╗
║   CONTROL    ║
║     ROOM     ║
║              ║
║   [●] [●]    ║
║    \\___/     ║
║              ║
╚══════════════╝
        `}</pre>
      </div>
    </div>
  )
}