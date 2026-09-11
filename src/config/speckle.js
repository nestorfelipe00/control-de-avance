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

/** URL canónica del modelo, usada por UrlHelper del viewer. */
export function getModelUrl() {
  const { serverUrl, projectId, modelId } = speckleConfig
  return `${serverUrl}/projects/${projectId}/models/${modelId}`
}
