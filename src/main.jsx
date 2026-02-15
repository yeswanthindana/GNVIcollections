import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center font-sans">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <p className="text-slate-600 mb-4">We encountered an unexpected error while rendering this page.</p>
          <pre className="bg-slate-100 p-4 rounded text-xs text-left overflow-auto max-w-2xl mx-auto border border-red-100">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
