import { useState } from 'react'
import { getEmbedUrl } from '../config/speckle.js'
import { ESTADO_COLOR } from '../domain/colors.js'
import { ESTADOS } from '../domain/constants.js'

/**
 * Panel del visor 3D — usa el EMBED oficial de Speckle (iframe).
 *
 * Muestra el modelo de coordinación centralizado (federado) real. Es robusto
 * ante el formato de la geometría (a diferencia del loader de objetos, que no
 * lee los "bundles" del importador nuevo).
 *
 * Botón "Reencuadrar": como el iframe es de otro dominio (app.speckle.systems),
 * el navegador no permite controlar su cámara desde aquí; la forma fiable de
 * volver al encuadre inicial es RECARGAR el visor (se remonta el iframe).
 *
 * NOTA fase 2: el recoloreo por estado de avance requiere @speckle/viewer con
 * acceso programático a los objetos (ver src/lib/speckleViewer.js).
 */
export default function ViewerPanel() {
  const src = getEmbedUrl()
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="card">
      <h2>
        Modelo 3D · <small>Speckle Viewer (modelo federado)</small>
      </h2>
      <div className="viewer-stage">
        <button
          className="viewer-reset"
          onClick={() => setReloadKey((k) => k + 1)}
          title="Volver a la vista inicial (recarga el visor)"
        >
          ⌖ Reencuadrar
        </button>
        <iframe
          key={reloadKey}
          title="Speckle — Modelo de Coordinación"
          src={src}
          allow="fullscreen; xr-spatial-tracking"
          loading="lazy"
        />
      </div>
      <div className="legend">
        <span><i className="dot" style={{ background: ESTADO_COLOR[ESTADOS.EJECUTADO] }} />Ejecutado</span>
        <span><i className="dot" style={{ background: ESTADO_COLOR[ESTADOS.EN_PROGRESO] }} />En Progreso</span>
        <span><i className="dot" style={{ background: ESTADO_COLOR[ESTADOS.POR_EJECUTAR] }} />Por Ejecutar</span>
        <span style={{ color: 'var(--ink-3)' }}>· recoloreo por avance: fase 2</span>
      </div>
    </div>
  )
}
