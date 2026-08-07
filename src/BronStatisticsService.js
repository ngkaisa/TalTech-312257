/**
 * BRON statistika mock andmeteenus.
 *
 * Genereerib deterministlikke näidisandmeid:
 *   - Hooned (TalTech Mustamäe kampuse tüüpi koodid)
 *   - Ruumid (Lisa 13 ruumitüübid: aula, üldkasutatav auditoorium, õpiruum jne)
 *   - Broneeringud viimase 42 päeva jooksul (staatus: aktiivne, lõppenud, tühistatud, ghost-taotlus)
 *   - Anduri lugemid (broneeringu ajaperioodil kasutuses / tühjalt)
 *
 * Valemid vastavalt proovika Lisa 13-le:
 *   - Broneeritud kasutus %  = broneeritud tunnid / avatud tunnid
 *   - Tegelik kasutus %      = anduri poolt tuvastatud kasutuse tunnid / avatud tunnid
 *   - Kasutamata broneering % = (broneeritud - tegelik) / broneeritud
 *
 * Broneeringu tühistamise "kui kaua enne algust" arvutatakse mock andmena
 * juba genereerimise ajal.
 */

// -----------------------------------------------------------------------------
// Konstandid — vastavad Lisa 13 loeteludele
// -----------------------------------------------------------------------------

export const RUUMITYYBID = [
    { code: 'aula', label: 'Aula' },
    { code: 'eriotstarbeline_auditoorium', label: 'Eriotstarbeline auditoorium' },
    { code: 'uldkasutatav_auditoorium', label: 'Üldkasutatav auditoorium' },
    { code: 'opiruum', label: 'Õpiruum' },
    { code: 'teaduslabor', label: 'Teaduslabor' },
    { code: 'saun', label: 'Saun' },
    { code: 'arvutiklass', label: 'Arvutiklass' },
    { code: 'oppelabor', label: 'Õppelabor' },
    { code: 'labor', label: 'Labor' },
    { code: 'seminariruum', label: 'Seminariruum' },
    { code: 'spordiruum', label: 'Spordiruum' },
    { code: 'tookoda', label: 'Töökoda' }
];

export const SYNDMUSETYYBID = [
    { code: 'eksam', label: 'Eksam / arvestus' },
    { code: 'konsultatsioon', label: 'Konsultatsioon' },
    { code: 'oppe_teadus', label: 'Õppe- ja teadustöö' },
    { code: 'iseseisev', label: 'Iseseisev õppetöö' },
    { code: 'hooldus', label: 'Hooldus' },
    { code: 'muu', label: 'Muu' },
    { code: 'eelnadal', label: 'Eelnädal' },
    { code: 'rent', label: 'Rent' }
];

export const BRONEERINGU_STAATUS = {
    AKTIIVNE: 'aktiivne',
    LOPPENUD: 'lõppenud',
    TUHISTATUD: 'tühistatud',
    GHOST: 'taotlus',
    TUNNIPLAAN: 'tunniplaan',  // Tunniplaanist imporditud, ülimuslik
};

// -----------------------------------------------------------------------------
// Deterministlik PRNG — samad "juhuslikud" andmed iga käivitusel
// -----------------------------------------------------------------------------

/** Mulberry32 seed-põhine PRNG. */
function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) | 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick(rng, list) {
    return list[Math.floor(rng() * list.length)];
}

function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

// -----------------------------------------------------------------------------
// Hooned + ruumid
// -----------------------------------------------------------------------------

export const HOONED = [
    { code: 'U01', name: 'U01 — Peahoone', address: 'Ehitajate tee 5' },
    { code: 'U02', name: 'U02 — Auditooriumid', address: 'Ehitajate tee 5' },
    { code: 'U04', name: 'U04 — Loodusteadused', address: 'Akadeemia tee 15' },
    { code: 'U06', name: 'U06 — Energeetika', address: 'Ehitajate tee 5' },
    { code: 'ICT', name: 'ICT — Infotehnoloogia maja', address: 'Akadeemia tee 15A' },
    { code: 'SOC', name: 'SOC — Sotsiaalteadused', address: 'Akadeemia tee 3' },
    { code: 'MEK', name: 'MEK — Mektory', address: 'Raja 15' }
];

/** Genereerib ruumid ette antud hoonete arvuga vahemikus 8..24 ruumi hoone kohta. */
function generateRooms() {
    const rng = makeRng(1337);
    const rooms = [];
    let idCounter = 100;

    for (const hoone of HOONED) {
        const roomCount = randomInt(rng, 8, 20);
        for (let i = 0; i < roomCount; i++) {
            const ruumitypp = pick(rng, RUUMITYYBID);
            const floor = randomInt(rng, 0, 5);
            const roomNumber = String(floor * 100 + i + 1).padStart(3, '0');
            const kohti = ruumitypp.code === 'aula' ? randomInt(rng, 200, 500) : ruumitypp.code === 'uldkasutatav_auditoorium' ? randomInt(rng, 60, 180) : ruumitypp.code === 'seminariruum' ? randomInt(rng, 15, 40) : ruumitypp.code === 'arvutiklass' ? randomInt(rng, 20, 32) : ruumitypp.code === 'opiruum' ? randomInt(rng, 6, 20) : randomInt(rng, 10, 30);
            const arvutikohti = ['arvutiklass', 'oppelabor', 'labor', 'teaduslabor'].includes(ruumitypp.code) ? kohti : 0;

            rooms.push({
                id: `R${idCounter++}`,
                code: `${hoone.code}-${roomNumber}`,
                name: `${hoone.code}-${roomNumber}`,
                hoone: hoone.code,
                hoone_name: hoone.name,
                ruumitypp: ruumitypp.code,
                ruumitypp_label: ruumitypp.label,
                kohti,
                arvutikohti,
                korrus: floor
            });
        }
    }

    return rooms;
}

export const RUUMID = generateRooms();

// -----------------------------------------------------------------------------
// Broneeringud + anduri lugemid
// -----------------------------------------------------------------------------

const START_HOUR = 8;
const END_HOUR = 22;
const DAY_LENGTH_HOURS = END_HOUR - START_HOUR;
const HISTORY_DAYS = 42; // ~6 nädalat

const REFERENCE_DATE = new Date('2026-08-01T00:00:00');

function dateOffset(days) {
    const d = new Date(REFERENCE_DATE);
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Genereerib broneeringud. Iga ruumi jaoks:
 *   - Tavaline päev: 30–70% tõenäosusega 1-4 broneeringut
 *   - Aktiivsem ruumitüüp (aula, üldkasutatav aud) saab enam broneeringuid
 *   - Osa broneeringutest on tühistatud, osa ghost (taotlus)
 *   - Iga aktiivne broneering võib olla „tegelikult kasutuses" (andur registreeris)
 *     või tühjaks jäänud
 */
function generateBookings() {
    const rng = makeRng(42);
    const bookings = [];
    let id = 1;

    // Ruumitüübi-põhine kasutuskoefitsient
    const activityFactor = {
        aula: 0.35,
        eriotstarbeline_auditoorium: 0.55,
        uldkasutatav_auditoorium: 0.75,
        opiruum: 0.6,
        teaduslabor: 0.4,
        saun: 0.15,
        arvutiklass: 0.65,
        oppelabor: 0.55,
        labor: 0.5,
        seminariruum: 0.7,
        spordiruum: 0.45,
        tookoda: 0.3
    };

    for (const ruum of RUUMID) {
        const activity = activityFactor[ruum.ruumitypp] ?? 0.5;

        for (let dayOffset = HISTORY_DAYS - 1; dayOffset >= 0; dayOffset--) {
            const dayDate = dateOffset(dayOffset);
            const weekday = dayDate.getDay(); // 0 = pühapäev
            const isWeekend = weekday === 0 || weekday === 6;
            const dayFactor = isWeekend ? 0.2 : 1;

            // Kas selle ruumi jaoks tekib täna broneeringuid?
            if (rng() > activity * dayFactor) {
                continue;
            }

            const bookingCount = randomInt(rng, 1, isWeekend ? 2 : 4);

            // Broneeringute algused ei kattu — jagame päeva
            const slots = [];
            let cursor = START_HOUR + Math.floor(rng() * 2);
            for (let b = 0; b < bookingCount && cursor < END_HOUR - 1; b++) {
                const duration = pick(rng, [1, 1.5, 2, 2, 3]);
                const startHour = cursor;
                const endHour = Math.min(END_HOUR, cursor + duration);
                slots.push({ startHour, endHour });
                cursor = endHour + (rng() < 0.4 ? 0 : randomInt(rng, 1, 2));
            }

            for (const slot of slots) {
                const startDate = new Date(dayDate);
                const startMinutes = Math.round((slot.startHour % 1) * 60);
                startDate.setHours(Math.floor(slot.startHour), startMinutes, 0, 0);
                const endDate = new Date(dayDate);
                const endMinutes = Math.round((slot.endHour % 1) * 60);
                endDate.setHours(Math.floor(slot.endHour), endMinutes, 0, 0);

                const syndmus = pick(rng, SYNDMUSETYYBID);

                // 12% tõenäosust — tühistatud broneering
                const rTuhi = rng();
                let staatus;
                let tuhistatudEnneAlgustMin = null;
                let tuhistajaRoll = null;

                if (rTuhi < 0.12) {
                    staatus = BRONEERINGU_STAATUS.TUHISTATUD;
                    // Tühistamise moment eelnevalt: 5min-72h enne algust
                    tuhistatudEnneAlgustMin = pick(rng, [5, 15, 30, 60, 120, 240, 480, 1440, 2880, 4320]);
                    tuhistajaRoll = pick(rng, ['TUDENG', 'TOOTAJA', 'HALDUR', 'SUPER']);
                } else if (rTuhi < 0.15) {
                    staatus = BRONEERINGU_STAATUS.GHOST;
                } else if (dayOffset === 0 && startDate > new Date()) {
                    staatus = BRONEERINGU_STAATUS.AKTIIVNE;
                } else {
                    staatus = BRONEERINGU_STAATUS.LOPPENUD;
                }

                // Anduri register — kas ruum läks kasutusse
                //   Aktiivsed/lõppenud broneeringud: 78% tõenäosust "tegelikult kasutuses"
                //   Tühistatud/ghost: mitte kunagi kasutuses
                const sensorUsed = staatus === BRONEERINGU_STAATUS.LOPPENUD || staatus === BRONEERINGU_STAATUS.AKTIIVNE ? rng() < 0.78 : false;

                // ~8% tõenäosusega tunniplaan broneering (ülimuslik, ei saa kustutada)
                const isTunniplaan = staatus !== BRONEERINGU_STAATUS.TUHISTATUD
                    && staatus !== BRONEERINGU_STAATUS.GHOST
                    && rng() < 0.08
                    && ['uldkasutatav_auditoorium', 'seminariruum', 'arvutiklass', 'opiruum'].includes(ruum.ruumitypp);

                bookings.push({
                    id: `B${id++}`,
                    ruum_id: ruum.id,
                    ruum_code: ruum.code,
                    hoone: ruum.hoone,
                    ruumitypp: ruum.ruumitypp,
                    algus: startDate.toISOString(),
                    lopp: endDate.toISOString(),
                    kestus_h: slot.endHour - slot.startHour,
                    staatus: isTunniplaan ? BRONEERINGU_STAATUS.TUNNIPLAAN : staatus,
                    syndmus: isTunniplaan ? 'oppe_teadus' : syndmus.code,
                    syndmus_label: isTunniplaan ? 'Õppe- ja teadustöö' : syndmus.label,
                    allikas: isTunniplaan ? 'tunniplaan' : 'bron',
                    kasutaja_roll: isTunniplaan ? 'TUNNIPLAAN' : pick(rng, ['TUDENG', 'TUDENG', 'TOOTAJA', 'TOOTAJA', 'HALDUR', 'SUPER']),
                    tuhistatud_enne_algust_min: isTunniplaan ? null : tuhistatudEnneAlgustMin,
                    tuhistaja_roll: isTunniplaan ? null : tuhistajaRoll,
                    andur_kasutusel: isTunniplaan ? true : sensorUsed
                });
            }
        }
    }

    return bookings;
}

export const BRONEERINGUD = generateBookings();

// -----------------------------------------------------------------------------
// Filter helper
// -----------------------------------------------------------------------------

function filterBookings(filters = {}) {
    return BRONEERINGUD.filter((b) => {
        if (filters.hoone && filters.hoone.length > 0 && !filters.hoone.includes(b.hoone)) return false;
        if (filters.ruumitypp && filters.ruumitypp.length > 0 && !filters.ruumitypp.includes(b.ruumitypp)) return false;
        if (filters.ruum_id && b.ruum_id !== filters.ruum_id) return false;
        if (filters.algus_alates) {
            if (new Date(b.algus) < new Date(filters.algus_alates)) return false;
        }
        if (filters.algus_kuni) {
            if (new Date(b.algus) > new Date(filters.algus_kuni)) return false;
        }
        return true;
    });
}

function filterRooms(filters = {}) {
    return RUUMID.filter((r) => {
        if (filters.hoone && filters.hoone.length > 0 && !filters.hoone.includes(r.hoone)) return false;
        if (filters.ruumitypp && filters.ruumitypp.length > 0 && !filters.ruumitypp.includes(r.ruumitypp)) return false;
        return true;
    });
}

// -----------------------------------------------------------------------------
// Statistika avalikud funktsioonid — Lisa 13 valemid
// -----------------------------------------------------------------------------

/** Vaikimisi periood: viimased 30 päeva. */
export function defaultPeriod() {
    const kuni = new Date(REFERENCE_DATE);
    const alates = new Date(REFERENCE_DATE);
    alates.setDate(alates.getDate() - 29);
    return {
        algus_alates: alates.toISOString().slice(0, 10),
        algus_kuni: kuni.toISOString().slice(0, 10)
    };
}

function periodDays(filters) {
    if (!filters.algus_alates || !filters.algus_kuni) {
        return HISTORY_DAYS;
    }
    const a = new Date(filters.algus_alates);
    const b = new Date(filters.algus_kuni);
    return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * KPI kokkuvõte antud filtri jaoks.
 *
 * @returns {{
 *   broneeritud_pct: number,
 *   tegelik_pct: number,
 *   kasutamata_pct: number,
 *   tuhistatud_arv: number,
 *   broneeringute_arv: number,
 *   ruumide_arv: number,
 *   broneeritud_tunnid: number,
 *   avatud_tunnid: number
 * }}
 */
export function getKpiSummary(filters = {}) {
    const rooms = filterRooms(filters);
    const bookings = filterBookings(filters);
    const days = periodDays(filters);
    const avatudTunnid = rooms.length * days * DAY_LENGTH_HOURS;

    if (avatudTunnid === 0) {
        return {
            broneeritud_pct: 0,
            tegelik_pct: 0,
            kasutamata_pct: 0,
            tuhistatud_arv: 0,
            broneeringute_arv: 0,
            ruumide_arv: rooms.length,
            broneeritud_tunnid: 0,
            avatud_tunnid: 0
        };
    }

    let broneeritudTunnid = 0;
    let tegelikTunnid = 0;
    let tuhistatudArv = 0;
    let broneeringuteArv = 0;

    for (const b of bookings) {
        if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) {
            tuhistatudArv++;
            continue;
        }
        if (b.staatus === BRONEERINGU_STAATUS.GHOST) {
            // ghost = ootel taotlus, ei arvestata broneeringuna
            continue;
        }
        broneeringuteArv++;
        broneeritudTunnid += b.kestus_h;
        if (b.andur_kasutusel) {
            tegelikTunnid += b.kestus_h;
        }
    }

    const broneeritudPct = (broneeritudTunnid / avatudTunnid) * 100;
    const tegelikPct = (tegelikTunnid / avatudTunnid) * 100;
    const kasutamataPct = broneeritudTunnid > 0 ? ((broneeritudTunnid - tegelikTunnid) / broneeritudTunnid) * 100 : 0;

    return {
        broneeritud_pct: Number(broneeritudPct.toFixed(1)),
        tegelik_pct: Number(tegelikPct.toFixed(1)),
        kasutamata_pct: Number(kasutamataPct.toFixed(1)),
        tuhistatud_arv: tuhistatudArv,
        broneeringute_arv: broneeringuteArv,
        ruumide_arv: rooms.length,
        broneeritud_tunnid: Math.round(broneeritudTunnid),
        avatud_tunnid: Math.round(avatudTunnid)
    };
}

/**
 * Ruumide kaupa statistika tabel — üks rida ruumi kohta.
 */
export function getRoomStatistics(filters = {}) {
    const rooms = filterRooms(filters);
    const days = periodDays(filters);
    const bookingsByRoom = new Map();

    for (const b of filterBookings(filters)) {
        if (!bookingsByRoom.has(b.ruum_id)) {
            bookingsByRoom.set(b.ruum_id, []);
        }
        bookingsByRoom.get(b.ruum_id).push(b);
    }

    return rooms.map((room) => {
        const bookings = bookingsByRoom.get(room.id) ?? [];
        const avatudTunnid = days * DAY_LENGTH_HOURS;

        let broneeritudTunnid = 0;
        let tegelikTunnid = 0;
        let tuhistatudArv = 0;

        for (const b of bookings) {
            if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) {
                tuhistatudArv++;
                continue;
            }
            if (b.staatus === BRONEERINGU_STAATUS.GHOST) continue;
            broneeritudTunnid += b.kestus_h;
            if (b.andur_kasutusel) tegelikTunnid += b.kestus_h;
        }

        const broneeritudPct = (broneeritudTunnid / avatudTunnid) * 100;
        const tegelikPct = (tegelikTunnid / avatudTunnid) * 100;
        const kasutamataPct = broneeritudTunnid > 0 ? ((broneeritudTunnid - tegelikTunnid) / broneeritudTunnid) * 100 : 0;

        return {
            ...room,
            broneeritud_pct: Number(broneeritudPct.toFixed(1)),
            tegelik_pct: Number(tegelikPct.toFixed(1)),
            kasutamata_pct: Number(kasutamataPct.toFixed(1)),
            tuhistatud_arv: tuhistatudArv,
            broneeringute_arv: bookings.length
        };
    });
}

/**
 * Ajakäivast trend — päev-päevalt broneeritud vs tegelik vs kasutamata.
 * Kasutatakse stacked bar chartis.
 */
export function getDailyTrend(filters = {}) {
    const rooms = filterRooms(filters);
    const bookings = filterBookings(filters);
    const roomCount = rooms.length;
    const perDay = new Map();

    for (const b of bookings) {
        const dayKey = b.algus.slice(0, 10);
        if (!perDay.has(dayKey)) {
            perDay.set(dayKey, { broneeritud_h: 0, tegelik_h: 0, tuhistatud: 0 });
        }
        const entry = perDay.get(dayKey);
        if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) {
            entry.tuhistatud++;
        } else if (b.staatus !== BRONEERINGU_STAATUS.GHOST) {
            entry.broneeritud_h += b.kestus_h;
            if (b.andur_kasutusel) entry.tegelik_h += b.kestus_h;
        }
    }

    const avatudPäevas = roomCount * DAY_LENGTH_HOURS;
    return [...perDay.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([day, e]) => ({
            date: day,
            broneeritud_pct: avatudPäevas ? Number(((e.broneeritud_h / avatudPäevas) * 100).toFixed(1)) : 0,
            tegelik_pct: avatudPäevas ? Number(((e.tegelik_h / avatudPäevas) * 100).toFixed(1)) : 0,
            kasutamata_pct: avatudPäevas ? Number((((e.broneeritud_h - e.tegelik_h) / avatudPäevas) * 100).toFixed(1)) : 0,
            tuhistatud: e.tuhistatud
        }));
}

/**
 * Nädalapäev × kellaaeg heatmap — mitu broneeringut igas ajaruudus.
 *
 * @returns {{ weekday: number, hour: number, count: number, intensity: number }[]}
 *   weekday: 1..7 (E..P), hour: 8..22, intensity: 0..1 (max normaliseeritud)
 */
export function getHeatmap(filters = {}) {
    const bookings = filterBookings(filters).filter((b) => b.staatus === BRONEERINGU_STAATUS.LOPPENUD || b.staatus === BRONEERINGU_STAATUS.AKTIIVNE);

    const grid = {}; // key: weekday-hour
    for (let d = 1; d <= 7; d++) {
        for (let h = START_HOUR; h < END_HOUR; h++) {
            grid[`${d}-${h}`] = 0;
        }
    }

    for (const b of bookings) {
        const dt = new Date(b.algus);
        const jsDay = dt.getDay(); // 0=Sun..6=Sat
        const weekday = jsDay === 0 ? 7 : jsDay; // 1=Mon..7=Sun
        const startH = dt.getHours();
        const endH = new Date(b.lopp).getHours();
        for (let h = startH; h < endH && h < END_HOUR; h++) {
            if (h >= START_HOUR) {
                grid[`${weekday}-${h}`] = (grid[`${weekday}-${h}`] ?? 0) + 1;
            }
        }
    }

    const values = Object.values(grid);
    const max = Math.max(1, ...values);

    return Object.entries(grid).map(([key, count]) => {
        const [weekday, hour] = key.split('-').map(Number);
        return {
            weekday,
            hour,
            count,
            intensity: Number((count / max).toFixed(3))
        };
    });
}

/**
 * Tühistamiste statistika — nädalapäeva ja tundide kaupa jaotus,
 * viimased tühistamised tabelina.
 */
export function getCancellations(filters = {}) {
    const cancelled = filterBookings(filters).filter((b) => b.staatus === BRONEERINGU_STAATUS.TUHISTATUD);

    // Nädalapäeva kaupa
    const byWeekday = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    // Tundide kaupa
    const byHour = {};
    for (let h = START_HOUR; h < END_HOUR; h++) byHour[h] = 0;

    let totalMin = 0;
    for (const b of cancelled) {
        const dt = new Date(b.algus);
        const jsDay = dt.getDay();
        const weekday = jsDay === 0 ? 7 : jsDay;
        byWeekday[weekday]++;
        const h = dt.getHours();
        if (h >= START_HOUR && h < END_HOUR) byHour[h]++;
        if (b.tuhistatud_enne_algust_min != null) totalMin += b.tuhistatud_enne_algust_min;
    }

    const roomsMap = Object.fromEntries(RUUMID.map((r) => [r.id, r]));

    // Viimased 25 tühistamist tabelisse
    const recent = [...cancelled]
        .sort((a, b) => (a.algus < b.algus ? 1 : -1))
        .slice(0, 25)
        .map((b) => ({
            id: b.id,
            algus: b.algus,
            nadalapaev: (() => {
                const d = new Date(b.algus).getDay();
                const names = ['P', 'E', 'T', 'K', 'N', 'R', 'L'];
                return names[d];
            })(),
            kellaaeg: new Date(b.algus).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }),
            tuhistatud_enne_min: b.tuhistatud_enne_algust_min,
            ruum: b.ruum_code,
            hoone: b.hoone,
            ruumitypp: b.ruumitypp,
            tuhistaja_roll: b.tuhistaja_roll,
            ruum_id: b.ruum_id
        }));

    return {
        total: cancelled.length,
        keskmine_enne_algust_min: cancelled.length > 0 ? Math.round(totalMin / cancelled.length) : 0,
        by_weekday: byWeekday,
        by_hour: byHour,
        recent
    };
}

/**
 * Ühe ruumi detailandmed — metaandmed + broneeringud + ajajoon.
 */
export function getRoomDetail(roomId, filters = {}) {
    const room = RUUMID.find((r) => r.id === roomId);
    if (!room) return null;

    const bookings = filterBookings({ ...filters, ruum_id: roomId });

    // Sündmuse tüüpide jaotus
    const bySyndmus = {};
    for (const b of bookings) {
        if (b.staatus === BRONEERINGU_STAATUS.GHOST) continue;
        bySyndmus[b.syndmus_label] = (bySyndmus[b.syndmus_label] ?? 0) + 1;
    }

    // Päev-päeva trend
    const trend = getDailyTrend({ ...filters, ruum_id: roomId });

    // Broneeringute list
    const list = [...bookings].sort((a, b) => (a.algus < b.algus ? 1 : -1));

    return {
        ...room,
        by_syndmus: bySyndmus,
        trend,
        broneeringud: list
    };
}

/** Kõikide broneeringute total valgeleht statistika päisesse. */
export function getGlobalCounts() {
    return {
        hooned: HOONED.length,
        ruumid: RUUMID.length,
        broneeringud: BRONEERINGUD.length
    };
}

// ─── React-friendly aliases ──────────────────────────────────────────────────

/** Alias: getRoomStatistics nimega mida React vaated kasutavad */
export function getRuumideSummary(filters) {
    return getRoomStatistics(filters);
}

/** Alias: teisendab getHeatmap väljundi 2D massiiviks [dayIdx 0-6][hourIdx 0-13] */
export function getHeatmapData(filters) {
    const raw = getHeatmap(filters);
    const grid = Array.from({ length: 7 }, () => Array(14).fill(0));
    for (const { weekday, hour, intensity } of raw) {
        const di = weekday - 1;   // 1-indexed → 0-indexed (0=E..6=P)
        const hi = hour - 8;      // hour 8 → index 0, hour 21 → index 13
        if (di >= 0 && di < 7 && hi >= 0 && hi < 14) {
            grid[di][hi] = intensity;
        }
    }
    return grid;
}

/** Alias: tühistamiste statistika StatistikaTuhistamised vaate jaoks */
export function getTuhistamisedStats(filters) {
    const c = getCancellations(filters);
    const all = filterBookingsPublic(filters);
    const total = all.filter(b => b.staatus !== 'taotlus').length;
    const tuhistamine_pct = total > 0 ? c.total / total : 0;
    const avg_enne_h = c.total > 0 ? c.keskmine_enne_algust_min / 60 : null;

    const byClass = { lt15: 0, lt60: 0, lt240: 0, lt1440: 0, lt4320: 0, gte4320: 0 };
    for (const b of BRONEERINGUD.filter(b => b.staatus === BRONEERINGU_STAATUS.TUHISTATUD)) {
        if (filters.hoone?.length && !filters.hoone.includes(b.hoone)) continue;
        if (filters.ruumitypp?.length && !filters.ruumitypp.includes(b.ruumitypp)) continue;
        const m = b.tuhistatud_enne_algust_min ?? 0;
        if (m < 15) byClass.lt15++;
        else if (m < 60) byClass.lt60++;
        else if (m < 240) byClass.lt240++;
        else if (m < 1440) byClass.lt1440++;
        else if (m < 4320) byClass.lt4320++;
        else byClass.gte4320++;
    }

    return { kokku: c.total, tuhistamine_pct, avg_enne_h, byClass };
}

function filterBookingsPublic(filters) {
    return BRONEERINGUD.filter(b => {
        if (filters.hoone?.length && !filters.hoone.includes(b.hoone)) return false;
        if (filters.ruumitypp?.length && !filters.ruumitypp.includes(b.ruumitypp)) return false;
        return true;
    });
}
