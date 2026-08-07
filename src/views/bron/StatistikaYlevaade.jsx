import { ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getKpiSummary, getRuumideSummary } from '../../BronStatisticsService';
import KpiKaart from '../../components/bron/KpiKaart';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function pct(v) { return (+v).toFixed(1) + '%'; }

// Arvutusvalemid — kuvatakse KPI kaartidel ⓘ tooltipina
const LEGEND = {
    broneeritud:
        'Broneeritud kasutus % = broneeritud tunnid ÷ avatud tunnid × 100\n' +
        'Avatud tunnid = ruumide arv × perioodi päevad × 14 h/päev (08:00–22:00)\n' +
        'Sisaldab: aktiivne + lõppenud broneeringud (v.a tühistatud ja menetlusel taotlused)',
    tegelik:
        'Tegelik kasutus % = anduriga kinnitatud tunnid ÷ avatud tunnid × 100\n' +
        'Anduri lugemine: broneering loetakse reaalselt kasutatuks kui ruumisensor registreeris kohalolu\n' +
        '~78% tõenäosusega simuleeritud, tunniplaanil alati true',
    kasutamata:
        'Kasutamata broneering % = (broneeritud − tegelik) ÷ broneeritud × 100\n' +
        'Näitab kui suur osa broneeringutest jäi reaalselt kasutamata (ruumis ei käidud)\n' +
        'Mida väiksem, seda paremini broneeringuid kasutatakse',
    tuhistatud:
        'Tühistamisi = lõplikult tühistatud broneeringute arv perioodil\n' +
        'Sisaldab: kasutaja ise tühistas + haldur tühistas\n' +
        'Ei sisalda: menetlusel taotlused (ghost-booking)',
    kokku:
        'Broneeringuid kokku = kinnistatud broneeringute arv (aktiivne + lõppenud)\n' +
        'Ei sisalda: tühistatud ega menetlusel taotlused',
    ruumid:
        'Analüüsitud ruumi = filtri tingimustele vastavate ruumide arv\n' +
        'Avatud tunnid arvutatakse ainult nende ruumide põhjal',
};

const METOODIKA_RIDAD = [
    { label: 'Avatud aeg', valem: 'Ruumide arv × perioodi päevad × 14 h/päev (08:00–22:00)' },
    { label: 'Broneeritud kasutus %', valem: 'Broneeritud tunnid ÷ avatud tunnid × 100' },
    { label: 'Tegelik kasutus %', valem: 'Andurpositiivsed tunnid ÷ avatud tunnid × 100' },
    { label: 'Kasutamata broneering %', valem: '(Broneeritud − tegelik) ÷ broneeritud × 100' },
    { label: 'Tühistamise määr %', valem: 'Tühistatud ÷ (tühistatud + lõppenud) × 100' },
    { label: 'Anduri lugemine', valem: 'Broneering loetakse kasutuses olevaks kui ruumisensor registreeris kohalolu (simuleeritud ~78% tõenäosusega; tunniplaanil 100%)' },
    { label: 'Menetlusel taotlus', valem: 'Ghost-booking: blokeerib ruumi otsebroneerimisel, kuid ei arvestata täituvusstatistikasse kuni kinnitamiseni' },
];

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
                <KpiKaart
                    value={pct(kpi.broneeritud_pct)}
                    label="Broneeritud kasutus"
                    sub={`${kpi.broneeritud_tunnid.toLocaleString()} / ${kpi.avatud_tunnid.toLocaleString()} h`}
                    legend={LEGEND.broneeritud}
                />
                <KpiKaart
                    value={pct(kpi.tegelik_pct)}
                    label="Tegelik kasutus (anduri põhjal)"
                    variant="green"
                    legend={LEGEND.tegelik}
                />
                <KpiKaart
                    value={pct(kpi.kasutamata_pct)}
                    label="Kasutamata broneering"
                    variant="amber"
                    legend={LEGEND.kasutamata}
                />
                <KpiKaart
                    value={kpi.tuhistatud_arv.toLocaleString()}
                    label="Tühistamisi"
                    variant="red"
                    legend={LEGEND.tuhistatud}
                />
                <KpiKaart
                    value={kpi.broneeringute_arv.toLocaleString()}
                    label="Broneeringuid kokku"
                    legend={LEGEND.kokku}
                />
                <KpiKaart
                    value={kpi.ruumide_arv}
                    label="Analüüsitud ruumi"
                    legend={LEGEND.ruumid}
                />
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

            {/* ── Arvutusmetoodika legend ── */}
            <div className="bron-card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ margin: '0 0 .75rem', color: 'var(--tt-navy)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--tt-purple-500)' }}>calculate</span>
                    Arvutusmetoodika
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '.35rem .5rem', color: '#6b7280', fontWeight: 600, width: '30%' }}>Näitaja</th>
                            <th style={{ textAlign: 'left', padding: '.35rem .5rem', color: '#6b7280', fontWeight: 600 }}>Valem / selgitus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {METOODIKA_RIDAD.map(({ label, valem }) => (
                            <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '.35rem .5rem', color: '#374151', fontWeight: 500, verticalAlign: 'top' }}>{label}</td>
                                <td style={{ padding: '.35rem .5rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '.8rem' }}>{valem}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
