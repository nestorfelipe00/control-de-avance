import { useEffect, useRef, useState } from 'react'
import { SpeckleViewerController } from '../lib/speckleViewer.js'
import { getModelUrl, speckleConfig, viewerConfig } from '../config/speckle.js'
import { idsPorEstado } from '../domain/aggregations.js'
import { ESTADO_COLOR } from '../domain/colors.js'
import { ESTADOS, DISCIPLINAS } from '../domain/constants.js'

/**
 * Visor 3D con @speckle/viewer (SDK) — FILTRADO INTERACTIVO desde la app.
 *
 * Reacciona a los filtros:
 *  - Disciplina  -> aísla solo esa disciplina (ej. Eléctrico).
 *  - Nivel       -> aísla solo ese piso.
 *  - Estatus + registros -> recolorea por estado de avance.
 *
 * ⚠️ REQUISITO: el modelo debe estar en formato CLÁSICO de objetos de Speckle
 * (el formato "bundle" nuevo NO carga con el SDK). Activar con VITE_VIEWER_MODE=sdk.
 * Los nombres de propiedad (nivel/disciplina) se ajustan en viewerConfig / DISCIPLINAS.
 */

// Busca una propiedad por nombre dentro del objeto raw de Speckle (shallow +
// properties + búsqueda recursiva acotada). Devuelve el primer valor string/num.
function findProp(raw, name, depth = 3) {
  if (!raw || typeof raw !== 'object' || depth < 0) return undefined
  const lower = name.toLowerCase()
  for (const [k, v] of Object.entries(raw)) {
    if (k.toLowerCase() === lower && (typeof v === 'string' || typeof v === 'number')) return v
  }
  for (const v of Object.values(raw)) {
    if (v && typeof v === 'object') {
      const found = findProp(v, name, depth - 1)
      if (found !== undefined) return found
    }
  }
  return undefined
}

export default function ViewerPanelSDK({ registros = [], filtros = {} }) {
  const ref = useRef(null)
  const ctrlRef = useRef(null)
  const [estado, setEstado] = useState('cargando') // cargando | listo | vacio | error

  // Init + carga (una vez)
  useEffect(() => {
    let vivo = true
    const ctrl = new SpeckleViewerController()
    ctrlRef.current = ctrl
    ;(async () => {
      try {
        await ctrl.init(ref.current)
        await ctrl.loadModel(getModelUrl(), speckleConfig.token)
        if (!vivo) return
        setEstado(ctrl.appIdToSpeckleId.size > 0 || ctrl.isLoaded ? 'listo' : 'vacio')
      } catch (e) {
        console.error('Speckle SDK viewer:', e)
        if (vivo) setEstado('error')
      }
    })()
    return () => {
      vivo = false
      ctrl.dispose()
    }
  }, [])

  // Aislar + recolorear al cambiar filtros / datos
  useEffect(() => {
    const ctrl = ctrlRef.current
    if (!ctrl || estado !== 'listo') return

    const { disciplina = 'todas', nivel = 'todos' } = filtros

    // 1) Aislamiento por disciplina y/o nivel
    const preds = []
    if (disciplina !== 'todas') {
      const disc = DISCIPLINAS.find((d) => d.id === disciplina)
      const matches = (disc?.match || [disciplina]).map((m) => m.toLowerCase())
      preds.push((raw) => {
        const v = String(findProp(raw, viewerConfig.propDisciplina) ?? '').toLowerCase()
        return matches.some((m) => v.includes(m))
      })
    }
    if (nivel !== 'todos') {
      preds.push((raw) => String(findProp(raw, viewerConfig.propNivel) ?? '') === nivel)
    }

    if (preds.length > 0) {
      ctrl.isolateByPredicate((raw) => preds.every((p) => p(raw)))
    } else {
      ctrl.resetFilters()
    }

    // 2) Recolor por estado de avance (cruza por id_elemento = UniqueId Revit)
    const grupos = idsPorEstado(registros)
    const colorGroups = Object.values(ESTADOS)
      .map((e) => ({ objectIds: ctrl.toSpeckleIds(grupos[e] || []), color: ESTADO_COLOR[e] }))
      .filter((g) => g.objectIds.length > 0)
    if (colorGroups.length > 0) ctrl.applyColorGroups(colorGroups)
  }, [filtros, registros, estado])

  const msg = {
    cargando: 'Cargando modelo…',
    vacio: 'El modelo no tiene geometría cargable por el SDK (¿formato bundle?).',
    error: 'No se pudo cargar el modelo con el SDK. Requiere formato clásico de Speckle.'
  }[estado]

  return (
    <div className="card">
      <h2>
        Modelo 3D · <small>Speckle SDK (filtrado interactivo)</small>
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
