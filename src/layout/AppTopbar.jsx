import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ROLE_LABELS, ROLES, useRole } from '../context/RoleContext';

const ROLE_ICONS = {
    [ROLES.GUEST]:  'person_off',
    [ROLES.SUPER]:  'admin_panel_settings',
    [ROLES.HALDUR]: 'manage_accounts',
    [ROLES.UNI]:    'school',
    [ROLES.EXT]:    'public',
};
const ROLE_ORDER = [ROLES.GUEST, ROLES.UNI, ROLES.EXT, ROLES.HALDUR, ROLES.SUPER];

export default function AppTopbar() {
    const { currentRole, currentRoleLabel, isLoggedIn, setRole,
            canSeeFullStatistics, canSeeOwnBookings, isExt } = useRole();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        function handle(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [menuOpen]);

    return (
        <header>
            {/* ── Pre-header: institutsioon + keel ── */}
            <div className="bron-preheader">
                <div className="bron-preheader__inner">
                    <span className="bron-preheader__app-label">Tallinna Tehnikaülikool</span>
                    <div className="bron-preheader__lang">
                        <a href="#">EST</a><span>|</span><a href="#">ENG</a>
                    </div>
                </div>
            </div>

            {/* ── Main bar: logo + navigatsioon + rollid ── */}
            <div className="bron-mainbar">
                <div className="bron-mainbar__inner">
                    {/* TAL TECH blokk-logo */}
                    <Link to="/" className="bron-logo-block" aria-label="BRON avaleht">
                        <span className="bron-logo-block__tal">TAL</span>
                        <span className="bron-logo-block__tech">TECH</span>
                    </Link>

                    {/* Peamine navigatsioon — gradientalal */}
                    <nav className="bron-topnav" aria-label="Peamine navigatsioon">
                        <NavLink to="/otsi-ruumi"
                            className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                            Otsi ruumi
                        </NavLink>
                        {canSeeOwnBookings && <>
                            <NavLink to="/broneeringud"
                                className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Broneeringud
                            </NavLink>
                            <NavLink to="/taotlused"
                                className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Taotlused
                            </NavLink>
                        </>}
                        {isExt && !canSeeOwnBookings && (
                            <NavLink to="/taotlused"
                                className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Taotlused
                            </NavLink>
                        )}
                        {canSeeFullStatistics && (
                            <NavLink to="/statistika"
                                className={({ isActive }) => 'bron-topnav__link' + (isActive ? ' active' : '')}>
                                Statistika
                            </NavLink>
                        )}
                    </nav>

                    {/* Parempool */}
                    <div className="bron-topnav__right">
                        {!isLoggedIn && (
                            <button className="bron-login-btn" onClick={() => setRole(ROLES.UNI)}>
                                <span className="material-icons" style={{ fontSize: '1rem' }}>login</span>
                                Logi sisse
                            </button>
                        )}
                        {/* Demo rolli-switcher */}
                        <div className="bron-role-dropdown" ref={menuRef}>
                            <button className="bron-role-pill"
                                onClick={() => setMenuOpen(o => !o)}
                                aria-expanded={menuOpen} aria-haspopup="menu">
                                <span className="material-icons" style={{ fontSize: '1rem' }}>
                                    {ROLE_ICONS[currentRole]}
                                </span>
                                {currentRoleLabel}
                                <span className="material-icons" style={{ fontSize: '.9rem', opacity: .7 }}>
                                    {menuOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>
                            {menuOpen && (
                                <div className="bron-role-menu" role="menu">
                                    <div className="bron-role-menu__label">Demo — vaheta rolli</div>
                                    {ROLE_ORDER.map(role => (
                                        <button key={role}
                                            className={`bron-role-menu__item${currentRole === role ? ' active' : ''}`}
                                            onClick={() => { setRole(role); setMenuOpen(false); }}
                                            role="menuitem">
                                            <span className="material-icons" style={{ fontSize: '1.05rem' }}>
                                                {ROLE_ICONS[role]}
                                            </span>
                                            {ROLE_LABELS[role]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
