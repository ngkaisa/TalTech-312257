/**
 * RoleContext — BRON prototüübi rollimudel React kontekstina.
 * Vastab Vue useRole.js loogikale.
 */
import { createContext, useContext, useEffect, useState } from 'react';

export const ROLES = {
    GUEST: 'guest',
    SUPER: 'super',
    HALDUR: 'haldur',
    UNI: 'uni',
    EXT: 'ext',
};

export const ROLE_LABELS = {
    [ROLES.GUEST]: 'Külastaja',
    [ROLES.SUPER]: 'Superkasutaja',
    [ROLES.HALDUR]: 'Ruumi haldur',
    [ROLES.UNI]: 'Uni-ID kasutaja',
    [ROLES.EXT]: 'Väline kasutaja',
};

export const ROLE_DESCRIPTIONS = {
    [ROLES.GUEST]: 'Sisselogimata külastaja — ainult avalik info',
    [ROLES.SUPER]: 'Admin — kõik õigused, kogu statistika, kõik ruumid',
    [ROLES.HALDUR]: 'Ruumi omanik — enda ruumide statistika ja taotluste menetlus',
    [ROLES.UNI]: 'Tudeng / töötaja / õppejõud — enda broneeringud, avalik statistika',
    [ROLES.EXT]: 'Väline kasutaja — ainult ruumide taotlemine ja avalik info',
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
        isGuest: currentRole === ROLES.GUEST,
        isSuper: currentRole === ROLES.SUPER,
        isHaldur: currentRole === ROLES.HALDUR,
        isUni: currentRole === ROLES.UNI,
        isExt: currentRole === ROLES.EXT,
        isInternal: [ROLES.SUPER, ROLES.HALDUR, ROLES.UNI].includes(currentRole),
        isLoggedIn: currentRole !== ROLES.GUEST,
        canSeeFullStatistics: [ROLES.SUPER, ROLES.HALDUR].includes(currentRole),
        canSeeOwnBookings: [ROLES.SUPER, ROLES.HALDUR, ROLES.UNI].includes(currentRole),
    };

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
    const ctx = useContext(RoleContext);
    if (!ctx) throw new Error('useRole must be used inside RoleProvider');
    return ctx;
}
