const SEVERITY_MAP = {
    aktiivne: 'info',
    'lõppenud': 'success',
    'tühistatud': 'danger',
    taotlus: 'warn',
    menetlusel: 'warn',
    kinnitatud: 'success',
    tagasi_lykatud: 'danger',
    tuhistatud: 'neutral',
};

const LABEL_MAP = {
    aktiivne: 'Aktiivne',
    'lõppenud': 'Lõppenud',
    'tühistatud': 'Tühistatud',
    taotlus: 'Taotlus',
    menetlusel: 'Menetlusel',
    kinnitatud: 'Kinnitatud',
    tagasi_lykatud: 'Tagasi lükatud',
    tuhistatud: 'Tuhistatud',
};

export default function StaatusKaart({ staatus }) {
    const sev = SEVERITY_MAP[staatus] || 'neutral';
    return (
        <span className={`bron-badge bron-badge--${sev}`}>
            {LABEL_MAP[staatus] || staatus}
        </span>
    );
}
