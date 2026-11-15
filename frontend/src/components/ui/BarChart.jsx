export default function BarChart({items, empty = 'sem dados.'}) {
    const max = Math.max(0, ...items.map((i) => i.value))

    if (items.length === 0 || max === 0) return <p className="muted">{empty}</p>

    return (
        <div>
            {items.map((i) => (
                <div className="bar-row" key={i.key}>
                    <span className="bar-label" title={i.label}>
                        {i.label}
                    </span>
                    <div className="bar-track">
                        <div className={`bar-fill ${i.tone ? `tone-${i.tone}` : ''}`}
                        style={{width: `${(i.value / max) * 100}%` }}
                        />
                    </div>
                    <span className="bar-value">{i.value}</span>
                    </div>
            ))}
        </div>
    )
}