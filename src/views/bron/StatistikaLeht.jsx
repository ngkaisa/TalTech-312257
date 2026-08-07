import { TabPanel, Tabs } from '@TalTech-IT/styleguide';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { defaultPeriod, getGlobalCounts } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import LigipaasPuudub from '../../components/bron/LigipaasPuudub';
import StatistikaFilter from '../../components/bron/StatistikaFilter';
import { useRole } from '../../context/RoleContext';
import StatistikaKeskkond from './StatistikaKeskkond';
import StatistikaPopulaarsedAjad from './StatistikaPopulaarsedAjad';
import StatistikaRuumid from './StatistikaRuumid';
import StatistikaTagasiside from './StatistikaTagasiside';
import StatistikaTuhistamised from './StatistikaTuhistamised';
import StatistikaYlevaade from './StatistikaYlevaade';

const TAB_KEYS = ['ylevaade', 'ruumid', 'populaarsed-ajad', 'tuhistamised', 'tagasiside', 'keskkond'];
const TAB_LABELS = {
    ylevaade: 'Ülevaade',
    ruumid: 'Ruumide kasutus',
    'populaarsed-ajad': 'Populaarsed ajad',
    tuhistamised: 'Tühistamised',
    tagasiside: 'Tagasiside',
    keskkond: 'Kasutajad & Keskkond',
};
const counts = getGlobalCounts();

export default function StatistikaLeht() {
    const { canSeeFullStatistics } = useRole();
    const location = useLocation();
    const navigate = useNavigate();

    const queryTab = new URLSearchParams(location.search).get('tab');
    const [activeTab, setActiveTab] = useState(
        TAB_KEYS.includes(queryTab) ? queryTab : 'ylevaade'
    );
    const [filters, setFilters] = useState(defaultPeriod());

    useEffect(() => {
        const q = new URLSearchParams(location.search).get('tab');
        if (q && TAB_KEYS.includes(q) && q !== activeTab) setActiveTab(q);
    }, [location.search]);

    function switchTab(tab) {
        setActiveTab(tab);
        navigate(`/statistika?tab=${tab}`, { replace: true });
    }

    if (!canSeeFullStatistics) return <LigipaasPuudub />;

    const tabContent = {
        ylevaade: <StatistikaYlevaade filters={filters} />,
        ruumid: <StatistikaRuumid filters={filters} />,
        'populaarsed-ajad': <StatistikaPopulaarsedAjad filters={filters} />,
        tuhistamised: <StatistikaTuhistamised filters={filters} />,
        tagasiside: <StatistikaTagasiside filters={filters} />,
        keskkond: <StatistikaKeskkond filters={filters} />,
    };

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Statistika', to: '/statistika' },
                { label: TAB_LABELS[activeTab] }
            ]} />

            <div className="bron-page-header">
                <div>
                    <h1>Kasutusstatistika</h1>
                    <p>TalTechi ruumide broneeringud, kasutus ja tühistamised.</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {[
                        { icon: 'corporate_fare', val: counts.hooned, lab: 'hoonet' },
                        { icon: 'meeting_room', val: counts.ruumid, lab: 'ruumi' },
                        { icon: 'event', val: counts.broneeringud.toLocaleString('et-EE'), lab: 'broneeringut' },
                    ].map(({ icon, val, lab }) => (
                        <span key={lab} className="bron-stat-chip">
                            <span className="material-icons" style={{ fontSize: '.9rem' }}>{icon}</span>
                            {val} {lab}
                        </span>
                    ))}
                </div>
            </div>

            <StatistikaFilter filters={filters} onChange={setFilters} />

            <Tabs
                id="statistika-tabs"
                labels={TAB_KEYS.map(t => TAB_LABELS[t])}
                selectedIndex={TAB_KEYS.indexOf(activeTab)}
                onSelect={(i) => switchTab(TAB_KEYS[i])}
            >
                {TAB_KEYS.map(t => (
                    <TabPanel key={t}>
                        {tabContent[t]}
                    </TabPanel>
                ))}
            </Tabs>
        </div>
    );
}
