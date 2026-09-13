import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme-tokens.scss'
import { App } from './App'

// Match the original app's own behavior: default to the OS's light/dark
// preference on first launch, rather than always forcing light.
document.documentElement.classList.toggle(
  'dark',
  window.matchMedia('(prefers-color-scheme: dark)').matches
)

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
