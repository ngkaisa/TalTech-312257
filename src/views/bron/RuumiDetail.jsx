import { useNavigate, useParams } from 'react-router-dom';
import { BRONEERINGUD, BRONEERINGU_STAATUS, RUUMID } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { RuumiGalerii } from '../../components/bron/RuumiGalerii';

function fmt(iso) {
    return new Date(iso).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function RuumiDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const room = RUUMID.find(r => r.id === id);

    if (!room) return <div className="bron-page"><h1>Ruum ei leitud</h1></div>;

    const recent = BRONEERINGUD
        .filter(b => b.ruum_id === id && b.staatus === BRONEERINGU_STAATUS.LOPPENUD)
        .slice(0, 10);

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Otsi ruumi', to: '/otsi-ruumi' },
                { label: room.code }
            ]} />

            <div className="bron-page-header">
                <div>
                    <h1>{room.code}</h1>
                    <p>{room.ruumitypp_label} · {room.hoone_name}</p>
                </div>
                <button className="bron-btn bron-btn-primary" onClick={() => navigate(`/broneeri/${room.id}`)}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>event_available</span>
                    Broneeri see ruum
                </button>
            </div>

            <RuumiGalerii ruumitypp={room.ruumitypp} alt={room.code} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Mahutavus', value: `${room.kohti} kohta` },
                    { label: 'Arvutikohti', value: room.arvutikohti > 0 ? `${room.arvutikohti} tk` : '—' },
                    { label: 'Hoone', value: room.hoone },
                    { label: 'Korrus', value: room.korrus },
                ].map(({ label, value }) => (
                    <div key={label} className="bron-kpi">
                        <div className="bron-kpi__value" style={{ fontSize: '1.4rem' }}>{value}</div>
                        <div className="bron-kpi__label">{label}</div>
                    </div>
                ))}
            </div>

            <div className="bron-card">
                <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)' }}>Viimased broneeringud</h3>
                {recent.length === 0
                    ? <p style={{ color: '#9ca3af' }}>Broneeringuid ei leitud.</p>
                    : (
                        <div className="bron-table-wrap">
                            <table className="bron-table">
                                <thead>
                                    <tr><th>Algus</th><th>Lõpp</th><th>Sündmus</th><th>Kestus</th></tr>
                                </thead>
                                <tbody>
                                    {recent.map(b => (
                                        <tr key={b.id}>
                                            <td>{fmt(b.algus)}</td>
                                            <td>{fmt(b.lopp)}</td>
                                            <td>{b.syndmus_label}</td>
                                            <td>{b.kestus_h} h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>
        </div>
    );
}
