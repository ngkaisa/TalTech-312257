import { Link } from 'react-router-dom';

export default function BronBreadcrumbs({ items = [] }) {
    return (
        <nav className="bron-breadcrumb" aria-label="Leivapuru">
            {items.map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    {i > 0 && <span aria-hidden="true">›</span>}
                    {item.to
                        ? <Link to={item.to}>{item.label}</Link>
                        : <span>{item.label}</span>
                    }
                </span>
            ))}
        </nav>
    );
}
