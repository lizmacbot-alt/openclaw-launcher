import { useState, useEffect, useRef } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

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

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h > 0) return `${h}h ${m % 60}m`
    if (m > 0) return `${m}m ${s % 60}s`
    return `${s}s`
  }

  const handleStart = async () => {
    setActionLoading('start')
    setError(null)
    try {
      const result = await ipcInvoke('start-agent')
      if (result.success) {
        setAgentRunning(true)
        setStatusDetail('Running')
      } else {
        setError(result.error || 'Failed to start')
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
        setError(result.error || 'Failed to stop')
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
        setError(result.error || 'Failed to restart')
      }
    } catch (e: any) { setError(e.message) }
    finally { setActionLoading(null) }
  }

  return (
    <div className="flex flex-col h-full animate-in px-8 py-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <img src="./assets/openclaw-icon.png" alt="OpenClaw" className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-bold">OpenClaw Launcher</h1>
          <p className="text-xs text-muted">Agent Management</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`text-sm font-semibold ${agentRunning ? 'text-success' : 'text-error'}`}>
              {agentRunning ? '● Running' : '● Stopped'}
            </span>
            <div className="text-xs text-muted mt-1">
              {agentRunning ? `Uptime: ${formatUptime(uptime)}` : statusDetail}
            </div>
          </div>
          <button onClick={checkStatus} className="text-xs text-muted hover:text-white transition-colors">
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm mb-4">
          <div className="bg-bg rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Provider</div>
            <div className="capitalize font-medium">{provider || 'Anthropic'}</div>
          </div>
          <div className="bg-bg rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Channel</div>
            <div className="capitalize font-medium">{channel || 'Telegram'}</div>
          </div>
          <div className="bg-bg rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Templates</div>
            <div className="font-medium">{selectedTemplates.length} active</div>
          </div>
        </div>

        <div className="flex gap-2">
          {agentRunning ? (
            <button
              onClick={handleStop}
              disabled={actionLoading !== null}
              className="px-5 py-2 rounded-lg font-medium text-sm bg-error/20 text-error hover:bg-error/30 transition-all disabled:opacity-50"
            >
              {actionLoading === 'stop' ? 'Stopping...' : 'Stop Agent'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={actionLoading !== null}
              className="px-5 py-2 rounded-lg font-medium text-sm bg-success/20 text-success hover:bg-success/30 transition-all disabled:opacity-50"
            >
              {actionLoading === 'start' ? 'Starting...' : 'Start Agent'}
            </button>
          )}
          <button
            onClick={handleRestart}
            disabled={actionLoading !== null}
            className="px-5 py-2 rounded-lg font-medium text-sm bg-warning/20 text-warning hover:bg-warning/30 transition-all disabled:opacity-50"
          >
            {actionLoading === 'restart' ? 'Restarting...' : 'Restart'}
          </button>
          {channel && channel !== 'terminal' && channel !== 'browser' && (
            <button
              onClick={() => ipcInvoke('open-channel', channel)}
              className="px-5 py-2 rounded-lg font-medium text-sm border border-border text-muted hover:text-white hover:border-white/20 transition-all"
            >
              Open {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: '📦', title: 'Marketplace', desc: 'Browse templates and skills', action: () => setScreen('templates') },
          { icon: '⚙️', title: 'Settings', desc: 'Provider, channel, workspace', action: () => setScreen('provider') },
          { icon: '🌐', title: 'Dashboard', desc: 'Open web dashboard', action: () => ipcInvoke('open-external', 'http://localhost:18789') },
          { icon: '📋', title: 'Config', desc: '~/.openclaw/config.yaml', action: () => ipcInvoke('open-external', 'file://' + (process.env.HOME || '~') + '/.openclaw/config.yaml') },
        ].map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className="bg-surface border border-border rounded-xl p-4 text-left hover:border-coral/30 hover:bg-coral/5 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="font-semibold text-sm">{item.title}</div>
            <div className="text-xs text-muted">{item.desc}</div>
          </button>
        ))}
      </div>

      <button onClick={() => setScreen('welcome')} className="text-xs text-muted hover:text-coral transition-colors self-center">
        Run Setup Again
      </button>
    </div>
  )
}
