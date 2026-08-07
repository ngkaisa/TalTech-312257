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

// Varustuse filtri valikud — vastavad searchRooms() omadused-filterile
const VARUSTUS_OPTS = [
    { code: 'arvutid',  label: 'Arvutid' },
    { code: 'labor',    label: 'Labor' },
    { code: 'sport',    label: 'Spordiruum' },
    { code: 'saun',     label: 'Saun' },
    { code: 'tookoda',  label: 'Töökoda' },
    { code: 'suur',     label: '200+ kohta' },
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
        hoone: '', ruumitypp: '', min_kohti: '', max_kohti: '', otsing: '', omadused: [],
    });

    function setS(key, val) { setSearch(s => ({ ...s, [key]: val })); }
    function setF(key, val) { setFilters(f => ({ ...f, [key]: val })); }
    function toggleOmadus(code) {
        setFilters(f => ({
            ...f,
            omadused: f.omadused.includes(code)
                ? f.omadused.filter(o => o !== code)
                : [...f.omadused, code],
        }));
    }

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

            {/* ── Otsingukaart — kahe-veerupaigutus ── */}
            <div className="bron-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    {/* ── Vasak veerg: Ürituse toimumise aeg ── */}
                    <div>
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--tt-purple-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>
                            Ürituse toimumise aeg
                        </div>
                        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="bron-form-group" style={{ minWidth: 140 }}>
                                <label>Kuupäev</label>
                                <input type="date" value={search.kuupaev} min="2026-08-01" max="2026-12-31"
                                    onChange={e => setS('kuupaev', e.target.value)} />
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 100 }}>
                                <label>Algus</label>
                                <select value={search.kellaaeg} onChange={e => setS('kellaaeg', Number(e.target.value))}>
                                    {KELLAAEG_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 100 }}>
                                <label>Lõpp</label>
                                <select value={search.kestus} onChange={e => setS('kestus', Number(e.target.value))}>
                                    {KESTUS_OPTS.map(o => (
                                        <option key={o.value} value={o.value}>
                                            {fmtMins(search.kellaaeg + o.value * 60)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ paddingBottom: '2px' }}>
                                <TTNewButton
                                    type="button"
                                    variant={search.korduv ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setS('korduv', !search.korduv)}
                                >
                                    {search.korduv ? '✓ Kordub' : '+ Lisa kordus'}
                                </TTNewButton>
                            </div>
                        </div>

                        {/* Korduvuse seaded */}
                        {search.korduv && (
                            <div style={{ background: 'var(--tt-purple-100)', borderRadius: 8, padding: '.75rem', marginTop: '.75rem' }}>
                                <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                                    <div className="bron-form-group" style={{ minWidth: 150 }}>
                                        <label>Sagedus</label>
                                        <select value={search.korduvus} onChange={e => setS('korduvus', e.target.value)}>
                                            {KORDUV_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="bron-form-group" style={{ minWidth: 100 }}>
                                        <label>Korduste arv</label>
                                        <input type="number" min="2" max="52" value={search.korduvus_arv}
                                            onChange={e => setS('korduvus_arv', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '.75rem', color: 'var(--tt-purple-500)', fontWeight: 600, marginRight: '.25rem' }}>
                                        {searchDates.length}× ({fmtMins(search.kellaaeg)}–{fmtMins(endMin)}):
                                    </span>
                                    {searchDates.slice(0, 6).map(d => (
                                        <Badge key={d} color="purple" size="sm" style={{ fontSize: '.72rem' }}>
                                            {new Date(d).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit' })}
                                        </Badge>
                                    ))}
                                    {searchDates.length > 6 && (
                                        <span style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)' }}>+{searchDates.length - 6} veel</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Parem veerg: Ruumi info ── */}
                    <div>
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--tt-purple-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>
                            Ruumi info
                        </div>

                        {/* Rida 1: otsing + hoone */}
                        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                            <div className="bron-form-group" style={{ flex: 1, minWidth: 140 }}>
                                <label>Otsing</label>
                                <input type="text" placeholder="Ruumi kood, hoone..." value={filters.otsing}
                                    onChange={e => setF('otsing', e.target.value)} />
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 150 }}>
                                <label>Hoone</label>
                                <select value={filters.hoone} onChange={e => setF('hoone', e.target.value)}>
                                    <option value="">Kõik hooned</option>
                                    {HOONED.map(h => <option key={h.code} value={h.code}>{h.code} — {h.name.split('—')[1]?.trim()}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Rida 2: ruumitüüp + kohtade vahemik */}
                        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                            <div className="bron-form-group" style={{ minWidth: 160 }}>
                                <label>Ruumitüüp</label>
                                <select value={filters.ruumitypp} onChange={e => setF('ruumitypp', e.target.value)}>
                                    <option value="">Kõik tüübid</option>
                                    {RUUMITYYBID.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 80 }}>
                                <label>Kohti alates</label>
                                <input type="number" min="1" placeholder="min" value={filters.min_kohti}
                                    onChange={e => setF('min_kohti', e.target.value)} />
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 80 }}>
                                <label>Kuni</label>
                                <input type="number" min="1" placeholder="max" value={filters.max_kohti}
                                    onChange={e => setF('max_kohti', e.target.value)} />
                            </div>
                        </div>

                        {/* Rida 3: varustus checkboxid + tühjenda */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '.75rem', color: '#6b7280', fontWeight: 600, marginRight: '.15rem' }}>Varustus:</span>
                            {VARUSTUS_OPTS.map(v => (
                                <label key={v.code} style={{
                                    display: 'flex', alignItems: 'center', gap: '.25rem',
                                    fontSize: '.78rem', cursor: 'pointer', userSelect: 'none',
                                    padding: '.2rem .5rem', borderRadius: 20,
                                    background: filters.omadused.includes(v.code) ? 'var(--tt-purple-500)' : '#f3f4f6',
                                    color: filters.omadused.includes(v.code) ? '#fff' : '#374151',
                                    fontWeight: filters.omadused.includes(v.code) ? 600 : 400,
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={filters.omadused.includes(v.code)}
                                        onChange={() => toggleOmadus(v.code)}
                                        style={{ display: 'none' }}
                                    />
                                    {v.label}
                                </label>
                            ))}
                            <TTNewButton
                                variant="outline"
                                size="sm"
                                style={{ marginLeft: 'auto' }}
                                onClick={() => setFilters({ hoone: '', ruumitypp: '', min_kohti: '', max_kohti: '', otsing: '', omadused: [] })}>
                                Tühjenda
                            </TTNewButton>
                        </div>
                    </div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                {/* §1.1.1 — ghost booking (menetlusel taotlus) = warning; hõivatud = danger; vaba = success */}
                                <StatusTag type={room.taotlus_menetlusel ? 'warning' : room.vaba ? 'success' : 'danger'}>
                                    {room.taotlus_menetlusel ? 'Taotlus menetlusel' : room.vaba ? 'Vaba' : 'Hõivatud'}
                                </StatusTag>
                                <span style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)' }}>
                                    {room.hetkel_vaba_tekst}
                                </span>
                            </div>
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
