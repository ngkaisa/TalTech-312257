import { useNavigate, useParams } from 'react-router-dom';
import { RUUMID, getKpiSummary } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import KpiKaart from '../../components/bron/KpiKaart';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import { useRole } from '../../context/RoleContext';

function pct(v) { return (+v).toFixed(1) + '%'; }

export default function StatistikaRuumiDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canSeeFullStatistics } = useRole();

    if (!canSeeFullStatistics) return <LigipaasPuudub />;

    const room = RUUMID.find(r => r.id === id);
    if (!room) return <div className="bron-page"><h1>Ruum ei leitud</h1></div>;

    const kpi = getKpiSummary({ ruum_id: id });

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Statistika', to: '/statistika' },
                { label: 'Ruumide kasutus', to: '/statistika?tab=ruumid' },
                { label: room.code }
            ]} />

            <div className="bron-page-header">
                <div>
                    <h1>{room.code}</h1>
                    <p>{room.ruumitypp_label} · {room.hoone_name}</p>
                </div>
                <button className="bron-btn bron-btn-secondary" onClick={() => navigate(-1)}>← Tagasi</button>
            </div>

            <div className="bron-kpi-grid">
                <KpiKaart value={pct(kpi.broneeritud_pct)} label="Broneeritud kasutus" />
                <KpiKaart value={pct(kpi.tegelik_pct)} label="Tegelik kasutus" variant="green" />
                <KpiKaart value={pct(kpi.kasutamata_pct)} label="Kasutamata" variant="amber" />
                <KpiKaart value={kpi.tuhistatud_arv} label="Tühistamisi" variant="red" />
                <KpiKaart value={kpi.broneeringute_arv} label="Broneeringuid" />
                <KpiKaart value={room.kohti} label="Mahutavus" />
            </div>
        </div>
    );
}
