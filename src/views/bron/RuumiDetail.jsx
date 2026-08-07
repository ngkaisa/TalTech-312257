import { Badge, StatusTag, TTNewButton } from '@TalTech-IT/styleguide';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getRoomAvailability,
    getRoomFeedback,
    getRoomScheduleWithContacts,
} from '../../BronBookingsService';
import { BRONEERINGUD, BRONEERINGU_STAATUS, RUUMID } from '../../BronStatisticsService';
import BronBreadcrumbs from '../../components/bron/BronBreadcrumbs';
import { RuumiGalerii } from '../../components/bron/RuumiGalerii';
import { useRole } from '../../context/RoleContext';

function fmt(iso) {
    return new Date(iso).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StarRating({ value, onChange, label }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
            <span style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                {label}
            </span>
            <div style={{ display: 'flex', gap: '.1rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange && onChange(star)}
                        style={{
                            background: 'none', border: 'none',
                            cursor: onChange ? 'pointer' : 'default',
                            color: star <= value ? 'var(--tt-pink-500)' : 'var(--tt-border)',
                            fontSize: '1.25rem', lineHeight: 1, padding: '0 .05rem',
                        }}
                        aria-label={`${star} täht`}
                    >★</button>
                ))}
            </div>
        </div>
    );
}

function TagasisideVorm({ ruumCode }) {
    const [form, setForm] = useState({ temperatuur: 0, puhtus: 0, ohk: 0, varustus: 0, kommentaar: '' });
    const [submitted, setSubmitted] = useState(false);

    if (submitted) {
        return (
            <div style={{ background: '#d1fae5', borderRadius: 8, padding: '.75rem 1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✓</span>
                <span style={{ fontSize: '.88rem', color: '#065f46', fontWeight: 600 }}>
                    Täname! Sinu tagasiside ruumile {ruumCode} on salvestatud.
                </span>
            </div>
        );
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.temperatuur || !form.puhtus || !form.ohk || !form.varustus) {
            alert('Palun hinda kõiki kategooriaid tärnikestega.');
            return;
        }
        setSubmitted(true);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                {[
                    { key: 'temperatuur', label: 'Temperatuur' },
                    { key: 'puhtus',      label: 'Puhtus' },
                    { key: 'ohk',         label: 'Õhk / lõhnad' },
                    { key: 'varustus',    label: 'Varustus' },
                ].map(({ key, label }) => (
                    <StarRating
                        key={key}
                        value={form[key]}
                        label={label}
                        onChange={v => setForm(f => ({ ...f, [key]: v }))}
                    />
                ))}
            </div>
            <div className="bron-form-group" style={{ marginBottom: '.75rem' }}>
                <label style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Kommentaar (valikuline)
                </label>
                <textarea
                    rows={2}
                    style={{ resize: 'vertical' }}
                    placeholder="Kirjelda probleemi või kiida ruumi..."
                    value={form.kommentaar}
                    onChange={e => setForm(f => ({ ...f, kommentaar: e.target.value }))}
                />
            </div>
            <TTNewButton type="submit" variant="primary" size="sm">Saada tagasiside</TTNewButton>
        </form>
    );
}

function TagasisideRida({ fb }) {
    const avg = ((fb.temperatuur + fb.puhtus + fb.ohk + fb.varustus) / 4).toFixed(1);
    const avgN = parseFloat(avg);
    const avgColor = avgN >= 4 ? 'var(--bs-success)' : avgN >= 3 ? '#d97706' : 'var(--bs-danger)';
    return (
        <div style={{ padding: '.75rem 0', borderBottom: '1px solid var(--tt-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{fb.kasutaja}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--tt-text-muted)' }}>{fb.kuupaev}</span>
                    <span style={{ fontWeight: 700, color: avgColor }}>⌀ {avg}</span>
                </span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: fb.kommentaar ? '.35rem' : 0 }}>
                <StarRating value={fb.temperatuur} label="Temperatuur" />
                <StarRating value={fb.puhtus}      label="Puhtus" />
                <StarRating value={fb.ohk}         label="Õhk / lõhnad" />
                <StarRating value={fb.varustus}    label="Varustus" />
            </div>
            {fb.kommentaar && (
                <p style={{ margin: '.25rem 0 0', fontSize: '.82rem', color: 'var(--tt-text-muted)', fontStyle: 'italic' }}>
                    „{fb.kommentaar}"
                </p>
            )}
        </div>
    );
}

const NOW_DISPLAY = new Date('2026-08-06T10:30:00');

export default function RuumiDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, canSeeFullStatistics } = useRole();

    const room = RUUMID.find(r => r.id === id);
    if (!room) return <div className="bron-page"><h1>Ruum ei leitud</h1></div>;

    const avail    = getRoomAvailability(id);
    const schedule = canSeeFullStatistics ? getRoomScheduleWithContacts(id) : [];
    const feedback = getRoomFeedback(id);
    const recent   = BRONEERINGUD
        .filter(b => b.ruum_id === id && b.staatus === BRONEERINGU_STAATUS.LOPPENUD)
        .slice(0, 8);

    const feedbackAvg = feedback.length
        ? (feedback.reduce((s, f) => s + (f.temperatuur + f.puhtus + f.ohk + f.varustus) / 4, 0) / feedback.length).toFixed(1)
        : null;

    return (
        <div className="bron-page">
            <BronBreadcrumbs items={[
                { label: 'Avaleht', to: '/' },
                { label: 'Otsi ruumi', to: '/otsi-ruumi' },
                { label: room.code },
            ]} />

            {/* ── Päis ── */}
            <div className="bron-page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.4rem' }}>
                        <h1 style={{ margin: 0 }}>{room.code}</h1>
                        {/* §1.1.1 — ghost booking (taotlus menetlusel) kuvatakse warning-ina */}
                        <StatusTag type={avail.taotlus_menetlusel ? 'warning' : avail.vaba ? 'success' : 'danger'}>
                            {avail.hetkel_vaba_tekst}
                        </StatusTag>
                    </div>
                    <p style={{ margin: 0, color: 'var(--tt-text-muted)' }}>{room.ruumitypp_label} · {room.hoone_name}</p>
                </div>
                <TTNewButton variant="primary" onClick={() => navigate(`/broneeri/${room.id}`)}>
                    Broneeri see ruum
                </TTNewButton>
            </div>

            <RuumiGalerii ruumitypp={room.ruumitypp} alt={room.code} />

            {/* ── KPI-d ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Mahutavus', value: `${room.kohti} kohta` },
                    { label: 'Arvutikohti', value: room.arvutikohti > 0 ? `${room.arvutikohti} tk` : '—' },
                    { label: 'Hoone', value: room.hoone },
                    { label: 'Korrus', value: room.korrus },
                    ...(feedbackAvg ? [{ label: 'Kasutajad hindavad', value: `★ ${feedbackAvg}`, sub: `${feedback.length} hinnangut` }] : []),
                ].map(({ label, value, sub }) => (
                    <div key={label} className="bron-kpi">
                        <div className="bron-kpi__value" style={{ fontSize: '1.4rem' }}>{value}</div>
                        <div className="bron-kpi__label">{label}</div>
                        {sub && <div style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)' }}>{sub}</div>}
                    </div>
                ))}
            </div>

            {/* ── Tänane graafik koos kontaktidega (super / haldur) ── */}
            {canSeeFullStatistics && (
                <div className="bron-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>contact_phone</span>
                        Graafik ja broneerijate kontaktid (täna + homme)
                    </h3>
                    {schedule.length === 0 ? (
                        <p style={{ color: 'var(--tt-text-muted)', margin: 0 }}>Järgmise 2 päeva jooksul broneeringuid pole.</p>
                    ) : (
                        <div className="bron-table-wrap">
                            <table className="table table-hover" style={{ fontSize: '.875rem' }}>
                                <thead>
                                    <tr>
                                        <th>Päev</th><th>Aeg</th><th>Sündmus</th>
                                        <th>Broneerija</th><th>E-post</th><th>Telefon</th><th>Organisatsioon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map(b => {
                                        const isNow = new Date(b.algus) <= NOW_DISPLAY && new Date(b.lopp) > NOW_DISPLAY;
                                        const isTunniplaan = b.allikas === 'tunniplaan';
                                        const rowBg = isTunniplaan ? '#fef3c7' : isNow ? 'var(--tt-purple-100)' : undefined;
                                        return (
                                            <tr key={b.id} style={rowBg ? { background: rowBg } : {}}>
                                                <td>{b.paev}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{b.algus_fmt}–{b.lopp_fmt}</td>
                                                <td>
                                                    {b.syndmus_label}
                                                    {isTunniplaan && (
                                                        <Badge color="purple" size="sm" style={{ marginLeft: '.4rem' }}>Tunniplaan</Badge>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: isNow ? 700 : 400 }}>
                                                    {isTunniplaan ? (
                                                        <span style={{ color: 'var(--tt-text-muted)', fontStyle: 'italic', fontSize: '.85rem' }}>
                                                            Tunniplaan (ülimuslik)
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {b.broneerija_nimi}
                                                            {isNow && <Badge color="pink" size="sm" style={{ marginLeft: '.4rem' }}>praegu ruumis</Badge>}
                                                        </>
                                                    )}
                                                </td>
                                                <td>
                                                    {!isTunniplaan && (
                                                        <a href={`mailto:${b.broneerija_email}`} style={{ color: 'var(--tt-purple-500)' }}>
                                                            {b.broneerija_email}
                                                        </a>
                                                    )}
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    {!isTunniplaan && (
                                                        <a href={`tel:${b.broneerija_telefon}`} style={{ color: 'var(--tt-purple-500)' }}>
                                                            {b.broneerija_telefon}
                                                        </a>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '.78rem', color: 'var(--tt-text-muted)' }}>
                                                    {isTunniplaan ? '—' : b.broneerija_org}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tagasiside ── */}
            <div className="bron-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span className="material-icons" style={{ fontSize: '1.1rem' }}>star_rate</span>
                    Kasutajate tagasiside
                    {feedbackAvg && (
                        <span style={{ fontWeight: 400, fontSize: '.875rem', color: 'var(--tt-text-muted)' }}>
                            — ⌀ {feedbackAvg} · {feedback.length} hinnangut
                        </span>
                    )}
                </h3>

                {/* Tagasiside saatmisvorm kõigile sisselogitud kasutajatele */}
                {isLoggedIn && (
                    <div style={{ background: 'var(--tt-purple-100)', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
                        <p style={{ margin: '0 0 .75rem', fontSize: '.85rem', fontWeight: 600, color: 'var(--tt-purple-600)' }}>
                            Anna hinnang ruumile {room.code}
                        </p>
                        <TagasisideVorm ruumCode={room.code} />
                    </div>
                )}

                {/* Super/haldur näeb kõiki hinnanguid nimedega */}
                {canSeeFullStatistics ? (
                    feedback.length === 0
                        ? <p style={{ color: 'var(--tt-text-muted)', margin: 0 }}>Tagasisidet pole veel antud.</p>
                        : feedback.map(fb => <TagasisideRida key={fb.id} fb={fb} />)
                ) : (
                    /* Teistele kasutajatele: anonüümsed keskmised */
                    feedback.length > 0 && (
                        <div>
                            <p style={{ fontSize: '.82rem', color: 'var(--tt-text-muted)', margin: '0 0 .75rem' }}>
                                Põhineb {feedback.length} kasutaja hinnangul:
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                {[
                                    { key: 'temperatuur', label: 'Temperatuur' },
                                    { key: 'puhtus',      label: 'Puhtus' },
                                    { key: 'ohk',         label: 'Õhk / lõhnad' },
                                    { key: 'varustus',    label: 'Varustus' },
                                ].map(({ key, label }) => {
                                    const avg = feedback.reduce((s, f) => s + f[key], 0) / feedback.length;
                                    return (
                                        <StarRating
                                            key={key}
                                            value={Math.round(avg)}
                                            label={`${label} (⌀ ${avg.toFixed(1)})`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* ── Viimased broneeringud (ajalugu) ── */}
            <div className="bron-card">
                <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                    Viimased broneeringud
                </h3>
                {recent.length === 0
                    ? <p style={{ color: 'var(--tt-text-muted)', margin: 0 }}>Broneeringuid ei leitud.</p>
                    : (
                        <div className="bron-table-wrap">
                            <table className="table table-hover" style={{ fontSize: '.875rem' }}>
                                <thead>
                                    <tr><th>Algus</th><th>Lõpp</th><th>Sündmus</th><th>Kestus</th></tr>
                                </thead>
                                <tbody>
                                    {recent.map(b => (
                                        <tr key={b.id}>
                                            <td>{fmt(b.algus)}</td>
                                            <td>{fmt(b.lopp)}</td>
                                            <td>{b.syndmus_label}</td>
                                            <td>{b.kestus_h} h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>
        </div>
    );
}
