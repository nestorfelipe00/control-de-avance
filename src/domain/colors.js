/**
 * Sistema de color del dashboard.
 *
 * Diseñado según la skill `dataviz`:
 *  - ESTADOS: paleta de "estado" reservada (no se reutiliza para series),
 *    distinta en TONO y en LUMINOSIDAD (robusta ante daltonismo). Siempre
 *    acompañada de etiqueta/ícono, nunca color solo.
 *  - SEMANAS: son tiempo ORDENADO -> rampa SECUENCIAL de un solo tono
 *    (claro->oscuro), no 16 tonos categóricos.
 *
 * PENDIENTE: validar con scripts/validate_palette.js de la skill dataviz
 * cuando se autorice ejecutar Node.
 */
import { ESTADOS } from './constants.js'

/** Color por estado de avance. */
export const ESTADO_COLOR = {
  [ESTADOS.POR_EJECUTAR]: '#94A3B8', // slate 400 — neutro (aún no iniciado)
  [ESTADOS.EN_PROGRESO]: '#F59E0B', // amber 500 — en curso
  [ESTADOS.EJECUTADO]: '#16A34A' // green 600 — completado
}

/** Versión RGB (0-1) para el viewer de Speckle, que espera números. */
export function hexToViewerColor(hex) {
  const h = hex.replace('#', '')
  return parseInt(h, 16) // el viewer acepta int 0xRRGGBB
}

/**
 * Rampa secuencial (azul) para las semanas de ejecución.
 * Devuelve un color interpolado claro->oscuro según el índice de semana.
 * @param {number} semana  1..totalSemanas
 * @param {number} totalSemanas
 */
export function colorSemana(semana, totalSemanas = 16) {
  // Extremos de la rampa (azul claro -> azul oscuro), accesibles.
  const start = { r: 0xdb, g: 0xea, b: 0xfe } // blue-100
  const end = { r: 0x1e, g: 0x3a, b: 0x8a } // blue-900
  const t = totalSemanas <= 1 ? 0 : (semana - 1) / (totalSemanas - 1)
  const r = Math.round(start.r + (end.r - start.r) * t)
  const g = Math.round(start.g + (end.g - start.g) * t)
  const b = Math.round(start.b + (end.b - start.b) * t)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** Color para "Por Ejecutar" dentro de gráficos por semana. */
export const COLOR_POR_EJECUTAR = ESTADO_COLOR[ESTADOS.POR_EJECUTAR]

/** Tokens de tinta (texto) — nunca usar el color de serie para texto. */
export const INK = {
  primary: '#0f172a',
  secondary: '#475569',
  muted: '#94a3b8',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  border: '#e2e8f0'
}
