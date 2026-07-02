/* ==========================================================================
   🥀 OFICIAL - SCRIPT.JS
   Interações premium, abas responsivas, cursor customizado e utilitários.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Oficial Alexia Melusine Page initialized.');

    // Detectar Dispositivo Touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    /* ==========================================================================
       1. Cursor Customizado Interativo (Apenas Desktop)
       ========================================================================== */
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');

    if (!isTouchDevice && cursor && cursorDot) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // O ponto segue o mouse instantaneamente
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Loop de animação suave para o círculo externo do cursor
        const animateCursor = () => {
            // Interpolação linear (lag suave)
            const ease = 0.15;
            cursorX += (mouseX - cursorX) * ease;
            cursorY += (mouseY - cursorY) * ease;

            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;

            requestAnimationFrame(animateCursor);
        };
        requestAnimationFrame(animateCursor);

        // Feedback visual ao entrar e sair da janela
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorDot.style.opacity = '0';
        });

        // Expandir cursor ao passar sobre elementos interativos
        const interactiveElements = document.querySelectorAll('a, button, .tab-btn, .copy-email-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '48px';
                cursor.style.height = '48px';
                cursor.style.borderColor = 'var(--clr-red)';
                cursor.style.backgroundColor = 'rgba(168, 12, 30, 0.1)';
            });

            el.addEventListener('mouseleave', () => {
                cursor.style.width = '28px';
                cursor.style.height = '28px';
                cursor.style.borderColor = 'var(--clr-brass)';
                cursor.style.backgroundColor = 'transparent';
            });
        });
    }

    /* ==========================================================================
       2. Navegação por Abas (Ecossistema de Links)
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Haptic Feedback suave no clique das abas
            triggerHapticFeedback(40);

            // Remover classes ativas de todas as abas
            tabButtons.forEach(button => button.classList.remove('active-tab'));
            tabPanels.forEach(panel => {
                panel.classList.remove('active-panel');
                // Pequeno delay para ocultar no display
                setTimeout(() => {
                    if (!panel.classList.contains('active-panel')) {
                        panel.style.display = 'none';
                    }
                }, 150);
            });

            // Adicionar classes ativas na aba clicada
            btn.classList.add('active-tab');
            const activePanel = document.getElementById(targetTab);
            
            if (activePanel) {
                activePanel.style.display = 'block';
                // Trigger reflow para iniciar a transição de opacidade
                activePanel.offsetHeight;
                activePanel.classList.add('active-panel');
            }
        });
    });

    // Inicializar o estado das abas: mostrar apenas a primeira ativa
    tabPanels.forEach((panel, idx) => {
        if (idx === 0) {
            panel.style.display = 'block';
            panel.classList.add('active-panel');
        } else {
            panel.style.display = 'none';
        }
    });

    /* ==========================================================================
       3. Copiar E-mail para a Área de Transferência
       ========================================================================== */
    const copyEmailBtns = document.querySelectorAll('.copy-email-btn');

    copyEmailBtns.forEach(btn => {
        const email = btn.getAttribute('data-email');
        const tooltip = btn.querySelector('.copy-tooltip');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            navigator.clipboard.writeText(email).then(() => {
                triggerHapticFeedback(50);

                if (tooltip) {
                    tooltip.textContent = 'E-mail Copiado!';
                    tooltip.classList.add('copied');
                }

                // Resetar o tooltip após 2.5 segundos
                setTimeout(() => {
                    if (tooltip) {
                        tooltip.textContent = 'Copiar E-mail';
                        tooltip.classList.remove('copied');
                    }
                }, 2500);
            }).catch(err => {
                console.error('Erro ao copiar e-mail: ', err);
            });
        });
    });

    /* ==========================================================================
       4. Animações de Entrada de Rolagem (Scroll Reveal)
       ========================================================================== */
    const scrollAnimateElements = document.querySelectorAll('.scroll-animate');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target); // Animou uma vez, não observa mais
                }
            });
        }, observerOptions);

        scrollAnimateElements.forEach(el => observer.observe(el));
    } else {
        // Fallback se o navegador for antigo
        scrollAnimateElements.forEach(el => el.classList.add('active'));
    }

    /* ==========================================================================
       5. Web Audio API Synthesizer (Sons Dinâmicos)
       ========================================================================== */
    let audioCtx = null;

    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    // Registrar eventos para inicializar áudio por segurança (políticas de autoplay)
    ['click', 'touchstart', 'mousemove'].forEach(evt => {
        document.addEventListener(evt, initAudio, { once: true });
    });

    const playSynthHover = () => {
        if (!audioCtx) return;
        initAudio();
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    };

    const playSynthPop = () => {
        if (!audioCtx) return;
        initAudio();
        
        const now = audioCtx.currentTime;
        
        // Oscilador 1: Onda Senoidal profunda (frequência fundamental)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.exponentialRampToValueAtTime(80, now + 0.5);
        gain1.gain.setValueAtTime(0.06, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        
        // Oscilador 2: Onda Triangular (harmônico e textura gótica/ressonante)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(100, now);
        osc2.frequency.exponentialRampToValueAtTime(50, now + 0.6);
        gain2.gain.setValueAtTime(0.03, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.6);
        osc2.stop(now + 0.6);
    };

    const playSynthClose = () => {
        if (!audioCtx) return;
        initAudio();
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    };

    /* ==========================================================================
       6. Controle do Lightbox Modal (Foto Saltando)
       ========================================================================== */
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (galleryCards && lightbox) {
        galleryCards.forEach(card => {
            // Hover sound
            card.addEventListener('mouseenter', () => {
                if (!isTouchDevice) {
                    playSynthHover();
                }
            });

            // Clique: Foto saltando na tela
            card.addEventListener('click', () => {
                const fullSrc = card.getAttribute('data-full');
                const captionText = card.getAttribute('data-caption');

                lightboxImg.src = fullSrc;
                lightboxCaption.textContent = captionText;

                // Som de pop
                playSynthPop();
                // Haptic Feedback
                triggerHapticFeedback(60);

                // Ativar modal
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // impede scroll de fundo
            });
        });

        // Fechar modal
        const closeModal = () => {
            playSynthClose();
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // restaura scroll
            setTimeout(() => {
                lightboxImg.src = '';
                lightboxCaption.textContent = '';
            }, 500); // tempo da transição CSS
        };

        lightboxClose.addEventListener('click', closeModal);
        lightbox.addEventListener('click', (e) => {
            // Fechar se clicar fora da imagem
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeModal();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeModal();
            }
        });
    }

    /* ==========================================================================
       7. Utilitários
       ========================================================================== */
    function triggerHapticFeedback(duration) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
});
