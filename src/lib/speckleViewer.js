/**
 * Controlador del visor de Speckle.
 *
 * Envuelve @speckle/viewer para: inicializar, cargar el modelo, y recolorear
 * / aislar objetos según los datos de avance.
 *
 * NOTA de versión: la API de @speckle/viewer evoluciona entre versiones. Este
 * código apunta a la línea 2.20.x. Si al ejecutar hay diferencias de nombres,
 * ajustar los imports/métodos (documentado en cada función).
 *
 * NOTA de datos: para recolorear necesitamos los IDs de objeto de Speckle.
 * Los datos de avance suelen venir por UniqueId de Revit (applicationId). Por
 * eso construimos un mapa applicationId -> speckleId al cargar el modelo.
 */
import {
  Viewer,
  DefaultViewerParams,
  SpeckleLoader,
  UrlHelper,
  CameraController,
  SelectionExtension,
  FilteringExtension
} from '@speckle/viewer'

export class SpeckleViewerController {
  constructor() {
    this.viewer = null
    this.filtering = null
    /** Mapa applicationId (Revit UniqueId) -> speckle object id */
    this.appIdToSpeckleId = new Map()
    this._loaded = false
    this._disposed = false
  }

  /** Inicializa el viewer dentro de un contenedor DOM. */
  async init(container) {
    const params = { ...DefaultViewerParams, showStats: false }
    this.viewer = new Viewer(container, params)
    await this.viewer.init()
    // React StrictMode puede desmontar durante el await: si ya se liberó, salir.
    if (this._disposed || !this.viewer) return this

    // Extensiones básicas: cámara, selección y filtrado (recoloreo/aislado).
    this.viewer.createExtension(CameraController)
    this.viewer.createExtension(SelectionExtension)
    this.filtering = this.viewer.createExtension(FilteringExtension)

    return this
  }

  /**
   * Carga un modelo desde su URL (proyecto/modelo). Para modelo público el
   * token va vacío.
   * @param {string} modelUrl  https://.../projects/<id>/models/<id>
   * @param {string} token     token de solo-lectura ('' si es público)
   */
  async loadModel(modelUrl, token = '') {
    if (this._disposed || !this.viewer) return this

    // Si el modelo no tiene versiones (0 geometría), getResourceUrls falla:
    // lo tratamos como "vacío", no como error.
    let resourceUrls = []
    try {
      resourceUrls = await UrlHelper.getResourceUrls(modelUrl)
    } catch (e) {
      console.warn('[Speckle] Modelo sin versiones o inaccesible:', e?.message || e)
      this._loaded = false
      return this
    }

    for (const url of resourceUrls) {
      if (this._disposed || !this.viewer) return this
      const loader = new SpeckleLoader(this.viewer.getWorldTree(), url, token)
      await this.viewer.loadObject(loader, true)
    }
    this._loaded = resourceUrls.length > 0
    this._buildIdMap()
    return this
  }

  /** Recorre el árbol y mapea applicationId -> speckleId. */
  _buildIdMap() {
    this.appIdToSpeckleId.clear()
    const tree = this.viewer.getWorldTree()
    if (!tree) return
    // walk() visita cada nodo del árbol de render.
    tree.walk((node) => {
      const raw = node?.model?.raw
      if (raw?.applicationId && raw?.id) {
        this.appIdToSpeckleId.set(raw.applicationId, raw.id)
      }
      return true
    })
  }

  /** Traduce una lista de applicationIds (Revit) a speckleIds. */
  toSpeckleIds(appIds = []) {
    const out = []
    for (const a of appIds) {
      const s = this.appIdToSpeckleId.get(a)
      if (s) out.push(s)
    }
    return out
  }

  /**
   * Aplica grupos de color al modelo.
   * @param {Array<{objectIds:string[], color:string}>} groups  ids de Speckle
   */
  applyColorGroups(groups = []) {
    if (!this.filtering) return
    // setUserObjectColors espera [{ objectIds, color }]
    this.filtering.setUserObjectColors(groups)
    this.viewer?.requestRender?.()
  }

  /** Aísla un conjunto de objetos (el resto queda fantasma). */
  isolate(speckleIds = []) {
    if (!this.filtering) return
    this.filtering.isolateObjects(speckleIds, 'avance', true)
    this.viewer?.requestRender?.()
  }

  /** Quita aislamientos y colores personalizados. */
  resetFilters() {
    if (!this.filtering) return
    this.filtering.resetFilters()
    this.viewer?.requestRender?.()
  }

  /**
   * Recorre el árbol y devuelve los speckleIds cuyo objeto "raw" cumple el
   * predicado. Útil para aislar por disciplina, nivel, categoría, etc.
   * @param {(raw:object)=>boolean} pred
   */
  getIdsByPredicate(pred) {
    const ids = []
    const tree = this.viewer?.getWorldTree?.()
    if (!tree) return ids
    tree.walk((node) => {
      const raw = node?.model?.raw
      if (raw?.id && pred(raw)) ids.push(raw.id)
      return true
    })
    return ids
  }

  /**
   * Aísla los objetos que cumplen el predicado (el resto queda fantasma).
   * Si no hay coincidencias, limpia el aislamiento.
   * @returns {number} cantidad aislada
   */
  isolateByPredicate(pred) {
    const ids = this.getIdsByPredicate(pred)
    if (ids.length === 0) {
      if (this.filtering) this.filtering.resetFilters()
      this.viewer?.requestRender?.()
      return 0
    }
    this.isolate(ids)
    return ids.length
  }

  get isLoaded() {
    return this._loaded
  }

  /** Libera recursos. */
  dispose() {
    this._disposed = true
    try {
      this.viewer?.dispose?.()
    } finally {
      this.viewer = null
      this.filtering = null
      this.appIdToSpeckleId.clear()
      this._loaded = false
    }
  }
}
