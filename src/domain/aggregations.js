/**
 * Agregaciones de negocio: convierten los registros de avance en los datos que
 * consumen KPIs, gráficos y tabla. Lógica pura, sin dependencias de UI.
 *
 * Modelo de registro: { id_elemento, partida, nivel, semana, estado,
 *                        cantidad, unidad ('m2'|'c/u'), avance_pct }
 */
import { ESTADOS } from './constants.js'

/** Filtra registros según los filtros activos de la UI. */
export function filtrar(registros, filtros = {}) {
  const { estatus = 'todos', semana = 'todas', nivel = 'todos' } = filtros
  return registros.filter((r) => {
    if (estatus !== 'todos' && r.estado !== estatus) return false
    if (nivel !== 'todos' && r.nivel !== nivel) return false
    if (semana !== 'todas') {
      const s = semana === '0' || semana === 0 ? null : Number(semana)
      if (r.semana !== s) return false
    }
    return true
  })
}

/** KPIs: superficie (m²), unidades (c/u), % ejecutado (ponderado por m²), conteos. */
export function calcularKpis(registros) {
  let m2 = 0
  let m2Av = 0
  let cu = 0
  let ejec = 0
  let prog = 0
  let por = 0
  for (const r of registros) {
    if (r.unidad === 'c/u') cu += r.cantidad || 0
    else {
      m2 += r.cantidad || 0
      m2Av += (r.cantidad || 0) * ((r.avance_pct || 0) / 100)
    }
    if (r.estado === ESTADOS.EJECUTADO) ejec++
    else if (r.estado === ESTADOS.EN_PROGRESO) prog++
    else por++
  }
  return {
    superficie: +m2.toFixed(1),
    unidades: Math.round(cu),
    pctEjecutado: m2 > 0 ? +((m2Av / m2) * 100).toFixed(1) : 0,
    nPartidas: registros.length,
    nEjecutado: ejec,
    nProgreso: prog,
    nPorEjecutar: por
  }
}

/** Superficie (m²) por semana; los sin semana van como "Por Ejecutar". */
export function superficiePorSemana(registros) {
  const map = new Map()
  let por = 0
  for (const r of registros) {
    if (r.unidad === 'c/u') continue
    if (r.semana == null) por += r.cantidad || 0
    else map.set(r.semana, (map.get(r.semana) || 0) + (r.cantidad || 0))
  }
  const rows = [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([semana, valor]) => ({ semana, label: `Semana ${semana}`, valor: +valor.toFixed(1) }))
  if (por > 0) rows.push({ semana: 0, label: 'Por Ejecutar', valor: +por.toFixed(1) })
  return rows
}

/** Superficie EJECUTADA (m² * avance) por semana; para barras. */
export function avancePorSemana(registros) {
  const map = new Map()
  for (const r of registros) {
    if (r.unidad === 'c/u' || r.semana == null) continue
    map.set(r.semana, (map.get(r.semana) || 0) + (r.cantidad || 0) * ((r.avance_pct || 0) / 100))
  }
  const rows = []
  for (let s = 1; s <= 16; s++) rows.push({ semana: s, label: `S${s}`, valor: +(map.get(s) || 0).toFixed(1) })
  return rows
}

/** Resumen por tipo de partida: cantidad y % ejecutado (para la tabla). */
export function resumenPorPartida(registros) {
  const map = new Map()
  for (const r of registros) {
    const k = `${r.partida}|${r.unidad}`
    const o = map.get(k) || { partida: r.partida, unidad: r.unidad, cantidad: 0, cantAv: 0 }
    o.cantidad += r.cantidad || 0
    o.cantAv += (r.cantidad || 0) * ((r.avance_pct || 0) / 100)
    map.set(k, o)
  }
  return [...map.values()]
    .map((o) => ({
      partida: o.partida,
      unidad: o.unidad,
      cantidad: +o.cantidad.toFixed(1),
      pctEjecutado: o.cantidad > 0 ? +((o.cantAv / o.cantidad) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

/** % ejecutado (ponderado por m²) por nivel; para colorear el visor. */
export function avancePorNivel(registros) {
  const map = new Map()
  for (const r of registros) {
    if (r.unidad === 'c/u') continue
    const o = map.get(r.nivel) || { cantidad: 0, cantAv: 0 }
    o.cantidad += r.cantidad || 0
    o.cantAv += (r.cantidad || 0) * ((r.avance_pct || 0) / 100)
    map.set(r.nivel, o)
  }
  const out = {}
  for (const [nivel, o] of map) out[nivel] = o.cantidad > 0 ? (o.cantAv / o.cantidad) * 100 : 0
  return out
}

/** Agrupa id_elemento por estado (para recolorear el viewer). */
export function idsPorEstado(registros) {
  const grupos = { [ESTADOS.POR_EJECUTAR]: [], [ESTADOS.EN_PROGRESO]: [], [ESTADOS.EJECUTADO]: [] }
  for (const r of registros) grupos[r.estado]?.push(r.id_elemento)
  return grupos
}

/** Opciones únicas para selectores. */
export function opcionesFiltros(registros) {
  const niveles = [...new Set(registros.map((r) => r.nivel))]
  const semanas = [...new Set(registros.filter((r) => r.semana != null).map((r) => r.semana))].sort(
    (a, b) => a - b
  )
  return { niveles, semanas }
}
