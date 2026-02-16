import { create } from 'zustand'

export type Screen = 'welcome' | 'system-check' | 'provider' | 'channel' | 'templates' | 'complete' | 'manager'

interface SetupState {
  screen: Screen
  provider: string | null
  apiKey: string
  apiKeyVerified: boolean
  channel: string | null
  channelToken: string
  selectedTemplates: string[]
  agentRunning: boolean
  setScreen: (s: Screen) => void
  setProvider: (p: string) => void
  setApiKey: (k: string) => void
  setApiKeyVerified: (v: boolean) => void
  setChannel: (c: string) => void
  setChannelToken: (t: string) => void
  toggleTemplate: (id: string) => void
  setAgentRunning: (r: boolean) => void
}

export const useSetupStore = create<SetupState>((set, get) => {
  if (typeof window !== 'undefined') {
    (window as any).__store = { get, set: (s: Partial<SetupState>) => set(s) }
  }
  return {
  screen: 'welcome',
  provider: null,
  apiKey: '',
  apiKeyVerified: false,
  channel: null,
  channelToken: '',
  selectedTemplates: ['starter'],
  agentRunning: false,
  setScreen: (screen) => set({ screen }),
  setProvider: (provider) => set({ provider, apiKey: '', apiKeyVerified: false }),
  setApiKey: (apiKey) => set({ apiKey }),
  setApiKeyVerified: (apiKeyVerified) => set({ apiKeyVerified }),
  setChannel: (channel) => set({ channel }),
  setChannelToken: (channelToken) => set({ channelToken }),
  toggleTemplate: (id) => set((s) => ({
    selectedTemplates: s.selectedTemplates.includes(id)
      ? s.selectedTemplates.filter((t) => t !== id)
      : [...s.selectedTemplates, id],
  })),
  setAgentRunning: (agentRunning) => set({ agentRunning }),
}})
