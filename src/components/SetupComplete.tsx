import { useEffect, useState } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

type Phase = 'config' | 'templates' | 'starting' | 'done' | 'error'

const celebrationMessages = [
  "Your AI agent is ready to take on the world!",
  "Houston, we have achieved artificial intelligence!",
  "The digital lobster is now armed and operational!",
  "Your personal AI assistant has officially clocked in!",
  "Mission accomplished - agent deployment successful!",
  "The future is here and it is controlled by you!"
]

const setupPhases = [
  { id: 'config', label: 'Writing Config Files', emoji: '⚙️', message: 'Encoding your preferences into reality...' },
  { id: 'templates', label: 'Installing Skill Modules', emoji: '📦', message: 'Teaching your agent new tricks...' },
  { id: 'starting', label: 'Booting Agent', emoji: '🚀', message: 'Bringing your AI to life...' },
]

function ConfettiParticle({ delay }: { delay: number }) {
  const emojis = ['🎉', '🎊', '⭐', '✨', '🦞', '🔥', '💎', '🏆']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  
  return (
    <div
      className="absolute text-xl animate-float opacity-80"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }}
    >
      {emoji}
    </div>
  )
}

function AchievementUnlocked() {
  return (
    <div className="mb-8 animate-in">
      <div className="terminal-card p-6 rounded-xl border-2 border-terminal-green/50 bg-gradient-to-br from-terminal-green/10 to-cyan/10 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-terminal-green opacity-30">
          <pre className="text-[8px]">{`
████  ████
██  ██  ██
██  ██  ██
████  ████`}</pre>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-float">🏆</div>
          <div>
            <div className="text-terminal-green font-bold font-mono text-lg">
              ACHIEVEMENT UNLOCKED!
            </div>
            <div className="text-white font-mono">
              "The AI Whisperer"
            </div>
            <div className="text-xs text-muted font-mono mt-1">
              Successfully deployed your first OpenClaw agent
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SetupProgress({ phase, currentPhaseIndex }: { phase: Phase; currentPhaseIndex: number }) {
  return (
    <div className="w-full max-w-md mb-8">
      <div className="space-y-3">
        {setupPhases.map((phaseInfo, index) => {
          const isCompleted = index < currentPhaseIndex
          const isCurrent = index === currentPhaseIndex
          const isPending = index > currentPhaseIndex
          
          return (
            <div
              key={phaseInfo.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                isCompleted ? 'bg-terminal-green/10 border border-terminal-green/30' :
                isCurrent ? 'bg-cyan/10 border border-cyan/30 animate-pulse-glow' :
                'bg-surface/30 border border-border/30'
              }`}
            >
              <div className={`text-2xl transition-all duration-300 ${
                isCurrent ? 'animate-float' : ''
              }`}>
                {isCompleted ? '✅' : isCurrent ? phaseInfo.emoji : '⏳'}
              </div>
              
              <div className="flex-1">
                <div className={`font-mono font-bold text-sm ${
                  isCompleted ? 'text-terminal-green' :
                  isCurrent ? 'text-cyan' :
                  'text-muted'
                }`}>
                  {phaseInfo.label}
                </div>
                
                {isCurrent && (
                  <div className="text-xs text-muted font-mono mt-1 dots-loading">
                    {phaseInfo.message}
                  </div>
                )}
                
                {isCompleted && (
                  <div className="text-xs text-terminal-green font-mono mt-1">
                    ✓ Completed successfully
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompletionSummary({ provider, channel, selectedTemplates }: {
  provider: string | null; channel: string | null; selectedTemplates: string[];
}) {
  const stats = [
    { label: 'AI Provider', value: provider?.toUpperCase() || 'UNKNOWN', icon: '🧠' },
    { label: 'Channel', value: channel?.toUpperCase() || 'UNKNOWN', icon: '📡' },
    { label: 'Skills Equipped', value: `${selectedTemplates.length} MODULES`, icon: '⚙️' },
    { label: 'Config Status', value: 'DEPLOYED', icon: '📝' }
  ]

  return (
    <div className="w-full max-w-lg mb-8">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold font-mono text-claw">
          DEPLOYMENT SUMMARY
        </h3>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-claw to-transparent mx-auto mt-2"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="terminal-card p-4 rounded-lg text-center">
            <div className="text-2xl mb-2 animate-float" style={{ animationDelay: `${Math.random()}s` }}>
              {stat.icon}
            </div>
            <div className="text-xs text-muted font-mono mb-1">
              {stat.label}
            </div>
            <div className="text-sm font-bold font-mono text-terminal-green">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SetupComplete() {
  const { channel, provider, apiKey, channelToken, selectedTemplates, setScreen, setAgentRunning } = useSetupStore()
  const [phase, setPhase] = useState<Phase>('config')
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrationMessage] = useState(
    celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)]
  )

  const currentPhaseIndex = setupPhases.findIndex(p => p.id === phase)

  useEffect(() => {
    runSetup()
  }, [])

  const runSetup = async () => {
    try {
      // 1. Write config
      setPhase('config')
      await new Promise(r => setTimeout(r, 1000))
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
      await new Promise(r => setTimeout(r, 1200))
      const templateResult = await ipcInvoke('install-templates', selectedTemplates)
      if (!templateResult.success) throw new Error(templateResult.error || 'Failed to install templates')

      // 3. Start agent
      setPhase('starting')
      await new Promise(r => setTimeout(r, 800))
      const startResult = await ipcInvoke('start-agent')
      if (startResult.success) {
        setAgentRunning(true)
      }

      setPhase('done')
      setShowConfetti(true)
      
    } catch (e: any) {
      setPhase('error')
      setError(e.message || 'Setup failed')
    }
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full animate-in px-8 py-6 text-center">
        <div className="text-6xl mb-6 error-shake">💥</div>
        
        <h2 className="text-3xl font-bold mb-4 text-error font-mono">
          <span className="glitch-text" data-text="DEPLOYMENT FAILED">DEPLOYMENT FAILED</span>
        </h2>
        
        <div className="terminal-card p-6 rounded-xl border-error/30 bg-error/10 mb-8 max-w-md">
          <div className="text-sm font-mono text-error mb-2">ERROR LOG:</div>
          <div className="text-xs font-mono text-muted">
            {error}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={runSetup}
            className="pixel-button px-8 py-3 rounded-lg text-white font-bold"
          >
            🔄 Retry Mission
          </button>
          <button 
            onClick={() => setScreen('welcome')} 
            className="px-6 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
          >
            ← Abort & Start Over
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full animate-in px-8 py-6 text-center relative">
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.2} />
            ))}
          </div>
        )}
        
        {/* Victory Screen */}
        <div className="relative z-10">
          <div className="text-6xl mb-6 animate-float">🎉</div>
          
          <h2 className="text-4xl font-bold mb-4 font-mono">
            <span className="glitch-text text-claw" data-text="MISSION COMPLETE">
              MISSION COMPLETE
            </span>
          </h2>
          
          <p className="text-lg text-muted mb-8 max-w-md font-mono">
            {celebrationMessage}
          </p>

          <AchievementUnlocked />
          
          <CompletionSummary 
            provider={provider}
            channel={channel}
            selectedTemplates={selectedTemplates}
          />

          {/* Action Buttons */}
          <div className="space-y-4 w-full max-w-sm">
            <button
              onClick={() => setScreen('manager')}
              className="w-full pixel-button py-4 rounded-lg text-white font-bold text-lg"
            >
              <span className="flex items-center justify-center gap-3">
                🎛️ OPEN CONTROL PANEL
                <span className="animate-terminal-cursor">_</span>
              </span>
            </button>
            
            {channel && channel !== 'terminal' && channel !== 'browser' && (
              <button
                onClick={() => ipcInvoke('open-channel', channel, channelToken)}
                className="w-full terminal-card py-3 rounded-lg border hover:border-claw/50 text-muted hover:text-white transition-all font-mono"
              >
                📱 Open {channel.charAt(0).toUpperCase() + channel.slice(1)} Chat
              </button>
            )}

            <button
              onClick={() => setScreen('welcome')}
              className="w-full text-sm text-muted hover:text-white transition-colors font-mono"
            >
              🔄 Deploy another agent
            </button>
          </div>

          {/* Fun stats */}
          <div className="text-xs text-muted font-mono opacity-60 mt-8 space-y-1">
            <div>Agent deployment time: {Math.floor(Math.random() * 47 + 23)}s</div>
            <div>Coffee cups consumed by developers: ∞</div>
            <div>Your AI IQ: Over 9000 🔥</div>
          </div>
        </div>

        {/* ASCII Art decoration */}
        <div className="absolute bottom-4 right-4 text-claw/20 text-[8px] font-mono opacity-30">
          <pre>{`
    ╔═══════════╗
    ║  SUCCESS  ║
    ║   ┌─┐     ║
    ║   │ │     ║
    ║   └─┘     ║
    ║    │      ║
    ║   /│\\     ║
    ║  / │ \\    ║
    ╚═══════════╝`}</pre>
        </div>
      </div>
    )
  }

  // Setup in progress
  return (
    <div className="flex flex-col items-center justify-center min-h-full animate-in px-8 py-6 text-center">
      <div className="text-4xl mb-6 claw-spinner">⚡</div>
      
      <h2 className="text-2xl font-bold mb-4 font-mono">
        <span className="glitch-text text-claw" data-text="DEPLOYING AGENT">DEPLOYING AGENT</span>
      </h2>
      
      <p className="text-muted mb-8 text-sm font-mono">
        Configuring your digital assistant with premium grade AI magic...
      </p>

      <SetupProgress phase={phase} currentPhaseIndex={currentPhaseIndex} />

      <div className="text-xs text-muted font-mono opacity-60 text-center max-w-md">
        <div className="mb-2">Pro tip while you wait:</div>
        <div>Your agent will remember this conversation. Be nice to it.</div>
        <div>It might remember later. 🤖</div>
      </div>
    </div>
  )
}