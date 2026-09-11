import { useEffect, useRef, useState } from 'react'
import * as OBC from '@thatopen/components'
import { viewerConfig } from '../config/speckle.js'
import { ESTADO_COLOR } from '../domain/colors.js'
import { ESTADOS, DISCIPLINAS } from '../domain/constants.js'

/**
 * Visor IFC propio con ThatOpen Components (web-ifc) — FILTRADO TOTAL desde la app.
 *
 * A diferencia del embed de Speckle, aquí controlamos la geometría: aislar por
 * nivel, categoría o disciplina, y recolorear por estado de avance.
 *
 * Carga el IFC desde viewerConfig.ifcUrl (VITE_IFC_URL). El IFC debe exportarse
 * de Revit incluyendo Property Sets + niveles (IfcBuildingStorey).
 *
 * ⚠️ ESTADO: andamiaje listo (mundo 3D + carga IFC). El aislamiento por
 * disciplina/nivel se AFINA con el modelo real (nombres de Psets/propiedades y
 * la API de clasificación de ThatOpen 3.x) — marcado con TODO.
 */
export default function ViewerPanelIFC({ filtros = {} }) {
  const ref = useRef(null)
  const stateRef = useRef({ components: null, world: null, model: null })
  const [estado, setEstado] = useState('init') // init | cargando | listo | sin-archivo | error

  // Inicializa el mundo 3D y carga el IFC (una vez)
  useEffect(() => {
    let vivo = true
    const container = ref.current
    const components = new OBC.Components()

    try {
      const worlds = components.get(OBC.Worlds)
      const world = worlds.create()
      world.scene = new OBC.SimpleScene(components)
      world.renderer = new OBC.SimpleRenderer(components, container)
      world.camera = new OBC.SimpleCamera(components)
      components.init()
      world.scene.setup()
      world.scene.three.background = null
      components.get(OBC.Grids).create(world)
      stateRef.current = { components, world, model: null }
    } catch (e) {
      console.error('IFC viewer init:', e)
      setEstado('error')
      return
    }

    if (!viewerConfig.ifcUrl) {
      setEstado('sin-archivo')
    } else {
      setEstado('cargando')
      ;(async () => {
        try {
          const ifcLoader = components.get(OBC.IfcLoader)
          await ifcLoader.setup()
          const res = await fetch(viewerConfig.ifcUrl)
          const buffer = new Uint8Array(await res.arrayBuffer())
          const model = await ifcLoader.load(buffer)
          if (!vivo) return
          const world = stateRef.current.world
          // El objeto renderizable puede ser model.object (3.x) o el propio model
          world.scene.three.add(model.object ?? model)
          stateRef.current.model = model
          // TODO: clasificar por nivel/categoría/Pset con OBC.Classifier al afinar
          setEstado('listo')
        } catch (e) {
          console.error('IFC load:', e)
          if (vivo) setEstado('error')
        }
      })()
    }

    return () => {
      vivo = false
      try {
        components.dispose()
      } catch {
        /* noop */
      }
    }
  }, [])

  // Aísla / recolorea al cambiar filtros
  useEffect(() => {
    const { components, model } = stateRef.current
    if (!components || !model || estado !== 'listo') return
    // TODO (afinar con modelo real): usar OBC.Classifier + OBC.Hider para
    //  - aislar por nivel (IfcBuildingStorey) según filtros.nivel
    //  - aislar por disciplina/categoría según filtros.disciplina (ver DISCIPLINAS)
    //  - recolorear por estado de avance (cruce por GlobalId/UniqueId)
    // La API exacta de clasificación depende de la versión de @thatopen y del IFC.
  }, [filtros, estado])

  const msg = {
    init: '',
    cargando: 'Cargando IFC…',
    'sin-archivo': 'Configura VITE_IFC_URL con la ruta del IFC (ej. /modelo.ifc en public/).',
    error: 'No se pudo cargar el IFC. Revisa la ruta/archivo.'
  }[estado]

  return (
    <div className="card">
      <h2>
        Modelo 3D · <small>Visor IFC (ThatOpen) — filtrado interactivo</small>
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
