import { useState } from 'react'
import { resumenPorPartida } from '../domain/aggregations.js'
import { ESTADO_COLOR } from '../domain/colors.js'
import { ESTADOS, ESTADO_LABEL } from '../domain/constants.js'

const nf1 = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 })

function estadoDe(pct) {
  if (pct >= 99) return ESTADOS.EJECUTADO
  if (pct <= 0) return ESTADOS.POR_EJECUTAR
  return ESTADOS.EN_PROGRESO
}

/** Tabla de partidas ARQ con cantidad y % ejecutado. */
export default function PartidasTable({ registros }) {
  const [sortK, setSortK] = useState('cantidad')
  let rows = resumenPorPartida(registros)
  rows = [...rows].sort((a, b) =>
    sortK === 'partida' ? a.partida.localeCompare(b.partida) : (b[sortK] ?? 0) - (a[sortK] ?? 0)
  )

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2>
        Partidas ARQ cuantificables en BIM{' '}
        <small>· {rows.length} tipos · {registros.length} registros</small>
      </h2>
      <div className="tbl-scroll">
        <table>
          <thead>
            <tr>
              <th onClick={() => setSortK('partida')}>Partida</th>
              <th>Unidad</th>
              <th className="num" onClick={() => setSortK('cantidad')}>Cantidad</th>
              <th onClick={() => setSortK('pctEjecutado')}>% Ejecutado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="state-msg">Sin partidas para este filtro</td>
              </tr>
            )}
            {rows.map((o) => {
              const est = estadoDe(o.pctEjecutado)
              const col = ESTADO_COLOR[est]
              return (
                <tr key={o.partida + o.unidad}>
                  <td>{o.partida}</td>
                  <td>{o.unidad}</td>
                  <td className="num">{nf1.format(o.cantidad)}</td>
                  <td>
                    <div className="barcell">
                      <div className="bar">
                        <i style={{ width: `${o.pctEjecutado}%`, background: col }} />
                      </div>
                      <span className="pct">{Math.round(o.pctEjecutado)}%</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="pill"
                      style={{ background: `color-mix(in srgb, ${col} 16%, transparent)`, color: col }}
                    >
                      <i className="dot" style={{ background: col }} />
                      {ESTADO_LABEL[est]}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
