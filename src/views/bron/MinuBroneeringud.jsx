import { useMemo, useState } from 'react';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StaatusKaart from '../../components/bron/StaatusKaart';
import { useRole } from '../../context/RoleContext';
import { getMyBookings } from '../../BronBookingsService';

function fmt(iso) {
    return new Date(iso).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MinuBroneeringud() {
    const { currentRole, canSeeOwnBookings } = useRole();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [cancelledId, setCancelledId] = useState(null);

    const bookings = useMemo(() => getMyBookings(currentRole), [currentRole]);

    const upcoming = bookings.filter(b => new Date(b.algus) >= new Date('2026-07-15') && b.staatus !== 'tühistatud');
    const past = bookings.filter(b => new Date(b.algus) < new Date('2026-07-15') || b.staatus === 'tühistatud');
    const shown = activeTab === 'upcoming' ? upcoming : past;

    if (!canSeeOwnBookings) return <LigipaasPuudub />;

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: 'Minu broneeringud' }]} />
            <div className="bron-page-header">
                <div>
                    <h1>Minu broneeringud</h1>
                    <p>Sinu kinnitatud broneeringud. Vali „Tühista", et vabastada aeg teistele kasutajatele.</p>
                </div>
                <a href="/otsi-ruumi" className="bron-btn bron-btn-primary">+ Uus broneering</a>
            </div>

            <div className="bron-tabs">
                <button className={`bron-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
                    Tulevased <span className="bron-badge bron-badge--neutral" style={{ marginLeft: '.4rem' }}>{upcoming.length}</span>
                </button>
                <button className={`bron-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
                    Ajalugu <span className="bron-badge bron-badge--neutral" style={{ marginLeft: '.4rem' }}>{past.length}</span>
                </button>
            </div>

            {shown.length === 0
                ? <div className="bron-empty"><h3>Broneeringuid pole</h3></div>
                : (
                    <div className="bron-table-wrap">
                        <table className="bron-table">
                            <thead>
                                <tr><th>Ruum</th><th>Hoone</th><th>Algus</th><th>Lõpp</th><th>Sündmus</th><th>Staatus</th><th></th></tr>
                            </thead>
                            <tbody>
                                {shown.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>{b.ruum}</strong></td>
                                        <td style={{ fontSize: '.8rem', color: '#6b7280' }}>{b.hoone}</td>
                                        <td>{fmt(b.algus)}</td>
                                        <td>{fmt(b.lopp)}</td>
                                        <td>{b.syndmus_label}</td>
                                        <td><StaatusKaart staatus={b.staatus} /></td>
                                        <td>
                                            {activeTab === 'upcoming' && b.staatus !== 'tühistatud' && (
                                                cancelledId === b.id
                                                    ? <span className="bron-badge bron-badge--success">✓ Tühistatud</span>
                                                    : <button className="bron-btn bron-btn-danger bron-btn-sm" onClick={() => setCancelledId(b.id)}>Tühista</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>
    );
}
