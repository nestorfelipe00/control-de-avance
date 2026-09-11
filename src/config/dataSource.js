/**
 * Selector de fuente de datos de avance.
 * Fase 1: "mock" (JSON local). Fase 2: "supabase".
 */
export const dataSourceConfig = {
  source: import.meta.env.VITE_DATA_SOURCE || 'mock',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
}
