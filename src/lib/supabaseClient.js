/**
 * Cliente de Supabase (fase 2).
 * Se inicializa de forma perezosa solo si hay credenciales configuradas.
 * En fase 1 (mock) este módulo no se usa.
 */
import { createClient } from '@supabase/supabase-js'
import { dataSourceConfig } from '../config/dataSource.js'

let _client = null

export function getSupabase() {
  if (_client) return _client
  const { url, anonKey } = dataSourceConfig.supabase
  if (!url || !anonKey) {
    throw new Error(
      'Supabase no configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env'
    )
  }
  _client = createClient(url, anonKey)
  return _client
}
