import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { colorSemana, COLOR_POR_EJECUTAR } from '../domain/colors.js'
import { superficiePorSemana } from '../domain/aggregations.js'
import { TOTAL_SEMANAS } from '../domain/constants.js'

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })

/** Dona de superficie (m²) por semana de ejecución. */
export default function DonutSemana({ registros }) {
  const data = superficiePorSemana(registros)
  const color = (d) => (d.semana === 0 ? COLOR_POR_EJECUTAR : colorSemana(d.semana, TOTAL_SEMANAS))

  return (
    <div className="card">
      <h2>Superficie (m²) por Semana</h2>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="label" innerRadius={58} outerRadius={95} paddingAngle={1}>
            {data.map((d) => (
              <Cell key={d.label} fill={color(d)} stroke="var(--surface)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${nf.format(v)} m²`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
