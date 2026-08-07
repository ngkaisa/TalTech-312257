import { Badge, StatusTag, TabPanel, Tabs, TTNewButton } from '@TalTech-IT/styleguide';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, getMyBookings } from '../../BronBookingsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StaatusKaart from '../../components/bron/StaatusKaart';
import { useRole } from '../../context/RoleContext';

function fmt(iso) {
    return new Date(iso).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const TODAY = new Date('2026-08-07');

function isUpcoming(b) {
    return new Date(b.algus) >= TODAY && b.staatus !== 'tühistatud';
}

function isTunniplaan(b) {
    return b.allikas === 'tunniplaan';
}

/** Ühe broneeringu rida — kasutatud nii "minu" kui "kõik" tabelis */
function BroneeringRida({ b, onCancel, cancelledId, showUser = false }) {
    const cancelled = cancelledId === b.id;
    const canAct = isUpcoming(b) && !isTunniplaan(b);

    return (
        <tr key={b.id}>
            <td><strong>{b.ruum}</strong><br /><span style={{ fontSize: '.75rem', color: '#9ca3af' }}>{b.hoone}</span></td>
            {showUser && <td style={{ fontSize: '.82rem' }}>{b.kasutaja_nimi ?? '—'}<br /><span style={{ fontSize: '.72rem', color: '#9ca3af' }}>{b.kasutaja_roll}</span></td>}
            <td>{fmt(b.algus)}</td>
            <td>{fmt(b.lopp)}</td>
            <td>{b.syndmus_label}</td>
            <td>
                {isTunniplaan(b)
                    ? <Badge color="purple" size="sm">Tunniplaan</Badge>
                    : <StaatusKaart staatus={b.staatus} />
                }
            </td>
            <td>
                {canAct && (
                    cancelled
                        ? <StatusTag type="success">✓ Tühistatud</StatusTag>
                        : <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'nowrap' }}>
                            {/* Muuda — §1.1.1: uni-ID saab enda broneeringuid muuta */}
                            <TTNewButton
                                as={Link}
                                to={`/uus-broneering/${b.ruum_id}`}
                                state={{ kuupaev: b.algus?.slice(0, 10), kellaaeg: null, kestus: b.kestus_h, syndmus: b.syndmus }}
                                variant="outline" size="sm"
                            >Muuda</TTNewButton>
                            {/* Tühista */}
                            <TTNewButton variant="danger" size="sm" onClick={() => onCancel(b.id)}>Tühista</TTNewButton>
                        </div>
                )}
            </td>
        </tr>
    );
}

export default function MinuBroneeringud() {
    const { currentRole, canSeeOwnBookings, isSuper } = useRole();
    const [activeTab, setActiveTab] = useState(0);
    const [cancelledIds, setCancelledIds] = useState(new Set());

    const myBookings = useMemo(() => getMyBookings(currentRole), [currentRole]);
    const allBookings = useMemo(() => isSuper ? getAllBookings() : [], [isSuper]);

    if (!canSeeOwnBookings) return <LigipaasPuudub />;

    function cancel(id) { setCancelledIds(prev => new Set([...prev, id])); }

    const upcoming = myBookings.filter(isUpcoming);
    const past = myBookings.filter(b => !isUpcoming(b));
    const shownMy = activeTab === 1 ? past : upcoming;

    // Super: tab 2 = kõik broneeringud
    const tabLabels = isSuper
        ? [
            <span>Tulevased <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{upcoming.length}</Badge></span>,
            <span>Ajalugu <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{past.length}</Badge></span>,
            <span>Kõik broneeringud <Badge color="pink" size="sm" style={{ marginLeft: '.4rem' }}>{allBookings.length}</Badge></span>,
        ]
        : [
            <span>Tulevased <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{upcoming.length}</Badge></span>,
            <span>Ajalugu <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{past.length}</Badge></span>,
        ];

    const thead = (showUser) => (
        <thead>
            <tr>
                <th>Ruum</th>
                {showUser && <th>Kasutaja</th>}
                <th>Algus</th><th>Lõpp</th><th>Sündmus</th><th>Staatus</th><th></th>
            </tr>
        </thead>
    );

    function renderTable(rows, showUser = false) {
        if (rows.length === 0) return <div className="bron-empty"><h3>Broneeringuid pole</h3></div>;
        return (
            <div className="bron-table-wrap">
                <table className="table table-hover">
                    {thead(showUser)}
                    <tbody>
                        {rows.map(b => (
                            <BroneeringRida key={b.id} b={b} onCancel={cancel} cancelledId={cancelledIds.has(b.id) ? b.id : null} showUser={showUser} />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: 'Minu broneeringud' }]} />
            <div className="bron-page-header">
                <div>
                    <h1>Minu broneeringud</h1>
                    <p>
                        {isSuper
                            ? 'Sinu broneeringud ja kõigi kasutajate broneeringud. §1.1.1: superkasutaja võib muuta ja tühistada teiste broneeringuid.'
                            : 'Sinu kinnitatud broneeringud. Vali „Muuda" muutmiseks või „Tühista" aja vabastamiseks.'
                        }
                    </p>
                </div>
                <TTNewButton as={Link} to="/otsi-ruumi" variant="primary">+ Uus broneering</TTNewButton>
            </div>

            <Tabs
                id="minu-broneeringud-tabs"
                labels={tabLabels}
                selectedIndex={activeTab}
                onSelect={setActiveTab}
            >
                <TabPanel>{renderTable(shownMy)}</TabPanel>
                <TabPanel>{renderTable(shownMy)}</TabPanel>
                {isSuper && <TabPanel>{renderTable(allBookings, true)}</TabPanel>}
            </Tabs>
        </div>
    );
}
