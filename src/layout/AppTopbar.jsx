import { Header } from '@TalTech-IT/styleguide';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROLE_LABELS, ROLES, useRole } from '../context/RoleContext';

// Rollide järjekord ja võtmed CVI Roles komponendile
const ROLE_ORDER = [ROLES.GUEST, ROLES.UNI, ROLES.EXT, ROLES.HALDUR, ROLES.SUPER];
const ROLE_ID_MAP = {
    [ROLES.GUEST]:  0,
    [ROLES.UNI]:    1,
    [ROLES.EXT]:    2,
    [ROLES.HALDUR]: 3,
    [ROLES.SUPER]:  4,
};
const ROLE_BY_ID = Object.fromEntries(
    Object.entries(ROLE_ID_MAP).map(([role, id]) => [id, role])
);

export default function AppTopbar() {
    const { currentRole, currentRoleLabel, isLoggedIn, setRole,
            canSeeFullStatistics, canSeeOwnBookings, isExt } = useRole();
    const location = useLocation();
    const navigate = useNavigate();
    const [rolesOpen, setRolesOpen] = useState(false);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // CVI Header links — näita ainult rollile lubatud linke
    const links = [
        { children: 'Otsi ruumi', to: '/otsi-ruumi', active: isActive('/otsi-ruumi') },
        ...(canSeeOwnBookings ? [
            { children: 'Broneeringud', to: '/broneeringud', active: isActive('/broneeringud') },
            { children: 'Taotlused',    to: '/taotlused',    active: isActive('/taotlused') },
        ] : []),
        ...(isExt && !canSeeOwnBookings ? [
            { children: 'Taotlused', to: '/taotlused', active: isActive('/taotlused') },
        ] : []),
        ...(canSeeFullStatistics ? [
            { children: 'Statistika', to: '/statistika', active: isActive('/statistika') },
        ] : []),
    ];

    // CVI Roles prop
    const rolesConfig = {
        activeRole: ROLE_ID_MAP[currentRole],
        availableRoles: ROLE_ORDER.map((r) => ({ key: ROLE_ID_MAP[r], label: ROLE_LABELS[r] })),
        dropdownOpen: rolesOpen,
        onClick: () => setRolesOpen((o) => !o),
        onSelectRole: (id) => {
            setRole(ROLE_BY_ID[id]);
            setRolesOpen(false);
        },
    };

    // Login prop — näita ainult külalisele
    const loginConfig = !isLoggedIn
        ? { label: 'Logi sisse', onClick: () => setRole(ROLES.UNI) }
        : undefined;

    return (
        <Header
            linkAs={Link}
            links={links}
            logoLink={{ to: '/', 'aria-label': 'BRON avaleht' }}
            skipLink={{ to: '#main-content', children: 'Liigu sisule' }}
            roles={rolesConfig}
            login={loginConfig}
            breakpoint={0}
        />
    );
}
