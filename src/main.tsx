import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { content } from './content'
import App from './App'
import './theme.css'
import './styles.css'

// Keep the browser tab title in sync with the content file.
document.title = content.title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
