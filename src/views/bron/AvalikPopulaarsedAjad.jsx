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
