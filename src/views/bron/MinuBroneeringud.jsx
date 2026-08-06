import { Badge, StatusTag, TabPanel, Tabs, TTNewButton } from '@TalTech-IT/styleguide';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../../BronBookingsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StaatusKaart from '../../components/bron/StaatusKaart';
import { useRole } from '../../context/RoleContext';

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
                <TTNewButton as={Link} to="/otsi-ruumi" variant="primary">+ Uus broneering</TTNewButton>
            </div>

            <Tabs
                id="minu-broneeringud-tabs"
                labels={[
                    <span>Tulevased <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{upcoming.length}</Badge></span>,
                    <span>Ajalugu <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{past.length}</Badge></span>
                ]}
                selectedIndex={activeTab === 'upcoming' ? 0 : 1}
                onSelect={(i) => setActiveTab(i === 0 ? 'upcoming' : 'past')}
            >
                <TabPanel>
                {shown.length === 0
                    ? <div className="bron-empty"><h3>Broneeringuid pole</h3></div>
                    : (
                        <div className="bron-table-wrap">
                            <table className="table table-hover">
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
                                                        ? <StatusTag type="success">✓ Tühistatud</StatusTag>
                                                        : <TTNewButton variant="danger" size="sm" onClick={() => setCancelledId(b.id)}>Tühista</TTNewButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
                </TabPanel>
                <TabPanel>
                {shown.length === 0
                    ? <div className="bron-empty"><h3>Broneeringuid pole</h3></div>
                    : (
                        <div className="bron-table-wrap">
                            <table className="table table-hover">
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
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
                </TabPanel>
            </Tabs>
        </div>
    );
}
