/**
 * Repositorio de datos de avance.
 *
 * Abstrae DE DÓNDE vienen los datos: en fase 1 del generador mock; en fase 2 de
 * Supabase. El resto de la app consume siempre esta interfaz (getAvance), así el
 * cambio de fuente no afecta a componentes ni al viewer.
 */
import { dataSourceConfig } from '../config/dataSource.js'
import { generarMockAvance } from './mockAvance.js'

/**
 * Devuelve todos los registros de avance.
 * @returns {Promise<Array>} registros con el esquema de mockAvance.
 */
export async function getAvance() {
  if (dataSourceConfig.source === 'supabase') {
    return getAvanceSupabase()
  }
  // Fase 1: mock. Se envuelve en promesa para tener la misma firma async.
  return Promise.resolve(generarMockAvance())
}

/** Lectura desde Supabase (fase 2). */
async function getAvanceSupabase() {
  const { getSupabase } = await import('../lib/supabaseClient.js')
  const supabase = getSupabase()
  const { data, error } = await supabase.from('avance_elementos').select('*')
  if (error) throw error
  return data ?? []
}
