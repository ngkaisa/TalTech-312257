import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRooms } from '../../BronBookingsService';
import { HOONED, RUUMITYYBID } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { RuumiKaardiPilt } from '../../components/bron/RuumiGalerii';

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
                {results.length === 0 && (
                    <div className="bron-empty" style={{ gridColumn: '1 / -1' }}>
                        <span class="material-icons" style={{fontSize:"1.75rem",color:"var(--tt-purple-300)",display:"block",marginBottom:".5rem"}}>search</span>
                        <h3>Tulemusi ei leitud</h3>
                        <p>Muuda filtriparameetreid.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
