import { ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getKpiSummary, getRuumideSummary } from '../../BronStatisticsService';
import KpiKaart from '../../components/bron/KpiKaart';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function pct(v) { return (+v).toFixed(1) + '%'; }

export default function StatistikaYlevaade({ filters = {} }) {
    const kpi = getKpiSummary(filters);
    const rooms = getRuumideSummary(filters).slice(0, 8);

    const doughnutData = {
        labels: ['Broneeritud kasutus', 'Kasutamata broneering', 'Vaba aeg'],
        datasets: [{
            data: [
                kpi.tegelik_pct * 100,
                (kpi.broneeritud_pct - kpi.tegelik_pct) * 100,
                (1 - kpi.broneeritud_pct) * 100,
            ],
            backgroundColor: ['#251d47', '#e4067e', '#e5e7eb'],
        }],
    };

    const barData = {
        labels: rooms.map(r => r.code),
        datasets: [
            { label: 'Broneeritud %', data: rooms.map(r => +(r.broneeritud_pct * 100).toFixed(1)), backgroundColor: '#251d47' },
            { label: 'Tegelik %', data: rooms.map(r => +(r.tegelik_pct * 100).toFixed(1)), backgroundColor: '#e4067e' },
        ],
    };

    return (
        <div>
            <div className="bron-kpi-grid">
                <KpiKaart value={pct(kpi.broneeritud_pct)} label="Broneeritud kasutus" sub={`${kpi.broneeritud_tunnid.toLocaleString()} / ${kpi.avatud_tunnid.toLocaleString()} h`} />
                <KpiKaart value={pct(kpi.tegelik_pct)} label="Tegelik kasutus (anduri põhjal)" variant="green" />
                <KpiKaart value={pct(kpi.kasutamata_pct)} label="Kasutamata broneering" variant="amber" />
                <KpiKaart value={kpi.tuhistatud_arv.toLocaleString()} label="Tühistamisi" variant="red" />
                <KpiKaart value={kpi.broneeringute_arv.toLocaleString()} label="Broneeringuid kokku" />
                <KpiKaart value={kpi.ruumide_arv} label="Analüüsitud ruumi" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>Kasutuse jaotus</h3>
                    <div style={{ maxWidth: 280, margin: '0 auto' }}>
                        <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>Populaarsemad ruumid</h3>
                    <Bar data={barData} options={{
                        indexAxis: 'y',
                        scales: { x: { max: 100, ticks: { callback: v => v + '%' } } },
                        plugins: { legend: { position: 'top' } }
                    }} />
                </div>
            </div>
        </div>
    );
}
