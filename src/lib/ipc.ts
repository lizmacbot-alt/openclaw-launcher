// IPC bridge — real Electron calls or browser-mode fallbacks

declare global {
  interface Window {
    electronAPI?: {
      platform: string
      invoke: (channel: string, ...args: any[]) => Promise<any>
      on: (channel: string, cb: (...args: any[]) => void) => void
    }
  }
}

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export async function ipcInvoke(channel: string, ...args: any[]): Promise<any> {
  if (isElectron) {
    return window.electronAPI!.invoke(channel, ...args)
  }
  // Browser fallback mocks
  return browserMock(channel, args)
}

async function browserMock(channel: string, args: any[]): Promise<any> {
  await new Promise(r => setTimeout(r, 500 + Math.random() * 1000))

  switch (channel) {
    case 'system-check':
      return {
        os: { name: 'Browser', version: 'dev mode', arch: 'wasm', supported: true },
        node: { installed: true, version: 'v22.0.0', sufficient: true },
        openclaw: { installed: true, version: 'v1.0.0 (mock)' },
      }
    case 'verify-api-key':
      return { valid: true }
    case 'write-config':
      return { success: true, path: '~/.openclaw/config.yaml' }
    case 'install-templates':
      return { success: true }
    case 'start-agent':
      return { success: true, output: 'Mock gateway started' }
    case 'stop-agent':
      return { success: true }
    case 'agent-status':
      return { running: false, detail: 'Browser mode — no real agent' }
    case 'check-existing-config':
      return { exists: false }
    case 'verify-gumroad-license':
      return { valid: false, error: 'License verification requires desktop app' }
    case 'get-licenses':
      return {}
    case 'install-node':
      return { success: false, manual: 'Download from https://nodejs.org' }
    case 'install-openclaw':
      return { success: false, manual: 'Run: npm install -g openclaw@latest' }
    case 'open-channel':
    case 'open-external':
      return { success: true }
    default:
      return {}
  }
}

export const platform = (typeof window !== 'undefined' && window.electronAPI?.platform) || 'browser'
