import { Link } from 'react-router-dom';
import { getGlobalCounts } from '../../BronStatisticsService';
import { useRole } from '../../context/RoleContext';

const counts = getGlobalCounts();

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
    const { currentRoleLabel, isGuest, isUni, isExt, isLoggedIn, canSeeFullStatistics } = role;

    const subtitle = isGuest
        ? 'Sirvi TalTechi ruume ja vaata populaarseid broneerimisaegu.'
        : canSeeFullStatistics
        ? 'Menetle taotlusi ja vaata ruumide kasutusstatistikat.'
        : isExt
        ? 'Esita broneeringutaotlus TalTechi ruumide kasutamiseks.'
        : 'Broneeri auditooriume, seminariruume ja laboreid ülikooli hoonetes.';

    const visibleCards = ACTION_CARDS.filter(c => c.show(role));

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
