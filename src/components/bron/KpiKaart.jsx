export default function KpiKaart({ value, label, sub, variant = '' }) {
    return (
        <div className={`bron-kpi ${variant ? `bron-kpi--${variant}` : ''}`}>
            <div className="bron-kpi__value">{value}</div>
            <div className="bron-kpi__label">{label}</div>
            {sub && <div className="bron-kpi__sub">{sub}</div>}
        </div>
    );
}
