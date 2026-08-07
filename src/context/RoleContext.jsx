/**
 * RoleContext — BRON prototüübi rollimudel React kontekstina.
 * Vastab Vue useRole.js loogikale.
 */
import { createContext, useContext, useEffect, useState } from 'react';

export const ROLES = {
    GUEST:   'guest',
    SUPER:   'super',
    HALDUR:  'haldur',
    TOOTAJA: 'tootaja',  // töötaja / õppejõud — uni-ID
    TUDENG:  'tudeng',   // tudeng — uni-ID
    EXT:     'ext',      // väline kasutaja, ei oma uni-ID-d
};

export const ROLE_LABELS = {
    [ROLES.GUEST]:   'Külastaja',
    [ROLES.SUPER]:   'Superkasutaja',
    [ROLES.HALDUR]:  'Ruumi haldur',
    [ROLES.TOOTAJA]: 'Töötaja / õppejõud',
    [ROLES.TUDENG]:  'Tudeng',
    [ROLES.EXT]:     'Väline kasutaja',
};

export const ROLE_DESCRIPTIONS = {
    [ROLES.GUEST]:   'Sisselogimata külastaja — ainult avalik info',
    [ROLES.SUPER]:   'Superkasutaja (admin) — kõik õigused, kogu statistika, kõik ruumid',
    [ROLES.HALDUR]:  'Ruumi haldur (ruumi omanik) — enda ruumide statistika ja taotluste menetlus',
    [ROLES.TOOTAJA]: 'Töötaja / õppejõud — uni-ID kasutaja, laiem broneerimisõigus',
    [ROLES.TUDENG]:  'Tudeng — uni-ID kasutaja, piiratud broneerimisõigus',
    [ROLES.EXT]:     'Väline kasutaja — ainult ruumide taotlemine ja avalik info',
};

const STORAGE_KEY = 'bron.currentRole';

function readStoredRole() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && Object.values(ROLES).includes(stored)) return stored;
    } catch (_) { /* ignore */ }
    return ROLES.GUEST;
}

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
    const [currentRole, setCurrentRoleState] = useState(readStoredRole);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, currentRole); } catch (_) { /* ignore */ }
    }, [currentRole]);

    function setRole(role) {
        if (Object.values(ROLES).includes(role)) setCurrentRoleState(role);
    }

    const value = {
        currentRole,
        currentRoleLabel: ROLE_LABELS[currentRole],
        currentRoleDescription: ROLE_DESCRIPTIONS[currentRole],
        setRole,
        isGuest:   currentRole === ROLES.GUEST,
        isSuper:   currentRole === ROLES.SUPER,
        isHaldur:  currentRole === ROLES.HALDUR,
        isTootaja: currentRole === ROLES.TOOTAJA,
        isTudeng:  currentRole === ROLES.TUDENG,
        isExt:     currentRole === ROLES.EXT,
        // isUni säilib tagasiühilduvusena — tõene nii tudengi kui töötaja puhul
        isUni: [ROLES.TOOTAJA, ROLES.TUDENG].includes(currentRole),
        isInternal: [ROLES.SUPER, ROLES.HALDUR, ROLES.TOOTAJA, ROLES.TUDENG].includes(currentRole),
        isLoggedIn: currentRole !== ROLES.GUEST,
        canSeeFullStatistics: [ROLES.SUPER, ROLES.HALDUR].includes(currentRole),
        canSeeOwnBookings: [ROLES.SUPER, ROLES.HALDUR, ROLES.TOOTAJA, ROLES.TUDENG].includes(currentRole),
    };

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
    const ctx = useContext(RoleContext);
    if (!ctx) throw new Error('useRole must be used inside RoleProvider');
    return ctx;
}
