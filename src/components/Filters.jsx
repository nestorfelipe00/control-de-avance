import { ESTADO_LABEL, ESTADOS, DISCIPLINAS } from '../domain/constants.js'
import { TOTAL_SEMANAS } from '../domain/constants.js'
import { viewerConfig } from '../config/speckle.js'

/** Barra de filtros: Estatus, Semana, Nivel (+ Disciplina en modo SDK) + limpiar. */
export default function Filters({ filtros, setFiltros, niveles }) {
  const set = (k) => (e) => setFiltros((f) => ({ ...f, [k]: e.target.value }))
  const semanas = Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1)
  const mostrarDisciplina = viewerConfig.mode === 'gltf'

  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="f-est">Estatus</label>
        <select id="f-est" value={filtros.estatus} onChange={set('estatus')}>
          <option value="todos">Todos</option>
          <option value={ESTADOS.EJECUTADO}>{ESTADO_LABEL[ESTADOS.EJECUTADO]}</option>
          <option value={ESTADOS.EN_PROGRESO}>{ESTADO_LABEL[ESTADOS.EN_PROGRESO]}</option>
          <option value={ESTADOS.POR_EJECUTAR}>{ESTADO_LABEL[ESTADOS.POR_EJECUTAR]}</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-sem">Semana de Ejecución</label>
        <select id="f-sem" value={filtros.semana} onChange={set('semana')}>
          <option value="todas">Todas</option>
          {semanas.map((s) => (
            <option key={s} value={s}>
              Semana {s}
            </option>
          ))}
          <option value="0">Por Ejecutar</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-niv">Nivel</label>
        <select id="f-niv" value={filtros.nivel} onChange={set('nivel')}>
          <option value="todos">Todos</option>
          {niveles.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      {mostrarDisciplina && (
        <div className="field">
          <label htmlFor="f-disc">Disciplina (3D)</label>
          <select id="f-disc" value={filtros.disciplina || 'todas'} onChange={set('disciplina')}>
            <option value="todas">Todas</option>
            {DISCIPLINAS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        className="reset"
        onClick={() => setFiltros({ estatus: 'todos', semana: 'todas', nivel: 'todos', disciplina: 'todas' })}
      >
        ↺ Limpiar filtros
      </button>
    </div>
  )
}
