import { useMemo, useState } from 'react';
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
    const [activeTab, setActiveTab] = useState('mine');
    const [actionId, setActionId] = useState(null);
    const [action, setAction] = useState(null);

    const myReqs = useMemo(() => getMyRequests(currentRole), [currentRole]);
    const allReqs = useMemo(() => getAllRequests(), []);

    if (!isLoggedIn) return <LigipaasPuudub />;

    const shown = (canSeeFullStatistics && activeTab === 'all') ? allReqs : myReqs;

    function doAction(id, act) { setActionId(id); setAction(act); }

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
                    <a href="/otsi-ruumi" className="bron-btn bron-btn-primary">+ Uus taotlus</a>
                )}
            </div>

            {canSeeFullStatistics && (
                <div className="bron-tabs">
                    <button className={`bron-tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
                        Minu taotlused
                    </button>
                    <button className={`bron-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        Kõik menetlusel <span className="bron-badge bron-badge--warn" style={{ marginLeft: '.4rem' }}>{allReqs.filter(r => r.seis === 'menetlusel').length}</span>
                    </button>
                </div>
            )}

            {shown.length === 0
                ? <div className="bron-empty"><h3>Taotlusi pole</h3></div>
                : (
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
                                {shown.map(r => (
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
                                                ? <span className={`bron-badge ${action === 'kinnita' ? 'bron-badge--success' : 'bron-badge--danger'}`}>
                                                    {action === 'kinnita' ? '✓ Kinnitatud' : '✗ Tagasi lükatud'}
                                                  </span>
                                                : <StaatusKaart staatus={r.seis} />
                                            }
                                        </td>
                                        {canSeeFullStatistics && (
                                            <td>
                                                {r.seis === 'menetlusel' && actionId !== r.id && (
                                                    <div style={{ display: 'flex', gap: '.4rem' }}>
                                                        <button className="bron-btn bron-btn-primary bron-btn-sm" onClick={() => doAction(r.id, 'kinnita')}>Kinnita</button>
                                                        <button className="bron-btn bron-btn-danger bron-btn-sm" onClick={() => doAction(r.id, 'lykka')}>Lükka tagasi</button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
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
