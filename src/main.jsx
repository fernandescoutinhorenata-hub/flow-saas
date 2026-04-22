import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

const path = window.location.pathname

if (path === '/owner-panel-9x7k') {
  import('./pages/OwnerPanel').then(({ default: OwnerPanel }) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <AuthProvider>
        <OwnerPanel />
      </AuthProvider>
    )
  })
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
