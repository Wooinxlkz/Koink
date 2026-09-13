import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { CompanionApp } from './components/CompanionApp'

// Both windows load the same index.html/bundle; the "companion" window's
// URL carries a query flag (set in src-tauri/tauri.conf.json) so a single
// entry point can render either the big Studio app or the small floating
// mascot depending on which window it's running in.
const isCompanion = new URLSearchParams(window.location.search).get('window') === 'companion'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>{isCompanion ? <CompanionApp /> : <App />}</StrictMode>
)
