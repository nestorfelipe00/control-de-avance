/**
 * Generador de datos de avance MOCK (fase 1) a partir de las PARTIDAS REALES.
 *
 * Carga las partidas ARQ cuantificables en BIM (partidas.arq.json, extraídas de
 * «REVISION DE PONDERADORES BIM.xlsx») y les asigna de forma determinista un
 * estado / semana / nivel / % de avance para poder desarrollar el dashboard sin
 * depender aún de Supabase ni de datos reales de terreno.
 *
 * Esquema de salida (idéntico al de la tabla de Supabase en fase 2):
 *  id_elemento, partida, nivel, semana, estado, cantidad, unidad, avance_pct
 */
import partidas from './partidas.arq.json'
import { ESTADOS, TOTAL_SEMANAS } from '../domain/constants.js'

const NIVELES = ['Nivel -1', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Genera registros de avance mock a partir de las partidas reales. */
export function generarMockAvance() {
  const rand = mulberry32(20260911)
  return partidas.map((p, i) => {
    const unidad = p.unidad || 'm2'
    const porEjecutar = rand() < 0.28
    let semana = porEjecutar ? null : 1 + Math.floor(rand() * TOTAL_SEMANAS)
    const x = rand()
    let estado
    let avance_pct
    if (semana == null) {
      estado = ESTADOS.POR_EJECUTAR
      avance_pct = 0
    } else if (x < 0.62) {
      estado = ESTADOS.EJECUTADO
      avance_pct = 100
    } else if (x < 0.85) {
      estado = ESTADOS.EN_PROGRESO
      avance_pct = Math.floor(rand() * 70) + 15
    } else {
      estado = ESTADOS.POR_EJECUTAR
      avance_pct = 0
      semana = null
    }
    return {
      id_elemento: p.id || `ARQ-${String(i + 1).padStart(4, '0')}`,
      partida: p.nombre,
      edt: p.edt,
      nivel: NIVELES[Math.floor(rand() * NIVELES.length)],
      semana,
      estado,
      cantidad: p.cantidad,
      unidad,
      avance_pct
    }
  })
}
