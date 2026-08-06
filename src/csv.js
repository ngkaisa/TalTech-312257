/**
 * CSV eksport util — brauseris laadib alla CSV-faili.
 *
 * @param {string} filename — soovitatav failinimi (ilma laienduseta)
 * @param {Array<Record<string, any>>} rows — andmeread
 * @param {Array<{ key: string, label: string, format?: (v: any, row: any) => string }>} columns
 */
export function downloadCsv(filename, rows, columns) {
    const header = columns.map((c) => escapeCell(c.label)).join(',');
    const body = rows
        .map((row) =>
            columns
                .map((c) => {
                    const raw = c.format ? c.format(row[c.key], row) : row[c.key];
                    return escapeCell(raw);
                })
                .join(',')
        )
        .join('\n');

    // BOM tagab Exceli õige et_EE dekodeeringu
    const csv = '\ufeff' + header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCell(v) {
    if (v == null) return '';
    const s = String(v);
    // Kui sisu sisaldab jutumärki, koma või reavahetust — pane jutumärkidesse ja escape
    if (/["\n,;]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}
