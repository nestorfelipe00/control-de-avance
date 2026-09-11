import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { viewerConfig } from '../config/speckle.js'
import { ESTADO_COLOR } from '../domain/colors.js'
import { ESTADOS } from '../domain/constants.js'

/**
 * Visor 3D propio con three.js — carga modelos glTF/GLB (uno por disciplina) y
 * permite mostrar/ocultar por disciplina, reencuadrar, y (a futuro) filtrar por
 * nivel y recolorear por avance.
 *
 * Los modelos se definen en viewerConfig.gltfModels (VITE_GLTF_MODELS).
 * Geometría liviana exportada de Revit → ideal para visualización web.
 */
export default function ViewerPanelGLTF({ filtros = {} }) {
  const ref = useRef(null)
  const three = useRef({})
  const [estado, setEstado] = useState('init') // init | cargando | listo | sin-modelos | error
  const [progreso, setProgreso] = useState('')

  // Montaje de la escena + carga de modelos (una vez)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const modelos = viewerConfig.gltfModels || []

    const scene = new THREE.Scene()
    const w = container.clientWidth || 800
    const h = container.clientHeight || 500
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100000)
    camera.position.set(30, 25, 40)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 1.1))
    const dir = new THREE.DirectionalLight(0xffffff, 1.6)
    dir.position.set(50, 80, 30)
    scene.add(dir)
    const grid = new THREE.GridHelper(200, 40, 0x94a3b8, 0xd0d7e2)
    grid.material.opacity = 0.4
    grid.material.transparent = true
    scene.add(grid)

    three.current = { scene, camera, renderer, controls, models: {}, raf: 0 }

    // Loop de render
    const animate = () => {
      three.current.raf = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth
      const nh = container.clientHeight
      if (nw && nh) {
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      }
    })
    ro.observe(container)

    // Carga de modelos glТF
    if (modelos.length === 0) {
      setEstado('sin-modelos')
    } else {
      setEstado('cargando')
      const loader = new GLTFLoader()
      let pendientes = modelos.length
      modelos.forEach((m) => {
        loader.load(
          m.url,
          (gltf) => {
            const obj = gltf.scene
            obj.userData.disciplina = m.id
            scene.add(obj)
            three.current.models[m.id] = obj
            pendientes -= 1
            setProgreso(`${modelos.length - pendientes}/${modelos.length}`)
            if (pendientes === 0) {
              encuadrar()
              setEstado('listo')
            }
          },
          undefined,
          (err) => {
            console.error('glTF load error', m.url, err)
            pendientes -= 1
            if (pendientes === 0) setEstado(Object.keys(three.current.models).length ? 'listo' : 'error')
          }
        )
      })
    }

    function encuadrar() {
      const box = new THREE.Box3()
      let has = false
      for (const obj of Object.values(three.current.models)) {
        if (obj.visible) {
          box.expandByObject(obj)
          has = true
        }
      }
      if (!has) return
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z) || 10
      const dist = maxDim * 1.6
      camera.position.set(center.x + dist, center.y + dist * 0.8, center.z + dist)
      camera.near = maxDim / 100
      camera.far = maxDim * 100
      camera.updateProjectionMatrix()
      controls.target.copy(center)
      controls.update()
    }
    three.current.encuadrar = encuadrar

    return () => {
      cancelAnimationFrame(three.current.raf)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.()
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((mm) => mm.dispose?.())
        }
      })
    }
  }, [])

  // Mostrar/ocultar por disciplina
  useEffect(() => {
    const t = three.current
    if (!t.models || estado !== 'listo') return
    const disc = filtros.disciplina || 'todas'
    for (const [id, obj] of Object.entries(t.models)) {
      obj.visible = disc === 'todas' || id === disc
    }
    // TODO (con modelo real): filtrar por nivel y recolorear por estado de avance.
  }, [filtros, estado])

  const msg = {
    init: '',
    cargando: `Cargando modelos… ${progreso}`,
    'sin-modelos': 'Configura VITE_GLTF_MODELS con las URLs de los .glb por disciplina.',
    error: 'No se pudieron cargar los modelos glTF. Revisa las URLs.'
  }[estado]

  return (
    <div className="card">
      <h2>
        Modelo 3D · <small>Visor glTF (three.js) — geometría liviana</small>
      </h2>
      <div className="viewer-stage" ref={ref}>
        <button
          className="viewer-reset"
          onClick={() => three.current.encuadrar && three.current.encuadrar()}
          title="Reencuadrar la vista"
        >
          ⌖ Reencuadrar
        </button>
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
