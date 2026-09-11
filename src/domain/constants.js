/**
 * Constantes de dominio del control de avance.
 * Centraliza estados, categorías y nombres para que UI, viewer y datos
 * hablen el mismo idioma.
 */

/** Estados de avance de una partida/elemento. */
export const ESTADOS = {
  POR_EJECUTAR: 'por_ejecutar',
  EN_PROGRESO: 'en_progreso',
  EJECUTADO: 'ejecutado'
}

/** Etiquetas legibles para la UI. */
export const ESTADO_LABEL = {
  [ESTADOS.POR_EJECUTAR]: 'Por Ejecutar',
  [ESTADOS.EN_PROGRESO]: 'En Progreso',
  [ESTADOS.EJECUTADO]: 'Ejecutado'
}

/** Orden canónico de estados (para leyendas y agregaciones). */
export const ESTADO_ORDEN = [
  ESTADOS.POR_EJECUTAR,
  ESTADOS.EN_PROGRESO,
  ESTADOS.EJECUTADO
]

/** Niveles del edificio (mock para fase 1; en fase 2 vendrán del parámetro de Revit). */
export const NIVELES = ['Nivel -1', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']

/** Total de semanas del cronograma (ajustar al plan real de obra). */
export const TOTAL_SEMANAS = 16

/**
 * Disciplinas presentes en el modelo federado (para aislar en el visor SDK).
 * Códigos del modelo: PCI, GCL, ELE, ALL, ARQ. `match` son textos a buscar en la
 * propiedad de disciplina de los objetos (ajustar a los reales del modelo).
 */
export const DISCIPLINAS = [
  { id: 'ARQ', label: 'Arquitectura', match: ['ARQ', 'arquitectura'] },
  { id: 'ELE', label: 'Eléctrico', match: ['ELE', 'electric'] },
  { id: 'PCI', label: 'Protección Incendios', match: ['PCI', 'incendio', 'fire'] },
  { id: 'GCL', label: 'Gases Clínicos', match: ['GCL', 'gas'] },
  { id: 'ALL', label: 'Alcantarillado', match: ['ALL', 'alcantarill', 'sanitary'] }
]
