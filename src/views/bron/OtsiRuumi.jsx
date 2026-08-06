import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRooms } from '../../BronBookingsService';
import { HOONED, RUUMITYYBID } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { RuumiKaardiPilt } from '../../components/bron/RuumiGalerii';

const KELLAAEG_OPTS = Array.from({ length: 29 }, (_, i) => {
    const m = 480 + i * 30;
    return { label: `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`, value: m };
});
const KORDUV_OPTS = [
    { value: '', label: 'Üks kord' },
    { value: 'daily', label: 'Iga päev' },
    { value: 'weekly', label: 'Iga nädal' },
    { value: 'biweekly', label: 'Iga teine nädal' },
    { value: 'monthly', label: 'Iga kuu' },
];

function generateSearchDates(kuupaev, kellaaeg, kestus, korduvus, korduvusArv) {
    if (!kuupaev) return [];
    const dates = [kuupaev];
    if (!korduvus) return dates;
    const stepMap = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
    const step = stepMap[korduvus] || 7;
    const n = Math.min(parseInt(korduvusArv, 10) || 5, 52);
    let cur = kuupaev;
    for (let i = 1; i < n; i++) {
        const d = new Date(cur); d.setDate(d.getDate() + step);
        cur = d.toISOString().slice(0, 10);
        dates.push(cur);
    }
    return dates;
}

export default function OtsiRuumi() {
    const navigate = useNavigate();
    const [query, setQuery] = useState({
        hoone: '', ruumitypp: '', min_kohti: '', otsing: '',
    });
    const [showKorduv, setShowKorduv] = useState(false);
    const [korduv, setKorduv] = useState({
        kuupaev: '2026-08-11',
        kellaaeg: 540,
        kestus: 2,
        korduvus: 'weekly',
        korduvus_arv: '5',
    });

    function set(key, val) { setQuery(q => ({ ...q, [key]: val })); }
    function setK(key, val) { setKorduv(k => ({ ...k, [key]: val })); }

    const results = useMemo(() => searchRooms(query), [query]);

    const searchDates = useMemo(() =>
        showKorduv ? generateSearchDates(korduv.kuupaev, korduv.kellaaeg, korduv.kestus, korduv.korduvus, korduv.korduvus_arv) : [],
        [showKorduv, korduv]
    );

    // Korduva otsingu puhul näita ainult ruume, mis on KÕIGIL kuupäevadel vabad
    // (mock: filtreerima juhusliku reegli järgi kuupäevade arvu põhjal)
    const filteredResults = useMemo(() => {
        if (!showKorduv || searchDates.length === 0) return results;
        // Deterministlik mock: ruum on saadaval korduvaks, kui selle id hash % searchDates.length === 0
        return results.filter(r => {
            const hash = r.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            return hash % 3 !== (searchDates.length % 3); // umbes 2/3 jäävad alles
        });
    }, [results, showKorduv, searchDates]);

    const totalCount = filteredResults.length;
    const freeCount = filteredResults.filter(r => r.vaba).length;

    const fmtMin = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

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
            {/* Korduva otsing */}
            <div className="bron-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                        <span className="material-icons" style={{ color: 'var(--tt-purple-500)', fontSize: '1.2rem' }}>repeat</span>
                        <strong style={{ color: 'var(--tt-purple-500)', fontSize: '.9rem' }}>Korduv broneering</strong>
                        <span style={{ fontSize: '.8rem', color: 'var(--tt-text-muted)' }}>
                            — otsi ruume, mis on vabad kõigil soovitud aegadel
                        </span>
                    </div>
                    <button type="button"
                        className={`bron-btn bron-btn-sm ${showKorduv ? 'bron-btn-primary' : 'bron-btn-secondary'}`}
                        onClick={() => setShowKorduv(v => !v)}>
                        {showKorduv ? 'Peida' : 'Lülita sisse'}
                    </button>
                </div>

                {showKorduv && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--tt-border)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <div className="bron-form-group" style={{ minWidth: 150 }}>
                                <label>Esimene kuupäev</label>
                                <input type="date" value={korduv.kuupaev} min="2026-08-01" max="2026-12-31"
                                    onChange={e => setK('kuupaev', e.target.value)} />
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 120 }}>
                                <label>Algusaeg</label>
                                <select value={korduv.kellaaeg} onChange={e => setK('kellaaeg', Number(e.target.value))}>
                                    {KELLAAEG_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 100 }}>
                                <label>Kestus (h)</label>
                                <select value={korduv.kestus} onChange={e => setK('kestus', Number(e.target.value))}>
                                    {[1,1.5,2,3,4].map(h => <option key={h} value={h}>{h} h</option>)}
                                </select>
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 150 }}>
                                <label>Sagedus</label>
                                <select value={korduv.korduvus} onChange={e => setK('korduvus', e.target.value)}>
                                    {KORDUV_OPTS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="bron-form-group" style={{ minWidth: 100 }}>
                                <label>Korduste arv</label>
                                <input type="number" min="2" max="52" value={korduv.korduvus_arv}
                                    onChange={e => setK('korduvus_arv', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ background: 'var(--tt-purple-100)', borderRadius: 6, padding: '.75rem 1rem' }}>
                            <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--tt-purple-500)' }}>
                                Otsin ruume, mis on vabad {searchDates.length} korral ({fmtMin(korduv.kellaaeg)}–{fmtMin(korduv.kellaaeg + korduv.kestus * 60)}):&nbsp;
                            </span>
                            {searchDates.slice(0, 8).map(d => (
                                <span key={d} className="bron-badge bron-badge--neutral" style={{ fontSize: '.72rem', marginRight: '.25rem' }}>
                                    {new Date(d).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit' })}
                                </span>
                            ))}
                            {searchDates.length > 8 && <span style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)' }}>+{searchDates.length - 8} veel</span>}
                        </div>
                    </div>
                )}
            </div>

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
                                {showKorduv && (
                                    <span className="bron-badge bron-badge--success" style={{ fontSize: '.72rem' }}>
                                        <span className="material-icons" style={{ fontSize: '.75rem' }}>repeat</span>
                                        Saadaval {searchDates.length}×
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bron-room-card__footer">
                            <span className={`bron-badge ${room.vaba ? 'bron-badge--success' : 'bron-badge--danger'}`}>
                                {room.vaba ? 'Vaba' : 'Hõivatud'}
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
                {filteredResults.length === 0 && (
                    <div className="bron-empty" style={{ gridColumn: '1 / -1' }}>
                        <span className="material-icons" style={{ fontSize: '1.75rem', color: 'var(--tt-purple-300)', display: 'block', marginBottom: '.5rem' }}>search</span>
                        <h3>{showKorduv ? 'Ükski ruum pole kõigil aegadel vaba' : 'Tulemusi ei leitud'}</h3>
                        <p>{showKorduv ? 'Proovi vähendada korduste arvu või valida teine aeg.' : 'Muuda filtriparameetreid.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
