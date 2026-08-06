import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RUUMID, SYNDMUSETYYBID } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { useRole } from '../../context/RoleContext';

const KELLAAEG_OPTS = Array.from({ length: 29 }, (_, i) => {
    const totalMin = 480 + i * 30;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return { label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, value: totalMin };
});

const KESTUS_OPTS = [
    { label: '30 min', h: 0.5 }, { label: '1 tund', h: 1 }, { label: '1,5 tundi', h: 1.5 },
    { label: '2 tundi', h: 2 }, { label: '3 tundi', h: 3 }, { label: '4 tundi', h: 4 },
];

export default function BroneeringuVorm() {
    const { ruum_id } = useParams();
    const navigate = useNavigate();
    const { isExt, isLoggedIn } = useRole();
    const [submitted, setSubmitted] = useState(false);

    const defaultRoom = ruum_id ? RUUMID.find(r => r.id === ruum_id) : null;

    const [form, setForm] = useState({
        ruum_id: defaultRoom?.id || '',
        kuupaev: '2026-08-10',
        kellaaeg: 540,
        kestus: 2,
        syndmus: 'oppe_teadus',
        pohjendus: '',
        osalejate_arv: '',
    });

    function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    if (!isLoggedIn) {
        return (
            <div className="bron-page">
                <div className="bron-access-denied">
                    <h2>Sisselogimine nõutud</h2>
                    <p>Broneeringu loomiseks peate olema sisse logitud.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="bron-page" style={{ maxWidth: 480 }}>
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '2.5rem', color: '#147a52', marginBottom: '.75rem', display: 'block' }}>check_circle</span>
                    <h2 style={{ color: '#065f46', margin: '0 0 .5rem' }}>
                        {isExt ? 'Taotlus esitatud!' : 'Broneering kinnitatud!'}
                    </h2>
                    <p style={{ color: '#047857', margin: '0 0 1.5rem' }}>
                        {isExt
                            ? 'Sinu taotlus on saadetud ruumihaldurile menetlemiseks.'
                            : 'Broneering on edukalt registreeritud.'}
                    </p>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
                        <button className="bron-btn bron-btn-primary" onClick={() => navigate('/broneeringud')}>Vaata broneeringuid</button>
                        <button className="bron-btn bron-btn-secondary" onClick={() => setSubmitted(false)}>Uus broneering</button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedRoom = RUUMID.find(r => r.id === form.ruum_id);

    return (
        <div className="bron-page" style={{ maxWidth: 700 }}>
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Otsi ruumi', to: '/otsi-ruumi' },
                { label: isExt ? 'Uus taotlus' : 'Uus broneering' }
            ]} />
            <div className="bron-page-header">
                <div>
                    <h1>{isExt ? 'Esita taotlus' : 'Uus broneering'}</h1>
                    <p>{isExt ? 'Täida taotlusvorm — haldur kinnitab selle käsitsi.' : 'Broneeri ruum ülikoolihoonetes.'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bron-card">
                <div className="bron-form-grid">
                    <div className="bron-form-group">
                        <label>Ruum *</label>
                        <select value={form.ruum_id} onChange={e => set('ruum_id', e.target.value)} required>
                            <option value="">Vali ruum...</option>
                            {RUUMID.map(r => (
                                <option key={r.id} value={r.id}>{r.code} ({r.ruumitypp_label}, {r.kohti} kohta)</option>
                            ))}
                        </select>
                        {selectedRoom && (
                            <span style={{ fontSize: '.75rem', color: '#6b7280' }}>
                                {selectedRoom.hoone_name} · {selectedRoom.kohti} kohta
                            </span>
                        )}
                    </div>

                    <div className="bron-form-group">
                        <label>Kuupäev *</label>
                        <input type="date" value={form.kuupaev} min="2026-08-01" max="2026-12-31"
                            onChange={e => set('kuupaev', e.target.value)} required />
                    </div>

                    <div className="bron-form-group">
                        <label>Algusaeg *</label>
                        <select value={form.kellaaeg} onChange={e => set('kellaaeg', Number(e.target.value))} required>
                            {KELLAAEG_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="bron-form-group">
                        <label>Kestus *</label>
                        <select value={form.kestus} onChange={e => set('kestus', Number(e.target.value))} required>
                            {KESTUS_OPTS.map(o => <option key={o.h} value={o.h}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="bron-form-group">
                        <label>Sündmuse tüüp *</label>
                        <select value={form.syndmus} onChange={e => set('syndmus', e.target.value)} required>
                            {SYNDMUSETYYBID.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
                        </select>
                    </div>

                    <div className="bron-form-group">
                        <label>Osalejate arv</label>
                        <input type="number" min="1" placeholder="nt 15" value={form.osalejate_arv}
                            onChange={e => set('osalejate_arv', e.target.value)} />
                    </div>
                </div>

                {isExt && (
                    <div className="bron-form-group" style={{ marginTop: '1rem' }}>
                        <label>Põhjendus / sündmuse kirjeldus *</label>
                        <textarea rows={3} value={form.pohjendus}
                            onChange={e => set('pohjendus', e.target.value)}
                            placeholder="Kirjelda üritust või kasutuse eesmärki..."
                            required style={{ resize: 'vertical' }} />
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem' }}>
                    <button type="submit" className="bron-btn bron-btn-primary">
                        {isExt ? '📤 Esita taotlus' : '✓ Kinnita broneering'}
                    </button>
                    <button type="button" className="bron-btn bron-btn-secondary" onClick={() => navigate(-1)}>
                        Katkesta
                    </button>
                </div>
            </form>
        </div>
    );
}
