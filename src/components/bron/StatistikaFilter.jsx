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
