import { NavLink } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

function NavItem({ to, icon, label, end = false }) {
    return (
        <li>
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) => 'bron-nav__link' + (isActive ? ' active' : '')}
            >
                <span className="material-icons">{icon}</span>
                {label}
            </NavLink>
        </li>
    );
}

function Section({ label }) {
    return <li className="bron-nav__section">{label}</li>;
}

export default function AppSidebar() {
    const { isInternal, isExt, canSeeFullStatistics, canSeeOwnBookings, isLoggedIn } = useRole();

    return (
        <aside className="bron-sidebar">
            <ul className="bron-nav">
                <NavItem to="/" icon="home" label="Avaleht" end />

                {(isInternal || isExt) && <>
                    <Section label="Ruumid" />
                    <NavItem to="/otsi-ruumi" icon="search" label="Otsi ruumi" />
                </>}

                {canSeeOwnBookings && !canSeeFullStatistics && <>
                    <Section label="Minu" />
                    <NavItem to="/broneeringud" icon="event" label="Minu broneeringud" />
                    <NavItem to="/taotlused"    icon="description" label="Minu taotlused" />
                </>}

                {canSeeOwnBookings && canSeeFullStatistics && <>
                    <Section label="Minu" />
                    <NavItem to="/broneeringud" icon="event" label="Minu broneeringud" />
                    <Section label="Haldus" />
                    <NavItem to="/taotlused" icon="rule" label="Broneeringute haldus" />
                </>}

                {isExt && !canSeeOwnBookings && <>
                    <Section label="Minu" />
                    <NavItem to="/taotlused" icon="description" label="Minu taotlused" />
                </>}

                {canSeeFullStatistics && <>
                    <Section label="Statistika" />
                    <NavItem to="/statistika" icon="bar_chart" label="Kasutusstatistika" />
                </>}

                <Section label="Avalik" />
                <NavItem to="/avalik/populaarsed-ajad" icon="schedule" label="Populaarsed ajad" />
            </ul>
        </aside>
    );
}
