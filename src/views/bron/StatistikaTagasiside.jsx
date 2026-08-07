import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFeedback } from '../../BronBookingsService';
import { RUUMID } from '../../BronStatisticsService';

const KATEGOORIAD = [
    { key: 'temperatuur', label: 'Temperatuur' },
    { key: 'puhtus',      label: 'Puhtus' },
    { key: 'ohk',         label: 'Õhk / lõhnad' },
    { key: 'varustus',    label: 'Varustus' },
];

function StarBar({ value }) {
    return (
        <span style={{ display: 'inline-flex', gap: 1, fontSize: '1rem', lineHeight: 1 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ color: s <= Math.round(value) ? 'var(--tt-pink-500)' : 'var(--tt-border)' }}>★</span>
            ))}
            <span style={{ marginLeft: '.3rem', fontSize: '.8rem', color: 'var(--tt-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {value.toFixed(1)}
            </span>
        </span>
    );
}

function avg(items, key) {
    if (!items.length) return 0;
    return items.reduce((s, f) => s + f[key], 0) / items.length;
}

export default function StatistikaTagasiside({ filters }) {
    const navigate = useNavigate();
    const allFeedback = useMemo(() => getAllFeedback(RUUMID), []);

    // Perioodifilter (filters.alates / filters.kuni)
    const filtered = useMemo(() => {
        if (!filters?.alates && !filters?.kuni) return allFeedback;
        return allFeedback.filter(fb => {
            if (filters.alates && fb.kuupaev < filters.alates) return false;
            if (filters.kuni   && fb.kuupaev > filters.kuni)   return false;
            return true;
        });
    }, [allFeedback, filters]);

    // Üldkeskmine per kategooria
    const globalAvg = useMemo(() => KATEGOORIAD.map(k => ({
        ...k, avg: avg(filtered, k.key),
    })), [filtered]);

    const overallAvg = useMemo(() => {
        if (!filtered.length) return 0;
        return filtered.reduce((s, f) => s + (f.temperatuur + f.puhtus + f.ohk + f.varustus) / 4, 0) / filtered.length;
    }, [filtered]);

    // Tagasiside per ruum — top 10 (kõige madalam üldhinne)
    const perRuum = useMemo(() => {
        const map = {};
        for (const fb of filtered) {
            if (!map[fb.ruum_id]) map[fb.ruum_id] = { ruum_id: fb.ruum_id, ruum_code: fb.ruum_code, hoone: fb.hoone, items: [] };
            map[fb.ruum_id].items.push(fb);
        }
        return Object.values(map).map(r => ({
            ...r,
            count: r.items.length,
            avg: r.items.reduce((s, f) => s + (f.temperatuur + f.puhtus + f.ohk + f.varustus) / 4, 0) / r.items.length,
        })).sort((a, b) => a.avg - b.avg); // madalaim ees (prioriteet halduritele)
    }, [filtered]);

    // Viimased kommentaarid
    const kommentaarid = useMemo(() => filtered.filter(f => f.kommentaar).slice(0, 30), [filtered]);

    return (
        <div>
            {/* ── KPI riba ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="bron-kpi">
                    <div className="bron-kpi__value">{filtered.length}</div>
                    <div className="bron-kpi__label">hinnangut kokku</div>
                </div>
                <div className="bron-kpi">
                    <div className="bron-kpi__value">★ {overallAvg.toFixed(1)}</div>
                    <div className="bron-kpi__label">üldkeskmine</div>
                </div>
                <div className="bron-kpi">
                    <div className="bron-kpi__value">{kommentaarid.length}</div>
                    <div className="bron-kpi__label">kommentaari</div>
                </div>
                <div className="bron-kpi">
                    <div className="bron-kpi__value">{perRuum.length}</div>
                    <div className="bron-kpi__label">hinnatud ruumi</div>
                </div>
            </div>

            {/* ── Kategooriate keskmised ── */}
            <div className="bron-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                    Kategooriate keskmised
                </h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {globalAvg.map(k => (
                        <div key={k.key}>
                            <div style={{ fontSize: '.78rem', color: 'var(--tt-text-muted)', marginBottom: '.25rem' }}>{k.label}</div>
                            <StarBar value={k.avg} />
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* ── Ruumid madalama hinnanguga (vajavad tähelepanu) ── */}
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                        Ruumid — madalam hinne ees
                    </h3>
                    <div className="bron-table-wrap">
                        <table className="table table-hover" style={{ fontSize: '.85rem' }}>
                            <thead>
                                <tr>
                                    <th>Ruum</th>
                                    <th>Hoone</th>
                                    <th>Hinnanguid</th>
                                    <th>Üldhinne</th>
                                </tr>
                            </thead>
                            <tbody>
                                {perRuum.slice(0, 15).map(r => (
                                    <tr key={r.ruum_id} style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/ruum/${r.ruum_id}?tab=tagasiside`)}>
                                        <td style={{ fontWeight: 600, color: 'var(--tt-purple-500)' }}>{r.ruum_code}</td>
                                        <td style={{ color: 'var(--tt-text-muted)', fontSize: '.78rem' }}>{r.hoone}</td>
                                        <td>{r.count}</td>
                                        <td><StarBar value={r.avg} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Viimased kommentaarid ── */}
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                        Viimased kommentaarid
                    </h3>
                    {kommentaarid.length === 0 ? (
                        <p style={{ color: 'var(--tt-text-muted)', margin: 0 }}>Kommentaare pole.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', maxHeight: 400, overflowY: 'auto' }}>
                            {kommentaarid.map(fb => (
                                <div key={fb.id} style={{
                                    background: 'var(--tt-purple-50, #f8f7fc)',
                                    borderRadius: 6, padding: '.6rem .8rem',
                                    borderLeft: '3px solid var(--tt-purple-300)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                                        <span
                                            style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--tt-purple-500)', cursor: 'pointer' }}
                                            onClick={() => navigate(`/ruum/${fb.ruum_id}?tab=tagasiside`)}
                                        >
                                            {fb.ruum_code}
                                        </span>
                                        <span style={{ fontSize: '.75rem', color: 'var(--tt-text-muted)' }}>{fb.kuupaev} · {fb.kasutaja}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--tt-text)' }}>{fb.kommentaar}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
