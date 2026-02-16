import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[OpenClaw Launcher] UI Error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#050810', color: '#fff', fontFamily: 'monospace', padding: 32,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🦞</div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#ff4d4d', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
