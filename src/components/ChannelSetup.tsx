import { useSetupStore } from '../stores/setup-store'
import { ipcInvoke } from '../lib/ipc'

const channels = [
  { id: 'telegram', icon: '✈️', name: 'Telegram', sub: 'Easiest setup', tag: '⭐', instructions: ['Open @BotFather on Telegram', 'Send /newbot and follow the prompts', 'Paste the bot token below'] },
  { id: 'discord', icon: '💬', name: 'Discord', sub: 'For teams', instructions: ['Go to Discord Developer Portal', 'Create a new Application → Bot', 'Copy the bot token below'] },
  { id: 'whatsapp', icon: '📱', name: 'WhatsApp', sub: 'Personal', instructions: ['Set up WhatsApp Business API', 'Get your access token', 'Paste the token below'] },
  { id: 'signal', icon: '🔒', name: 'Signal', sub: 'Private', instructions: ['Install signal-cli', 'Link your device', 'Paste your phone number below'] },
  { id: 'terminal', icon: '🖥️', name: 'Terminal', sub: 'CLI nerds', instructions: ['No setup needed!', 'Run: openclaw chat', 'Chat directly in your terminal'] },
  { id: 'browser', icon: '🌐', name: 'Browser', sub: 'Dashboard', instructions: ['No setup needed!', 'Chat via the web dashboard', 'Just hit Next'] },
]

export default function ChannelSetup() {
  const { channel, channelToken, setChannel, setChannelToken, setScreen } = useSetupStore()
  const selected = channels.find((c) => c.id === channel)
  const noToken = channel === 'terminal' || channel === 'browser'

  const openHelp = (url: string) => {
    ipcInvoke('open-external', url).catch(() => window.open(url, '_blank'))
  }

  return (
    <div className="flex flex-col items-center h-full animate-in px-8 py-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-1">Where do you want to chat?</h2>
      <p className="text-muted mb-6 text-sm">Pick your favorite messaging platform</p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-6">
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => setChannel(c.id)}
            className={`relative p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${
              channel === c.id ? 'border-coral bg-coral/10 shadow-lg shadow-coral/10' : 'border-border bg-surface hover:border-white/20'
            }`}
          >
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-semibold text-sm">{c.name}</div>
            <div className="text-xs text-muted">{c.sub}</div>
            {c.tag && <span className="absolute top-2 right-2 text-xs">{c.tag}</span>}
          </button>
        ))}
      </div>

      {selected && (
        <div className="w-full max-w-lg animate-in">
          <div className="bg-surface border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Setup Instructions</div>
              {channel === 'telegram' && (
                <button onClick={() => openHelp('https://t.me/BotFather')} className="text-xs text-coral hover:text-coral-hover">
                  Open BotFather →
                </button>
              )}
              {channel === 'discord' && (
                <button onClick={() => openHelp('https://discord.com/developers/applications')} className="text-xs text-coral hover:text-coral-hover">
                  Developer Portal →
                </button>
              )}
            </div>
            <ol className="space-y-2">
              {selected.instructions.map((inst, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted">
                  <span className="text-coral font-semibold">{i + 1}.</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ol>
          </div>
          {!noToken && (
            <input
              type="text"
              placeholder={channel === 'signal' ? 'Your phone number (+1234567890)...' : 'Paste your token here...'}
              value={channelToken}
              onChange={(e) => setChannelToken(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-coral transition-colors font-mono"
            />
          )}
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-6">
        <button onClick={() => setScreen('provider')} className="px-6 py-2.5 rounded-full border border-border text-muted hover:text-white hover:border-white/20 transition-all text-sm">← Back</button>
        <button
          onClick={() => setScreen('templates')}
          disabled={!channel || (!noToken && !channelToken)}
          className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
            channel && (noToken || channelToken) ? 'bg-coral hover:bg-coral-hover text-white hover:scale-105 active:scale-95' : 'bg-surface text-muted cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
