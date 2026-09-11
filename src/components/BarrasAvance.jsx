import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { avancePorSemana } from '../domain/aggregations.js'
import { colorSemana } from '../domain/colors.js'
import { TOTAL_SEMANAS } from '../domain/constants.js'

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })

/** Barras de superficie ejecutada (m²) por semana. */
export default function BarrasAvance({ registros }) {
  const data = avancePorSemana(registros)
  return (
    <div className="card">
      <h2>Avance ejecutado (m²) por Semana</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip formatter={(v) => `${nf.format(v)} m²`} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="valor" radius={[3, 3, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.semana} fill={colorSemana(d.semana, TOTAL_SEMANAS)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
