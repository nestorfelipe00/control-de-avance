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
 * NOTA fase 2: el recoloreo por estado de avance requiere el paquete
 * @speckle/viewer con acceso programático a los objetos (ver src/lib/speckleViewer.js).
 * El embed es de solo visualización/órbita, así que la leyenda es informativa.
 */
export default function ViewerPanel() {
  const src = getEmbedUrl()
  return (
    <div className="card">
      <h2>
        Modelo 3D · <small>Speckle Viewer (modelo federado)</small>
      </h2>
      <div className="viewer-stage">
        <iframe
          title="Speckle — Modelo de Coordinación"
          src={src}
          allow="fullscreen; xr-spatial-tracking"
          loading="lazy"
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
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
