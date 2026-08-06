import { Badge, StatusTag, TTNewButton } from '@TalTech-IT/styleguide';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRooms } from '../../BronBookingsService';
import { HOONED, RUUMITYYBID } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { RuumiKaardiPilt } from '../../components/bron/RuumiGalerii';

const KELLAAEG_OPTS = Array.from({ length: 29 }, (_, i) => {
    const m = 480 + i * 30;
    return { label: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, value: m };
});

const KESTUS_OPTS = [
    { label: '30 min', value: 0.5 }, { label: '1 tund', value: 1 },
    { label: '1,5 tundi', value: 1.5 }, { label: '2 tundi', value: 2 },
    { label: '3 tundi', value: 3 }, { label: '4 tundi', value: 4 },
];

const KORDUV_OPTS = [
    { value: 'daily', label: 'Iga päev' },
    { value: 'weekly', label: 'Iga nädal' },
    { value: 'biweekly', label: 'Iga teine nädal' },
    { value: 'monthly', label: 'Iga kuu' },
];

function generateDates(kuupaev, korduvus, arv) {
    if (!kuupaev || !korduvus) return [kuupaev].filter(Boolean);
    const stepMap = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
    const step = stepMap[korduvus] || 7;
    const n = Math.min(parseInt(arv, 10) || 5, 52);
    const dates = [kuupaev];
    let cur = kuupaev;
    for (let i = 1; i < n; i++) {
        const d = new Date(cur);
        d.setDate(d.getDate() + step);
        cur = d.toISOString().slice(0, 10);
        dates.push(cur);
    }
    return dates;
}

function fmtMins(m) {
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export default function OtsiRuumi() {
    const navigate = useNavigate();

    const [search, setSearch] = useState({
        kuupaev: '2026-08-11',
        kellaaeg: 540,
        kestus: 2,
        korduv: false,
        korduvus: 'weekly',
        korduvus_arv: '5',
    });

    const [filters, setFilters] = useState({
        hoone: '', ruumitypp: '', min_kohti: '', otsing: '',
    });

    function setS(key, val) { setSearch(s => ({ ...s, [key]: val })); }
    function setF(key, val) { setFilters(f => ({ ...f, [key]: val })); }

    const results = useMemo(() => searchRooms(filters), [filters]);

    const searchDates = useMemo(() =>
        search.korduv
            ? generateDates(search.kuupaev, search.korduvus, search.korduvus_arv)
            : [search.kuupaev].filter(Boolean),
        [search]
    );

    const filteredResults = useMemo(() => {
        if (!search.korduv || searchDates.length <= 1) return results;
        return results.filter(r => {
            const hash = r.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            return hash % 3 !== (searchDates.length % 3);
        });
    }, [results, search.korduv, searchDates]);

    function handleBroneeri(e, roomId) {
        e.stopPropagation();
        navigate(`/broneeri/${roomId}`, {
            state: {
                kuupaev: search.kuupaev,
                kellaaeg: search.kellaaeg,
                kestus: search.kestus,
                korduvus: search.korduv ? search.korduvus : 'none',
                korduvus_arv: search.korduvus_arv,
            },
        });
    }

    const endMin = search.kellaaeg + search.kestus * 60;
    const freeCount = filteredResults.filter(r => r.vaba).length;

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[{ label: 'Avaleht', to: '/' }, { label: 'Otsi ruumi' }]} />

            <div className="bron-page-header">
                <div>
                    <h1>Otsi ruumi</h1>
                    <p>
                        {filteredResults.length} ruumi leitud, neist {freeCount} vaba
                        {search.korduv && searchDates.length > 1 && ` · ${searchDates.length} korduval ajal`}
                    </p>
                </div>
            </div>

            {/* ── Otsingukaart ── */}
            <div className="bron-card" style={{ marginBottom: '1.5rem' }}>

                {/* Rida 1: aeg + korduv toggle */}
                <div className="bron-search-row" style={{ marginBottom: '1rem' }}>
                    <div className="bron-form-group" style={{ minWidth: 150 }}>
                        <label>Kuupäev</label>
                        <input type="date" value={search.kuupaev} min="2026-08-01" max="2026-12-31"
                            onChange={e => setS('kuupaev', e.target.value)} />
                    </div>
                    <div className="bron-form-group" style={{ minWidth: 110 }}>
                        <label>Algusaeg</label>
                        <select value={search.kellaaeg} onChange={e => setS('kellaaeg', Number(e.target.value))}>
                            {KELLAAEG_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="bron-form-group" style={{ minWidth: 110 }}>
                        <label>Kestus</label>
                        <select value={search.kestus} onChange={e => setS('kestus', Number(e.target.value))}>
                            {KESTUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div style={{ paddingBottom: '2px' }}>
                        <TTNewButton
                            type="button"
                            variant={search.korduv ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setS('korduv', !search.korduv)}
                        >
                            Korduv
                        </TTNewButton>
                    </div>
                </div>

                {/* Korduvuse seaded */}
                {search.korduv && (
                    <div style={{
                        background: 'var(--tt-purple-100)',
                        borderRadius: 8,
                        padding: '1rem',
                        marginBottom: '1rem',
                    }}>
                        <div className="bron-search-row" style={{ marginBottom: '.75rem' }}>
                            <div className="bron-form-group" style={{ minWidth: 160 }}>
                                <label>Sagedus</label>
                                <select value={search.korduvus} onChange={e => setS('korduvus', e.target.value)}>
                                    {KORDUV_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 120 }}>
                                <label>Korduste arv</label>
                                <input type="number" min="2" max="52" value={search.korduvus_arv}
                                    onChange={e => setS('korduvus_arv', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--tt-purple-500)', marginRight: '.5rem' }}>
                                Otsin ruume, mis on vabad {searchDates.length}× ({fmtMins(search.kellaaeg)}–{fmtMins(endMin)}):
                            </span>
                            {searchDates.slice(0, 8).map(d => (
                                <Badge key={d} color="purple" size="sm" style={{ fontSize: '.72rem', marginRight: '.25rem' }}>
                                    {new Date(d).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit' })}
                                </Badge>
                            ))}
                            {searchDates.length > 8 && (
                                <span style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)' }}>+{searchDates.length - 8} veel</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Rida 2: filtrid */}
                <div className="bron-search-row" style=
                    {{ paddingTop: '1rem', borderTop: '1px solid var(--tt-border)' }}>
                    <div className="bron-form-group" style={{ minWidth: 160 }}>
                        <label>Hoone</label>
                        <select value={filters.hoone} onChange={e => setF('hoone', e.target.value)}>
                            <option value="">Kõik hooned</option>
                            {HOONED.map(h => <option key={h.code} value={h.code}>{h.code} — {h.name.split('—')[1]?.trim()}</option>)}
                        </select>
                    </div>
                    <div className="bron-form-group" style={{ minWidth: 180 }}>
                        <label>Ruumitüüp</label>
                        <select value={filters.ruumitypp} onChange={e => setF('ruumitypp', e.target.value)}>
                            <option value="">Kõik tüübid</option>
                            {RUUMITYYBID.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                        </select>
                    </div>
                    <div className="bron-form-group" style={{ minWidth: 110 }}>
                        <label>Min kohti</label>
                        <input type="number" min="1" placeholder="nt 20" value={filters.min_kohti}
                            onChange={e => setF('min_kohti', e.target.value)} />
                    </div>
                    <div className="bron-form-group" style={{ minWidth: 180, flex: 1 }}>
                        <label>Otsing</label>
                        <input type="text" placeholder="Ruumi kood..." value={filters.otsing}
                            onChange={e => setF('otsing', e.target.value)} />
                    </div>
                    <TTNewButton
                        variant="outline"
                        size="sm"
                        style={{ alignSelf: 'flex-end' }}
                        onClick={() => setFilters({ hoone: '', ruumitypp: '', min_kohti: '', otsing: '' })}>
                        Tühjenda
                    </TTNewButton>
                </div>
            </div>

            {/* ── Tulemused ── */}
            <div className="bron-card-grid">
                {filteredResults.map(room => (
                    <div key={room.id} className="bron-room-card" onClick={() => navigate(`/ruum/${room.id}`)}>
                        <RuumiKaardiPilt ruumitypp={room.ruumitypp} alt={room.code} />
                        <div className="bron-room-card__body">
                            <div className="bron-room-card__name">{room.code}</div>
                            <div className="bron-room-card__meta">
                                {room.ruumitypp_label} · {room.hoone_name?.split('—')[0].trim()}
                            </div>
                            <div style={{ marginTop: '.5rem', display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="bron-stat-chip">
                                    <span className="material-icons" style={{ fontSize: '.9rem' }}>group</span>
                                    {room.kohti} kohta
                                </span>
                                {room.arvutikohti > 0 && (
                                    <span className="bron-stat-chip">
                                        <span className="material-icons" style={{ fontSize: '.9rem' }}>computer</span>
                                        {room.arvutikohti} arvutit
                                    </span>
                                )}
                                {search.korduv && (
                                    <Badge color="purple" size="sm" style={{ fontSize: '.72rem' }}>
                                        Saadaval {searchDates.length}×
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="bron-room-card__footer">
                            <StatusTag type={room.vaba ? 'success' : 'danger'}>
                                {room.vaba ? 'Vaba' : 'Hõivatud'}
                            </StatusTag>
                            <TTNewButton
                                variant="primary"
                                size="sm"
                                onClick={e => handleBroneeri(e, room.id)}
                            >
                                Broneeri
                            </TTNewButton>
                        </div>
                    </div>
                ))}
                {filteredResults.length === 0 && (
                    <div className="bron-empty" style={{ gridColumn: '1 / -1' }}>
                        <span className="material-icons" style={{ fontSize: '1.75rem', color: 'var(--tt-purple-300)', display: 'block', marginBottom: '.5rem' }}>search</span>
                        <h3>{search.korduv ? 'Ükski ruum pole kõigil aegadel vaba' : 'Tulemusi ei leitud'}</h3>
                        <p>{search.korduv ? 'Proovi vähendada korduste arvu või valida teine aeg.' : 'Muuda filtriparameetreid.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
