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
