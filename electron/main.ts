import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { exec, spawn, ChildProcess } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import https from 'https'
import http from 'http'
import os from 'os'

const execAsync = promisify(exec)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

let mainWindow: BrowserWindow | null = null
let gatewayProcess: ChildProcess | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f0f',
    icon: path.join(__dirname, '../build/icon.icns'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// ── Helpers ──

function homedir() { return os.homedir() }

function httpRequest(url: string, options: https.RequestOptions, body?: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.request(url, options, (res) => {
      let data = ''
      res.on('data', (c) => data += c)
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }))
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
    if (body) req.write(body)
    req.end()
  })
}

// ── IPC: system-check ──

ipcMain.handle('system-check', async () => {
  const result = {
    os: { name: '', version: '', arch: '', supported: true },
    node: { installed: false, version: '', sufficient: false },
    openclaw: { installed: false, version: '' },
  }

  // OS
  const platform = process.platform
  result.os.arch = process.arch
  if (platform === 'darwin') {
    result.os.name = 'macOS'
    try { const { stdout } = await execAsync('sw_vers -productVersion'); result.os.version = stdout.trim() } catch { result.os.version = 'unknown' }
  } else if (platform === 'win32') {
    result.os.name = 'Windows'
    result.os.version = os.release()
  } else {
    result.os.name = 'Linux'
    try { const { stdout } = await execAsync('cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d \\"'); result.os.version = stdout.trim() || os.release() } catch { result.os.version = os.release() }
  }

  // Node.js
  try {
    const { stdout } = await execAsync('node --version')
    const ver = stdout.trim()
    result.node.installed = true
    result.node.version = ver
    const major = parseInt(ver.replace('v', '').split('.')[0], 10)
    result.node.sufficient = major >= 22
  } catch { /* not installed */ }

  // OpenClaw
  try {
    const { stdout: whichOut } = await execAsync('which openclaw')
    if (whichOut.trim()) {
      result.openclaw.installed = true
      try {
        const { stdout: verOut } = await execAsync('openclaw --version')
        result.openclaw.version = verOut.trim().split('\n')[0]
      } catch {
        result.openclaw.version = 'installed (version unknown)'
      }
    }
  } catch { /* not installed */ }

  return result
})

// ── IPC: install-node ──

ipcMain.handle('install-node', async (_event) => {
  const platform = process.platform
  if (platform === 'darwin' || platform === 'linux') {
    // Use nvm
    try {
      await execAsync('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash', { timeout: 60000 })
      await execAsync('export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm install 22', { timeout: 120000, shell: '/bin/bash' })
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message, manual: 'Download from https://nodejs.org/en/download — install Node.js v22 or later' }
    }
  } else {
    return { success: false, error: 'Automatic install not supported on Windows', manual: 'Download from https://nodejs.org/en/download — install Node.js v22 or later' }
  }
})

// ── IPC: install-openclaw ──

ipcMain.handle('install-openclaw', async (_event) => {
  try {
    await execAsync('npm install -g openclaw@latest', { timeout: 120000 })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message, manual: 'Run in terminal: npm install -g openclaw@latest' }
  }
})

// ── IPC: verify-api-key ──

ipcMain.handle('verify-api-key', async (_event, provider: string, apiKey: string) => {
  try {
    if (provider === 'anthropic') {
      const res = await httpRequest('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }, JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }))
      if (res.status === 200 || res.status === 201) return { valid: true }
      const body = JSON.parse(res.body)
      if (body?.error?.type === 'authentication_error') return { valid: false, error: 'Invalid API key' }
      // Overloaded or other non-auth error means key is valid
      if (res.status === 529 || res.status === 429) return { valid: true }
      return { valid: false, error: body?.error?.message || `HTTP ${res.status}` }
    }

    if (provider === 'openai') {
      const res = await httpRequest('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }, JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }))
      if (res.status === 200 || res.status === 201) return { valid: true }
      if (res.status === 429) return { valid: true } // rate limited = key is valid
      const body = JSON.parse(res.body)
      if (res.status === 401) return { valid: false, error: 'Invalid API key' }
      return { valid: false, error: body?.error?.message || `HTTP ${res.status}` }
    }

    if (provider === 'google') {
      const res = await httpRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
        JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 1 } })
      )
      if (res.status === 200) return { valid: true }
      if (res.status === 400 || res.status === 403) return { valid: false, error: 'Invalid API key' }
      return { valid: false, error: `HTTP ${res.status}` }
    }

    // For groq, openrouter, custom — just accept
    return { valid: true }
  } catch (e: any) {
    return { valid: false, error: e.message }
  }
})

// ── IPC: write-config ──

ipcMain.handle('write-config', async (_event, config: {
  provider: string
  apiKey: string
  channel: string
  channelToken: string
  templates: string[]
}) => {
  try {
    const configDir = path.join(homedir(), '.openclaw')
    await mkdir(configDir, { recursive: true })
    await mkdir(path.join(configDir, 'workspace'), { recursive: true })

    const providerMap: Record<string, { baseUrl: string; api: string; defaultModel: string }> = {
      anthropic: { baseUrl: 'https://api.anthropic.com', api: 'anthropic-messages', defaultModel: 'claude-sonnet-4-20250514' },
      openai: { baseUrl: 'https://api.openai.com/v1', api: 'openai-completions', defaultModel: 'gpt-4o' },
      google: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', api: 'google-generative-ai', defaultModel: 'gemini-2.5-flash' },
      groq: { baseUrl: 'https://api.groq.com/openai/v1', api: 'openai-completions', defaultModel: 'llama-3.3-70b-versatile' },
      openrouter: { baseUrl: 'https://openrouter.ai/api/v1', api: 'openai-completions', defaultModel: 'anthropic/claude-sonnet-4-20250514' },
      custom: { baseUrl: 'https://api.example.com/v1', api: 'openai-completions', defaultModel: 'default' },
    }

    const prov = providerMap[config.provider] || providerMap.anthropic

    // Build YAML manually (no dependency needed for simple config)
    const lines: string[] = [
      '# OpenClaw config — generated by OpenClaw Launcher',
      `# Generated: ${new Date().toISOString()}`,
      '',
      'models:',
      '  providers:',
      `    ${config.provider}:`,
      `      baseUrl: "${prov.baseUrl}"`,
      `      apiKey: "${config.apiKey}"`,
      `      api: "${prov.api}"`,
      '      models:',
      '        - id: "default"',
      `          name: "${prov.defaultModel}"`,
      '          reasoning: false',
      '          input: ["text", "image"]',
      '          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }',
      '          contextWindow: 200000',
      '          maxTokens: 8192',
      '',
      'agents:',
      '  defaults:',
      `    model: "${prov.defaultModel}"`,
      `    workspace: "~/.openclaw/workspace"`,
      '',
    ]

    // Channel config
    if (config.channel && config.channel !== 'terminal' && config.channel !== 'browser') {
      lines.push('channels:')
      if (config.channel === 'telegram') {
        lines.push('  telegram:')
        lines.push(`    botToken: "${config.channelToken}"`)
        lines.push('    dmPolicy: "pairing"')
      } else if (config.channel === 'discord') {
        lines.push('  discord:')
        lines.push(`    botToken: "${config.channelToken}"`)
      } else if (config.channel === 'whatsapp') {
        lines.push('  whatsapp:')
        lines.push(`    accessToken: "${config.channelToken}"`)
      } else if (config.channel === 'signal') {
        lines.push('  signal:')
        lines.push(`    phoneNumber: "${config.channelToken}"`)
      }
      lines.push('')
    }

    lines.push('gateway:')
    lines.push('  port: 18789')
    lines.push('  bind: "loopback"')
    lines.push('')

    const configPath = path.join(configDir, 'config.yaml')

    // Check if config already exists
    let existingConfig = ''
    try { existingConfig = await readFile(configPath, 'utf-8') } catch {}
    if (existingConfig) {
      // Backup existing
      const backupPath = configPath + '.backup.' + Date.now()
      await writeFile(backupPath, existingConfig, 'utf-8')
    }

    await writeFile(configPath, lines.join('\n'), 'utf-8')

    return { success: true, path: configPath }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// ── IPC: install-templates ──

ipcMain.handle('install-templates', async (_event, templates: string[]) => {
  try {
    const workspaceDir = path.join(homedir(), '.openclaw', 'workspace')
    await mkdir(workspaceDir, { recursive: true })

    // Templates are bundled in app resources or dev source
    const templateBasePaths: Record<string, string> = {
      'starter': 'the-starter',
      'note-taker': 'the-note-taker',
    }

    for (const tmpl of templates) {
      const dirName = templateBasePaths[tmpl]
      if (!dirName) continue // premium templates handled separately

      // In packaged app, templates are in resources; in dev, in src/templates
      let templateDir: string
      if (app.isPackaged) {
        templateDir = path.join(process.resourcesPath, 'templates', dirName)
      } else {
        templateDir = path.join(__dirname, '..', 'src', 'templates', dirName)
      }

      if (!fs.existsSync(templateDir)) continue

      const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.md'))
      for (const file of files) {
        const src = path.join(templateDir, file)
        const dest = path.join(workspaceDir, file)
        // Don't overwrite existing files unless they're the defaults
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(src, dest)
        }
      }
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// ── IPC: start-agent ──

ipcMain.handle('start-agent', async () => {
  try {
    // Try daemon mode first
    const { stdout } = await execAsync('openclaw gateway start', { timeout: 15000 })
    return { success: true, output: stdout.trim() }
  } catch (e: any) {
    // If daemon mode doesn't work, spawn as child
    try {
      if (gatewayProcess) {
        gatewayProcess.kill()
        gatewayProcess = null
      }
      gatewayProcess = spawn('openclaw', ['gateway', '--port', '18789'], {
        detached: true,
        stdio: 'ignore',
      })
      gatewayProcess.unref()
      // Wait a moment for startup
      await new Promise(r => setTimeout(r, 2000))
      return { success: true, output: 'Gateway started as child process' }
    } catch (e2: any) {
      return { success: false, error: e2.message }
    }
  }
})

// ── IPC: stop-agent ──

ipcMain.handle('stop-agent', async () => {
  try {
    await execAsync('openclaw gateway stop', { timeout: 10000 })
    if (gatewayProcess) { gatewayProcess.kill(); gatewayProcess = null }
    return { success: true }
  } catch (e: any) {
    // Try killing child process
    if (gatewayProcess) { gatewayProcess.kill(); gatewayProcess = null; return { success: true } }
    return { success: false, error: e.message }
  }
})

// ── IPC: agent-status ──

ipcMain.handle('agent-status', async () => {
  try {
    // Try CLI status first
    const { stdout } = await execAsync('openclaw gateway status', { timeout: 5000 })
    const running = stdout.toLowerCase().includes('running') || stdout.toLowerCase().includes('online') || stdout.toLowerCase().includes('listening')
    return { running, detail: stdout.trim() }
  } catch {
    // Fallback: HTTP ping
    try {
      const res = await httpRequest('http://localhost:18789/health', { method: 'GET' })
      return { running: res.status === 200, detail: 'Gateway responding on port 18789' }
    } catch {
      return { running: false, detail: 'Gateway not running' }
    }
  }
})

// ── IPC: open-channel ──

ipcMain.handle('open-channel', async (_event, channel: string, token?: string) => {
  if (channel === 'telegram' && token) {
    // Extract bot username from token or just open Telegram
    shell.openExternal('https://telegram.org/')
  } else if (channel === 'discord') {
    shell.openExternal('https://discord.com/app')
  } else if (channel === 'whatsapp') {
    shell.openExternal('https://web.whatsapp.com/')
  } else if (channel === 'browser') {
    shell.openExternal('http://localhost:18789')
  }
  return { success: true }
})

// ── IPC: check-existing-config ──

ipcMain.handle('check-existing-config', async () => {
  try {
    const configPath = path.join(homedir(), '.openclaw', 'config.yaml')
    const exists = fs.existsSync(configPath)
    if (!exists) return { exists: false }
    const content = await readFile(configPath, 'utf-8')
    // Simple parse to detect provider and channel
    const hasAnthropic = content.includes('anthropic')
    const hasOpenai = content.includes('openai')
    const hasGoogle = content.includes('google')
    const hasTelegram = content.includes('telegram')
    const hasDiscord = content.includes('discord')
    return {
      exists: true,
      provider: hasAnthropic ? 'anthropic' : hasOpenai ? 'openai' : hasGoogle ? 'google' : 'unknown',
      channel: hasTelegram ? 'telegram' : hasDiscord ? 'discord' : 'unknown',
    }
  } catch {
    return { exists: false }
  }
})

// ── IPC: verify-gumroad-license ──

ipcMain.handle('verify-gumroad-license', async (_event, productId: string, licenseKey: string) => {
  try {
    const postData = `product_id=${encodeURIComponent(productId)}&license_key=${encodeURIComponent(licenseKey)}`
    const res = await httpRequest('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData).toString(),
      },
    }, postData)
    const body = JSON.parse(res.body)
    if (body.success) {
      // Store license
      const licDir = path.join(homedir(), '.openclaw-launcher')
      await mkdir(licDir, { recursive: true })
      const licPath = path.join(licDir, 'licenses.json')
      let licenses: Record<string, any> = {}
      try { licenses = JSON.parse(await readFile(licPath, 'utf-8') as string) } catch {}
      licenses[productId] = { key: licenseKey, verified: true, verifiedAt: new Date().toISOString(), purchase: body.purchase }
      await writeFile(licPath, JSON.stringify(licenses, null, 2), 'utf-8')
      return { valid: true, purchase: body.purchase }
    }
    return { valid: false, error: body.message || 'Invalid license' }
  } catch (e: any) {
    return { valid: false, error: e.message }
  }
})

// ── IPC: get-licenses ──

ipcMain.handle('get-licenses', async () => {
  try {
    const licPath = path.join(homedir(), '.openclaw-launcher', 'licenses.json')
    const content = await readFile(licPath, 'utf-8')
    return JSON.parse(content as string)
  } catch {
    return {}
  }
})

// ── IPC: open-external ──

ipcMain.handle('open-external', async (_event, url: string) => {
  shell.openExternal(url)
  return { success: true }
})
