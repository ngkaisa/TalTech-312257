import { Badge, StatusTag, TabPanel, Tabs, TTNewButton } from '@TalTech-IT/styleguide';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, getMyBookings } from '../../BronBookingsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StaatusKaart from '../../components/bron/StaatusKaart';
import { useRole } from '../../context/RoleContext';

const TYHIST_POHJUSED = [
    'Üritus jäi ära',
    'Kuupäev muutus',
    'Leidsin sobivama ruumi',
    'Osalejate arv muutus',
    'Tehniline viga broneerimisel',
    'Muu',
];

function TyhistamineModaal({ broneering, onKinnita, onSulge }) {
    const [liik, setLiik] = useState('');
    const [kommentaar, setKommentaar] = useState('');
    const kehtiv = liik !== '' && kommentaar.trim().length >= 5;

    function submit(e) {
        e.preventDefault();
        if (!kehtiv) return;
        onKinnita({ id: broneering.id, liik, kommentaar: kommentaar.trim() });
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
        }} onClick={onSulge}>
            <div style={{
                background: '#fff', borderRadius: 10, padding: '1.75rem',
                width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(52,43,96,.18)',
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{ margin: '0 0 .3rem', fontSize: '1.1rem', color: 'var(--tt-purple-500)' }}>
                    Tühista broneering
                </h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '.85rem', color: 'var(--tt-text-muted)' }}>
                    <strong>{broneering.ruum}</strong> · {new Date(broneering.algus).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <form onSubmit={submit}>
                    <div className="bron-form-group" style={{ marginBottom: '1rem' }}>
                        <label>Tühistamise põhjus *</label>
                        <select value={liik} onChange={e => setLiik(e.target.value)} required>
                            <option value="">Vali põhjus...</option>
                            {TYHIST_POHJUSED.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bron-form-group" style={{ marginBottom: '1.25rem' }}>
                        <label>Kommentaar *</label>
                        <textarea
                            value={kommentaar}
                            onChange={e => setKommentaar(e.target.value)}
                            rows={3}
                            placeholder="Kirjelda lühidalt tühistamise põhjust (min 5 tähemärki)"
                            style={{ resize: 'vertical' }}
                            required
                        />
                        {kommentaar.length > 0 && kommentaar.trim().length < 5 && (
                            <span style={{ fontSize: '.75rem', color: '#c41c1c' }}>
                                Kommentaar peab olema vähemalt 5 tähemärki
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="bron-btn bron-btn-secondary" onClick={onSulge}>
                            Loobu
                        </button>
                        <button type="submit" className="bron-btn bron-btn-danger" disabled={!kehtiv}>
                            Kinnita tühistamine
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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
                            <TTNewButton variant="danger" size="sm" onClick={() => onCancel(b)}>Tühista</TTNewButton>
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
    const [tyhistamisModaal, setTyhistamisModaal] = useState(null); // broneering objekt

    const myBookings = useMemo(() => getMyBookings(currentRole), [currentRole]);
    const allBookings = useMemo(() => isSuper ? getAllBookings() : [], [isSuper]);

    if (!canSeeOwnBookings) return <LigipaasPuudub />;

    function cancel(broneering) { setTyhistamisModaal(broneering); }
    function kinnitaTyhistamine({ id }) {
        setCancelledIds(prev => new Set([...prev, id]));
        setTyhistamisModaal(null);
    }

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
            {tyhistamisModaal && (
                <TyhistamineModaal
                    broneering={tyhistamisModaal}
                    onKinnita={kinnitaTyhistamine}
                    onSulge={() => setTyhistamisModaal(null)}
                />
            )}
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
