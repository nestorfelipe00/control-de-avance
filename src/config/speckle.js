/**
 * Configuración de conexión a Speckle.
 * Los valores vienen de variables de entorno (.env) con fallback a los
 * IDs del modelo de prueba del Hospital de Coquimbo.
 */
export const speckleConfig = {
  serverUrl: import.meta.env.VITE_SPECKLE_SERVER_URL || 'https://app.speckle.systems',
  projectId: import.meta.env.VITE_SPECKLE_PROJECT_ID || '1a3ef97d52',
  modelId: import.meta.env.VITE_SPECKLE_MODEL_ID || '51f6f1a7ce',
  // Vacío = modelo público. En producción, para modelo privado, el token
  // debe servirse desde un backend, nunca exponerse en el cliente.
  token: import.meta.env.VITE_SPECKLE_TOKEN || ''
}

/** URL canónica del modelo, usada por UrlHelper del viewer (fase 2 / recolor). */
export function getModelUrl() {
  const { serverUrl, projectId, modelId } = speckleConfig
  return `${serverUrl}/projects/${projectId}/models/${modelId}`
}

/**
 * URL del EMBED de Speckle (iframe). Muestra el modelo federado real sin
 * depender del loader de objetos. Es la vía usada por el visor de la maqueta.
 * Modelo de coordinación centralizado (federado): proyecto 15c0044cac.
 * Se puede sobreescribir con VITE_SPECKLE_EMBED_URL (p.ej. con embedToken).
 */
export const embedConfig = {
  url:
    import.meta.env.VITE_SPECKLE_EMBED_URL ||
    'https://app.speckle.systems/projects/15c0044cac/models/c356c5227b#embed={"isEnabled":true,"isTransparent":true}'
}

export function getEmbedUrl() {
  return embedConfig.url
}

/**
 * Configuración del modo de visor:
 *  - 'embed' (por defecto): iframe de Speckle. Muestra el modelo pero NO permite
 *    filtrar desde la app (funciona con cualquier formato, incluido bundle).
 *  - 'sdk': @speckle/viewer con filtrado programático (aislar por disciplina/nivel,
 *    recolorear por avance). REQUIERE un modelo en formato clásico de objetos
 *    (el bundle actual NO carga con el SDK).
 *
 * Cambiar a 'sdk' con VITE_VIEWER_MODE=sdk cuando exista el modelo clásico.
 *
 * propNivel / propDisciplina: nombres de las propiedades en el modelo Speckle por
 * las que se aísla. AJUSTAR a los reales tras inspeccionar el modelo clásico
 * (con VITE_PROP_NIVEL / VITE_PROP_DISCIPLINA).
 */
/**
 * Modelos glTF/GLB a cargar en el visor propio (three.js), uno por disciplina.
 * Se define con VITE_GLTF_MODELS = JSON, ej:
 *   [{"id":"ELE","label":"Eléctrico","url":"https://.../ELE.glb"},
 *    {"id":"ARQ","label":"Arquitectura","url":"https://.../ARQ.glb"}]
 */
function parseGltfModels() {
  try {
    const raw = import.meta.env.VITE_GLTF_MODELS
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('VITE_GLTF_MODELS inválido:', e?.message)
  }
  return []
}

export const viewerConfig = {
  // 'embed' (iframe Speckle, por defecto) | 'gltf' (visor propio three.js)
  mode: import.meta.env.VITE_VIEWER_MODE || 'embed',
  // Modelos glTF por disciplina (para el visor propio)
  gltfModels: parseGltfModels()
}
