import { ConfigProvider } from '@TalTech-IT/styleguide';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import AppLayout from './layout/AppLayout';
import Avaleht from './views/bron/Avaleht';
import AvalikPopulaarsedAjad from './views/bron/AvalikPopulaarsedAjad';
import BroneeringuVorm from './views/bron/BroneeringuVorm';
import MinuBroneeringud from './views/bron/MinuBroneeringud';
import MinuTaotlused from './views/bron/MinuTaotlused';
import OtsiRuumi from './views/bron/OtsiRuumi';
import RuumiDetail from './views/bron/RuumiDetail';
import StatistikaLeht from './views/bron/StatistikaLeht';
import StatistikaRuumiDetail from './views/bron/StatistikaRuumiDetail';

export default function App() {
    return (
        <ConfigProvider theme="taltech">
        <BrowserRouter>
            <RoleProvider>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Avaleht />} />
                        <Route path="otsi-ruumi" element={<OtsiRuumi />} />
                        <Route path="ruum/:id" element={<RuumiDetail />} />
                        <Route path="broneeringud" element={<MinuBroneeringud />} />
                        <Route path="taotlused" element={<MinuTaotlused />} />
                        <Route path="broneeri/:ruum_id?" element={<BroneeringuVorm />} />
                        <Route path="statistika" element={<StatistikaLeht />} />
                        <Route path="statistika/ruumid/:id" element={<StatistikaRuumiDetail />} />
                        <Route path="statistika/ruumid" element={<Navigate to="/statistika?tab=ruumid" replace />} />
                        <Route path="statistika/populaarsed-ajad" element={<Navigate to="/statistika?tab=populaarsed-ajad" replace />} />
                        <Route path="statistika/tuhistamised" element={<Navigate to="/statistika?tab=tuhistamised" replace />} />
                        <Route path="avalik/populaarsed-ajad" element={<AvalikPopulaarsedAjad />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </RoleProvider>
        </BrowserRouter>
        </ConfigProvider>
    );
}
