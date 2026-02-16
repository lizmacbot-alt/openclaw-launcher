import { useSetupStore } from '../stores/setup-store'

const freeTemplates = [
  { id: 'starter', emoji: '⭐', name: 'The Starter', desc: 'A clean, general-purpose agent', price: 'FREE' },
  { id: 'note-taker', emoji: '📝', name: 'The Note Taker', desc: 'Captures and organizes everything', price: 'FREE' },
]

const premiumTemplates = [
  { id: 'freelancer', emoji: '🚀', name: 'The Freelancer', desc: 'Invoice, track time, manage clients', price: '$14.99' },
  { id: 'content-machine', emoji: '📣', name: 'The Content Machine', desc: 'Research, write, schedule, optimize', price: '$14.99' },
  { id: 'dev-buddy', emoji: '💻', name: 'The Dev Buddy', desc: 'Code review, debugging, CI monitoring', price: '$14.99' },
  { id: 'exec-assistant', emoji: '👔', name: 'The Executive Assistant', desc: 'Calendar, email triage, meeting prep', price: '$19.99' },
  { id: 'sales-rep', emoji: '💰', name: 'The Sales Rep', desc: 'Pipeline, outreach, deal management', price: '$19.99' },
]

function TemplateCard({ id, emoji, name, desc, price }: { id: string; emoji: string; name: string; desc: string; price: string }) {
  const { selectedTemplates, toggleTemplate } = useSetupStore()
  const selected = selectedTemplates.includes(id)
  const isPremium = price !== 'FREE'

  return (
    <button
      onClick={() => toggleTemplate(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01] ${
        selected ? 'border-coral bg-coral/10 shadow-lg shadow-coral/10' : 'border-border bg-surface hover:border-white/20'
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs text-muted mt-0.5">{desc}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-semibold ${isPremium ? 'text-coral' : 'text-success'}`}>{price}</span>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          selected ? 'bg-coral border-coral text-white' : 'border-border'
        }`}>
          {selected && <span className="text-xs">✓</span>}
        </div>
      </div>
    </button>
  )
}

export default function TemplateMarketplace() {
  const setScreen = useSetupStore((s) => s.setScreen)

  return (
    <div className="flex flex-col h-full animate-in px-8 py-4 overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">Choose a personality</h2>
        <p className="text-muted text-sm">Pick templates for your agent</p>
      </div>

      <div className="w-full max-w-lg mx-auto space-y-6 flex-1">
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Free Templates</h3>
          <div className="space-y-2">
            {freeTemplates.map((t) => <TemplateCard key={t.id} {...t} />)}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Premium Templates</h3>
          <div className="space-y-2">
            {premiumTemplates.map((t) => <TemplateCard key={t.id} {...t} />)}
          </div>
        </div>

        <button className="w-full p-4 rounded-xl border-2 border-dashed border-coral/50 bg-coral/5 hover:bg-coral/10 transition-all text-center group">
          <div className="text-lg font-bold text-coral group-hover:scale-105 transition-transform">🔓 Unlock All Premium — $49.99</div>
          <div className="text-xs text-muted mt-1">Save 40% vs buying individually</div>
        </button>
      </div>

      <div className="flex gap-3 justify-center pt-6">
        <button onClick={() => setScreen('channel')} className="px-6 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">← Back</button>
        <button
          onClick={() => setScreen('complete')}
          className="bg-coral hover:bg-coral-hover text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
        >
          Finish Setup →
        </button>
      </div>
    </div>
  )
}
