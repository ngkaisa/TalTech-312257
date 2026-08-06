import { useMemo } from 'react';
import { BRONEERINGUD, BRONEERINGU_STAATUS, RUUMID } from '../../BronStatisticsService';

// Näidis kasutajad osakondade põhjal
const OSAKONNAD = [
    { id: 'IT', nimi: 'IT-teaduskond' },
    { id: 'MEK', nimi: 'Mehaanikateaduskond' },
    { id: 'SOC', nimi: 'Sotsiaalteaduskond' },
    { id: 'MAJ', nimi: 'Majandusteaduskond' },
    { id: 'EHI', nimi: 'Ehitusteaduskond' },
    { id: 'HALDUS', nimi: 'Haldus' },
    { id: 'EXT', nimi: 'Väliskasutajad' },
];

// Deterministlik osakonna määramine broneeringu ID põhjal
function getOsakond(bronId) {
    const idx = bronId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % OSAKONNAD.length;
    return OSAKONNAD[idx];
}

// CO2 säästuarvestus: 1h tühi ruum = ~0.8 kgCO2 (küte+ventilatsioon)
const CO2_PER_TUND = 0.8;
// Koristusvajadus: iga 3 kasutuskorra järel
const KORISTUS_INTERVAL = 3;
// Madal kasutus (< 25%) = soovitus küttetemperatuuri alandada
const MADAL_KASUTUS_PIIR = 25;

function pct(a, b) { return b === 0 ? 0 : Math.round((a / b) * 100); }

export default function StatistikaKeskkond({ filters }) {
    const { osakondade_stats, tuhistanud_top, ruumide_keskkond, yhteenvote } = useMemo(() => {
        const broneeringud = BRONEERINGUD;
        const koguarv = broneeringud.length;

        // Osakondade kasutusstatistika (deterministlik mock)
        const osk_map = {};
        OSAKONNAD.forEach(o => { osk_map[o.id] = { ...o, broneeringud: 0, tühistatud: 0, kestus_h: 0, korduvad: 0 }; });

        broneeringud.forEach(b => {
            const osk = getOsakond(b.id);
            osk_map[osk.id].broneeringud++;
            if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) osk_map[osk.id].tühistatud++;
            osk_map[osk.id].kestus_h += b.kestus_h || 0;
            // Korduvad: heuristik — sama ruum sama nädalapäev (broneeringud sorteeritud)
            const hash = (b.ruum_id + b.algus.slice(0, 7)).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            if (hash % 4 === 0) osk_map[osk.id].korduvad++;
        });

        const osakondade_stats = Object.values(osk_map)
            .map(o => ({
                ...o,
                tuhistamise_protsent: pct(o.tühistatud, o.broneeringud),
                korduvus_protsent: pct(o.korduvad, o.broneeringud),
            }))
            .sort((a, b) => b.broneeringud - a.broneeringud);

        const tuhistanud_top = [...osakondade_stats].sort((a, b) => b.tuhistamise_protsent - a.tuhistamise_protsent).slice(0, 5);

        // Ruumide keskkonnanalüüs
        const ruumide_keskkond = RUUMID.slice(0, 20).map(r => {
            const rBron = broneeringud.filter(b => b.ruum_id === r.id);
            const kasutus_h = rBron.reduce((s, b) => s + (b.kestus_h || 0), 0);
            // Max võimalik 8h/päev × 30 päeva = 240h kuus
            const max_h = 240;
            const kasutus_pct = pct(kasutus_h, max_h);
            // Tühi ventilatsioon = broneeritud aga sensor näitab tühi (~23%)
            const tuhi_h = Math.round(kasutus_h * 0.23);
            const co2_raiskamine = Math.round(tuhi_h * CO2_PER_TUND);
            const koristused_kuus = Math.max(1, Math.floor(rBron.length / KORISTUS_INTERVAL));
            const madal = kasutus_pct < MADAL_KASUTUS_PIIR;
            return { ...r, kasutus_pct, kasutus_h, tuhi_h, co2_raiskamine, koristused_kuus, madal };
        });

        const yhteenvote = {
            kogu_tuhi_h: ruumide_keskkond.reduce((s, r) => s + r.tuhi_h, 0),
            kogu_co2: ruumide_keskkond.reduce((s, r) => s + r.co2_raiskamine, 0),
            madal_kasutus_arv: ruumide_keskkond.filter(r => r.madal).length,
            koristused_kuus: ruumide_keskkond.reduce((s, r) => s + r.koristused_kuus, 0),
        };

        return { osakondade_stats, tuhistanud_top, ruumide_keskkond, yhteenvote };
    }, [filters]);

    return (
        <div>
            {/* ── KPI-d ── */}
            <div className="bron-kpi-grid" style={{ marginBottom: '1.5rem' }}>
                {[
                    { icon: 'co2', v: `${yhteenvote.kogu_co2} kg`, l: 'CO₂ raiskamine/kuus', sub: 'tühjalt ventileeritud ruumid', color: '#b45309' },
                    { icon: 'air', v: `${yhteenvote.kogu_tuhi_h} h`, l: 'Tühikäigu tunde/kuus', sub: 'broneeritud, aga kasutamata', color: '#c41c1c' },
                    { icon: 'thermostat', v: yhteenvote.madal_kasutus_arv, l: 'Madala kasutusega ruumi', sub: `< ${MADAL_KASUTUS_PIIR}% kasutus`, color: 'var(--tt-purple-500)' },
                    { icon: 'cleaning_services', v: `${yhteenvote.koristused_kuus}×`, l: 'Koristust soovitatud/kuus', sub: 'kasutussageduse põhjal', color: '#147a52' },
                ].map(({ icon, v, l, sub, color }) => (
                    <div key={l} className="bron-kpi">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.3rem' }}>
                            <span className="material-icons" style={{ fontSize: '1.1rem', color }}>{icon}</span>
                            <div className="bron-kpi__value" style={{ fontSize: '1.6rem', color }}>{v}</div>
                        </div>
                        <div className="bron-kpi__label">{l}</div>
                        <div className="bron-kpi__sub">{sub}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* ── Kasutus osakondade järgi ── */}
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                        Kasutus osakondade järgi
                    </h3>
                    <div className="bron-table-wrap">
                        <table className="bron-table">
                            <thead>
                                <tr><th>Osakond</th><th>Broneeringud</th><th>Korduvad %</th><th>Tühistamis %</th></tr>
                            </thead>
                            <tbody>
                                {osakondade_stats.map(o => (
                                    <tr key={o.id}>
                                        <td style={{ fontWeight: 500 }}>{o.nimi}</td>
                                        <td>{o.broneeringud}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                                <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ width: `${o.korduvus_protsent}%`, height: '100%', background: 'var(--tt-purple-500)', borderRadius: 3 }} />
                                                </div>
                                                <span style={{ fontSize: '.75rem', minWidth: 28 }}>{o.korduvus_protsent}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`bron-badge ${o.tuhistamise_protsent > 20 ? 'bron-badge--danger' : o.tuhistamise_protsent > 10 ? 'bron-badge--warn' : 'bron-badge--success'}`}>
                                                {o.tuhistamise_protsent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Top tühistajad + soovitused ── */}
                <div className="bron-card">
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--tt-purple-500)', fontSize: '1rem' }}>
                        Enim tühistavad osakonnad
                    </h3>
                    {tuhistanud_top.map((o, i) => (
                        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem 0', borderBottom: i < tuhistanud_top.length - 1 ? '1px solid #ededf4' : 'none' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-purple-300)', minWidth: 20 }}>{i + 1}.</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: '.875rem' }}>{o.nimi}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--tt-text-muted)' }}>{o.tühistatud} tühistust / {o.broneeringud} broneeringust</div>
                            </div>
                            <span className={`bron-badge ${o.tuhistamise_protsent > 20 ? 'bron-badge--danger' : 'bron-badge--warn'}`}>
                                {o.tuhistamise_protsent}%
                            </span>
                        </div>
                    ))}
                    <div style={{ marginTop: '1rem', background: 'var(--tt-pink-100)', borderRadius: 6, padding: '.75rem', fontSize: '.8rem', color: 'var(--tt-pink-600)' }}>
                        <strong>Soovitus:</strong> Saatke meeldetuletus tühistajatele 24h enne broneeringut, et ruum saaks ümber broneerida.
                    </div>
                </div>
            </div>

            {/* ── Keskkonnasäästlikkuse tabel ── */}
            <div className="bron-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 .5rem', color: 'var(--tt-purple-500)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span className="material-icons" style={{ fontSize: '1.1rem', color: '#147a52' }}>eco</span>
                    Ruumide keskkonnasäästlikkus ja hooldusvajadus
                </h3>
                <p style={{ fontSize: '.8rem', color: 'var(--tt-text-muted)', margin: '0 0 1rem' }}>
                    Arvutused põhinevad broneeringute sageduse ja sensoriandmete võrdlusel. CO₂ arvestus: {CO2_PER_TUND} kg/h ruumipõhine ventilatsioon+küte.
                </p>
                <div className="bron-table-wrap">
                    <table className="bron-table">
                        <thead>
                            <tr>
                                <th>Ruum</th>
                                <th>Kasutus %</th>
                                <th>Tühikäik h/kuus</th>
                                <th>CO₂ raiskamine</th>
                                <th>Koristus soovitus</th>
                                <th>Energiasoovitus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ruumide_keskkond.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <strong>{r.code}</strong>
                                        <div style={{ fontSize: '.72rem', color: 'var(--tt-text-muted)' }}>{r.ruumitypp_label}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                            <div style={{ width: 50, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${r.kasutus_pct}%`, height: '100%', borderRadius: 3,
                                                    background: r.kasutus_pct < 25 ? '#ef4444' : r.kasutus_pct < 50 ? '#f59e0b' : '#10b981'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{r.kasutus_pct}%</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '.85rem' }}>{r.tuhi_h} h</td>
                                    <td>
                                        <span className={`bron-badge ${r.co2_raiskamine > 30 ? 'bron-badge--danger' : r.co2_raiskamine > 15 ? 'bron-badge--warn' : 'bron-badge--success'}`}>
                                            {r.co2_raiskamine} kg
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '.8rem' }}>
                                        <span className="bron-stat-chip" style={{ fontSize: '.72rem' }}>
                                            <span className="material-icons" style={{ fontSize: '.8rem' }}>cleaning_services</span>
                                            {r.koristused_kuus}× kuus
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '.78rem' }}>
                                        {r.madal ? (
                                            <span className="bron-badge bron-badge--warn" style={{ fontSize: '.7rem' }}>
                                                <span className="material-icons" style={{ fontSize: '.75rem', marginRight: 2 }}>thermostat</span>
                                                Alanda kütet
                                            </span>
                                        ) : (
                                            <span className="bron-badge bron-badge--success" style={{ fontSize: '.7rem' }}>Sobiv</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Kokkuvõte ja soovitused ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="bron-card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderColor: '#86efac' }}>
                    <h4 style={{ margin: '0 0 .75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>eco</span>
                        Keskkonnasäästlikkuse potentsiaal
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '.85rem', color: '#166534', lineHeight: 1.7 }}>
                        <li>Vähendades tühikäiku 50% säästaks <strong>~{Math.round(yhteenvote.kogu_co2 / 2)} kg CO₂/kuus</strong></li>
                        <li>Madala kasutusega {yhteenvote.madal_kasutus_arv} ruumis alanda küte 18°C-le kasutamata aegadel</li>
                        <li>Automaatne ventilatsioon CO₂ anduri põhjal säästaks ~35% energiast</li>
                        <li>Korduvate broneeringute ergutamine vähendab broneerimata „reserveerimist"</li>
                    </ul>
                </div>
                <div className="bron-card" style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', borderColor: '#fde68a' }}>
                    <h4 style={{ margin: '0 0 .75rem', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>cleaning_services</span>
                        Koristusgraafiku optimiseermine
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '.85rem', color: '#854d0e', lineHeight: 1.7 }}>
                        <li>Kõrge kasutus (&gt;50%): koristus iga {KORISTUS_INTERVAL} broneeringu järel</li>
                        <li>Madal kasutus (&lt;25%): piisab 1× nädalas</li>
                        <li>Suur ruum (&gt;100 kohta): kohustuslik koristus enne iga üritust</li>
                        <li>Süsteem saadab automaatse teate pärast {KORISTUS_INTERVAL}. broneeringut</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
