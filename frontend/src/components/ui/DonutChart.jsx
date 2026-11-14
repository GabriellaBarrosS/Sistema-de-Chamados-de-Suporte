const RAIO = 15.9155

export default function DonutChart({ items, centerLabel = 'Total' }) {
  const total = items.reduce((soma, i) => soma + i.value, 0)

  let acumulado = 0
  const fatias = items
  .filter((i) => i.value > 0)
  .map((i) => {
    const pct = (i.value / total) * 100
    const fatia = {...i, pct, inicio:acumulado}
    acumulado += pct
    return fatia
  })

  return (
    <div className="donut">
        <svg
        className="donut-svg"
        viewBox="0 0 42 42"
        role="img"
        aria-label={`Gráfico de rosca com ${total} chamados`}>
            <circle className="donut-track" cx="21" cy="21" r={RAIO} fill="none" strokeWidth="6" />
            {fatias.map((f) => (
                <circle
                key={f.key}
                className={`donut-slice tone-${f.tone}`}
                cx="21"
                cy="21"
                r={RAIO}
                fill="none"
                strokeWidth="6"
                strokeDasharray={`${f.pct} ${100 - f.pct}`}
                strokeDashoffset={25 - f.inicio} />
            ))}
        <text x="21" y="21.5" className="donut-total" textAnchor="middle">{total}</text>
        <text x="21" y="26" className="donut-caption" textAnchor="middle">{centerLabel}</text>
      </svg>

      <ul className="legend">
        {items.map((i) => (
            <li key={i.key}>
                <span className={`legend-dot tone-${i.tone}`}/>
                {i.label}: <strong>{i.value}</strong>
            </li>
        ))}
      </ul>

    </div>
  )
}