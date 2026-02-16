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
    <div className="relative px-6 py-3 border-b border-claw/20">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="terminal-text text-xs">
          <span className="text-claw">LEVEL {current + 1}</span>
          <span className="text-muted"> / {steps.length}</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-terminal-green">
            {steps[current]?.description || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar progress={progress} />
      
      {/* Compact step icons */}
      <div className="relative mt-3 mb-2">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const isCompleted = i < current
            const isActive = i === current
            
            return (
              <div
                key={step.id}
                className={`relative z-10 flex flex-col items-center transition-all duration-300 ${
                  isActive ? 'transform scale-105' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-claw to-claw-dark text-white border-claw shadow-md shadow-claw/30'
                      : isActive
                      ? 'bg-gradient-to-br from-cyan to-pixel-blue text-white border-cyan shadow-md shadow-cyan/30 animate-pulse-glow'
                      : 'bg-surface text-muted border-border'
                  }`}
                >
                  {isCompleted ? '✓' : step.emoji}
                </div>
                <div className={`mt-1 text-center text-[9px] font-mono font-bold ${
                  isActive ? 'text-cyan' : isCompleted ? 'text-claw' : 'text-muted'
                }`}>
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Track line */}
        <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-border -z-20" />
      </div>

      {/* Status line */}
      <div className="flex justify-between items-center text-[10px] font-mono">
        <div className="text-muted terminal-prompt">
          {current === 0 && 'Warming up the neural networks...'}
          {current === 1 && 'Checking system compatibility...'}
          {current === 2 && 'Establishing AI connection...'}
          {current === 3 && 'Configuring communication channel...'}
          {current === 4 && 'Loading personality modules...'}
          {current === 5 && 'Agent initialization complete!'}
        </div>
        <div className="text-claw">
          {Math.round(progress)}% COMPLETE
        </div>
      </div>
    </div>
  )
}