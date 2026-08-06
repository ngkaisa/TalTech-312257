export default function PlatseholderVaade({ title = 'Tühi', message = 'Andmeid ei leitud.' }) {
    return (
        <div className="bron-empty">
            <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--tt-purple-300)', marginBottom: '.75rem', display: 'block' }}>inbox</span>
            <h3>{title}</h3>
            <p>{message}</p>
        </div>
    );
}
