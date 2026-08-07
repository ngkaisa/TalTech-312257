import { Badge, TabPanel, Tabs, TTNewButton } from '@TalTech-IT/styleguide';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, getAllRequests, getMyRequests } from '../../BronBookingsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StaatusKaart from '../../components/bron/StaatusKaart';
import { useRole } from '../../context/RoleContext';

function fmt(iso) {
    return new Date(iso).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function MinuTaotlused() {
    const { currentRole, isLoggedIn, isExt, isTudeng, isTootaja, canSeeFullStatistics } = useRole();
    const [activeTab, setActiveTab] = useState(0);
    const [actionId, setActionId] = useState(null);
    const [action, setAction] = useState(null);

    const myReqs = useMemo(() => getMyRequests(currentRole), [currentRole]);
    const allReqs = useMemo(() => getAllRequests(), []);
    const allBookings = useMemo(() => canSeeFullStatistics ? getAllBookings() : [], [canSeeFullStatistics]);

    if (!isLoggedIn) return <LigipaasPuudub />;

    const pendingReqs = allReqs.filter(r => r.seis === 'menetlusel');

    function doAction(id, act) { setActionId(id); setAction(act); }

    // Haldur/Super: 2 tabi — Menetlusel + Kõik broneeringud
    // Tavakasutaja: 1 tab — Minu taotlused
    const tabLabels = canSeeFullStatistics
        ? [
            <span>Menetlusel <Badge color="pink" size="sm" style={{ marginLeft: '.4rem' }}>{pendingReqs.length}</Badge></span>,
            <span>Kõik broneeringud <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{allBookings.length}</Badge></span>,
          ]
        : [
            <span>Minu taotlused <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{myReqs.length}</Badge></span>,
          ];

    function renderTable(rows, showMeta = false, showActions = false, emptyLabel = 'Kirjeid pole') {
        if (rows.length === 0) return <div className="bron-empty"><h3>{emptyLabel}</h3></div>;
        return (
            <div className="bron-table-wrap">
                <table className="bron-table">
                    <thead>
                        <tr>
                            <th>Ruum</th>
                            <th>Algus</th>
                            <th>Sündmus</th>
                            {showMeta && <th>Taotleja / kasutaja</th>}
                            <th>{showMeta ? 'Esitatud' : 'Esitatud'}</th>
                            <th>Seis</th>
                            {showActions && <th>Tegevused</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id}>
                                <td><strong>{r.ruum}</strong><br /><span style={{ fontSize: '.75rem', color: '#9ca3af' }}>{r.hoone}</span></td>
                                <td>{fmt(r.algus)}</td>
                                <td>{r.syndmus_label}</td>
                                {showMeta && (
                                    <td>
                                        <div style={{ fontSize: '.85rem' }}>{r.taotleja_nimi ?? r.kasutaja_nimi ?? '—'}</div>
                                        <div style={{ fontSize: '.75rem', color: '#6b7280' }}>{r.taotleja_org ?? r.kasutaja_roll ?? ''}</div>
                                    </td>
                                )}
                                <td>{fmtDate(r.esitatud ?? r.algus)}</td>
                                <td>
                                    {actionId === r.id
                                        ? <StaatusKaart staatus={action === 'kinnita' ? 'kinnitatud' : 'tagasi_lykatud'} />
                                        : <StaatusKaart staatus={r.seis ?? r.staatus} />
                                    }
                                </td>
                                {showActions && (
                                    <td>
                                        {(r.seis === 'menetlusel') && actionId !== r.id && (
                                            <div style={{ display: 'flex', gap: '.4rem' }}>
                                                <TTNewButton variant="primary" size="sm" onClick={() => doAction(r.id, 'kinnita')}>Kinnita</TTNewButton>
                                                <TTNewButton variant="danger" size="sm" onClick={() => doAction(r.id, 'lykka')}>Lükka tagasi</TTNewButton>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: canSeeFullStatistics ? 'Broneeringute haldus' : 'Taotlused' }]} />
            <div className="bron-page-header">
                <div>
                    <h1>{canSeeFullStatistics ? 'Broneeringute haldus' : 'Minu taotlused'}</h1>
                    <p>{canSeeFullStatistics
                        ? 'Menetle saabunud taotlusi ja vaata kõiki kinnitatud broneeringuid.'
                        : 'Sinu esitatud broneeringutaotlused ja nende menetlusolek.'
                    }</p>
                </div>
                {(isTudeng || isTootaja || isExt) && (
                    <TTNewButton as={Link} to="/otsi-ruumi" variant="primary">+ Uus taotlus</TTNewButton>
                )}
            </div>

            <Tabs
                id="taotlused-tabs"
                labels={tabLabels}
                selectedIndex={activeTab}
                onSelect={setActiveTab}
            >
                {canSeeFullStatistics
                    ? <>
                        {/* Tab 0: Menetlusel — vajab otsust */}
                        <TabPanel>{renderTable(pendingReqs, true, true, 'Menetlusel taotlusi pole')}</TabPanel>
                        {/* Tab 1: Kõik broneeringud — info teiste kinnitatud broneeringutest */}
                        <TabPanel>{renderTable(allBookings.map(b => ({ ...b, seis: b.staatus })), true, false, 'Broneeringuid pole')}</TabPanel>
                      </>
                    : <TabPanel>{renderTable(myReqs, false, false, 'Taotlusi pole')}</TabPanel>
                }
            </Tabs>
        </div>
    );
}
