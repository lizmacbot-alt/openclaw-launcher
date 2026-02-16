import { useState, useEffect } from 'react'
import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

const PRODUCT_IDS: Record<string, string> = {
  freelancer: 'pelgup',
  'content-machine': 'itrekp',
  'dev-buddy': 'gqxlhq',
  'exec-assistant': 'zozuc',
  'sales-rep': 'zklmgo',
}

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

function LicenseModal({ templateId, templateName, onClose, onVerified }: {
  templateId: string; templateName: string; onClose: () => void; onVerified: () => void
}) {
  const [key, setKey] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = async () => {
    setVerifying(true)
    setError(null)
    const productId = PRODUCT_IDS[templateId]
    if (!productId) { setError('Unknown template'); setVerifying(false); return }
    try {
      const result = await ipcInvoke('verify-gumroad-license', productId, key)
      if (result.valid) {
        onVerified()
      } else {
        setError(result.error || 'Invalid license key')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1">Unlock {templateName}</h3>
        <p className="text-sm text-muted mb-4">Enter your Gumroad license key to activate this template.</p>
        <input
          type="text"
          placeholder="License key..."
          value={key}
          onChange={e => { setKey(e.target.value); setError(null) }}
          onKeyDown={e => e.key === 'Enter' && key && verify()}
          className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-coral transition-colors font-mono mb-3"
          autoFocus
        />
        {error && <div className="text-error text-xs mb-3">❌ {error}</div>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white transition-colors">Cancel</button>
          <button
            onClick={verify}
            disabled={!key || verifying}
            className="bg-coral hover:bg-coral-hover disabled:bg-surface disabled:text-muted text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            {verifying ? 'Verifying...' : 'Activate'}
          </button>
        </div>
        <p className="text-xs text-muted mt-3 text-center">
          Don't have a key? <button onClick={() => ipcInvoke('open-external', 'https://openclaw.gumroad.com')} className="text-coral hover:text-coral-hover">Buy on Gumroad →</button>
        </p>
      </div>
    </div>
  )
}

function TemplateCard({ id, emoji, name, desc, price, licenses, onLicenseNeeded }: {
  id: string; emoji: string; name: string; desc: string; price: string
  licenses: Record<string, any>; onLicenseNeeded: (id: string, name: string) => void
}) {
  const { selectedTemplates, toggleTemplate } = useSetupStore()
  const selected = selectedTemplates.includes(id)
  const isPremium = price !== 'FREE'
  const isUnlocked = !isPremium || !!licenses[PRODUCT_IDS[id]]

  const handleClick = () => {
    if (isPremium && !isUnlocked) {
      onLicenseNeeded(id, name)
    } else {
      toggleTemplate(id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01] ${
        selected ? 'border-coral bg-coral/10 shadow-lg shadow-coral/10' : 'border-border bg-surface hover:border-white/20'
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm flex items-center gap-2">
          {name}
          {isPremium && !isUnlocked && <span className="text-[10px] bg-coral/20 text-coral px-1.5 py-0.5 rounded-full">🔒 Premium</span>}
          {isPremium && isUnlocked && <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded-full">✓ Unlocked</span>}
        </div>
        <div className="text-xs text-muted mt-0.5">{desc}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-semibold ${isPremium && !isUnlocked ? 'text-coral' : 'text-success'}`}>
          {isPremium && !isUnlocked ? price : 'FREE'}
        </span>
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
  const [licenses, setLicenses] = useState<Record<string, any>>({})
  const [licenseModal, setLicenseModal] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    ipcInvoke('get-licenses').then(setLicenses).catch(() => {})
  }, [])

  const handleLicenseVerified = () => {
    setLicenseModal(null)
    ipcInvoke('get-licenses').then(setLicenses).catch(() => {})
  }

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
            {freeTemplates.map((t) => <TemplateCard key={t.id} {...t} licenses={licenses} onLicenseNeeded={(id, name) => setLicenseModal({ id, name })} />)}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Premium Templates</h3>
          <div className="space-y-2">
            {premiumTemplates.map((t) => <TemplateCard key={t.id} {...t} licenses={licenses} onLicenseNeeded={(id, name) => setLicenseModal({ id, name })} />)}
          </div>
        </div>

        <button
          onClick={() => ipcInvoke('open-external', 'https://openclaw.gumroad.com')}
          className="w-full p-4 rounded-xl border-2 border-dashed border-coral/50 bg-coral/5 hover:bg-coral/10 transition-all text-center group"
        >
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

      {licenseModal && (
        <LicenseModal
          templateId={licenseModal.id}
          templateName={licenseModal.name}
          onClose={() => setLicenseModal(null)}
          onVerified={handleLicenseVerified}
        />
      )}
    </div>
  )
}
