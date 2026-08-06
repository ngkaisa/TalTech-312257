import { Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export default function LigipaasPuudub({ message }) {
    const { currentRoleLabel } = useRole();
    return (
        <div className="bron-access-denied">
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--tt-purple-300)', marginBottom: '1rem', display: 'block' }}>lock</span>
            <h2>Ligipääs puudub</h2>
            <p>{message || `Roll „${currentRoleLabel}" ei oma sellele lehele ligipääsu.`}</p>
            <Link to="/" className="bron-btn bron-btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>arrow_back</span>
                Tagasi avalehele
            </Link>
        </div>
    );
}
