import { useMemo, useState } from 'react'
import './App.css'
import Header from './components/Header.jsx'
import KpiCards from './components/KpiCards.jsx'
import Filters from './components/Filters.jsx'
import ViewerPanel from './components/ViewerPanel.jsx'
import DonutSemana from './components/DonutSemana.jsx'
import BarrasAvance from './components/BarrasAvance.jsx'
import PartidasTable from './components/PartidasTable.jsx'
import { useAvanceData } from './hooks/useAvanceData.js'
import { calcularKpis, filtrar, opcionesFiltros } from './domain/aggregations.js'

export default function App() {
  const { registros, cargando, error } = useAvanceData()
  const [filtros, setFiltros] = useState({ estatus: 'todos', semana: 'todas', nivel: 'todos' })

  const { niveles } = useMemo(() => opcionesFiltros(registros), [registros])
  const filtrados = useMemo(() => filtrar(registros, filtros), [registros, filtros])
  const kpis = useMemo(() => calcularKpis(filtrados), [filtrados])

  return (
    <div className="wrap">
      <Header />

      {error && <div className="state-msg">Error al cargar datos: {String(error.message || error)}</div>}
      {cargando && <div className="state-msg">Cargando datos de avance…</div>}

      {!cargando && !error && (
        <>
          <KpiCards kpis={kpis} />
          <Filters filtros={filtros} setFiltros={setFiltros} niveles={niveles} />

          <div className="grid">
            <ViewerPanel registros={filtrados} />
            <div className="rightcol">
              <DonutSemana registros={filtrados} />
              <BarrasAvance registros={filtrados} />
            </div>
          </div>

          <PartidasTable registros={filtrados} />

          <div className="foot">
            <b>Fuente de partidas:</b> «REVISION DE PONDERADORES BIM.xlsx» → hoja «Detalle control bim» ·
            especialidad ARQ · cuantificable en BIM = «sí» (286 partidas).
            <br />
            Los % de avance, semanas y niveles son <b>datos DEMO</b> (fase 1). Se reemplazarán por datos
            reales de Supabase (fase 2).
          </div>
        </>
      )}
    </div>
  )
}
