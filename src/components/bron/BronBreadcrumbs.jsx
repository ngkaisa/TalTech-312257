import { Breadcrumb } from '@TalTech-IT/styleguide';
import { Link } from 'react-router-dom';

export default function BronBreadcrumbs({ items = [] }) {
    return (
        <Breadcrumb>
            {items.map((item, i) => (
                <Breadcrumb.Item
                    key={i}
                    active={!item.to}
                    linkAs={item.to ? Link : undefined}
                    linkProps={item.to ? { to: item.to } : undefined}
                >
                    {item.label}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
}
