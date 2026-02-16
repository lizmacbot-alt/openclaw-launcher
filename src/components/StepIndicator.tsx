import { Screen, useSetupStore } from '../stores/setup-store'
import { useState, useEffect } from 'react'

const steps: { id: Screen; label: string; emoji: string; description: string }[] = [
  { id: 'welcome', label: 'BOOT', emoji: '⚡', description: 'System Initialize' },
  { id: 'system-check', label: 'SCAN', emoji: '🔍', description: 'Environment Check' },
  { id: 'provider', label: 'BRAIN', emoji: '🧠', description: 'AI Connection' },
  { id: 'channel', label: 'COMM', emoji: '📡', description: 'Channel Setup' },
  { id: 'templates', label: 'GEAR', emoji: '⚙️', description: 'Skill Loading' },
  { id: 'complete', label: 'LIVE', emoji: '🎉', description: 'Agent Online' },
]

const idx = (s: Screen) => steps.findIndex((st) => st.id === s)

// Mini lobster for walking animation
function WalkingLobster({ position, isActive }: { position: number; isActive: boolean }) {
  return (
    <div 
      className={`absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out ${isActive ? 'animate-float' : ''}`}
      style={{ left: `${position}%` }}
    >
      <svg width="24" height="16" viewBox="0 0 24 16" className="drop-shadow-lg">
        {/* Mini lobster body */}
        <ellipse cx="12" cy="8" rx="6" ry="3" fill="url(#miniBodyGradient)" />
        {/* Eyes */}
        <circle cx="10" cy="6" r="1" fill="#050810" />
        <circle cx="14" cy="6" r="1" fill="#050810" />
        <circle cx="10" cy="5.5" r="0.5" fill="#00e5cc" />
        <circle cx="14" cy="5.5" r="0.5" fill="#00e5cc" />
        {/* Tiny claws */}
        <ellipse cx="6" cy="8" rx="2" ry="1" fill="#ff6666" />
        <ellipse cx="18" cy="8" rx="2" ry="1" fill="#ff6666" />
        {/* Tail */}
        <ellipse cx="12" cy="11" rx="4" ry="1.5" fill="#cc3333" />
        
        <defs>
          <linearGradient id="miniBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-claw/30">
      <div 
        className="h-full bg-gradient-to-r from-claw to-cyan transition-all duration-700 ease-out terminal-progress"
        style={{ width: `${progress}%`, '--progress': `${progress}%` } as any}
      />
    </div>
  )
}

export default function StepIndicator() {
  const screen = useSetupStore((s) => s.screen)
  if (screen === 'manager') return null
  
  const current = idx(screen)
  const progress = ((current + 1) / steps.length) * 100
  const lobsterPosition = (current / (steps.length - 1)) * 85 + 7.5 // 7.5% to 92.5%

  return (
    <div className="relative px-8 py-6 border-b border-claw/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="terminal-text text-sm">
          <span className="text-claw">LEVEL {current + 1}</span>
          <span className="text-muted"> / {steps.length}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted font-mono">CURRENT OBJECTIVE</div>
          <div className="text-sm font-bold text-terminal-green">
            {steps[current]?.description || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar progress={progress} />
      
      {/* Step track with lobster */}
      <div className="relative mt-6 mb-4">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const isCompleted = i < current
            const isActive = i === current
            const isFuture = i > current
            
            return (
              <div
                key={step.id}
                className={`relative z-10 flex flex-col items-center transition-all duration-300 ${
                  isActive ? 'transform scale-110' : ''
                }`}
              >
                {/* Step node */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-claw to-claw-dark text-white border-claw shadow-lg shadow-claw/30'
                      : isActive
                      ? 'bg-gradient-to-br from-cyan to-pixel-blue text-white border-cyan shadow-lg shadow-cyan/30 animate-pulse-glow'
                      : 'bg-surface text-muted border-border hover:border-claw/50'
                  }`}
                >
                  {isCompleted ? (
                    <span className="success-check">✓</span>
                  ) : isActive ? (
                    <span className="animate-pulse">{step.emoji}</span>
                  ) : (
                    step.emoji
                  )}
                </div>
                
                {/* Step label */}
                <div className="mt-2 text-center">
                  <div className={`text-xs font-bold font-mono ${
                    isActive ? 'text-cyan' : isCompleted ? 'text-claw' : 'text-muted'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-[10px] font-mono ${
                    isActive ? 'text-white' : 'text-muted'
                  }`}>
                    {step.description.split(' ').map(word => word.slice(0, 4)).join(' ')}
                  </div>
                </div>
                
                {/* Connection line to next step */}
                {i < steps.length - 1 && (
                  <div className="absolute top-6 left-12 w-16 h-0.5 -z-10">
                    <div className={`h-full transition-all duration-500 ${
                      i < current ? 'bg-gradient-to-r from-claw to-claw-dark' : 'bg-border'
                    }`} />
                    {/* Animated data flow */}
                    {i < current && (
                      <div className="absolute top-0 left-0 w-2 h-full bg-cyan opacity-80 animate-pulse" 
                           style={{ animationDelay: `${i * 0.2}s` }} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Walking lobster */}
        <WalkingLobster position={lobsterPosition} isActive={true} />
        
        {/* Track line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-20" />
      </div>

      {/* Fun status messages */}
      <div className="flex justify-between items-center text-xs font-mono">
        <div className="text-muted">
          {current === 0 && <span className="terminal-prompt">Warming up the neural networks...</span>}
          {current === 1 && <span className="terminal-prompt">Checking system compatibility...</span>}
          {current === 2 && <span className="terminal-prompt">Establishing AI connection...</span>}
          {current === 3 && <span className="terminal-prompt">Configuring communication channel...</span>}
          {current === 4 && <span className="terminal-prompt">Loading personality modules...</span>}
          {current === 5 && <span className="terminal-prompt">Agent initialization complete!</span>}
        </div>
        <div className="text-claw">
          {Math.round(progress)}% COMPLETE
        </div>
      </div>

      {/* ASCII decoration */}
      {current >= 3 && (
        <div className="absolute top-2 right-4 text-claw/20 text-[8px] font-mono animate-pulse">
          <pre>{`  ████
 ██████
██ ██ ██
 ██████
  ████`}</pre>
        </div>
      )}
    </div>
  )
}