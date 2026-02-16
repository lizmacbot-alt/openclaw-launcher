import { useState, useEffect, useRef, useCallback } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

type Tab = 'dashboard' | 'logs' | 'settings'

interface ApiUsage {
  provider: string
  model: string
  tokensUsed: number
  tokenLimit: number
  estimatedCost: number
  period: string
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

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
      
      <div className="grid grid-cols-3 gap-4">
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

function ApiUsagePanel() {
  const [usage, setUsage] = useState<ApiUsage | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await ipcInvoke('get-api-usage')
        setUsage(data)
      } catch { /* ignore */ }
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!usage) return null

  const pct = Math.min(100, Math.round((usage.tokensUsed / usage.tokenLimit) * 100))
  const barColor = pct > 80 ? 'bg-error' : pct > 50 ? 'bg-warning' : 'bg-terminal-green'

  return (
    <div className="terminal-card p-5 rounded-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">📈</span>
        <div>
          <h3 className="font-bold font-mono text-lg text-claw">API USAGE</h3>
          <div className="text-xs text-muted font-mono">{usage.period}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-bold font-mono text-sm text-terminal-green">${usage.estimatedCost.toFixed(2)}</div>
          <div className="text-xs text-muted font-mono">estimated cost</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-muted mb-2">
        <span>{usage.provider.toUpperCase()} / {usage.model}</span>
        <span>{usage.tokensUsed.toLocaleString()} / {usage.tokenLimit.toLocaleString()} tokens</span>
      </div>

      <div className="w-full h-3 rounded-full bg-muted/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
      <div className="text-right text-xs font-mono text-muted mt-1">{pct}% used</div>
    </div>
  )
}

function LogsViewer({ maxLines = 10 }: { maxLines?: number }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await ipcInvoke('get-agent-logs')
        if (Array.isArray(data)) setLogs(data)
      } catch { /* ignore */ }
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const levelColor = (level: string) => {
    if (level === 'error') return 'text-error'
    if (level === 'warn') return 'text-warning'
    return 'text-terminal-green'
  }

  const levelTag = (level: string) => {
    if (level === 'error') return 'ERR'
    if (level === 'warn') return 'WRN'
    return 'INF'
  }

  const displayLogs = logs.slice(-maxLines)

  return (
    <div className="terminal-card p-5 rounded-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">📜</span>
        <h3 className="font-bold font-mono text-lg text-claw">LIVE LOGS</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
          <span className="text-xs font-mono text-muted">STREAMING</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="bg-black/60 rounded-lg p-3 font-mono text-xs overflow-y-auto border border-muted/20"
        style={{ maxHeight: `${maxLines * 1.6}em`, minHeight: '4em' }}
      >
        {displayLogs.length === 0 ? (
          <div className="text-muted">No log entries yet...</div>
        ) : (
          displayLogs.map((entry, i) => (
            <div key={i} className="flex gap-2 leading-relaxed">
              <span className="text-muted/60 shrink-0">{entry.timestamp}</span>
              <span className={`shrink-0 font-bold ${levelColor(entry.level)}`}>[{levelTag(entry.level)}]</span>
              <span className={levelColor(entry.level)}>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function QuickSettingsPanel({ provider, channel, onRestart }: {
  provider: string | null; channel: string | null; onRestart: () => void
}) {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  const providerModels: Record<string, string> = {
    anthropic: 'claude-sonnet-4-20250514',
    openai: 'gpt-4o',
    google: 'gemini-2.5-flash',
    groq: 'llama-3.3-70b-versatile',
    openrouter: 'anthropic/claude-sonnet-4-20250514',
  }

  const currentProvider = provider || 'anthropic'
  const currentModel = providerModels[currentProvider] || 'default'

  const handleSaveRestart = async () => {
    setSaving(true)
    try {
      if (apiKey.trim()) {
        await ipcInvoke('write-config', {
          provider: currentProvider,
          apiKey: apiKey.trim(),
          channel: channel || 'telegram',
          channelToken: '',
          templates: [],
        })
      }
      onRestart()
    } finally {
      setSaving(false)
      setShowApiKeyInput(false)
      setApiKey('')
    }
  }

  return (
    <div className="terminal-card p-5 rounded-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">⚙️</span>
        <h3 className="font-bold font-mono text-lg text-claw">QUICK SETTINGS</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted">PROVIDER</span>
          <span className="text-sm font-mono text-cyan font-bold">{currentProvider.toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted">MODEL</span>
          <span className="text-sm font-mono text-terminal-green">{currentModel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted">CHANNEL</span>
          <span className="text-sm font-mono text-pixel-blue font-bold">{(channel || 'telegram').toUpperCase()}</span>
        </div>

        <div className="border-t border-muted/20 pt-3">
          {showApiKeyInput ? (
            <div className="space-y-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter new API key..."
                className="w-full bg-black/60 border border-muted/30 rounded-lg px-3 py-2 text-sm font-mono text-terminal-green placeholder-muted/50 focus:border-cyan/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowApiKeyInput(false); setApiKey('') }}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-xs bg-muted/20 text-muted hover:bg-muted/30 transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveRestart}
                  disabled={saving || !apiKey.trim()}
                  className="flex-1 px-3 py-2 rounded-lg font-mono text-xs font-bold bg-claw/20 text-claw hover:bg-claw/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'SAVING...' : 'SAVE & RESTART'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="flex-1 px-3 py-2 rounded-lg font-mono text-xs bg-cyan/20 text-cyan hover:bg-cyan/30 transition-all"
              >
                🔑 CHANGE API KEY
              </button>
              <button
                onClick={handleSaveRestart}
                disabled={saving}
                className="flex-1 px-3 py-2 rounded-lg font-mono text-xs font-bold bg-warning/20 text-warning hover:bg-warning/30 transition-all disabled:opacity-50"
              >
                {saving ? 'RESTARTING...' : '🔄 SAVE & RESTART'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: '📊' },
    { id: 'logs', label: 'LOGS', icon: '📜' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
  ]

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all border ${
            activeTab === tab.id
              ? 'border-claw/50 bg-claw/20 text-claw'
              : 'border-muted/20 bg-transparent text-muted hover:border-muted/40 hover:text-white'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default function AgentManager() {
  const { agentRunning, setAgentRunning, provider, channel, selectedTemplates, setScreen } = useSetupStore()
  const [statusDetail, setStatusDetail] = useState('Checking...')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uptime, setUptime] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
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

  const handleRestart = useCallback(async () => {
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
  }, [setAgentRunning])

  return (
    <div className="flex flex-col min-h-full animate-in px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-float">🦞</div>
          <div>
            <h1 className="text-2xl font-bold font-mono">
              <span className="glitch-text text-claw" data-text="OPENCLAW">OPENCLAW</span>
              <span className="text-muted"> COMMAND CENTER</span>
            </h1>
            <div className="text-xs font-mono text-muted">
              Agent Control Interface v1.0.0-beta
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

      {/* Tabs */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <StatusIndicator running={agentRunning} uptime={uptime} />

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

          <ApiUsagePanel />

          <ControlPanel
            running={agentRunning}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            onRefresh={checkStatus}
            loading={actionLoading}
            error={error}
          />

          <LogsViewer maxLines={10} />

          <QuickActions channel={channel} onNavigate={setScreen} />
        </>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <>
          <StatusIndicator running={agentRunning} uptime={uptime} />
          <div className="mt-6">
            <LogsViewer maxLines={50} />
          </div>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <>
          <QuickSettingsPanel
            provider={provider}
            channel={channel}
            onRestart={handleRestart}
          />

          <div className="terminal-card p-5 rounded-xl mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🛠️</span>
              <h3 className="font-bold font-mono text-lg text-claw">ADVANCED</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScreen('provider')}
                className="terminal-card p-4 rounded-xl text-left transition-all duration-300 hover:border-cyan/50 hover:bg-cyan/10 interactive-glow"
              >
                <span className="text-2xl">🧠</span>
                <div className="font-bold font-mono text-sm mt-2 mb-1">PROVIDER SETUP</div>
                <div className="text-xs text-muted font-mono">Change AI provider and model</div>
              </button>
              <button
                onClick={() => setScreen('templates')}
                className="terminal-card p-4 rounded-xl text-left transition-all duration-300 hover:border-claw/50 hover:bg-claw/10 interactive-glow"
              >
                <span className="text-2xl">🛒</span>
                <div className="font-bold font-mono text-sm mt-2 mb-1">SKILL MARKETPLACE</div>
                <div className="text-xs text-muted font-mono">Browse and install capabilities</div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="text-center pt-6 border-t border-border mt-auto">
        <div className="text-xs text-muted font-mono space-y-1">
          <div>OpenClaw Launcher. Digital assistant deployment platform</div>
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
