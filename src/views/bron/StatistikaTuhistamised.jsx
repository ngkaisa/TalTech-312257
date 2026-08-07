import { BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getTuhistamisedStats } from '../../BronStatisticsService';
import KpiKaart from '../../components/bron/KpiKaart';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SEKKUMISE_KLASSID = [
    { key: 'lt15',    label: '< 15 min' },
    { key: 'lt60',    label: '15–60 min' },
    { key: 'lt240',   label: '1–4 h' },
    { key: 'lt1440',  label: '4–24 h' },
    { key: 'lt4320',  label: '1–3 päeva' },
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
                <KpiKaart
                    value={stats.kokku}
                    label="Tühistamisi kokku"
                    variant="red"
                    legend={
                        'Tühistamisi kokku = perioodil tühistatud broneeringute arv\n' +
                        'Sisaldab: kasutaja ise tühistas + haldur/super tühistas\n' +
                        'Ei sisalda: menetlusel (ghost) ega lõppenud broneeringuid'
                    }
                />
                <KpiKaart
                    value={(stats.tuhistamine_pct * 100).toFixed(1) + '%'}
                    label="Tühistamise määr"
                    variant="amber"
                    legend={
                        'Tühistamise määr % = tühistatud ÷ (tühistatud + lõppenud) × 100\n' +
                        'Näitab kui suur osa broneeringutest ei toimunud plaanipäraselt\n' +
                        'Mida väiksem, seda usaldusväärsemad kasutajate broneeringud'
                    }
                />
                <KpiKaart
                    value={stats.avg_enne_h != null ? stats.avg_enne_h.toFixed(1) + ' h' : '—'}
                    label="Keskm. tühistamise kaugus"
                    legend={
                        'Keskmine tühistamise kaugus = tühistamismomendi ja broneeringu alguse vahe keskmisena (tundides)\n' +
                        'Pikem kaugus = kasutajad teatavad varakult → ruum jõuab uuele kasutajale\n' +
                        'Lühem kaugus (< 1 h) = ruum jääb broneerituks kuid kasutamata'
                    }
                />
            </div>

            <div className="bron-card">
                <h3 style={{ margin: '0 0 .5rem', color: 'var(--tt-navy)', fontSize: '1rem' }}>
                    Tühistamise aeg enne broneeringu algust
                </h3>
                <p style={{ margin: '0 0 .75rem', fontSize: '.82rem', color: '#6b7280' }}>
                    Näitab millal kasutajad broneeringu tühistavad. Varajane tühistamine (3+ päeva) vabastab
                    ruumi teistele — hiline (&lt; 15 min) jätab ruumi praktiliselt kasutamata.
                </p>
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
