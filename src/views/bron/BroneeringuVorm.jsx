import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

const KORDUV_TYYP = [
    { value: 'none',    label: 'Üks kord' },
    { value: 'daily',   label: 'Iga päev' },
    { value: 'weekly',  label: 'Iga nädal' },
    { value: 'biweekly',label: 'Iga teine nädal' },
    { value: 'monthly', label: 'Iga kuu' },
];

// Ruumitüübid, kus uni-kasutaja peab esitama taotluse (mitte otsebroneering)
// vt dokument § 4.2 — tabel 4
const UNI_TAOTLUS_RUUMID = new Set([
    'eriotstarbeline_auditoorium',
    'aula',
    'labor',
    'teaduslabor',
    'oppelabor',
    'spordiruum',
    'saun',
    'tookoda',
]);

function vajabTaotlust({ isExt, isUni, isGuest }, ruumitypp) {
    if (isExt || isGuest) return true;          // ext ja külastaja → alati taotlus
    if (isUni) return UNI_TAOTLUS_RUUMID.has(ruumitypp); // uni → sõltub tüübist
    return false;                               // super / haldur → otse
}

function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

function generateOccurrences(form) {
    if (form.korduvus === 'none') return [form.kuupaev];
    const results = [form.kuupaev];
    let cur = form.kuupaev;
    const limit = form.korduvus_lopp_tyyp === 'count'
        ? parseInt(form.korduvus_arv, 10) - 1
        : 52; // max safety
    const endDate = form.korduvus_lopp_tyyp === 'date' ? form.korduvus_lopp : null;

    const stepMap = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
    const step = stepMap[form.korduvus] || 7;

    for (let i = 0; i < limit && results.length < 52; i++) {
        cur = addDays(cur, step);
        if (endDate && cur > endDate) break;
        results.push(cur);
    }
    return results;
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' });
}

export default function BroneeringuVorm() {
    const { ruum_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isExt, isUni, isGuest, isLoggedIn } = useRole();
    const [submitted, setSubmitted] = useState(false);

    const prefill = location.state || {};
    const defaultRoom = ruum_id ? RUUMID.find(r => r.id === ruum_id) : null;

    const [form, setForm] = useState({
        ruum_id: defaultRoom?.id || '',
        kuupaev: prefill.kuupaev || '2026-08-10',
        kellaaeg: prefill.kellaaeg !== undefined ? prefill.kellaaeg : 540,
        kestus: prefill.kestus !== undefined ? prefill.kestus : 2,
        syndmus: 'oppe_teadus',
        pohjendus: '',
        osalejate_arv: '',
        korduvus: prefill.korduvus || 'none',
        korduvus_lopp_tyyp: 'count',
        korduvus_arv: prefill.korduvus_arv || '5',
        korduvus_lopp: '2026-12-31',
    });

    function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

    const occurrences = useMemo(() => generateOccurrences(form), [form]);
    const isRecurring = form.korduvus !== 'none';

    const selectedRuumitypp = RUUMID.find(r => r.id === form.ruum_id)?.ruumitypp || '';
    const needsTaotlus = vajabTaotlust({ isExt, isUni, isGuest }, selectedRuumitypp);

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
            <div className="bron-page" style={{ maxWidth: 540 }}>
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
                    <span className="material-icons" style={{ fontSize: '2.5rem', color: '#147a52', marginBottom: '.75rem', display: 'block' }}>check_circle</span>
                    <h2 style={{ color: '#065f46', margin: '0 0 .5rem' }}>
                        {needsTaotlus ? 'Taotlus esitatud!' : isRecurring ? `${occurrences.length} broneeringut kinnitatud!` : 'Broneering kinnitatud!'}
                    </h2>
                    <p style={{ color: '#047857', margin: '0 0 1.5rem' }}>
                        {needsTaotlus
                            ? 'Sinu taotlus on saadetud ruumihaldurile menetlemiseks.'
                            : isRecurring
                            ? `Korduvad broneeringud on edukalt registreeritud (${occurrences.length} korda).`
                            : 'Broneering on edukalt registreeritud.'}
                    </p>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
                        <button className="bron-btn bron-btn-primary" onClick={() => navigate(needsTaotlus ? '/taotlused' : '/broneeringud')}>
                            <span className="material-icons" style={{ fontSize: '1rem' }}>{needsTaotlus ? 'inbox' : 'event'}</span>
                            {needsTaotlus ? 'Vaata taotlusi' : 'Vaata broneeringuid'}
                        </button>
                        <button className="bron-btn bron-btn-secondary" onClick={() => setSubmitted(false)}>Uus broneering</button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedRoom = RUUMID.find(r => r.id === form.ruum_id);
    const startMin = form.kellaaeg;
    const endMin = startMin + form.kestus * 60;
    const fmtMin = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

    return (
        <div className="bron-page" style={{ maxWidth: 780 }}>
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Otsi ruumi', to: '/otsi-ruumi' },
                { label: needsTaotlus ? 'Uus taotlus' : 'Uus broneering' }
            ]} />
            <div className="bron-page-header">
                <div>
                    <h1>{needsTaotlus ? 'Esita taotlus' : 'Uus broneering'}</h1>
                    <p>{needsTaotlus ? 'Täida taotlusvorm — haldur kinnitab selle käsitsi.' : 'Broneeri ruum ülikoolihoonetes.'}</p>
                </div>
            </div>

            {prefill.kuupaev && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--tt-purple-100)', borderRadius: 8, padding: '.6rem 1rem', marginBottom: '1rem', fontSize: '.85rem', color: 'var(--tt-purple-500)' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>search</span>
                    Eeltäidetud otsinguparameetritest — kontrolli andmed ja kinnita broneering.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* ── Põhiandmed ── */}
                <div className="bron-card" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                        Ruumi ja aja andmed
                    </h3>
                    <div className="bron-form-grid">
                        <div className="bron-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Ruum *</label>
                            <select value={form.ruum_id} onChange={e => set('ruum_id', e.target.value)} required>
                                <option value="">Vali ruum...</option>
                                {RUUMID.map(r => (
                                    <option key={r.id} value={r.id}>{r.code} — {r.ruumitypp_label}, {r.kohti} kohta, {r.hoone}</option>
                                ))}
                            </select>
                            {selectedRoom && (
                                <span style={{ fontSize: '.75rem', color: 'var(--tt-text-muted)' }}>
                                    {selectedRoom.hoone_name} · {selectedRoom.kohti} kohta
                                    {selectedRoom.arvutikohti > 0 && ` · ${selectedRoom.arvutikohti} arvutit`}
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

                    {needsTaotlus && (
                        <>
                            <div className="bron-form-group" style={{ marginTop: '1rem' }}>
                                <label>Põhjendus / sündmuse kirjeldus *</label>
                                <textarea rows={3} value={form.pohjendus}
                                    onChange={e => set('pohjendus', e.target.value)}
                                    placeholder="Kirjelda üritust või kasutuse eesmärki..."
                                    required style={{ resize: 'vertical' }} />
                            </div>
                            {isUni && selectedRuumitypp && (
                                <div style={{ marginTop: '.75rem', display: 'flex', alignItems: 'flex-start', gap: '.5rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '.6rem .8rem', fontSize: '.82rem', color: '#92400e' }}>
                                    <span className="material-icons" style={{ fontSize: '1rem', marginTop: '1px' }}>info</span>
                                    <span>See ruumitüüp nõuab halduri kinnitust. Sinu taotlus jõustub broneeringuna pärast ruumihalduri heakskiitu.</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Korduvus ── */}
                <div className="bron-card" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>repeat</span>
                        Korduvus
                    </h3>

                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {KORDUV_TYYP.map(t => (
                            <button key={t.value} type="button"
                                className={`bron-btn bron-btn-sm ${form.korduvus === t.value ? 'bron-btn-primary' : 'bron-btn-secondary'}`}
                                onClick={() => set('korduvus', t.value)}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {isRecurring && (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {/* Lõpp: arvu või kuupäeva järgi */}
                            <div className="bron-form-group" style={{ minWidth: 160 }}>
                                <label>Lõppeb</label>
                                <select value={form.korduvus_lopp_tyyp} onChange={e => set('korduvus_lopp_tyyp', e.target.value)}>
                                    <option value="count">Pärast N kordust</option>
                                    <option value="date">Kuni kuupäev</option>
                                </select>
                            </div>
                            {form.korduvus_lopp_tyyp === 'count' ? (
                                <div className="bron-form-group" style={{ minWidth: 120 }}>
                                    <label>Korduste arv</label>
                                    <input type="number" min="2" max="52" value={form.korduvus_arv}
                                        onChange={e => set('korduvus_arv', e.target.value)} />
                                </div>
                            ) : (
                                <div className="bron-form-group" style={{ minWidth: 160 }}>
                                    <label>Lõppkuupäev</label>
                                    <input type="date" value={form.korduvus_lopp} min={form.kuupaev} max="2027-12-31"
                                        onChange={e => set('korduvus_lopp', e.target.value)} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    <div style={{ background: 'var(--tt-purple-100)', borderRadius: 6, padding: '1rem' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--tt-purple-500)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            {needsTaotlus
                            ? isRecurring ? `Esitatakse ${occurrences.length} taotlust` : 'Esitatakse 1 taotlus'
                            : isRecurring ? `Luuakse ${occurrences.length} broneeringut` : 'Luuakse 1 broneering'
                        } · {fmtMin(startMin)}–{fmtMin(endMin)}
                        </div>
                        <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                            {occurrences.slice(0, 20).map((d, i) => (
                                <span key={d} className="bron-badge bron-badge--neutral" style={{ fontSize: '.72rem' }}>
                                    {fmtDate(d)}
                                </span>
                            ))}
                            {occurrences.length > 20 && (
                                <span className="bron-badge bron-badge--neutral" style={{ fontSize: '.72rem' }}>
                                    +{occurrences.length - 20} veel
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '.75rem' }}>
                    <button type="submit" className="bron-btn bron-btn-primary">
                        <span className="material-icons" style={{ fontSize: '1rem' }}>
                            {needsTaotlus ? 'send' : 'check'}
                        </span>
                        {needsTaotlus
                            ? isRecurring ? `Esita ${occurrences.length} taotlust` : 'Esita taotlus'
                            : isRecurring ? `Kinnita ${occurrences.length} broneeringut` : 'Kinnita broneering'
                        }
                    </button>
                    <button type="button" className="bron-btn bron-btn-secondary" onClick={() => navigate(-1)}>
                        Katkesta
                    </button>
                </div>
            </form>
        </div>
    );
}
