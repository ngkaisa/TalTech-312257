export default function KpiKaart({ value, label, sub, legend, variant = '' }) {
    return (
        <div className={`bron-kpi ${variant ? `bron-kpi--${variant}` : ''}`}>
            <div className="bron-kpi__value">{value}</div>
            <div className="bron-kpi__label">
                {label}
                {legend && (
                    <abbr
                        title={legend}
                        style={{
                            marginLeft: '.35rem',
                            cursor: 'help',
                            textDecoration: 'none',
                            fontSize: '.8rem',
                            opacity: 0.6,
                            verticalAlign: 'middle',
                        }}
                        aria-label={`Arvutusvalem: ${legend}`}
                    >ⓘ</abbr>
                )}
            </div>
            {sub && <div className="bron-kpi__sub">{sub}</div>}
        </div>
    );
}
