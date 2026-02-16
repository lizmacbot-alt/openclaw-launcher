import { useSetupStore } from './stores/setup-store'
import StepIndicator from './components/StepIndicator'
import Welcome from './components/Welcome'
import SystemCheck from './components/SystemCheck'
import ProviderSelect from './components/ProviderSelect'
import ChannelSetup from './components/ChannelSetup'
import TemplateMarketplace from './components/TemplateMarketplace'
import SetupComplete from './components/SetupComplete'
import AgentManager from './components/AgentManager'

const screens: Record<string, React.FC> = {
  welcome: Welcome,
  'system-check': SystemCheck,
  provider: ProviderSelect,
  channel: ChannelSetup,
  templates: TemplateMarketplace,
  complete: SetupComplete,
  manager: AgentManager,
}

export default function App() {
  const screen = useSetupStore((s) => s.screen)
  const Screen = screens[screen] || Welcome

  return (
    <div className="h-screen flex flex-col bg-bg text-white">
      <div className="h-8 shrink-0" />
      <StepIndicator />
      <div className="flex-1 min-h-0">
        <Screen />
      </div>
    </div>
  )
}
