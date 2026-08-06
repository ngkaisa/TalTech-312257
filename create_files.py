#!/usr/bin/env python3
"""Loob kõik BRON React failid."""
import os, textwrap

BASE = "/Users/kaisa.liiv/Desktop/TalTech/Proovikas/bron-react/src"

files = {}

# ─── AppTopbar ───────────────────────────────────────────────────────────────
files["layout/AppTopbar.jsx"] = r"""
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROLE_LABELS, ROLES, useRole } from '../context/RoleContext';

const ROLE_ICONS = {
    [ROLES.GUEST]:  '👤',
    [ROLES.SUPER]:  '🛡️',
    [ROLES.HALDUR]: '🔑',
    [ROLES.UNI]:    '🎓',
    [ROLES.EXT]:    '🌐',
};

export default function AppTopbar() {
    const { currentRole, currentRoleLabel, isGuest, isLoggedIn, canSeeFullStatistics, canSeeOwnBookings, setRole } = useRole();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    function handleKey(e) {
        if (e.key === 'Escape') setMenuOpen(false);
    }

    return (
        <header>
            {/* Pre-header */}
            <div className="bron-preheader">
                <div className="bron-preheader__inner">
                    <NavLink to="/" className="bron-preheader__tab">RUUMIDE BRONEERIMINE</NavLink>
                    <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.75rem' }}>EST | ENG</span>
                </div>
            </div>

            {/* Main bar */}
            <div className="bron-mainbar">
                <div className="bron-mainbar__inner">
                    <NavLink to="/" className="bron-logo">
                        BRON <span>·</span> TalTech
                    </NavLink>

                    <nav className="bron-topnav">
                        {(isLoggedIn || true) && (
                            <NavLink to="/otsi-ruumi" className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Otsi ruumi
                            </NavLink>
                        )}
                        {canSeeOwnBookings && (
                            <NavLink to="/broneeringud" className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Broneeringud
                            </NavLink>
                        )}
                        {(canSeeOwnBookings || !canSeeFullStatistics) && (
                            <NavLink to="/taotlused" className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Taotlused
                            </NavLink>
                        )}
                        {canSeeFullStatistics && (
                            <NavLink to="/statistika" className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Statistika
                            </NavLink>
                        )}
                    </nav>

                    <div className="bron-topnav__right">
                        <span className="bron-topnav__org">Tallinna Tehnikaülikool</span>

                        {/* Role switcher (demo) */}
                        <div className="bron-role-dropdown" ref={menuRef} onKeyDown={handleKey}>
                            <button
                                className="bron-role-pill"
                                onClick={() => setMenuOpen(o => !o)}
                                aria-expanded={menuOpen}
                            >
                                {ROLE_ICONS[currentRole]} {currentRoleLabel}
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="bron-role-menu" role="menu">
                                    <div className="bron-role-menu__label">Demo: vaheta rolli</div>
                                    {Object.entries(ROLES).map(([, role]) => (
                                        <button
                                            key={role}
                                            className={`bron-role-menu__item ${currentRole === role ? 'active' : ''}`}
                                            onClick={() => { setRole(role); setMenuOpen(false); }}
                                            role="menuitem"
                                        >
                                            {ROLE_ICONS[role]} {ROLE_LABELS[role]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
"""

# ─── AppSidebar ──────────────────────────────────────────────────────────────
files["layout/AppSidebar.jsx"] = r"""
import { NavLink } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function AppSidebar() {
    const { isLoggedIn, isInternal, isExt, canSeeFullStatistics, canSeeOwnBookings } = useRole();

    function link(to, label, emoji) {
        return (
            <li key={to}>
                <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => 'bron-nav__link' + (isActive ? ' active' : '')}
                >
                    <span>{emoji}</span> {label}
                </NavLink>
            </li>
        );
    }

    return (
        <aside className="bron-sidebar">
            <ul className="bron-nav">
                <li className="bron-nav__section">Avaleht</li>
                {link('/', 'Avaleht', '🏠')}

                {(isInternal || isExt) && <>
                    <li className="bron-nav__section">Ruumid</li>
                    {link('/otsi-ruumi', 'Otsi ruumi', '🔍')}
                </>}

                {canSeeOwnBookings && <>
                    <li className="bron-nav__section">Minu</li>
                    {link('/broneeringud', 'Minu broneeringud', '📅')}
                    {link('/taotlused', 'Minu taotlused', '📄')}
                </>}

                {isExt && !canSeeOwnBookings && <>
                    <li className="bron-nav__section">Minu</li>
                    {link('/taotlused', 'Minu taotlused', '📄')}
                </>}

                {canSeeFullStatistics && <>
                    <li className="bron-nav__section">Statistika</li>
                    {link('/statistika', 'Ülevaade', '📊')}
                </>}

                <li className="bron-nav__section">Avalik</li>
                {link('/avalik/populaarsed-ajad', 'Populaarsed ajad', '🕐')}
            </ul>
        </aside>
    );
}
"""

# ─── AppLayout ───────────────────────────────────────────────────────────────
files["layout/AppLayout.jsx"] = r"""
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

export default function AppLayout() {
    return (
        <div className="bron-layout">
            <AppTopbar />
            <div className="bron-body">
                <AppSidebar />
                <main className="bron-main" id="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
"""

# ─── Components ──────────────────────────────────────────────────────────────
files["components/bron/BronBreadcrumbs.jsx"] = r"""
import { Link } from 'react-router-dom';

export default function BronBreadcrumbs({ items = [] }) {
    return (
        <nav className="bron-breadcrumb" aria-label="Leivapuru">
            {items.map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    {i > 0 && <span aria-hidden="true">›</span>}
                    {item.to
                        ? <Link to={item.to}>{item.label}</Link>
                        : <span>{item.label}</span>
                    }
                </span>
            ))}
        </nav>
    );
}
"""

files["components/bron/LigipaasPuudub.jsx"] = r"""
import { Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export default function LigipaasPuudub({ message }) {
    const { currentRoleLabel } = useRole();
    return (
        <div className="bron-access-denied">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2>Ligipääs puudub</h2>
            <p>{message || `Roll „${currentRoleLabel}" ei oma sellele lehele ligipääsu.`}</p>
            <Link to="/" className="bron-btn bron-btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                ← Tagasi avalehele
            </Link>
        </div>
    );
}
"""

files["components/bron/KpiKaart.jsx"] = r"""
export default function KpiKaart({ value, label, sub, variant = '' }) {
    return (
        <div className={`bron-kpi ${variant ? `bron-kpi--${variant}` : ''}`}>
            <div className="bron-kpi__value">{value}</div>
            <div className="bron-kpi__label">{label}</div>
            {sub && <div className="bron-kpi__sub">{sub}</div>}
        </div>
    );
}
"""

files["components/bron/StaatusKaart.jsx"] = r"""
const SEVERITY_MAP = {
    aktiivne: 'info',
    'lõppenud': 'success',
    'tühistatud': 'danger',
    taotlus: 'warn',
    menetlusel: 'warn',
    kinnitatud: 'success',
    tagasi_lykatud: 'danger',
    tuhistatud: 'neutral',
};

const LABEL_MAP = {
    aktiivne: 'Aktiivne',
    'lõppenud': 'Lõppenud',
    'tühistatud': 'Tühistatud',
    taotlus: 'Taotlus',
    menetlusel: 'Menetlusel',
    kinnitatud: 'Kinnitatud',
    tagasi_lykatud: 'Tagasi lükatud',
    tuhistatud: 'Tuhistatud',
};

export default function StaatusKaart({ staatus }) {
    const sev = SEVERITY_MAP[staatus] || 'neutral';
    return (
        <span className={`bron-badge bron-badge--${sev}`}>
            {LABEL_MAP[staatus] || staatus}
        </span>
    );
}
"""

files["components/bron/PlatseholderVaade.jsx"] = r"""
export default function PlatseholderVaade({ title = 'Tühi', message = 'Andmeid ei leitud.' }) {
    return (
        <div className="bron-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📭</div>
            <h3>{title}</h3>
            <p>{message}</p>
        </div>
    );
}
"""

files["components/bron/StatistikaFilter.jsx"] = r"""
import { HOONED, RUUMITYYBID } from '../../BronStatisticsService';

export default function StatistikaFilter({ filters, onChange }) {
    function set(key, value) {
        onChange({ ...filters, [key]: value });
    }

    return (
        <div className="bron-filters">
            <div className="bron-form-group" style={{ minWidth: 160 }}>
                <label>Hoone</label>
                <select value={filters.hoone?.[0] || ''} onChange={e => set('hoone', e.target.value ? [e.target.value] : [])}>
                    <option value="">Kõik hooned</option>
                    {HOONED.map(h => <option key={h.code} value={h.code}>{h.code}</option>)}
                </select>
            </div>

            <div className="bron-form-group" style={{ minWidth: 180 }}>
                <label>Ruumitüüp</label>
                <select value={filters.ruumitypp?.[0] || ''} onChange={e => set('ruumitypp', e.target.value ? [e.target.value] : [])}>
                    <option value="">Kõik tüübid</option>
                    {RUUMITYYBID.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                </select>
            </div>

            <div className="bron-form-group" style={{ minWidth: 130 }}>
                <label>Alates</label>
                <input type="date" value={filters.algus_alates || ''} onChange={e => set('algus_alates', e.target.value)} />
            </div>

            <div className="bron-form-group" style={{ minWidth: 130 }}>
                <label>Kuni</label>
                <input type="date" value={filters.algus_kuni || ''} onChange={e => set('algus_kuni', e.target.value)} />
            </div>

            <button
                className="bron-btn bron-btn-secondary"
                onClick={() => onChange({ hoone: [], ruumitypp: [] })}
                style={{ alignSelf: 'flex-end' }}
            >
                Tühjenda
            </button>
        </div>
    );
}
"""

# ─── Views ───────────────────────────────────────────────────────────────────
files["views/bron/Avaleht.jsx"] = r"""
import { Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { getGlobalCounts } from '../../BronStatisticsService';

const counts = getGlobalCounts();

export default function Avaleht() {
    const { currentRoleLabel, isGuest, isInternal, isExt, isUni,
            canSeeFullStatistics, canSeeOwnBookings, isLoggedIn } = useRole();

    return (
        <div className="bron-page">
            {/* Header */}
            <div className="bron-page-header">
                <div>
                    <h1>{isGuest ? 'Ruumide broneerimine' : <>Tere, <span style={{ color: 'var(--tt-magenta)' }}>{currentRoleLabel}</span>!</>}</h1>
                    <p>
                        {isGuest && 'Sirvi TalTechi ruume ja vaata populaarseid broneerimisaegu.'}
                        {canSeeFullStatistics && 'Menetle taotlusi ja vaata ruumide kasutusstatistikat.'}
                        {isUni && 'Broneeri auditooriume, seminariruume ja laboreid ülikooli hoonetes.'}
                        {isExt && 'Esita broneeringutaotlus TalTechi ruumide kasutamiseks.'}
                    </p>
                </div>
                {isLoggedIn && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { v: counts.hooned, l: 'hoonet' },
                            { v: counts.ruumid, l: 'ruumi' },
                            { v: counts.broneeringud.toLocaleString('et-EE'), l: 'broneeringut' },
                        ].map(({ v, l }) => (
                            <div key={l} className="bron-kpi" style={{ minWidth: 100 }}>
                                <div className="bron-kpi__value" style={{ fontSize: '1.4rem' }}>{v}</div>
                                <div className="bron-kpi__label">{l}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div className="bron-quick-grid">
                {(isInternal || isExt) && (
                    <Link to="/otsi-ruumi" className="bron-action-card">
                        <div className="bron-action-card__icon">🔍</div>
                        <h3>Otsi ruumi</h3>
                        <p>Leia sobiv ruum hoone, tüübi või mahutavuse järgi.</p>
                    </Link>
                )}
                {canSeeOwnBookings && (
                    <Link to="/broneeringud" className="bron-action-card">
                        <div className="bron-action-card__icon">📅</div>
                        <h3>Minu broneeringud</h3>
                        <p>Vaata oma kinnitatud ja tulevasi broneeringuid.</p>
                    </Link>
                )}
                {isExt && (
                    <Link to="/taotlused" className="bron-action-card">
                        <div className="bron-action-card__icon">📄</div>
                        <h3>Minu taotlused</h3>
                        <p>Väliste kasutajate broneeringutaotluste seis.</p>
                    </Link>
                )}
                {canSeeFullStatistics && (
                    <Link to="/taotlused" className="bron-action-card bron-action-card--highlight">
                        <div className="bron-action-card__icon">📥</div>
                        <h3>Taotluste menetlus</h3>
                        <p>Vaata ja menetle ootavaid broneeringutaotlusi.</p>
                    </Link>
                )}
                {canSeeFullStatistics && (
                    <Link to="/statistika" className="bron-action-card">
                        <div className="bron-action-card__icon">📊</div>
                        <h3>Statistika</h3>
                        <p>Ruumide kasutus, populaarsed ajad, tühistamised.</p>
                    </Link>
                )}
                {isGuest && (
                    <Link to="/avalik/populaarsed-ajad" className="bron-action-card">
                        <div className="bron-action-card__icon">🕐</div>
                        <h3>Populaarsed ajad</h3>
                        <p>Vaata millal on ruumid kõige rohkem hõivatud.</p>
                    </Link>
                )}
            </div>

            {isGuest && (
                <div style={{ background: '#fff', border: '1px solid #e2e5eb', borderRadius: 8, padding: '1.5rem', maxWidth: 480 }}>
                    <h3 style={{ margin: '0 0 .75rem', color: 'var(--tt-navy)' }}>Sisselogimine</h3>
                    <p style={{ color: '#6b7280', fontSize: '.875rem', margin: '0 0 1rem' }}>
                        TalTechi töötajad ja tudengid saavad sisse logida ülikooliportaali kaudu.
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '.75rem', margin: 0 }}>
                        💡 Demo: vaheta rolli päises üleval paremas nurgas.
                    </p>
                </div>
            )}
        </div>
    );
}
"""

files["views/bron/LigipaasPuudub.jsx"] = r"""
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
export default LigipaasPuudub;
"""

files["views/bron/OtsiRuumi.jsx"] = r"""
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { HOONED, RUUMID, RUUMITYYBID } from '../../BronStatisticsService';
import { searchRooms } from '../../BronBookingsService';

const ROOM_PHOTOS = {
    aula: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop',
    uldkasutatav_auditoorium: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=200&fit=crop',
    seminariruum: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop',
    arvutiklass: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop',
    labor: 'https://images.unsplash.com/photo-1532094349884-543559ba97f4?w=400&h=200&fit=crop',
};
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&h=200&fit=crop';

export default function OtsiRuumi() {
    const navigate = useNavigate();
    const [query, setQuery] = useState({
        hoone: '', ruumitypp: '', min_kohti: '', otsing: '',
    });

    function set(key, val) { setQuery(q => ({ ...q, [key]: val })); }

    const results = useMemo(() => searchRooms(query), [query]);
    const totalCount = results.length;
    const freeCount = results.filter(r => r.vaba).length;

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: 'Otsi ruumi' }]} />
            <div className="bron-page-header">
                <div>
                    <h1>Otsi ruumi</h1>
                    <p>Leia sobiv ruum TalTechi hoonetes. Näidatakse {totalCount} ruumi, neist {freeCount} vaba.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bron-filters" style={{ marginBottom: '1.5rem' }}>
                <div className="bron-form-group" style={{ minWidth: 160 }}>
                    <label>Hoone</label>
                    <select value={query.hoone} onChange={e => set('hoone', e.target.value)}>
                        <option value="">Kõik hooned</option>
                        {HOONED.map(h => <option key={h.code} value={h.code}>{h.code} — {h.name.split('—')[1]?.trim()}</option>)}
                    </select>
                </div>
                <div className="bron-form-group" style={{ minWidth: 180 }}>
                    <label>Ruumitüüp</label>
                    <select value={query.ruumitypp} onChange={e => set('ruumitypp', e.target.value)}>
                        <option value="">Kõik tüübid</option>
                        {RUUMITYYBID.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                    </select>
                </div>
                <div className="bron-form-group" style={{ minWidth: 120 }}>
                    <label>Min kohti</label>
                    <input type="number" min="1" placeholder="nt 20" value={query.min_kohti}
                        onChange={e => set('min_kohti', e.target.value)} />
                </div>
                <div className="bron-form-group" style={{ minWidth: 200 }}>
                    <label>Otsing</label>
                    <input type="text" placeholder="Ruumi kood..." value={query.otsing}
                        onChange={e => set('otsing', e.target.value)} />
                </div>
                <button className="bron-btn bron-btn-secondary"
                    style={{ alignSelf: 'flex-end' }}
                    onClick={() => setQuery({ hoone: '', ruumitypp: '', min_kohti: '', otsing: '' })}>
                    Tühjenda
                </button>
            </div>

            {/* Results */}
            <div className="bron-card-grid">
                {results.map(room => (
                    <div key={room.id} className="bron-room-card" onClick={() => navigate(`/ruum/${room.id}`)}>
                        <img
                            src={ROOM_PHOTOS[room.ruumitypp] || DEFAULT_PHOTO}
                            alt={room.name}
                            className="bron-room-card__img"
                            onError={e => { e.target.src = DEFAULT_PHOTO; }}
                        />
                        <div className="bron-room-card__body">
                            <div className="bron-room-card__name">{room.code}</div>
                            <div className="bron-room-card__meta">
                                {room.ruumitypp_label} · {room.hoone_name?.split('—')[0].trim()}
                            </div>
                            <div style={{ marginTop: '.5rem', display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="bron-stat-chip">👥 {room.kohti} kohta</span>
                                {room.arvutikohti > 0 && <span className="bron-stat-chip">💻 {room.arvutikohti} arvutit</span>}
                            </div>
                        </div>
                        <div className="bron-room-card__footer">
                            <span className={`bron-badge ${room.vaba ? 'bron-badge--success' : 'bron-badge--danger'}`}>
                                {room.vaba ? '✓ Vaba' : '✗ Hõivatud'}
                            </span>
                            <button
                                className="bron-btn bron-btn-primary bron-btn-sm"
                                onClick={e => { e.stopPropagation(); navigate(`/broneeri/${room.id}`); }}
                            >
                                Broneeri
                            </button>
                        </div>
                    </div>
                ))}
                {results.length === 0 && (
                    <div className="bron-empty" style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '2rem' }}>🔍</div>
                        <h3>Tulemusi ei leitud</h3>
                        <p>Muuda filtriparameetreid.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
"""

files["views/bron/RuumiDetail.jsx"] = r"""
import { useNavigate, useParams } from 'react-router-dom';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { RUUMID } from '../../BronStatisticsService';
import { BRONEERINGUD, BRONEERINGU_STAATUS } from '../../BronStatisticsService';

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
                    📅 Broneeri see ruum
                </button>
            </div>

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
"""

files["views/bron/MinuBroneeringud.jsx"] = r"""
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
                    📅 Tulevased <span className="bron-badge bron-badge--neutral" style={{ marginLeft: '.4rem' }}>{upcoming.length}</span>
                </button>
                <button className={`bron-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
                    🕐 Ajalugu <span className="bron-badge bron-badge--neutral" style={{ marginLeft: '.4rem' }}>{past.length}</span>
                </button>
            </div>

            {shown.length === 0
                ? <div className="bron-empty"><div style={{ fontSize: '2rem' }}>📭</div><h3>Broneeringuid pole</h3></div>
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
"""

files["views/bron/MinuTaotlused.jsx"] = r"""
import { useMemo, useState } from 'react';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StaatusKaart from '../../components/bron/StaatusKaart';
import { useRole } from '../../context/RoleContext';
import { getAllRequests, getMyRequests } from '../../BronBookingsService';

function fmt(iso) {
    return new Date(iso).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function MinuTaotlused() {
    const { currentRole, isLoggedIn, isExt, isUni, canSeeFullStatistics } = useRole();
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
                {(isUni || isExt) && (
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
                ? <div className="bron-empty"><div style={{ fontSize: '2rem' }}>📭</div><h3>Taotlusi pole</h3></div>
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
"""

files["views/bron/BroneeringuVorm.jsx"] = r"""
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { useRole } from '../../context/RoleContext';
import { RUUMID } from '../../BronStatisticsService';
import { SYNDMUSETYYBID } from '../../BronStatisticsService';

const KELLAAEG_OPTS = Array.from({ length: 29 }, (_, i) => {
    const totalMin = 480 + i * 30;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return { label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, value: totalMin };
});

const KESTUS_OPTS = [
    { label: '30 min', h: 0.5 }, { label: '1 tund', h: 1 }, { label: '1,5 tundi', h: 1.5 },
    { label: '2 tundi', h: 2 }, { label: '3 tundi', h: 3 }, { label: '4 tundi', h: 4 },
];

export default function BroneeringuVorm() {
    const { ruum_id } = useParams();
    const navigate = useNavigate();
    const { isExt, isLoggedIn } = useRole();
    const [submitted, setSubmitted] = useState(false);

    const defaultRoom = ruum_id ? RUUMID.find(r => r.id === ruum_id) : null;

    const [form, setForm] = useState({
        ruum_id: defaultRoom?.id || '',
        kuupaev: '2026-08-10',
        kellaaeg: 540,
        kestus: 2,
        syndmus: 'oppe_teadus',
        pohjendus: '',
        osalejate_arv: '',
    });

    function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    if (!isLoggedIn) {
        return (
            <div className="bron-page">
                <div className="bron-access-denied">
                    <h2>Sisselogimine nõutud</h2>
                    <p>Broneeringu loomiseks peate olema sisse logitud.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="bron-page" style={{ maxWidth: 480 }}>
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>✅</div>
                    <h2 style={{ color: '#065f46', margin: '0 0 .5rem' }}>
                        {isExt ? 'Taotlus esitatud!' : 'Broneering kinnitatud!'}
                    </h2>
                    <p style={{ color: '#047857', margin: '0 0 1.5rem' }}>
                        {isExt
                            ? 'Sinu taotlus on saadetud ruumihaldurile menetlemiseks.'
                            : 'Broneering on edukalt registreeritud.'}
                    </p>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
                        <button className="bron-btn bron-btn-primary" onClick={() => navigate('/broneeringud')}>Vaata broneeringuid</button>
                        <button className="bron-btn bron-btn-secondary" onClick={() => setSubmitted(false)}>Uus broneering</button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedRoom = RUUMID.find(r => r.id === form.ruum_id);

    return (
        <div className="bron-page" style={{ maxWidth: 700 }}>
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Otsi ruumi', to: '/otsi-ruumi' },
                { label: isExt ? 'Uus taotlus' : 'Uus broneering' }
            ]} />
            <div className="bron-page-header">
                <div>
                    <h1>{isExt ? 'Esita taotlus' : 'Uus broneering'}</h1>
                    <p>{isExt ? 'Täida taotlusvorm — haldur kinnitab selle käsitsi.' : 'Broneeri ruum ülikoolihoonetes.'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bron-card">
                <div className="bron-form-grid">
                    <div className="bron-form-group">
                        <label>Ruum *</label>
                        <select value={form.ruum_id} onChange={e => set('ruum_id', e.target.value)} required>
                            <option value="">Vali ruum...</option>
                            {RUUMID.map(r => (
                                <option key={r.id} value={r.id}>{r.code} ({r.ruumitypp_label}, {r.kohti} kohta)</option>
                            ))}
                        </select>
                        {selectedRoom && (
                            <span style={{ fontSize: '.75rem', color: '#6b7280' }}>
                                {selectedRoom.hoone_name} · {selectedRoom.kohti} kohta
                            </span>
                        )}
                    </div>

                    <div className="bron-form-group">
                        <label>Kuupäev *</label>
                        <input type="date" value={form.kuupaev} min="2026-08-01" max="2026-12-31"
                            onChange={e => set('kuupaev', e.target.value)} required />
                    </div>

                    <div className="bron-form-group">
                        <label>Algusaeg *</label>
                        <select value={form.kellaaeg} onChange={e => set('kellaaeg', Number(e.target.value))} required>
                            {KELLAAEG_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="bron-form-group">
                        <label>Kestus *</label>
                        <select value={form.kestus} onChange={e => set('kestus', Number(e.target.value))} required>
                            {KESTUS_OPTS.map(o => <option key={o.h} value={o.h}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="bron-form-group">
                        <label>Sündmuse tüüp *</label>
                        <select value={form.syndmus} onChange={e => set('syndmus', e.target.value)} required>
                            {SYNDMUSETYYBID.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
                        </select>
                    </div>

                    <div className="bron-form-group">
                        <label>Osalejate arv</label>
                        <input type="number" min="1" placeholder="nt 15" value={form.osalejate_arv}
                            onChange={e => set('osalejate_arv', e.target.value)} />
                    </div>
                </div>

                {isExt && (
                    <div className="bron-form-group" style={{ marginTop: '1rem' }}>
                        <label>Põhjendus / sündmuse kirjeldus *</label>
                        <textarea rows={3} value={form.pohjendus}
                            onChange={e => set('pohjendus', e.target.value)}
                            placeholder="Kirjelda üritust või kasutuse eesmärki..."
                            required style={{ resize: 'vertical' }} />
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem' }}>
                    <button type="submit" className="bron-btn bron-btn-primary">
                        {isExt ? '📤 Esita taotlus' : '✓ Kinnita broneering'}
                    </button>
                    <button type="button" className="bron-btn bron-btn-secondary" onClick={() => navigate(-1)}>
                        Katkesta
                    </button>
                </div>
            </form>
        </div>
    );
}
"""

files["views/bron/StatistikaLeht.jsx"] = r"""
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StatistikaFilter from '../../components/bron/StatistikaFilter';
import { useRole } from '../../context/RoleContext';
import { defaultPeriod, getGlobalCounts } from '../../BronStatisticsService';
import StatistikaPopulaarsedAjad from './StatistikaPopulaarsedAjad';
import StatistikaRuumid from './StatistikaRuumid';
import StatistikaTuhistamised from './StatistikaTuhistamised';
import StatistikaYlevaade from './StatistikaYlevaade';

const TAB_KEYS = ['ylevaade', 'ruumid', 'populaarsed-ajad', 'tuhistamised'];
const TAB_LABELS = { ylevaade: 'Ülevaade', ruumid: 'Ruumide kasutus', 'populaarsed-ajad': 'Populaarsed ajad', tuhistamised: 'Tühistamised' };
const counts = getGlobalCounts();

export default function StatistikaLeht() {
    const { canSeeFullStatistics } = useRole();
    const location = useLocation();
    const navigate = useNavigate();

    const queryTab = new URLSearchParams(location.search).get('tab');
    const [activeTab, setActiveTab] = useState(
        TAB_KEYS.includes(queryTab) ? queryTab : 'ylevaade'
    );
    const [filters, setFilters] = useState(defaultPeriod());

    useEffect(() => {
        const q = new URLSearchParams(location.search).get('tab');
        if (q && TAB_KEYS.includes(q) && q !== activeTab) setActiveTab(q);
    }, [location.search]);

    function switchTab(tab) {
        setActiveTab(tab);
        navigate(`/statistika?tab=${tab}`, { replace: true });
    }

    if (!canSeeFullStatistics) return <LigipaasPuudub />;

    const tabContent = {
        ylevaade: <StatistikaYlevaade filters={filters} />,
        ruumid: <StatistikaRuumid filters={filters} />,
        'populaarsed-ajad': <StatistikaPopulaarsedAjad filters={filters} />,
        tuhistamised: <StatistikaTuhistamised filters={filters} />,
    };

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Statistika', to: '/statistika' },
                { label: TAB_LABELS[activeTab] }
            ]} />

            <div className="bron-page-header">
                <div>
                    <h1>Kasutusstatistika</h1>
                    <p>TalTechi ruumide broneeringud, kasutus ja tühistamised.</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {[
                        { icon: '🏢', val: counts.hooned, lab: 'hoonet' },
                        { icon: '🚪', val: counts.ruumid, lab: 'ruumi' },
                        { icon: '📅', val: counts.broneeringud.toLocaleString('et-EE'), lab: 'broneeringut' },
                    ].map(({ icon, val, lab }) => (
                        <span key={lab} className="bron-stat-chip">{icon} {val} {lab}</span>
                    ))}
                </div>
            </div>

            <StatistikaFilter filters={filters} onChange={setFilters} />

            <div className="bron-tabs">
                {TAB_KEYS.map(t => (
                    <button key={t} className={`bron-tab ${activeTab === t ? 'active' : ''}`} onClick={() => switchTab(t)}>
                        {TAB_LABELS[t]}
                    </button>
                ))}
            </div>

            {tabContent[activeTab]}
        </div>
    );
}
"""

files["views/bron/StatistikaYlevaade.jsx"] = r"""
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import KpiKaart from '../../components/bron/KpiKaart';
import { getKpiSummary, getRuumideSummary } from '../../BronStatisticsService';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function pct(v) { return (v * 100).toFixed(1) + '%'; }

export default function StatistikaYlevaade({ filters = {} }) {
    const kpi = getKpiSummary(filters);
    const rooms = getRuumideSummary(filters).slice(0, 8);

    const doughnutData = {
        labels: ['Broneeritud kasutus', 'Kasutamata broneering', 'Vaba aeg'],
        datasets: [{
            data: [
                kpi.tegelik_pct * 100,
                (kpi.broneeritud_pct - kpi.tegelik_pct) * 100,
                (1 - kpi.broneeritud_pct) * 100,
            ],
            backgroundColor: ['#251d47', '#e4067e', '#e5e7eb'],
        }],
    };

    const barData = {
        labels: rooms.map(r => r.code),
        datasets: [
            { label: 'Broneeritud %', data: rooms.map(r => +(r.broneeritud_pct * 100).toFixed(1)), backgroundColor: '#251d47' },
            { label: 'Tegelik %', data: rooms.map(r => +(r.tegelik_pct * 100).toFixed(1)), backgroundColor: '#e4067e' },
        ],
    };

    return (
        <div>
            <div className="bron-kpi-grid">
                <KpiKaart value={pct(kpi.broneeritud_pct)} label="Broneeritud kasutus" sub={`${kpi.broneeritud_tunnid.toLocaleString()} / ${kpi.avatud_tunnid.toLocaleString()} h`} />
                <KpiKaart value={pct(kpi.tegelik_pct)} label="Tegelik kasutus (anduri põhjal)" variant="green" />
                <KpiKaart value={pct(kpi.kasutamata_pct)} label="Kasutamata broneering" variant="amber" />
                <KpiKaart value={kpi.tuhistatud_arv.toLocaleString()} label="Tühistamisi" variant="red" />
                <KpiKaart value={kpi.broneeringute_arv.toLocaleString()} label="Broneeringuid kokku" />
                <KpiKaart value={kpi.ruumide_arv} label="Analüüsitud ruumi" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>Kasutuse jaotus</h3>
                    <div style={{ maxWidth: 280, margin: '0 auto' }}>
                        <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>Populaarsemad ruumid</h3>
                    <Bar data={barData} options={{
                        indexAxis: 'y',
                        scales: { x: { max: 100, ticks: { callback: v => v + '%' } } },
                        plugins: { legend: { position: 'top' } }
                    }} />
                </div>
            </div>
        </div>
    );
}
"""

files["views/bron/StatistikaRuumid.jsx"] = r"""
import { useNavigate } from 'react-router-dom';
import { downloadCsv } from '../../csv';
import { getRuumideSummary } from '../../BronStatisticsService';

function pct(v) { return (v * 100).toFixed(1) + '%'; }

export default function StatistikaRuumid({ filters = {} }) {
    const navigate = useNavigate();
    const rooms = getRuumideSummary(filters);

    function exportCsv() {
        downloadCsv('BRON-ruumid', rooms, [
            { key: 'code', label: 'Ruum' },
            { key: 'ruumitypp_label', label: 'Tüüp' },
            { key: 'hoone', label: 'Hoone' },
            { key: 'kohti', label: 'Kohti' },
            { key: 'broneeringute_arv', label: 'Broneeringuid' },
            { key: 'broneeritud_pct', label: 'Broneeritud %', format: v => pct(v) },
            { key: 'tegelik_pct', label: 'Tegelik %', format: v => pct(v) },
        ]);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '.75rem' }}>
                <button className="bron-btn bron-btn-secondary bron-btn-sm" onClick={exportCsv}>⬇ Ekspordi CSV</button>
            </div>
            <div className="bron-table-wrap">
                <table className="bron-table">
                    <thead>
                        <tr>
                            <th>Ruum</th><th>Tüüp</th><th>Hoone</th><th>Kohti</th>
                            <th>Broneeringuid</th><th>Broneeritud %</th><th>Tegelik %</th><th>Tühistamisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map(r => (
                            <tr key={r.id} onClick={() => navigate(`/statistika/ruumid/${r.id}`)}
                                style={{ cursor: 'pointer' }}>
                                <td><strong>{r.code}</strong></td>
                                <td>{r.ruumitypp_label}</td>
                                <td>{r.hoone}</td>
                                <td>{r.kohti}</td>
                                <td>{r.broneeringute_arv}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                                            <div style={{ width: pct(r.broneeritud_pct), height: '100%', background: '#251d47', borderRadius: 3 }} />
                                        </div>
                                        <span style={{ fontSize: '.8rem', whiteSpace: 'nowrap' }}>{pct(r.broneeritud_pct)}</span>
                                    </div>
                                </td>
                                <td>{pct(r.tegelik_pct)}</td>
                                <td>{r.tuhistatud_arv}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
"""

files["views/bron/StatistikaPopulaarsedAjad.jsx"] = r"""
import { getHeatmapData } from '../../BronStatisticsService';

const PAEVAD = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];
const KELLAAEG = Array.from({ length: 14 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

function getColor(v) {
    if (v === 0) return '#f3f4f6';
    if (v < 0.2) return '#fce7f3';
    if (v < 0.4) return '#f9a8d4';
    if (v < 0.6) return '#ec4899';
    if (v < 0.8) return '#be185d';
    return '#831843';
}

export default function StatistikaPopulaarsedAjad({ filters = {} }) {
    const heatmap = getHeatmapData(filters);

    return (
        <div className="bron-card">
            <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>
                Broneerimiste tihedus nädalapäevade ja kellaaegade lõikes
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="bron-heatmap-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151' }}>Kellaaeg</th>
                            {PAEVAD.map(p => <th key={p} style={{ fontWeight: 600, color: '#374151' }}>{p}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {KELLAAEG.map((kell, hi) => (
                            <tr key={kell}>
                                <td style={{ fontWeight: 500, color: '#6b7280', paddingRight: '1rem', textAlign: 'right' }}>{kell}</td>
                                {PAEVAD.map((_, di) => {
                                    const v = heatmap[di]?.[hi] ?? 0;
                                    return (
                                        <td key={di} title={`${Math.round(v * 100)}%`}>
                                            <div
                                                className="bron-heatmap-cell"
                                                style={{ background: getColor(v) }}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', alignItems: 'center', fontSize: '.75rem', color: '#6b7280' }}>
                <span>Madal</span>
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
                    <div key={v} style={{ width: 20, height: 14, background: getColor(v), borderRadius: 2 }} />
                ))}
                <span>Kõrge</span>
            </div>
        </div>
    );
}
"""

files["views/bron/StatistikaTuhistamised.jsx"] = r"""
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { getTuhistamisedStats } from '../../BronStatisticsService';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SEKKUMISE_KLASSID = [
    { key: 'lt15', label: '< 15 min' },
    { key: 'lt60', label: '15–60 min' },
    { key: 'lt240', label: '1–4 h' },
    { key: 'lt1440', label: '4–24 h' },
    { key: 'lt4320', label: '1–3 päeva' },
    { key: 'gte4320', label: '3+ päeva' },
];

export default function StatistikaTuhistamised({ filters = {} }) {
    const stats = getTuhistamisedStats(filters);

    const chartData = {
        labels: SEKKUMISE_KLASSID.map(k => k.label),
        datasets: [{
            label: 'Tühistamisi',
            data: SEKKUMISE_KLASSID.map(k => stats.byClass[k.key] || 0),
            backgroundColor: '#e4067e',
        }],
    };

    return (
        <div>
            <div className="bron-kpi-grid">
                <div className="bron-kpi bron-kpi--red">
                    <div className="bron-kpi__value">{stats.kokku}</div>
                    <div className="bron-kpi__label">Tühistamisi kokku</div>
                </div>
                <div className="bron-kpi bron-kpi--amber">
                    <div className="bron-kpi__value">{(stats.tuhistamine_pct * 100).toFixed(1)}%</div>
                    <div className="bron-kpi__label">Tühistamise määr</div>
                </div>
                <div className="bron-kpi">
                    <div className="bron-kpi__value">{stats.avg_enne_h?.toFixed(1) ?? '—'} h</div>
                    <div className="bron-kpi__label">Keskm. tühistamise kaugus</div>
                </div>
            </div>

            <div className="bron-card">
                <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>
                    Tühistamise aeg enne broneeringu algust
                </h3>
                <div style={{ maxHeight: 280 }}>
                    <Bar data={chartData} options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { ticks: { precision: 0 } } }
                    }} />
                </div>
            </div>
        </div>
    );
}
"""

files["views/bron/StatistikaRuumiDetail.jsx"] = r"""
import { useNavigate, useParams } from 'react-router-dom';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import KpiKaart from '../../components/bron/KpiKaart';
import { useRole } from '../../context/RoleContext';
import { RUUMID, getKpiSummary } from '../../BronStatisticsService';

function pct(v) { return (v * 100).toFixed(1) + '%'; }

export default function StatistikaRuumiDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canSeeFullStatistics } = useRole();

    if (!canSeeFullStatistics) return <LigipaasPuudub />;

    const room = RUUMID.find(r => r.id === id);
    if (!room) return <div className="bron-page"><h1>Ruum ei leitud</h1></div>;

    const kpi = getKpiSummary({ ruum_id: id });

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Statistika', to: '/statistika' },
                { label: 'Ruumide kasutus', to: '/statistika?tab=ruumid' },
                { label: room.code }
            ]} />

            <div className="bron-page-header">
                <div>
                    <h1>{room.code}</h1>
                    <p>{room.ruumitypp_label} · {room.hoone_name}</p>
                </div>
                <button className="bron-btn bron-btn-secondary" onClick={() => navigate(-1)}>← Tagasi</button>
            </div>

            <div className="bron-kpi-grid">
                <KpiKaart value={pct(kpi.broneeritud_pct)} label="Broneeritud kasutus" />
                <KpiKaart value={pct(kpi.tegelik_pct)} label="Tegelik kasutus" variant="green" />
                <KpiKaart value={pct(kpi.kasutamata_pct)} label="Kasutamata" variant="amber" />
                <KpiKaart value={kpi.tuhistatud_arv} label="Tühistamisi" variant="red" />
                <KpiKaart value={kpi.broneeringute_arv} label="Broneeringuid" />
                <KpiKaart value={room.kohti} label="Mahutavus" />
            </div>
        </div>
    );
}
"""

files["views/bron/AvalikPopulaarsedAjad.jsx"] = r"""
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { getHeatmapData, defaultPeriod } from '../../BronStatisticsService';

const PAEVAD = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];
const KELLAAEG = Array.from({ length: 14 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

function getColor(v) {
    if (v === 0) return '#f3f4f6';
    if (v < 0.3) return '#fce7f3';
    if (v < 0.6) return '#f9a8d4';
    if (v < 0.8) return '#ec4899';
    return '#be185d';
}

export default function AvalikPopulaarsedAjad() {
    const heatmap = getHeatmapData(defaultPeriod());

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: 'Populaarsed ajad' }]} />
            <div className="bron-page-header">
                <div>
                    <h1>Populaarsed broneerimisajad</h1>
                    <p>Vaata millal TalTechi ruumid on kõige rohkem hõivatud.</p>
                </div>
            </div>

            <div className="bron-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="bron-heatmap-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right', color: '#6b7280', fontWeight: 600 }}>Kellaaeg</th>
                                {PAEVAD.map(p => <th key={p} style={{ fontWeight: 700, color: '#374151' }}>{p}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {KELLAAEG.map((kell, hi) => (
                                <tr key={kell}>
                                    <td style={{ fontWeight: 500, color: '#9ca3af', paddingRight: '1rem', textAlign: 'right' }}>{kell}</td>
                                    {PAEVAD.map((_, di) => {
                                        const v = heatmap[di]?.[hi] ?? 0;
                                        return (
                                            <td key={di} title={`${Math.round(v * 100)}%`}>
                                                <div className="bron-heatmap-cell" style={{ background: getColor(v) }} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '.75rem', color: '#9ca3af' }}>
                    Andmed viimase 30 päeva broneerimisstatistika põhjal.
                </div>
            </div>
        </div>
    );
}
"""

# Write files
errors = []
for path, content in files.items():
    full_path = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    try:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content.lstrip('\n'))
        print(f"OK  {path}")
    except Exception as e:
        errors.append(f"ERR {path}: {e}")

if errors:
    for e in errors: print(e)
else:
    print(f"\n✓ Kõik {len(files)} faili kirjutatud.")
