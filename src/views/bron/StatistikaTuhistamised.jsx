import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { getTuhistamisedStats } from '../../BronStatisticsService';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SEKKUMISE_KLASSID = [
    { key: 'lt15', label: '< 15 min' },
    { key: 'lt60', label: '15–60 min' },
    { key: 'lt240', label: '1–4 h' },
    { key: 'lt1440', label: '4–24 h' },
    { key: 'lt4320', label: '1–3 päeva' },
    { key: 'gte4320', label: '3+ päeva' },
];

export default function StatistikaTuhistamised({ filters = {} }) {
    const stats = getTuhistamisedStats(filters);

    const chartData = {
        labels: SEKKUMISE_KLASSID.map(k => k.label),
        datasets: [{
            label: 'Tühistamisi',
            data: SEKKUMISE_KLASSID.map(k => stats.byClass[k.key] || 0),
            backgroundColor: '#e4067e',
        }],
    };

    return (
        <div>
            <div className="bron-kpi-grid">
                <div className="bron-kpi bron-kpi--red">
                    <div className="bron-kpi__value">{stats.kokku}</div>
                    <div className="bron-kpi__label">Tühistamisi kokku</div>
                </div>
                <div className="bron-kpi bron-kpi--amber">
                    <div className="bron-kpi__value">{(stats.tuhistamine_pct * 100).toFixed(1)}%</div>
                    <div className="bron-kpi__label">Tühistamise määr</div>
                </div>
                <div className="bron-kpi">
                    <div className="bron-kpi__value">{stats.avg_enne_h?.toFixed(1) ?? '—'} h</div>
                    <div className="bron-kpi__label">Keskm. tühistamise kaugus</div>
                </div>
            </div>

            <div className="bron-card">
                <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>
                    Tühistamise aeg enne broneeringu algust
                </h3>
                <div style={{ maxHeight: 280 }}>
                    <Bar data={chartData} options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { ticks: { precision: 0 } } }
                    }} />
                </div>
            </div>
        </div>
    );
}
