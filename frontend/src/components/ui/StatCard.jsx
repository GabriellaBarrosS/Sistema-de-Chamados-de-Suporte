export default function StantCard({ label, value, hint}) {
    return (
        <div className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            {hint && <small>{hint}</small>}
        </div>
    )
}