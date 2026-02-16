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

// Special "Start Fresh" option
const startFreshTemplate = {
  id: 'start-fresh',
  emoji: '🌱',
  name: 'Start Fresh',
  desc: 'A minimal agent - you build the skills yourself',
  price: 'FREE',
  category: 'base'
}

const freeTemplates = [
  { id: 'starter', emoji: '⭐', name: 'The Generalist', desc: 'Well-rounded, ready for anything', price: 'FREE', category: 'foundation' },
  { id: 'note-taker', emoji: '📝', name: 'The Archivist', desc: 'Captures, organizes, remembers everything', price: 'FREE', category: 'foundation' },
]

const premiumTemplates = [
  { id: 'freelancer', emoji: '🚀', name: 'The Freelancer', desc: 'Invoice tracking, time management, client relations', price: '$14.99', category: 'business', skills: ['Invoicing', 'Time Tracking', 'Client Management'] },
  { id: 'content-machine', emoji: '📣', name: 'The Content Machine', desc: 'Research, write, schedule, optimize content', price: '$14.99', category: 'marketing', skills: ['Content Writing', 'SEO Research', 'Social Scheduling'] },
  { id: 'dev-buddy', emoji: '💻', name: 'The Dev Buddy', desc: 'Code review, debugging, CI/CD monitoring', price: '$14.99', category: 'development', skills: ['Code Review', 'Bug Tracking', 'Deploy Monitoring'] },
  { id: 'exec-assistant', emoji: '👔', name: 'The Executive', desc: 'Calendar management, email triage, meeting prep', price: '$19.99', category: 'executive', skills: ['Calendar Sync', 'Email Processing', 'Meeting Notes'] },
  { id: 'sales-rep', emoji: '💰', name: 'The Sales Rep', desc: 'Pipeline management, outreach, deal tracking', price: '$19.99', category: 'sales', skills: ['CRM Integration', 'Lead Scoring', 'Follow-up Automation'] },
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in" onClick={onClose}>
      <div className="terminal-card p-8 w-full max-w-md mx-4 rounded-xl border-2" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">🔓</div>
          <h3 className="text-xl font-bold text-claw mb-2">Unlock {templateName}</h3>
          <p className="text-sm text-muted">Enter your Gumroad license key to equip this skillset.</p>
        </div>
        
        <div className="terminal-input-wrapper mb-4">
          <input
            type="text"
            placeholder="LICENSE-KEY-GOES-HERE"
            value={key}
            onChange={e => { setKey(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && key && verify()}
            className="terminal-input w-full px-4 py-3 rounded-lg text-center text-lg font-mono uppercase tracking-wider"
            autoFocus
          />
        </div>
        
        {error && (
          <div className="text-error text-sm mb-4 text-center p-3 bg-error/10 border border-error/30 rounded-lg font-mono">
            <span className="error-shake inline-block">⚠️</span> {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
          >
            Cancel
          </button>
          <button
            onClick={verify}
            disabled={!key || verifying}
            className="flex-1 pixel-button px-4 py-3 rounded-lg text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span> Verifying...
              </span>
            ) : (
              'Activate Skill'
            )}
          </button>
        </div>
        
        <div className="text-center mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted mb-2">Don't have a key?</p>
          <button 
            onClick={() => ipcInvoke('open-external', 'https://openclaw.gumroad.com')} 
            className="text-claw hover:text-claw-glow text-sm font-mono interactive-glow"
          >
            🛒 Buy on Gumroad →
          </button>
        </div>
      </div>
    </div>
  )
}

function SkillsetCard({ template, licenses, onLicenseNeeded, isStartFresh = false }: {
  template: any; licenses: Record<string, any>; onLicenseNeeded: (id: string, name: string) => void; isStartFresh?: boolean
}) {
  const { selectedTemplates, toggleTemplate } = useSetupStore()
  const selected = selectedTemplates.includes(template.id)
  const isPremium = template.price !== 'FREE'
  const isUnlocked = !isPremium || !!licenses[PRODUCT_IDS[template.id]]

  const handleClick = () => {
    if (isPremium && !isUnlocked) {
      onLicenseNeeded(template.id, template.name)
    } else {
      toggleTemplate(template.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full terminal-card p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.01] group ${
        selected ? 'border-claw bg-claw/10 shadow-lg shadow-claw/20' : 'border hover:border-claw/50'
      } ${isStartFresh ? 'border-dashed border-terminal-green/50 bg-terminal-green/5' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className={`text-3xl group-hover:animate-float ${selected ? 'animate-float' : ''}`}>
          {template.emoji}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-bold text-base font-mono">
              {template.name}
            </div>
            {isPremium && !isUnlocked && (
              <span className="text-[10px] bg-claw/20 text-claw px-2 py-1 rounded-full border border-claw/30 font-mono">
                🔒 PREMIUM
              </span>
            )}
            {isPremium && isUnlocked && (
              <span className="text-[10px] bg-terminal-green/20 text-terminal-green px-2 py-1 rounded-full border border-terminal-green/30 font-mono">
                ✓ UNLOCKED
              </span>
            )}
            {isStartFresh && (
              <span className="text-[10px] bg-terminal-green/20 text-terminal-green px-2 py-1 rounded-full border border-terminal-green/30 font-mono">
                🌱 MINIMAL
              </span>
            )}
          </div>
          
          <div className="text-sm text-muted mb-2 font-mono">
            {template.desc}
          </div>
          
          {template.skills && (
            <div className="flex flex-wrap gap-1">
              {template.skills.map((skill: string) => (
                <span key={skill} className="text-xs bg-cyan/10 text-cyan px-2 py-0.5 rounded border border-cyan/30 font-mono">
                  {skill}
                </span>
              ))}
            </div>
          )}
          
          {isStartFresh && (
            <div className="text-xs text-terminal-green font-mono mt-2">
              <span className="opacity-60">Recommended: </span>
              Pick at least one skillset to get started
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-sm font-bold font-mono ${
            isPremium && !isUnlocked ? 'text-claw' : 'text-terminal-green'
          }`}>
            {isPremium && !isUnlocked ? template.price : 'FREE'}
          </span>
          
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all font-mono text-xs ${
            selected 
              ? 'bg-claw border-claw text-white shadow-lg shadow-claw/50' 
              : 'border-border group-hover:border-claw/50'
          }`}>
            {selected && <span className="success-check">✓</span>}
          </div>
        </div>
      </div>
    </button>
  )
}

function SkillsCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6 p-4 terminal-card rounded-xl">
      <div className="text-2xl animate-float">⚙️</div>
      <div className="text-center">
        <div className="text-sm text-muted font-mono">SKILLS EQUIPPED</div>
        <div className={`text-2xl font-bold font-mono ${count > 0 ? 'text-claw' : 'text-muted'}`}>
          {count}
        </div>
      </div>
      <div className={`text-sm font-mono transition-all ${
        count > 0 ? 'text-terminal-green animate-pulse' : 'text-muted'
      }`}>
        {count === 0 && 'Choose wisely...'}
        {count === 1 && 'Getting started!'}
        {count === 2 && 'Building up...'}
        {count >= 3 && 'Powerhouse mode! 🚀'}
      </div>
    </div>
  )
}

export default function TemplateMarketplace() {
  const setScreen = useSetupStore((s) => s.setScreen)
  const { selectedTemplates } = useSetupStore()
  const [licenses, setLicenses] = useState<Record<string, any>>({})
  const [licenseModal, setLicenseModal] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    ipcInvoke('get-licenses').then(setLicenses).catch(() => {})
  }, [])

  const handleLicenseVerified = () => {
    setLicenseModal(null)
    ipcInvoke('get-licenses').then(setLicenses).catch(() => {})
  }

  const skillsCount = selectedTemplates.length

  return (
    <div className="flex flex-col h-full animate-in px-8 py-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-xs text-muted font-mono mb-2 tracking-wider">
          STEP 5: SKILL CONFIGURATION
        </div>
        <h2 className="text-3xl font-bold mb-2 font-mono">
          <span className="glitch-text text-claw" data-text="Build your agent's skillset">
            Build your agent's skillset
          </span>
        </h2>
        <p className="text-muted text-sm font-mono">
          Equip your AI with specialized abilities and personality modules
        </p>
      </div>

      {/* Skills counter */}
      <SkillsCounter count={skillsCount} />

      <div className="w-full max-w-2xl mx-auto space-y-6 flex-1">
        {/* Start Fresh Option */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-bold text-terminal-green uppercase tracking-wider font-mono">
              Minimal Setup
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-terminal-green/50 to-transparent" />
          </div>
          <SkillsetCard 
            template={startFreshTemplate} 
            licenses={licenses} 
            onLicenseNeeded={(id, name) => setLicenseModal({ id, name })} 
            isStartFresh={true}
          />
        </div>

        {/* Foundation Skills */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-bold text-cyan uppercase tracking-wider font-mono">
              Foundation Skills
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan/50 to-transparent" />
          </div>
          <div className="space-y-3">
            {freeTemplates.map((t) => (
              <SkillsetCard 
                key={t.id} 
                template={t} 
                licenses={licenses} 
                onLicenseNeeded={(id, name) => setLicenseModal({ id, name })} 
              />
            ))}
          </div>
        </div>

        {/* Premium Skillsets */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-bold text-claw uppercase tracking-wider font-mono">
              Professional Skillsets
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-claw/50 to-transparent" />
          </div>
          <div className="space-y-3">
            {premiumTemplates.map((t) => (
              <SkillsetCard 
                key={t.id} 
                template={t} 
                licenses={licenses} 
                onLicenseNeeded={(id, name) => setLicenseModal({ id, name })} 
              />
            ))}
          </div>
        </div>

        {/* Bundle Deal */}
        <div className="terminal-card p-6 rounded-xl border-2 border-dashed border-claw/50 bg-gradient-to-br from-claw/5 to-claw-dark/5 group hover:border-claw transition-all">
          <button
            onClick={() => ipcInvoke('open-external', 'https://openclaw.gumroad.com')}
            className="w-full text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-3xl animate-float">🎁</span>
              <div>
                <div className="text-xl font-bold text-claw group-hover:text-claw-glow font-mono">
                  COMPLETE SKILLSET BUNDLE
                </div>
                <div className="text-lg text-terminal-green font-mono">$49.99</div>
              </div>
              <span className="text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🚀</span>
            </div>
            <div className="text-sm text-muted mb-3 font-mono">
              All professional skillsets + future releases
            </div>
            <div className="text-xs text-claw font-mono">
              💰 Save 40% vs individual purchase • 🔓 Instant unlock
            </div>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-center pt-6 mt-6 border-t border-border">
        <button 
          onClick={() => setScreen('channel')} 
          className="px-6 py-3 rounded-lg border border-border text-muted hover:text-white hover:border-white/30 transition-all font-mono"
        >
          ← Previous
        </button>
        <button
          onClick={() => setScreen('complete')}
          className={`px-8 py-3 rounded-lg font-bold font-mono transition-all ${
            skillsCount > 0 
              ? 'pixel-button text-white' 
              : 'bg-surface text-muted cursor-not-allowed border border-border'
          }`}
          disabled={skillsCount === 0}
        >
          {skillsCount === 0 ? (
            'Select at least one skill →'
          ) : (
            `Deploy Agent with ${skillsCount} ${skillsCount === 1 ? 'Skill' : 'Skills'} →`
          )}
        </button>
      </div>

      {/* License Modal */}
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