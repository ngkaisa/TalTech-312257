import { useState } from 'react';

// Mitu pilti iga ruumitüübi kohta (Unsplash, 600×360)
const TYYBIPILDID = {
    aula: [
        'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=360&fit=crop',
    ],
    uldkasutatav_auditoorium: [
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=360&fit=crop',
    ],
    eriotstarbeline_auditoorium: [
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=360&fit=crop',
    ],
    seminariruum: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=600&h=360&fit=crop',
    ],
    opiruum: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=600&h=360&fit=crop',
    ],
    arvutiklass: [
        'https://images.unsplash.com/photo-1550439062-609e1531270e?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=360&fit=crop',
    ],
    labor: [
        'https://images.unsplash.com/photo-1532094349884-543559ba97f4?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=600&h=360&fit=crop',
    ],
    oppelabor: [
        'https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1532094349884-543559ba97f4?w=600&h=360&fit=crop',
    ],
    teaduslabor: [
        'https://images.unsplash.com/photo-1532094349884-543559ba97f4?w=600&h=360&fit=crop',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=360&fit=crop',
    ],
};
const VAIKIMISI = [
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&h=360&fit=crop',
];

export function getRuumiPildid(ruumitypp) {
    return TYYBIPILDID[ruumitypp] || VAIKIMISI;
}

/**
 * Väike carousel ruumikaardi jaoks (OtsiRuumi)
 * Kõrgus on fikseeritud (bron-room-card__img), noolenupud peal
 */
export function RuumiKaardiPilt({ ruumitypp, alt }) {
    const pildid = getRuumiPildid(ruumitypp);
    const [idx, setIdx] = useState(0);

    function prev(e) {
        e.stopPropagation();
        setIdx(i => (i - 1 + pildid.length) % pildid.length);
    }
    function next(e) {
        e.stopPropagation();
        setIdx(i => (i + 1) % pildid.length);
    }

    return (
        <div className="bron-room-card__img-wrap">
            <img
                src={pildid[idx]}
                alt={alt}
                className="bron-room-card__img"
                onError={e => { e.target.src = VAIKIMISI[0]; }}
            />
            {pildid.length > 1 && (
                <>
                    <button className="bron-img-nav bron-img-nav--prev" onClick={prev} aria-label="Eelmine pilt">
                        <span className="material-icons">chevron_left</span>
                    </button>
                    <button className="bron-img-nav bron-img-nav--next" onClick={next} aria-label="Järgmine pilt">
                        <span className="material-icons">chevron_right</span>
                    </button>
                    <div className="bron-img-dots">
                        {pildid.map((_, i) => (
                            <span key={i} className={`bron-img-dot${i === idx ? ' active' : ''}`}
                                onClick={e => { e.stopPropagation(); setIdx(i); }} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Täisgalerii ruumi detailvaate jaoks
 * Suur pilt + thumbnail-rida
 */
export function RuumiGalerii({ ruumitypp, alt }) {
    const pildid = getRuumiPildid(ruumitypp);
    const [idx, setIdx] = useState(0);

    function prev() { setIdx(i => (i - 1 + pildid.length) % pildid.length); }
    function next() { setIdx(i => (i + 1) % pildid.length); }

    return (
        <div className="bron-galerii">
            {/* Peapilt */}
            <div className="bron-galerii__main">
                <img
                    src={pildid[idx]}
                    alt={`${alt} — pilt ${idx + 1}`}
                    className="bron-galerii__img"
                    onError={e => { e.target.src = VAIKIMISI[0]; }}
                />
                {pildid.length > 1 && (
                    <>
                        <button className="bron-img-nav bron-img-nav--prev" onClick={prev} aria-label="Eelmine pilt">
                            <span className="material-icons">chevron_left</span>
                        </button>
                        <button className="bron-img-nav bron-img-nav--next" onClick={next} aria-label="Järgmine pilt">
                            <span className="material-icons">chevron_right</span>
                        </button>
                        <div className="bron-galerii__counter">{idx + 1} / {pildid.length}</div>
                    </>
                )}
            </div>

            {/* Thumbnailid */}
            {pildid.length > 1 && (
                <div className="bron-galerii__thumbs">
                    {pildid.map((src, i) => (
                        <button
                            key={i}
                            className={`bron-galerii__thumb${i === idx ? ' active' : ''}`}
                            onClick={() => setIdx(i)}
                            aria-label={`Pilt ${i + 1}`}
                        >
                            <img src={src} alt={`${alt} — pisipilt ${i + 1}`}
                                onError={e => { e.target.src = VAIKIMISI[0]; }} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
