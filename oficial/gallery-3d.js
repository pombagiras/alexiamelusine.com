/* ==========================================================================
   🥀 GALERIA DE TRANSIÇÃO 3D CYLINDRICAL CAROUSEL (VANILLA JS 60FPS)
   Engenharia gráfica de alto desempenho sem dependência de transpilação externa
   ========================================================================== */

(function () {
    const GALLERY_ITEMS = [
        {
            id: 1,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/Al%C3%AA%20(2).png",
            title: "Alê (II)",
            desc: "Expressão & Identidade",
            caption: "Alê (II) — Expressão e Identidade"
        },
        {
            id: 2,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/Al%C3%AA%20(3).png",
            title: "Alê (III)",
            desc: "O Despertar da Alma",
            caption: "Alê (III) — O Despertar da Alma"
        },
        {
            id: 3,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2023%20de%20dez.%20de%202025%2C%2013_50_31.png",
            title: "Matriz Carmesim",
            desc: "Dezembro de 2025",
            caption: "Matriz Carmesim — Dezembro de 2025"
        },
        {
            id: 4,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2023%20de%20dez.%20de%202025%2C%2013_54_19.png",
            title: "Visceral & Técnica",
            desc: "Direção de Imagem",
            caption: "Visceral & Tecnológica — Direção de Imagem"
        },
        {
            id: 5,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2023%20de%20dez.%20de%202025%2C%2013_56_22.png",
            title: "Reflexos nas Sombras",
            desc: "Dualidade Gótica",
            caption: "Reflexos nas Sombras — A Dualidade Gótica"
        },
        {
            id: 6,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2023%20de%20dez.%20de%202025%2C%2013_57_28.png",
            title: "Olhar da Esquerda",
            desc: "Proteção e Força",
            caption: "O Olhar da Esquerda — Proteção e Força"
        },
        {
            id: 7,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2025%20de%20dez.%20de%202025%2C%2015_41_02.png",
            title: "Manifestação Física",
            desc: "Natal de 2025",
            caption: "Manifestação Física — Natal de 2025"
        },
        {
            id: 8,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2025%20de%20dez.%20de%202025%2C%2017_49_49.png",
            title: "Capa do Útero",
            desc: "Beleza Fêmea",
            caption: "A Capa do Útero Transmutada — Beleza Fêmea"
        },
        {
            id: 9,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2025_12_2025%2C%2017_32_47.png",
            title: "Lógica Hermética",
            desc: "Desenho do Destino",
            caption: "Lógica Hermética — O Desenho do Destino"
        },
        {
            id: 10,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2025_12_2025%2C%2017_34_32.png",
            title: "Equilíbrio de Libra",
            desc: "Justiça & Simetria",
            caption: "Equilíbrio de Libra — Justiça e Simetria"
        },
        {
            id: 11,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2025_12_2025%2C%2017_36_45.png",
            title: "Transgressão de Gênero",
            desc: "Livre & Altiva",
            caption: "Transgressão de Gênero — Livre e Altiva"
        },
        {
            id: 12,
            full: "https://raw.githubusercontent.com/alexialuzdeferro/card-photos/refs/heads/main/ChatGPT%20Image%2025%20de%20dez.%20de%202025%2C%2017_46_21.png",
            title: "Mutação Plena",
            desc: "Irreversível & Plena",
            caption: "A Mutação Plena e Irreversível"
        }
    ];

    function initCylindricalGallery() {
        const root = document.getElementById('transition-gallery-3d-root');
        if (!root) return;

        root.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'gallery-3d-stage';
        container.style.cssText = `
            position: relative;
            width: 100%;
            padding: 2.5rem 0;
            overflow: hidden;
            user-select: none;
            cursor: grab;
            perspective: 1200px;
            touch-action: pan-y;
        `;

        const cylinder = document.createElement('div');
        cylinder.className = 'gallery-3d-cylinder';
        cylinder.style.cssText = `
            position: relative;
            width: 100%;
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform-style: preserve-3d;
            transition: transform 0.1s ease-out;
        `;

        container.appendChild(cylinder);

        const footerHint = document.createElement('div');
        footerHint.style.cssText = `
            margin-top: 1.5rem;
            text-align: center;
            font-size: 0.75rem;
            letter-spacing: 0.15em;
            color: #d4af37;
            text-transform: uppercase;
            font-weight: 600;
            opacity: 0.85;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        `;
        footerHint.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i> Arraste ou deslize para explorar a galeria 3D`;
        container.appendChild(footerHint);

        root.appendChild(container);

        const cardElements = [];
        const totalCards = GALLERY_ITEMS.length;
        const angleStep = 360 / totalCards;

        GALLERY_ITEMS.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-3d-card';
            card.setAttribute('data-full', item.full);
            card.setAttribute('data-caption', item.caption);
            card.style.cssText = `
                position: absolute;
                width: 240px;
                height: 370px;
                border-radius: 20px;
                padding: 0.85rem;
                background: linear-gradient(135deg, rgba(61, 5, 12, 0.45) 0%, rgba(20, 2, 5, 0.65) 100%);
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                border: 1px solid rgba(226, 180, 189, 0.22);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(92, 10, 21, 0.3);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                cursor: pointer;
                overflow: hidden;
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                transform-style: preserve-3d;
            `;

            card.innerHTML = `
                <div style="position: relative; width: 100%; height: 265px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(250, 246, 238, 0.1);">
                    <img src="${item.full}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(60%) brightness(0.85); transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s ease;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(36, 2, 6, 0.85) 0%, rgba(61, 5, 12, 0.15) 50%, transparent 100%); opacity: 0.8;"></div>
                </div>
                <div style="padding: 0.5rem 0.3rem 0.2rem 0.3rem; display: flex; flex-direction: column;">
                    <span style="font-family: 'Fraunces', serif; font-size: 1.15rem; font-weight: 700; color: #faf6ee; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${item.title}</span>
                    <span style="font-family: 'Geist', sans-serif; font-size: 0.8rem; color: #e2b4bd; margin-top: 0.25rem; font-weight: 500; letter-spacing: 0.02em;">${item.desc}</span>
                </div>
            `;

            const imgEl = card.querySelector('img');

            card.addEventListener('mouseenter', () => {
                imgEl.style.filter = 'grayscale(0%) brightness(1.1) saturate(1.15)';
                imgEl.style.transform = 'scale(1.08)';
                card.style.borderColor = 'rgba(212, 175, 55, 0.85)';
                card.style.background = 'linear-gradient(135deg, rgba(92, 10, 21, 0.65) 0%, rgba(36, 2, 6, 0.85) 100%)';
                card.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(158, 12, 27, 0.6), inset 0 1px 0 rgba(252, 211, 77, 0.4)';
            });

            card.addEventListener('mouseleave', () => {
                imgEl.style.filter = 'grayscale(60%) brightness(0.85)';
                imgEl.style.transform = 'scale(1)';
                card.style.borderColor = 'rgba(226, 180, 189, 0.22)';
                card.style.background = 'linear-gradient(135deg, rgba(61, 5, 12, 0.45) 0%, rgba(20, 2, 5, 0.65) 100%)';
                card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(92, 10, 21, 0.3)';
            });

            card.addEventListener('click', () => {
                if (isDraggingState) return;
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                const lightboxCaption = document.getElementById('lightbox-caption');

                if (lightbox && lightboxImg && lightboxCaption) {
                    lightboxImg.src = item.full;
                    lightboxCaption.textContent = item.caption;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });

            cylinder.appendChild(card);
            cardElements.push({ element: card, index: index });
        });

        let currentAngle = 0;
        let velocity = 0.12; 
        let isDragging = false;
        let isDraggingState = false;
        let startX = 0;
        let lastX = 0;
        let isHovered = false;
        let tiltX = 0;
        let tiltY = 0;

        function getRadius() {
            const w = window.innerWidth;
            if (w < 640) return 250;
            if (w < 1024) return 380;
            return 500;
        }

        function render60FPS() {
            if (!isDragging) {
                if (Math.abs(velocity) > 0.12) {
                    velocity *= 0.95; 
                } else if (!isHovered) {
                    velocity = 0.12; 
                } else {
                    velocity *= 0.92;
                }
                currentAngle += velocity;
            }

            const radius = getRadius();
            cylinder.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

            cardElements.forEach(item => {
                const angle = angleStep * item.index + currentAngle;
                const rad = (angle * Math.PI) / 180;

                const x = Math.sin(rad) * radius;
                const z = Math.cos(rad) * radius;
                const rotationY = angle;

                const normalizedZ = (z + radius) / (2 * radius);
                const opacity = Math.max(0.15, Math.min(1, Math.pow(normalizedZ, 1.8)));
                const scale = 0.7 + normalizedZ * 0.35;

                item.element.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateY(${rotationY}deg) scale(${scale})`;
                item.element.style.opacity = opacity;
                item.element.style.zIndex = Math.round(z + radius);
            });

            requestAnimationFrame(render60FPS);
        }

        requestAnimationFrame(render60FPS);

        function handlePointerDown(e) {
            isDragging = true;
            isDraggingState = false;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            lastX = startX;
            container.style.cursor = 'grabbing';
        }

        function handlePointerMove(e) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const normX = (clientX - centerX) / (rect.width / 2);
            const normY = (clientY - centerY) / (rect.height / 2);
            tiltX = -normY * 10;
            tiltY = normX * 10;

            if (isDragging) {
                const deltaX = clientX - lastX;
                if (Math.abs(clientX - startX) > 5) {
                    isDraggingState = true;
                }
                const sensitivity = window.innerWidth < 640 ? 0.35 : 0.25;
                currentAngle += deltaX * sensitivity;
                velocity = deltaX * sensitivity * 0.8;
                lastX = clientX;
            }
        }

        function handlePointerUp() {
            isDragging = false;
            container.style.cursor = 'grab';
        }

        container.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);

        container.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp);

        container.addEventListener('mouseenter', () => { isHovered = true; });
        container.addEventListener('mouseleave', () => {
            isHovered = false;
            tiltX = 0;
            tiltY = 0;
            handlePointerUp();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCylindricalGallery);
    } else {
        initCylindricalGallery();
    }
})();
