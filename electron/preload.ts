import { contextBridge, ipcRenderer } from 'electron'

const ALLOWED_CHANNELS = new Set([
  'system-check',
  'install-node',
  'install-openclaw',
  'install-progress',
  'verify-api-key',
  'write-config',
  'install-templates',
  'start-agent',
  'stop-agent',
  'agent-status',
  'check-existing-config',
  'verify-gumroad-license',
  'get-licenses',
  'open-channel',
  'open-external',
  'get-debug-logs',
  'auth-login',
  'auth-paste-token',
  'auth-setup-token',
])

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  invoke: (channel: string, ...args: any[]) => {
    if (!ALLOWED_CHANNELS.has(channel)) {
      return Promise.reject(new Error(`IPC channel "${channel}" is not allowed`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    if (!ALLOWED_CHANNELS.has(channel)) return
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  },
})
