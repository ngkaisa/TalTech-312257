import { Badge, TabPanel, Tabs, TTNewButton } from '@TalTech-IT/styleguide';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests, getMyRequests } from '../../BronBookingsService';
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

    if (!isLoggedIn) return <LigipaasPuudub />;

    const pendingCount = allReqs.filter(r => r.seis === 'menetlusel').length;
    const shown = (canSeeFullStatistics && activeTab === 1) ? allReqs : myReqs;

    function doAction(id, act) { setActionId(id); setAction(act); }

    const tabLabels = canSeeFullStatistics
        ? [
            <span>Minu taotlused <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{myReqs.length}</Badge></span>,
            <span>Kõik menetlusel <Badge color="pink" size="sm" style={{ marginLeft: '.4rem' }}>{pendingCount}</Badge></span>,
          ]
        : [
            <span>Minu taotlused <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>{myReqs.length}</Badge></span>,
          ];

    function renderTable(rows) {
        if (rows.length === 0) return <div className="bron-empty"><h3>Taotlusi pole</h3></div>;
        return (
            <div className="bron-table-wrap">
                <table className="bron-table">
                    <thead>
                        <tr>
                            <th>Ruum</th>
                            <th>Algus</th>
                            <th>Sündmus</th>
                            {canSeeFullStatistics && <th>Taotleja</th>}
                            <th>Esitatud</th>
                            <th>Seis</th>
                            {canSeeFullStatistics && <th>Tegevused</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id}>
                                <td><strong>{r.ruum}</strong><br /><span style={{ fontSize: '.75rem', color: '#9ca3af' }}>{r.hoone}</span></td>
                                <td>{fmt(r.algus)}</td>
                                <td>{r.syndmus_label}</td>
                                {canSeeFullStatistics && (
                                    <td>
                                        <div style={{ fontSize: '.85rem' }}>{r.taotleja_nimi}</div>
                                        <div style={{ fontSize: '.75rem', color: '#6b7280' }}>{r.taotleja_org}</div>
                                    </td>
                                )}
                                <td>{fmtDate(r.esitatud)}</td>
                                <td>
                                    {actionId === r.id
                                        ? <StaatusKaart staatus={action === 'kinnita' ? 'kinnitatud' : 'tagasi_lykatud'} />
                                        : <StaatusKaart staatus={r.seis} />
                                    }
                                </td>
                                {canSeeFullStatistics && (
                                    <td>
                                        {r.seis === 'menetlusel' && actionId !== r.id && (
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
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: 'Taotlused' }]} />
            <div className="bron-page-header">
                <div>
                    <h1>{canSeeFullStatistics ? 'Taotluste menetlus' : 'Minu taotlused'}</h1>
                    <p>{canSeeFullStatistics
                        ? 'Vaata ja menetle saabunud broneerimisteateid.'
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
                <TabPanel>{renderTable(shown)}</TabPanel>
                {canSeeFullStatistics && <TabPanel>{renderTable(shown)}</TabPanel>}
            </Tabs>
        </div>
    );
}
