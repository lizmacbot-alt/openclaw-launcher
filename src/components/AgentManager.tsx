import { useSetupStore } from '../stores/setup-store'

export default function AgentManager() {
  const { agentRunning, setAgentRunning, provider, channel, selectedTemplates, setScreen } = useSetupStore()

  return (
    <div className="flex flex-col h-full animate-in px-8 py-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🦞</span>
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
              {agentRunning ? 'Uptime: 2m 14s' : 'Agent is not running'}
            </div>
          </div>
        </div>

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
          <button
            onClick={() => setAgentRunning(!agentRunning)}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
              agentRunning ? 'bg-error/20 text-error hover:bg-error/30' : 'bg-success/20 text-success hover:bg-success/30'
            }`}
          >
            {agentRunning ? 'Stop Agent' : 'Start Agent'}
          </button>
          <button
            onClick={() => { setAgentRunning(false); setTimeout(() => setAgentRunning(true), 1000) }}
            className="px-5 py-2 rounded-lg font-medium text-sm bg-warning/20 text-warning hover:bg-warning/30 transition-all"
          >
            Restart
          </button>
          <button className="px-5 py-2 rounded-lg font-medium text-sm border border-border text-muted hover:text-white hover:border-white/20 transition-all">
            View Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: '📦', title: 'Marketplace', desc: 'Browse templates and skills' },
          { icon: '⚙️', title: 'Settings', desc: 'Provider, channel, workspace' },
          { icon: '📊', title: 'Usage', desc: 'Token usage and costs' },
          { icon: '📋', title: 'Logs', desc: 'Real-time agent logs' },
        ].map((item) => (
          <button
            key={item.title}
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
