import { useEffect, useState } from 'react'

/** Encabezado con título, badge de fase y toggle de tema. */
export default function Header() {
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="app-header">
      <div>
        <h1>Avance de Obra en Modelo BIM</h1>
        <p>Hospital de Coquimbo · Terminaciones ARQ · Control semanal por partidas</p>
      </div>
      <div className="right">
        <span className="badge">Fase 1 · datos demo</span>
        <button className="theme-btn" onClick={() => setDark((d) => !d)} aria-label="Cambiar tema">
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
