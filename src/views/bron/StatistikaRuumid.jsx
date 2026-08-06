import { useNavigate } from 'react-router-dom';
import { getRuumideSummary } from '../../BronStatisticsService';
import { downloadCsv } from '../../csv';

function pct(v) { return (+v).toFixed(1) + '%'; }

export default function StatistikaRuumid({ filters = {} }) {
    const navigate = useNavigate();
    const rooms = getRuumideSummary(filters);

    function exportCsv() {
        downloadCsv('BRON-ruumid', rooms, [
            { key: 'code', label: 'Ruum' },
            { key: 'ruumitypp_label', label: 'Tüüp' },
            { key: 'hoone', label: 'Hoone' },
            { key: 'kohti', label: 'Kohti' },
            { key: 'broneeringute_arv', label: 'Broneeringuid' },
            { key: 'broneeritud_pct', label: 'Broneeritud %', format: v => pct(v) },
            { key: 'tegelik_pct', label: 'Tegelik %', format: v => pct(v) },
        ]);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '.75rem' }}>
                <button className="bron-btn bron-btn-secondary bron-btn-sm" onClick={exportCsv}>⬇ Ekspordi CSV</button>
            </div>
            <div className="bron-table-wrap">
                <table className="bron-table">
                    <thead>
                        <tr>
                            <th>Ruum</th><th>Tüüp</th><th>Hoone</th><th>Kohti</th>
                            <th>Broneeringuid</th><th>Broneeritud %</th><th>Tegelik %</th><th>Tühistamisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map(r => (
                            <tr key={r.id} onClick={() => navigate(`/statistika/ruumid/${r.id}`)}
                                style={{ cursor: 'pointer' }}>
                                <td><strong>{r.code}</strong></td>
                                <td>{r.ruumitypp_label}</td>
                                <td>{r.hoone}</td>
                                <td>{r.kohti}</td>
                                <td>{r.broneeringute_arv}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                                            <div style={{ width: pct(r.broneeritud_pct), height: '100%', background: '#251d47', borderRadius: 3 }} />
                                        </div>
                                        <span style={{ fontSize: '.8rem', whiteSpace: 'nowrap' }}>{pct(r.broneeritud_pct)}</span>
                                    </div>
                                </td>
                                <td>{pct(r.tegelik_pct)}</td>
                                <td>{r.tuhistatud_arv}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
