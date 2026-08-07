import { Link } from 'react-router-dom';
import { getAllFeedback, getAllRequests } from '../../BronBookingsService';
import { getGlobalCounts, getKpiSummary, RUUMID } from '../../BronStatisticsService';
import { useRole } from '../../context/RoleContext';

const counts = getGlobalCounts();
const kpi = getKpiSummary({});
const allReqs = getAllRequests();
const allFeedback = getAllFeedback(RUUMID);

// Kriitilised kommentaarid — keskmine alla 2.5
function avgRating(fb) {
    return ((fb.temperatuur + fb.puhtus + fb.ohk + fb.varustus) / 4);
}
const kriitilised = allFeedback.filter(fb => fb.kommentaar && avgRating(fb) < 2.5).slice(0, 5);

const ACTION_CARDS = [
    {
        key: 'otsi',
        to: '/otsi-ruumi',
        icon: 'search',
        title: 'Otsi ruumi',
        desc: 'Leia sobiv ruum hoone, tüübi või mahutavuse järgi.',
        show: ({ isInternal, isExt }) => isInternal || isExt,
    },
    {
        key: 'bron',
        to: '/broneeringud',
        icon: 'event',
        title: 'Minu broneeringud',
        desc: 'Vaata oma kinnitatud ja tulevasi broneeringuid.',
        show: ({ canSeeOwnBookings }) => canSeeOwnBookings,
    },
    {
        key: 'taotlus_ext',
        to: '/taotlused',
        icon: 'description',
        title: 'Minu taotlused',
        desc: 'Broneeringutaotluste olek ja vastused.',
        show: ({ isExt }) => isExt,
    },
    {
        key: 'menetlus',
        to: '/taotlused',
        icon: 'inbox',
        title: 'Taotluste menetlus',
        desc: 'Menetle saabunud broneeringutaotlusi.',
        show: ({ canSeeFullStatistics }) => canSeeFullStatistics,
        highlight: true,
    },
    {
        key: 'stat',
        to: '/statistika',
        icon: 'bar_chart',
        title: 'Statistika',
        desc: 'Ruumide kasutus, populaarsed ajad, tühistamised.',
        show: ({ canSeeFullStatistics }) => canSeeFullStatistics,
    },
    {
        key: 'populaarsed',
        to: '/avalik/populaarsed-ajad',
        icon: 'schedule',
        title: 'Populaarsed ajad',
        desc: 'Vaata millal on TalTechi ruumid kõige rohkem hõivatud.',
        show: ({ isGuest }) => isGuest,
    },
];

export default function Avaleht() {
    const role = useRole();
    const { currentRoleLabel, isGuest, isTudeng, isTootaja, isExt, isLoggedIn, canSeeFullStatistics, isHaldur, isSuper } = role;

    const subtitle = isGuest
        ? 'Sirvi TalTechi ruume ja vaata populaarseid broneerimisaegu.'
        : canSeeFullStatistics
        ? 'Menetle taotlusi ja vaata ruumide kasutusstatistikat.'
        : isExt
        ? 'Esita broneeringutaotlus TalTechi ruumide kasutamiseks.'
        : 'Broneeri auditooriume, seminariruume ja laboreid ülikooli hoonetes.';

    const visibleCards = ACTION_CARDS.filter(c => c.show(role));
    const pendingReqs = allReqs.filter(r => r.seis === 'menetlusel');

    return (
        <div className="bron-page">
            {/* Lehekülje päis */}
            <div className="bron-page-header">
                <div className="bron-page-header__title">
                    <h1>
                        {isGuest
                            ? 'Ruumide broneerimine'
                            : <>Tere tulemast, <span style={{ color: 'var(--tt-pink-500)' }}>{currentRoleLabel}</span></>
                        }
                    </h1>
                    <p>{subtitle}</p>
                </div>

                {isLoggedIn && (
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
                        {[
                            { v: counts.hooned,                               l: 'hoonet' },
                            { v: counts.ruumid,                               l: 'ruumi' },
                            { v: counts.broneeringud.toLocaleString('et-EE'), l: 'broneeringut' },
                        ].map(({ v, l }) => (
                            <div key={l} className="bron-kpi" style={{ minWidth: 90, textAlign: 'center', padding: '.85rem 1rem' }}>
                                <div className="bron-kpi__value" style={{ fontSize: '1.4rem' }}>{v}</div>
                                <div className="bron-kpi__label">{l}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick action grid */}
            <div className="bron-quick-grid">
                {visibleCards.map(c => (
                    <Link
                        key={c.key}
                        to={c.to}
                        className={`bron-action-card${c.highlight ? ' bron-action-card--highlight' : ''}`}
                    >
                        <div className="bron-action-card__icon">
                            <span className="material-icons">{c.icon}</span>
                        </div>
                        <h3>{c.title}</h3>
                        <p>{c.desc}</p>
                    </Link>
                ))}
            </div>

            {/* ── TÖÖLAUD — Haldur ja Superkasutaja ── */}
            {canSeeFullStatistics && (
                <div style={{ marginTop: '.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-purple-500)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>dashboard</span>
                        Töölaud
                    </h2>

                    {/* KPI riba */}
                    <div className="bron-kpi-grid" style={{ marginBottom: '1.25rem' }}>
                        <div className="bron-kpi">
                            <div className="bron-kpi__value" style={{ color: pendingReqs.length > 0 ? '#b45309' : '#147a52' }}>
                                {pendingReqs.length}
                            </div>
                            <div className="bron-kpi__label">Menetlusel taotlust</div>
                            <div className="bron-kpi__sub">vajab otsust</div>
                        </div>
                        <div className="bron-kpi">
                            <div className="bron-kpi__value">{kpi.broneeringute_arv}</div>
                            <div className="bron-kpi__label">Broneeringut kokku</div>
                            <div className="bron-kpi__sub">sel perioodil</div>
                        </div>
                        <div className="bron-kpi bron-kpi--amber">
                            <div className="bron-kpi__value">{kpi.broneeritud_pct}%</div>
                            <div className="bron-kpi__label">Broneeritud</div>
                            <div className="bron-kpi__sub">ruumide ajast</div>
                        </div>
                        <div className={`bron-kpi${kpi.tuhistatud_arv > 10 ? ' bron-kpi--red' : ''}`}>
                            <div className="bron-kpi__value">{kpi.tuhistatud_arv}</div>
                            <div className="bron-kpi__label">Tühistamist</div>
                            <div className="bron-kpi__sub">sel perioodil</div>
                        </div>
                        {kriitilised.length > 0 && (
                            <div className="bron-kpi bron-kpi--red">
                                <div className="bron-kpi__value">{kriitilised.length}</div>
                                <div className="bron-kpi__label">Kriitilist tagasiside</div>
                                <div className="bron-kpi__sub">alla 2.5 ★</div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: pendingReqs.length > 0 ? '1fr 1fr' : '1fr', gap: '1rem' }} className="bron-toolaud-grid">

                        {/* Menetlusel taotlused */}
                        {pendingReqs.length > 0 && (
                            <div className="bron-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.85rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '.92rem', color: 'var(--tt-purple-500)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                        <span className="material-icons" style={{ fontSize: '1rem', color: '#b45309' }}>pending_actions</span>
                                        Menetlusel taotlused
                                    </h3>
                                    <Link to="/taotlused" style={{ fontSize: '.78rem', color: 'var(--tt-pink-500)', textDecoration: 'none', fontWeight: 600 }}>
                                        Vaata kõiki →
                                    </Link>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                    {pendingReqs.slice(0, 4).map(r => (
                                        <Link key={r.id} to="/taotlused" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.55rem .75rem', background: '#fff8f0', borderRadius: 6, border: '1px solid #fde68a' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--tt-text)' }}>{r.ruum}</div>
                                                    <div style={{ fontSize: '.75rem', color: 'var(--tt-text-muted)' }}>
                                                        {r.taotleja_nimi} · {new Date(r.algus).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit' })}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '.72rem', background: '#fef3c7', color: '#92400e', padding: '.15rem .5rem', borderRadius: 20, fontWeight: 600 }}>
                                                    Ootel
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                    {pendingReqs.length > 4 && (
                                        <div style={{ fontSize: '.78rem', color: 'var(--tt-text-muted)', textAlign: 'center', paddingTop: '.25rem' }}>
                                            + {pendingReqs.length - 4} taotlust veel
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Kriitilised kommentaarid */}
                        <div className="bron-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.85rem' }}>
                                <h3 style={{ margin: 0, fontSize: '.92rem', color: 'var(--tt-purple-500)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                    <span className="material-icons" style={{ fontSize: '1rem', color: '#c41c1c' }}>warning_amber</span>
                                    {isSuper ? 'Kriitilised kommentaarid' : 'Viimased kommentaarid'}
                                </h3>
                                <Link to="/statistika?tab=tagasiside" style={{ fontSize: '.78rem', color: 'var(--tt-pink-500)', textDecoration: 'none', fontWeight: 600 }}>
                                    Kõik →
                                </Link>
                            </div>
                            {kriitilised.length === 0 ? (
                                <div style={{ fontSize: '.85rem', color: 'var(--tt-text-muted)', display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 0' }}>
                                    <span className="material-icons" style={{ fontSize: '1.1rem', color: '#147a52' }}>check_circle</span>
                                    Kriitilisi kommentaare ei ole
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                    {kriitilised.slice(0, 4).map(fb => (
                                        <div key={fb.id} style={{ padding: '.55rem .75rem', background: '#fff1f1', borderRadius: 6, border: '1px solid #fecaca' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--tt-text)' }}>{fb.ruum_code}</span>
                                                <span style={{ fontSize: '.75rem', color: '#c41c1c', fontWeight: 700 }}>⌀ {avgRating(fb).toFixed(1)} ★</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--tt-text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                                                „{fb.kommentaar}"
                                            </p>
                                            <div style={{ fontSize: '.72rem', color: 'var(--tt-text-light)', marginTop: '.2rem' }}>{fb.kasutaja} · {fb.kuupaev}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Super: globaalsed ruumi top/flop */}
                    {isSuper && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                                <h3 style={{ margin: 0, fontSize: '.92rem', color: 'var(--tt-purple-500)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                    <span className="material-icons" style={{ fontSize: '1rem' }}>meeting_room</span>
                                    Madalama hinnanguga ruumid
                                </h3>
                                <Link to="/statistika?tab=tagasiside" style={{ fontSize: '.78rem', color: 'var(--tt-pink-500)', textDecoration: 'none', fontWeight: 600 }}>
                                    Vaata kõiki →
                                </Link>
                            </div>
                            <div className="bron-table-wrap">
                                <table className="bron-table">
                                    <thead>
                                        <tr>
                                            <th>Ruum</th>
                                            <th>Hoone</th>
                                            <th>⌀ Hinnang</th>
                                            <th>Kommentaare</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const byRoom = {};
                                            allFeedback.forEach(fb => {
                                                if (!byRoom[fb.ruum_code]) byRoom[fb.ruum_code] = { ruum: fb.ruum_code, hoone: fb.hoone, ratings: [], comments: 0 };
                                                byRoom[fb.ruum_code].ratings.push(avgRating(fb));
                                                if (fb.kommentaar) byRoom[fb.ruum_code].comments++;
                                            });
                                            return Object.values(byRoom)
                                                .map(r => ({ ...r, avg: r.ratings.reduce((a, b) => a + b, 0) / r.ratings.length }))
                                                .sort((a, b) => a.avg - b.avg)
                                                .slice(0, 5)
                                                .map(r => (
                                                    <tr key={r.ruum}>
                                                        <td><strong>{r.ruum}</strong></td>
                                                        <td style={{ fontSize: '.82rem', color: 'var(--tt-text-muted)' }}>{r.hoone}</td>
                                                        <td style={{ fontWeight: 700, color: r.avg < 2.5 ? '#c41c1c' : r.avg < 3.5 ? '#b45309' : '#147a52' }}>
                                                            {r.avg.toFixed(1)} ★
                                                        </td>
                                                        <td style={{ fontSize: '.82rem' }}>{r.comments}</td>
                                                    </tr>
                                                ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sisselogimata kasutaja - info */}
            {isGuest && (
                <div className="bron-card" style={{ maxWidth: 480 }}>
                    <h3 style={{ margin: '0 0 .6rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                        Sisselogimine
                    </h3>
                    <p style={{ color: 'var(--tt-text-muted)', fontSize: '.875rem', margin: '0 0 .75rem' }}>
                        TalTechi töötajad ja üliõpilased saavad sisse logida ülikooliportaali (uni-ID) kaudu.
                    </p>
                    <p style={{ color: 'var(--tt-text-light)', fontSize: '.78rem', margin: 0 }}>
                        💡 Demo: kasuta päises rolli-valijat erinevate rollide testimiseks.
                    </p>
                </div>
            )}
        </div>
    );
}
