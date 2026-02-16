import { Screen, useSetupStore } from '../stores/setup-store'

const steps: { id: Screen; label: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'system-check', label: 'System' },
  { id: 'provider', label: 'AI Provider' },
  { id: 'channel', label: 'Channel' },
  { id: 'templates', label: 'Templates' },
  { id: 'complete', label: 'Done' },
]

const idx = (s: Screen) => steps.findIndex((st) => st.id === s)

export default function StepIndicator() {
  const screen = useSetupStore((s) => s.screen)
  if (screen === 'manager') return null
  const current = idx(screen)

  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              i < current
                ? 'bg-coral text-white'
                : i === current
                ? 'bg-coral text-white pulse-glow'
                : 'bg-surface text-muted border border-border'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 transition-all duration-300 ${i < current ? 'bg-coral' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
