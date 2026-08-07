/**
 * Konteksti-vaadete (Minu broneeringud, Minu taotlused, Otsi ruumi) mock andmed.
 *
 * Kasutab BronStatisticsService andmemudelit — filtreerib
 * neid kasutaja rolli ja "minu" vaate jaoks.
 */
import { BRONEERINGU_STAATUS, BRONEERINGUD, RUUMID, RUUMITYYBID, SYNDMUSETYYBID } from './BronStatisticsService';

/**
 * "Minu" broneeringud — võtame lihtsalt mingi kindla alamhulga aktiivsetest ja lõppenud
 * broneeringutest, et demol näidata mõistlikku listi.
 */
export function getMyBookings(role = 'TUDENG') {
    // Näidise huvides valime iga 17. broneeringu — see annab ~200 broneeringut kokku,
    // filtreerime alla ~15 tk isikliku vaate jaoks.
    const mine = BRONEERINGUD.filter((b, i) => i % 17 === 3 && b.staatus !== BRONEERINGU_STAATUS.GHOST);

    return mine
        .slice(0, 15)
        .map((b) => {
            const ruum = RUUMID.find((r) => r.id === b.ruum_id);
            return {
                id: b.id,
                ruum_id: b.ruum_id,
                ruum: ruum ? ruum.code : '—',
                hoone: ruum ? ruum.hoone_name : '—',
                ruumitypp_label: ruum ? ruum.ruumitypp_label : '—',
                algus: b.algus,
                lopp: b.lopp,
                staatus: b.staatus,
                syndmus_label: b.syndmus_label,
                syndmus: b.syndmus,
                kestus_h: b.kestus_h,
                allikas: b.allikas,
            };
        })
        .sort((a, b) => (a.algus < b.algus ? 1 : -1));
}

// Kasutajanimed admin-vaate jaoks (demo)
const DEMO_KASUTAJAD = [
    'Mart Saar', 'Liisa Kask', 'Anna Lepp', 'Eve Kivi', 'Tiiu Mets',
    'Heli Nurm', 'Karl Tamm', 'Piret Mägi', 'Jüri Oja', 'Siret Kell',
];

/**
 * §1.1.1 — Superkasutaja näeb KÕIKI broneeringuid ja saab tühistada ükskõik millist.
 * Tagastab suurema alamhulga kõigist broneeringutest (mitte-ghost) rikastatult kasutajanimedega.
 */
export function getAllBookings() {
    const active = BRONEERINGUD.filter(b =>
        b.staatus !== BRONEERINGU_STAATUS.GHOST
    );

    return active
        .slice(0, 40)
        .map((b, idx) => {
            const ruum = RUUMID.find((r) => r.id === b.ruum_id);
            return {
                id: b.id,
                ruum_id: b.ruum_id,
                ruum: ruum ? ruum.code : '—',
                hoone: ruum ? ruum.hoone_name : '—',
                ruumitypp_label: ruum ? ruum.ruumitypp_label : '—',
                algus: b.algus,
                lopp: b.lopp,
                staatus: b.staatus,
                syndmus_label: b.syndmus_label,
                syndmus: b.syndmus,
                kestus_h: b.kestus_h,
                allikas: b.allikas,
                kasutaja_roll: b.kasutaja_roll,
                kasutaja_nimi: b.allikas === 'tunniplaan'
                    ? '— (Tunniplaan)'
                    : DEMO_KASUTAJAD[idx % DEMO_KASUTAJAD.length],
            };
        })
        .sort((a, b) => (a.algus < b.algus ? 1 : -1));
}

/**
 * "Minu" taotlused — ainult ghost/taotlus staatuses kirjed.
 * Näitab, et tavakasutajal on menetlusel taotlused.
 */
export function getMyRequests(role = 'TUDENG') {
    const requests = BRONEERINGUD.filter((b) => b.staatus === BRONEERINGU_STAATUS.GHOST);

    return requests
        .slice(0, 8)
        .map((b, idx) => {
            const ruum = RUUMID.find((r) => r.id === b.ruum_id);
            const seisud = ['menetlusel', 'menetlusel', 'kinnitatud', 'tagasi_lykatud', 'tuhistatud'];
            const seis = seisud[idx % seisud.length];
            const esitatud = new Date(b.algus);
            esitatud.setDate(esitatud.getDate() - 5 - idx);
            return {
                id: b.id,
                ruum: ruum ? ruum.code : '—',
                ruum_id: b.ruum_id,
                hoone: ruum ? ruum.hoone_name : '—',
                ruumitypp_label: ruum ? ruum.ruumitypp_label : '—',
                algus: b.algus,
                lopp: b.lopp,
                seis,
                syndmus_label: b.syndmus_label,
                kestus_h: b.kestus_h,
                pohjendus: role === 'EXT' ? 'Väline üritus — konverents "Rohepööre 2026"' : 'Uurimisgrupi koosolek',
                esitatud: esitatud.toISOString(),
                vastus_pohjendus: seis === 'tagasi_lykatud'
                    ? 'Ruum on sel perioodil reserveeritud ülikooli üritusel. Palun vali muu aeg või ruum.'
                    : null,
                taotleja_nimi: role === 'EXT' ? 'Demo Kasutaja' : 'Demo Üliõpilane',
                taotleja_email: role === 'EXT' ? 'demo@extern.ee' : 'demo@taltech.ee',
                taotleja_org: role === 'EXT' ? 'Rohepööre OÜ' : 'TalTech — Infotehnoloogia teaduskond',
                haldur_nimi: idx % 2 === 0 ? 'Mari Mägi' : 'Jaan Tamm',
            };
        })
        .sort((a, b) => (a.algus < b.algus ? -1 : 1));
}

/**
 * Kõik menetlusel taotlused haldurite jaoks — rikkalikum andmemudel.
 */
export function getAllRequests() {
    const TAOTLEJAD = [
        { nimi: 'Mart Saar', email: 'mart.saar@taltech.ee',     org: 'TalTech — IT teaduskond',      tyyp: 'uni' },
        { nimi: 'Liisa Kask', email: 'liisa.kask@taltech.ee',  org: 'TalTech — Mehaanikateaduskond', tyyp: 'uni' },
        { nimi: 'Peeter Oja', email: 'peeter@estartup.ee',     org: 'eStartup AS',                   tyyp: 'ext' },
        { nimi: 'Anna Lepp',  email: 'anna.lepp@taltech.ee',   org: 'TalTech — Keemia instituut',    tyyp: 'uni' },
        { nimi: 'Karl Vool',  email: 'karl@konverents.ee',     org: 'Konverentside OÜ',              tyyp: 'ext' },
        { nimi: 'Eve Kivi',   email: 'eve.kivi@taltech.ee',    org: 'TalTech — Energeetika instituut',tyyp: 'uni' },
        { nimi: 'Siim Tamm',  email: 'siim@ngo.org',          org: 'Eesti Noorteühing',              tyyp: 'ext' },
        { nimi: 'Tiiu Mets',  email: 'tiiu.mets@taltech.ee',  org: 'TalTech — Sotsiaalteaduste kool',tyyp: 'uni' },
        { nimi: 'Rain Pärn',  email: 'rain@rohe.ee',          org: 'Rohepööre OÜ',                  tyyp: 'ext' },
        { nimi: 'Heli Nurm',  email: 'heli.nurm@taltech.ee',  org: 'TalTech — Matemaatika instituut',tyyp: 'uni' },
    ];
    const POHJENDUSED = [
        'Uurimisgrupi iganädalane koosolek. Vajalik projektor ja tahvel.',
        'Väliskonverentsi "Rohepööre 2026" ettevalmistusseminar.',
        'Kaitsmiste eelne avalik esitlus magistritöödele.',
        'Meeskonna hooajaline planeerimiskoosolek — 12 osalejat.',
        'TalTech alumniürituse korraldusgrupi kohtumine.',
        'Startup-ideede esitluspäev ettevõtluskeskusele.',
        'Õpetamispraktika supervisioonigrupp — 8 õpetajaprakitkanti.',
        'Rahvusvaheline teadusgrant KickOff — 15 osalejat erinevatest institutsioonidest.',
        'Aastaaruande avalik esitlus toetajatele.',
        'IT-turvalisuse workshop firmasisesele tiimile.',
    ];
    const SEISUD = ['menetlusel','menetlusel','menetlusel','kinnitatud','kinnitatud','tagasi_lykatud'];
    const VASTUS_POHJ = [
        null, null, null,
        null,
        null,
        'Ruum on sel perioodil reserveeritud ülikooli eksamite tarbeks. Palun vali teine kuupäev.',
    ];

    const requests = BRONEERINGUD.filter((b) => b.staatus === BRONEERINGU_STAATUS.GHOST);

    return requests.slice(0, 10).map((b, idx) => {
        const ruum = RUUMID.find((r) => r.id === b.ruum_id);
        const t = TAOTLEJAD[idx % TAOTLEJAD.length];
        const seis = SEISUD[idx % SEISUD.length];
        const esitatud = new Date(b.algus);
        esitatud.setDate(esitatud.getDate() - 3 - (idx % 7));
        return {
            id: b.id,
            ruum: ruum ? ruum.code : '—',
            ruum_id: b.ruum_id,
            hoone: ruum ? ruum.hoone_name : '—',
            hoone_code: ruum ? ruum.hoone : '—',
            ruumitypp_label: ruum ? ruum.ruumitypp_label : '—',
            algus: b.algus,
            lopp: b.lopp,
            kestus_h: b.kestus_h,
            seis,
            syndmus_label: b.syndmus_label,
            pohjendus: POHJENDUSED[idx % POHJENDUSED.length],
            esitatud: esitatud.toISOString(),
            vastus_pohjendus: VASTUS_POHJ[idx % SEISUD.length],
            taotleja_nimi: t.nimi,
            taotleja_email: t.email,
            taotleja_org: t.org,
            taotleja_tyyp: t.tyyp,
        };
    }).sort((a, b) => new Date(a.esitatud) - new Date(b.esitatud));
}

/**
 * Ruumide otsingu mock. Filtreerib ruume otsinguparameetrite järgi.
 * Iga ruumi juurde arvutame hetkel vaba/hõivatud staatuse ja järgmise vaba ajakoht.
 */
export function searchRooms(query = {}) {
    let results = RUUMID.slice();

    if (query.hoone && query.hoone.length > 0) {
        results = results.filter((r) => query.hoone.includes(r.hoone));
    }
    if (query.ruumitypp && query.ruumitypp.length > 0) {
        results = results.filter((r) => query.ruumitypp.includes(r.ruumitypp));
    }
    if (query.min_kohti) {
        results = results.filter((r) => r.kohti >= query.min_kohti);
    }
    if (query.otsing) {
        const q = query.otsing.toLowerCase();
        results = results.filter((r) => r.code.toLowerCase().includes(q) || r.hoone_name.toLowerCase().includes(q));
    }

    // Omadused filter
    if (query.omadused && query.omadused.length > 0) {
        results = results.filter((r) =>
            query.omadused.every((o) => {
                if (o === 'arvutid')  return r.arvutikohti > 0;
                if (o === 'labor')   return ['oppelabor', 'labor', 'teaduslabor'].includes(r.ruumitypp);
                if (o === 'saun')    return r.ruumitypp === 'saun';
                if (o === 'sport')   return r.ruumitypp === 'spordiruum';
                if (o === 'tookoda') return r.ruumitypp === 'tookoda';
                if (o === 'suur')    return r.kohti >= 200;
                return true;
            })
        );
    }

    // Referentsi-aeg kättesaadavuse arvutamiseks
    let now;
    if (query.kuupaev && query.kellaaeg != null) {
        const d = new Date(query.kuupaev);
        d.setHours(0, query.kellaaeg, 0, 0); // kellaaeg on minutites alates 00:00
        now = d;
    } else if (query.kuupaev) {
        const d = new Date(query.kuupaev);
        d.setHours(10, 30, 0, 0);
        now = d;
    } else {
        now = new Date('2026-08-03T10:30:00');
    }

    // §1.1.1 — Kestuse filter: eemalda ruumid kus soovitud ajavahemik on hõivatud.
    // GHOST (taotlus menetlusel) blokeerib ruumi — samal ajal ei saa teist broneeringut teha.
    if (query.kuupaev && query.kellaaeg != null && query.kestus) {
        const reqEnd = new Date(now.getTime() + query.kestus * 3600 * 1000);
        results = results.filter((r) => {
            return !BRONEERINGUD.some((b) => {
                if (b.ruum_id !== r.id) return false;
                // Ainult tühistatud ei blokeeri; ghost (menetlusel taotlus) BLOKEERIB
                if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) return false;
                const bStart = new Date(b.algus);
                const bEnd = new Date(b.lopp);
                return bStart < reqEnd && bEnd > now;
            });
        });
    }

    return results.map((r) => {
        // §1.1.1 — GHOST broneeringud (menetlusel taotlused) blokeerivad ruumi
        const todayBookings = BRONEERINGUD.filter((b) => {
            if (b.ruum_id !== r.id) return false;
            if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) return false;
            const algus = new Date(b.algus);
            const lopp = new Date(b.lopp);
            return algus.toDateString() === now.toDateString() && lopp > now;
        }).sort((a, b) => new Date(a.algus) - new Date(b.algus));

        const currentBooking = todayBookings.find((b) => new Date(b.algus) <= now && new Date(b.lopp) > now);
        const nextBooking = todayBookings.find((b) => new Date(b.algus) > now);
        const isBusy = !!currentBooking;
        const isTaotlusMenetlusel = isBusy && currentBooking.staatus === BRONEERINGU_STAATUS.GHOST;

        function fmtTime(iso) {
            const d = new Date(iso);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }

        let hetkel_vaba_tekst;
        if (isTaotlusMenetlusel) {
            hetkel_vaba_tekst = `Taotlus menetlusel kuni ${fmtTime(currentBooking.lopp)}`;
        } else if (isBusy) {
            hetkel_vaba_tekst = `Hõivatud kuni ${fmtTime(currentBooking.lopp)}`;
        } else if (nextBooking) {
            const nextIsTaotlus = nextBooking.staatus === BRONEERINGU_STAATUS.GHOST;
            hetkel_vaba_tekst = nextIsTaotlus
                ? `Vaba kuni ${fmtTime(nextBooking.algus)} (seejärel taotlus menetlusel)`
                : `Vaba kuni ${fmtTime(nextBooking.algus)}`;
        } else {
            hetkel_vaba_tekst = 'Vaba täna kuni 22:00';
        }

        return {
            ...r,
            vaba: !isBusy,
            taotlus_menetlusel: isTaotlusMenetlusel,
            hetkel_vaba_tekst,
            jargmine_vaba: isBusy ? (nextBooking ? fmtTime(nextBooking.algus) : null) : null
        };
    });
}

// ─────────────────────────────────────────────────────────────────
// Kontaktisikud mock — kasutame RuumiDetail kontaktvaates
// ─────────────────────────────────────────────────────────────────
const KASUTAJAD_FULL = [
    { nimi: 'Mart Saar',   email: 'mart.saar@taltech.ee',    telefon: '+372 5123 4567', org: 'TalTech — IT teaduskond',           tyyp: 'uni' },
    { nimi: 'Liisa Kask',  email: 'liisa.kask@taltech.ee',   telefon: '+372 5234 5678', org: 'TalTech — Mehaanikateaduskond',      tyyp: 'uni' },
    { nimi: 'Peeter Oja',  email: 'peeter@estartup.ee',      telefon: '+372 5345 6789', org: 'eStartup AS',                        tyyp: 'ext' },
    { nimi: 'Anna Lepp',   email: 'anna.lepp@taltech.ee',    telefon: '+372 5456 7890', org: 'TalTech — Keemia instituut',         tyyp: 'uni' },
    { nimi: 'Karl Vool',   email: 'karl@konverents.ee',      telefon: '+372 5567 8901', org: 'Konverentside OÜ',                   tyyp: 'ext' },
    { nimi: 'Eve Kivi',    email: 'eve.kivi@taltech.ee',     telefon: '+372 5678 9012', org: 'TalTech — Energeetika instituut',    tyyp: 'uni' },
    { nimi: 'Siim Tamm',   email: 'siim@ngo.org',            telefon: '+372 5789 0123', org: 'Eesti Noorteühing',                  tyyp: 'ext' },
    { nimi: 'Tiiu Mets',   email: 'tiiu.mets@taltech.ee',    telefon: '+372 5890 1234', org: 'TalTech — Sotsiaalteaduste kool',   tyyp: 'uni' },
    { nimi: 'Rain Pärn',   email: 'rain@rohe.ee',            telefon: '+372 5901 2345', org: 'Rohepööre OÜ',                       tyyp: 'ext' },
    { nimi: 'Heli Nurm',   email: 'heli.nurm@taltech.ee',    telefon: '+372 5012 3456', org: 'TalTech — Matemaatika instituut',   tyyp: 'uni' },
];

// Referentsaeg kättesaadavuse arvutamiseks (sama mis searchRooms kasutab)
const NOW_REF = new Date('2026-08-06T10:30:00');

/**
 * Arvutab ruumi hetkelise kättesaadavuse.
 * Tagastab { vaba, hetkel_vaba_tekst, currentBooking, nextBooking }
 */
export function getRoomAvailability(ruum_id) {
    function fmtTime(iso) {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const today = NOW_REF.toDateString();
    // §1.1.1 — GHOST (menetlusel taotlused) blokeerivad ruumi — ainult tühistatud ei blokeeri
    const todayBookings = BRONEERINGUD.filter(b => {
        if (b.ruum_id !== ruum_id) return false;
        if (b.staatus === BRONEERINGU_STAATUS.TUHISTATUD) return false;
        const lopp = new Date(b.lopp);
        return new Date(b.algus).toDateString() === today && lopp > NOW_REF;
    }).sort((a, b) => new Date(a.algus) - new Date(b.algus));

    const currentBooking = todayBookings.find(b => new Date(b.algus) <= NOW_REF && new Date(b.lopp) > NOW_REF);
    const nextBooking    = todayBookings.find(b => new Date(b.algus) > NOW_REF);
    const isBusy = !!currentBooking;
    const isTaotlusMenetlusel = isBusy && currentBooking.staatus === BRONEERINGU_STAATUS.GHOST;

    let hetkel_vaba_tekst;
    if (isTaotlusMenetlusel)   hetkel_vaba_tekst = `Taotlus menetlusel kuni ${fmtTime(currentBooking.lopp)}`;
    else if (isBusy)           hetkel_vaba_tekst = `Hõivatud kuni ${fmtTime(currentBooking.lopp)}`;
    else if (nextBooking) {
        const nextIsTaotlus = nextBooking.staatus === BRONEERINGU_STAATUS.GHOST;
        hetkel_vaba_tekst = nextIsTaotlus
            ? `Vaba kuni ${fmtTime(nextBooking.algus)} (seejärel taotlus menetlusel)`
            : `Vaba kuni ${fmtTime(nextBooking.algus)}`;
    } else {
        hetkel_vaba_tekst = 'Vaba täna kuni 22:00';
    }

    return { vaba: !isBusy, taotlus_menetlusel: isTaotlusMenetlusel, hetkel_vaba_tekst, currentBooking, nextBooking };
}

/**
 * Tänase + homme broneeringud koos broneerija kontaktandmetega.
 * Nähtav ainult super/haldur rolliga kasutajatele.
 */
export function getRoomScheduleWithContacts(ruum_id) {
    function fmtTime(iso) {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const cutoff = new Date(NOW_REF);
    cutoff.setDate(cutoff.getDate() + 2); // kuni 2 päeva ette

    const bookings = BRONEERINGUD.filter(b => {
        if (b.ruum_id !== ruum_id) return false;
        if (b.staatus === 'tühistatud') return false;
        const algus = new Date(b.algus);
        return algus >= new Date(NOW_REF.toDateString()) && algus < cutoff;
    }).sort((a, b) => new Date(a.algus) - new Date(b.algus));

    return bookings.slice(0, 12).map((b, i) => {
        const isTunniplaan = b.allikas === 'tunniplaan';
        const k = KASUTAJAD_FULL[i % KASUTAJAD_FULL.length];
        return {
            ...b,
            // Tunniplaani broneeringul pole kontaktandmeid
            broneerija_nimi:    isTunniplaan ? null : k.nimi,
            broneerija_email:   isTunniplaan ? null : k.email,
            broneerija_telefon: isTunniplaan ? null : k.telefon,
            broneerija_org:     isTunniplaan ? null : k.org,
            broneerija_tyyp:    isTunniplaan ? 'tunniplaan' : k.tyyp,
            algus_fmt: fmtTime(b.algus),
            lopp_fmt:  fmtTime(b.lopp),
            paev: new Date(b.algus).toLocaleDateString('et-EE', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        };
    });
}

// ─────────────────────────────────────────────────────────────────
// Ruumi tagasiside mock andmed
// ─────────────────────────────────────────────────────────────────
const TAGASISIDE_KOMMENTAARID = [
    'Kliimaseade käis liiga valjult, segab töötamist.',
    'Ruum oli väga puhas ja korras!',
    'Valgustus pisut nõrk. Muus osas kõik hästi.',
    'Tundus, et eelmine kasutaja oli laua laiali jätnud — palun tuletada meelde korda.',
    'Suurepärane ruum! Sobib hästi väikestele seminaridele.',
    'Akna all tuli külm tuulõhk, korrigeerida.',
    'Projektori kaabel oli katki, vajas asendamist.',
    'Puhas ja vaikne. Täpselt selline nagu vaja.',
    'Lõhn ruumis oli veidi tuhkne — ehk tuulutada rohkem.',
];

function makeFeedbackSeed(ruum_id) {
    return ruum_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

function pseudoRand(seed, i) {
    const x = Math.sin(seed + i * 127.1) * 43758.5453;
    return x - Math.floor(x);
}

function randInt(seed, i, min, max) {
    return Math.floor(pseudoRand(seed, i) * (max - min + 1)) + min;
}

/**
 * Genereerib mock tagasiside antud ruumile.
 * Tagastab kuni 8 tagasiside kirjet.
 */
export function getRoomFeedback(ruum_id) {
    const seed = makeFeedbackSeed(ruum_id);
    const count = 3 + (seed % 5); // 3–7 tagasiside kirjet
    const KASUTAJAD_FEEDBACK = [
        'M. Saar', 'L. Kask', 'P. Oja', 'A. Lepp', 'K. Vool',
        'E. Kivi', 'S. Tamm', 'T. Mets', 'R. Pärn', 'H. Nurm',
    ];
    return Array.from({ length: count }, (_, i) => ({
        id: `TG_${ruum_id}_${i}`,
        ruum_id,
        kasutaja: KASUTAJAD_FEEDBACK[(seed + i) % KASUTAJAD_FEEDBACK.length],
        kuupaev: new Date(NOW_REF.getTime() - (1 + i) * 86400000 * randInt(seed, i * 3, 1, 5))
            .toISOString().slice(0, 10),
        temperatuur: randInt(seed, i * 7 + 1, 2, 5),
        puhtus:      randInt(seed, i * 7 + 2, 2, 5),
        ohk:         randInt(seed, i * 7 + 3, 1, 5),
        varustus:    randInt(seed, i * 7 + 4, 2, 5),
        kommentaar:  pseudoRand(seed, i * 7 + 5) > 0.45
            ? TAGASISIDE_KOMMENTAARID[(seed + i) % TAGASISIDE_KOMMENTAARID.length]
            : null,
    })).sort((a, b) => b.kuupaev.localeCompare(a.kuupaev));
}

export { RUUMITYYBID, SYNDMUSETYYBID };

// ─────────────────────────────────────────────────────────────────
// Tunniplaani konflikti kontroll broneerimise vormile
// ─────────────────────────────────────────────────────────────────
/**
 * Tagastab tunniplaani broneeringud, mis kattuvad soovitud ajaperioodiga.
 * Kasutatakse BroneeringuVormis hoiatuse kuvamiseks.
 */
export function getTunniplaanConflicts(ruum_id, kuupaev, kellaaeg_min, kestus_h) {
    if (!ruum_id || !kuupaev || kellaaeg_min == null || !kestus_h) return [];
    const reqStart = new Date(kuupaev);
    reqStart.setHours(0, kellaaeg_min, 0, 0);
    const reqEnd = new Date(reqStart.getTime() + kestus_h * 3600 * 1000);

    function fmtTime(iso) {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    return BRONEERINGUD.filter(b => {
        if (b.ruum_id !== ruum_id) return false;
        if (b.allikas !== 'tunniplaan') return false;
        const bStart = new Date(b.algus);
        const bEnd = new Date(b.lopp);
        return bStart < reqEnd && bEnd > reqStart;
    }).map(b => ({
        ...b,
        algus_fmt: fmtTime(b.algus),
        lopp_fmt:  fmtTime(b.lopp),
        paev: new Date(b.algus).toLocaleDateString('et-EE', { weekday: 'long', day: '2-digit', month: '2-digit' }),
    }));
}
