declare const __APP_VERSION__: string
import { useSetupStore } from './stores/setup-store'
import StepIndicator from './components/StepIndicator'
import Welcome from './components/Welcome'
import SystemCheck from './components/SystemCheck'
import ProviderSelect from './components/ProviderSelect'
import ChannelSetup from './components/ChannelSetup'
import TemplateMarketplace from './components/TemplateMarketplace'
import SetupComplete from './components/SetupComplete'
import AgentManager from './components/AgentManager'
import { useEffect, useState } from 'react'

const screens: Record<string, React.FC> = {
  welcome: Welcome,
  'system-check': SystemCheck,
  provider: ProviderSelect,
  channel: ChannelSetup,
  templates: TemplateMarketplace,
  complete: SetupComplete,
  manager: AgentManager,
}

function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([])
  
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  )
}

function VersionBadge() {
  return (
    <div className="version-badge">
      OpenClaw Launcher v{__APP_VERSION__}
    </div>
  )
}

export default function App() {
  const screen = useSetupStore((s) => s.screen)
  const Screen = screens[screen] || Welcome

  return (
    <div className="h-screen flex flex-col crt-screen terminal-grid text-white relative">
      <ParticleBackground />
      
      {/* Title bar spacer (draggable for window move) */}
      <div className="h-8 shrink-0 bg-gradient-to-r from-bg via-surface to-bg opacity-80 titlebar-drag" />
      
      {/* Step indicator (fixed at top) */}
      <div className="shrink-0 relative z-10">
        <StepIndicator />
      </div>

      {/* Main content (scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10">
        <Screen />
      </div>
      
      <VersionBadge />
    </div>
  )
}
