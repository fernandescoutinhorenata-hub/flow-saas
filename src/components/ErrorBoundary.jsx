import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          background: 'var(--bg-surface)', 
          borderRadius: '12px', 
          border: '1px solid var(--status-urgent)',
          margin: '24px',
          color: 'var(--text-primary)',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", color: 'var(--status-urgent)' }}>Oops! Algo deu errado.</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            O componente encontrou um erro inesperado. Por favor, tente recarregar a página.
          </p>
          <pre style={{ 
            background: 'var(--bg-base)', 
            padding: '16px', 
            borderRadius: '8px', 
            marginTop: '20px',
            fontSize: '12px',
            overflowX: 'auto',
            color: 'var(--status-urgent)'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '10px 20px',
              background: 'var(--accent)',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Recarregar Flow
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
