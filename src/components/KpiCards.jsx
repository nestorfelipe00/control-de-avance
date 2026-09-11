const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 })

/** Tarjetas de indicadores clave. */
export default function KpiCards({ kpis }) {
  const tiles = [
    { lbl: 'Partidas', val: nf.format(kpis.nPartidas), sub: 'de 286 ARQ' },
    { lbl: 'Superficie', val: `${nf.format(kpis.superficie)} m²`, sub: 'cuantificable BIM' },
    { lbl: 'Elementos', val: `${nf.format(kpis.unidades)} u`, sub: 'puertas / ventanas' },
    { lbl: 'En progreso', val: nf.format(kpis.nProgreso), sub: 'partidas' },
    { lbl: 'Por ejecutar', val: nf.format(kpis.nPorEjecutar), sub: 'partidas' }
  ]
  return (
    <div className="kpis">
      {tiles.map((t) => (
        <div className="kpi" key={t.lbl}>
          <div className="lbl">{t.lbl}</div>
          <div className="val">{t.val}</div>
          <div className="sub">{t.sub}</div>
        </div>
      ))}
      <div className="kpi hl">
        <div className="lbl">% Ejecutado</div>
        <div className="val">{nf1.format(kpis.pctEjecutado)}%</div>
        <div className="sub">ponderado por m²</div>
      </div>
    </div>
  )
}
