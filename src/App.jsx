import { ConfigProvider } from '@TalTech-IT/styleguide';
import { useState } from 'react';
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

const ACCESS_KEY = 'bron_access';
const PASSWORD = 'bron2026';

function PasswordGate({ children }) {
    const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(ACCESS_KEY) === '1');
    const [val, setVal] = useState('');
    const [err, setErr] = useState(false);

    if (unlocked) return children;

    function handleSubmit(e) {
        e.preventDefault();
        if (val === PASSWORD) {
            sessionStorage.setItem(ACCESS_KEY, '1');
            setUnlocked(true);
        } else {
            setErr(true);
            setVal('');
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--tt-purple-50, #f5f4fb)',
            fontFamily: 'ProximaNova, sans-serif',
        }}>
            <div style={{
                background: '#fff', borderRadius: 12, padding: '2.5rem 2rem',
                boxShadow: '0 4px 24px rgba(52,43,96,.12)', width: '100%', maxWidth: 360,
                textAlign: 'center',
            }}>
                <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔒</div>
                <h1 style={{ margin: '0 0 .4rem', fontSize: '1.3rem', color: 'var(--tt-purple-700, #342b60)' }}>
                    BRON prototüüp
                </h1>
                <p style={{ margin: '0 0 1.5rem', fontSize: '.88rem', color: '#666' }}>
                    TalTech ruumibroneerimissüsteem · Demo
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={val}
                        onChange={e => { setVal(e.target.value); setErr(false); }}
                        placeholder="Parool"
                        autoFocus
                        style={{
                            width: '100%', padding: '.65rem .9rem', fontSize: '1rem',
                            border: `1.5px solid ${err ? '#e53e3e' : '#d1d5db'}`,
                            borderRadius: 7, marginBottom: '.75rem', boxSizing: 'border-box',
                            outline: 'none',
                        }}
                    />
                    {err && <p style={{ color: '#e53e3e', fontSize: '.82rem', margin: '-.4rem 0 .6rem' }}>Vale parool</p>}
                    <button type="submit" style={{
                        width: '100%', padding: '.65rem', background: 'var(--tt-purple-500, #4c3f8a)',
                        color: '#fff', border: 'none', borderRadius: 7, fontSize: '1rem',
                        fontWeight: 700, cursor: 'pointer',
                    }}>
                        Sisene
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <PasswordGate>
        <ConfigProvider theme="taltech" locale="et">
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
        </PasswordGate>
    );
}
