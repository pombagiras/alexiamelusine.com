document.addEventListener('DOMContentLoaded', () => {
    // 1. Mouse Glow Tracker Effect (Desktop Only)
    const cursorGlow = document.getElementById('cursor-glow');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorGlow) {
        document.body.addEventListener('mouseenter', () => {
            cursorGlow.style.opacity = '1';
        });

        document.body.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });

        document.body.addEventListener('mousemove', (e) => {
            // Using requestAnimationFrame for smooth performance
            window.requestAnimationFrame(() => {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY + window.scrollY}px`;
            });
        });
    }

    // 2. Safe Haptic Feedback Trigger
    const hapticButtons = document.querySelectorAll('.haptic-btn');
    
    hapticButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if ('vibrate' in navigator) {
                // Trigger a 40ms subtle vibration for tactile confirmation
                navigator.vibrate(40);
            }
        });
    });

    // 3. Scroll Entrance Animations (Intersection Observer)
    const animElements = document.querySelectorAll('.scroll-animate');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.1 // triggers when 10% of element is visible
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animElements.forEach(el => el.classList.add('active'));
    }

    // 4. Subtle 3D Tilt Effect on Cards (Desktop Only)
    const cards = document.querySelectorAll('.card');
    
    if (!isTouchDevice) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // Mouse position inside element
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Max degrees of rotation
                const maxRotation = 4; 
                
                // Calculate rotation based on cursor distance from center
                const rotateX = ((centerY - y) / centerY) * maxRotation;
                const rotateY = ((x - centerX) / centerX) * maxRotation;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset card transform smoothly
                card.style.transform = '';
            });
        });
    }

    // 5. Click to Copy Email functionality
    const copyEmailBtns = document.querySelectorAll('.copy-email-btn');
    copyEmailBtns.forEach(btn => {
        const emailToCopy = btn.getAttribute('data-email');
        const tooltip = btn.querySelector('.copy-tooltip');
        
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(emailToCopy).then(() => {
                // Change tooltip text and style to success state
                if (tooltip) {
                    tooltip.textContent = 'E-mail Copiado!';
                    tooltip.classList.add('copied');
                }
                
                // Vibration feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate(30);
                }
                
                // Reset tooltip after 2.5 seconds
                setTimeout(() => {
                    if (tooltip) {
                        tooltip.textContent = 'Copiar e-mail';
                        tooltip.classList.remove('copied');
                    }
                }, 2500);
            }).catch(err => {
                console.error('Falha ao copiar e-mail: ', err);
            });
        });
    });
});

// 6. Mobile Toggle Expandable Content Function
function toggleExpand(btn) {
    const parent = btn.parentElement;
    const content = parent.querySelector('.expandable-content');
    
    if (!content) return;
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Continuar lendo';
    } else {
        content.classList.add('expanded');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Recolher texto';
    }

    if ('vibrate' in navigator) {
        navigator.vibrate(30);
    }
}
