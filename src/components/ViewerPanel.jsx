import { useEffect, useRef, useState } from 'react'
import { SpeckleViewerController } from '../lib/speckleViewer.js'
import { getModelUrl, speckleConfig } from '../config/speckle.js'
import { idsPorEstado } from '../domain/aggregations.js'
import { ESTADO_COLOR } from '../domain/colors.js'
import { ESTADOS } from '../domain/constants.js'

/**
 * Panel del visor 3D de Speckle. Inicializa el viewer, carga el modelo y
 * recolorea los objetos según el estado de avance de los registros filtrados.
 *
 * NOTA: mientras el modelo de Speckle no tenga geometría (0 versiones), el
 * visor se muestra vacío con un aviso. En cuanto se publique una versión, la
 * geometría aparece automáticamente.
 */
/**
 * Consulta a la API de Speckle si el modelo tiene al menos una versión (geometría).
 * Evita llamar al loader cuando el modelo está vacío (que produce un error interno).
 */
async function modeloTieneVersion() {
  const q = `query($p:String!,$m:String!){project(id:$p){model(id:$m){versions{totalCount}}}}`
  try {
    const res = await fetch(`${speckleConfig.serverUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(speckleConfig.token ? { Authorization: `Bearer ${speckleConfig.token}` } : {})
      },
      body: JSON.stringify({ query: q, variables: { p: speckleConfig.projectId, m: speckleConfig.modelId } })
    })
    const json = await res.json()
    return (json?.data?.project?.model?.versions?.totalCount || 0) > 0
  } catch {
    return false
  }
}

export default function ViewerPanel({ registros }) {
  const ref = useRef(null)
  const ctrlRef = useRef(null)
  const [estado, setEstado] = useState('init') // init | cargando | listo | vacio | error

  // Init + carga (una vez)
  useEffect(() => {
    let vivo = true
    const ctrl = new SpeckleViewerController()
    ctrlRef.current = ctrl
    setEstado('cargando')

    ;(async () => {
      try {
        await ctrl.init(ref.current)
        // Evitar cargar (y el error interno de Speckle) si el modelo no tiene versión.
        const hayGeometria = await modeloTieneVersion()
        if (!vivo) return
        if (!hayGeometria) {
          setEstado('vacio')
          return
        }
        await ctrl.loadModel(getModelUrl(), speckleConfig.token)
        if (!vivo) return
        setEstado(ctrl.appIdToSpeckleId.size > 0 ? 'listo' : 'vacio')
      } catch (e) {
        console.error('Speckle viewer:', e)
        if (vivo) setEstado('error')
      }
    })()

    return () => {
      vivo = false
      ctrl.dispose()
    }
  }, [])

  // Recoloreo cuando cambian los registros filtrados
  useEffect(() => {
    const ctrl = ctrlRef.current
    if (!ctrl || estado !== 'listo') return
    const grupos = idsPorEstado(registros)
    const colorGroups = Object.values(ESTADOS)
      .map((e) => ({
        objectIds: ctrl.toSpeckleIds(grupos[e] || []),
        color: ESTADO_COLOR[e] // hex string; @speckle/viewer espera color como string
      }))
      .filter((g) => g.objectIds.length > 0)
    ctrl.applyColorGroups(colorGroups)
  }, [registros, estado])

  const msg = {
    cargando: 'Cargando modelo de Speckle…',
    vacio: 'El modelo de Speckle aún no tiene geometría publicada (0 versiones). Envía el modelo Revit con el Speckle Connector para verlo aquí.',
    error: 'No se pudo cargar el modelo. Revisa el ID del proyecto/modelo o el acceso.',
    init: ''
  }[estado]

  return (
    <div className="card">
      <h2>
        Modelo 3D · <small>Speckle Viewer (recolor por estado)</small>
      </h2>
      <div className="viewer-stage" ref={ref}>
        {msg && <div className="viewer-note">{msg}</div>}
      </div>
      <div className="legend">
        <span><i className="dot" style={{ background: ESTADO_COLOR[ESTADOS.EJECUTADO] }} />Ejecutado</span>
        <span><i className="dot" style={{ background: ESTADO_COLOR[ESTADOS.EN_PROGRESO] }} />En Progreso</span>
        <span><i className="dot" style={{ background: ESTADO_COLOR[ESTADOS.POR_EJECUTAR] }} />Por Ejecutar</span>
      </div>
    </div>
  )
}
