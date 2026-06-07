// JavaScript functionality for Pride 2026

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pride 2026 initialized successfully.');
    
    // Set initial active state for first accordion if any
    const activeAccordions = document.querySelectorAll('.accordion-btn.active');
    activeAccordions.forEach(btn => {
        const content = btn.nextElementSibling;
        if (content) {
            content.classList.add('open');
            content.style.maxHeight = content.scrollHeight + "px";
            content.style.paddingBottom = "1.5rem";
        }
    });

    // Initialize interactive canvas glitter effect
    initGlitterCanvas();

    // Initialize evolution slideshow
    initEvolutionSlideshow();
});

/* ==========================================================================
   1. Dynamic Accordion Panels (Smooth Height Transitions)
   ========================================================================== */

function toggleAccordion(button) {
    if (!button) return;
    
    // Toggle active class on the button itself
    button.classList.toggle('active');
    
    // Get the next sibling element which is the accordion content wrapper
    const content = button.nextElementSibling;
    if (!content) return;
    
    // Toggle the 'open' class
    content.classList.toggle('open');
    
    if (content.classList.contains('open')) {
        // Calculate exact scroll height dynamically for a premium smooth animation
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.paddingBottom = "1.5rem";
    } else {
        content.style.maxHeight = null;
        content.style.paddingBottom = "0";
    }
}

// Keep accordion heights synced if the browser window size changes (e.g. rotating mobile screen)
window.addEventListener('resize', () => {
    document.querySelectorAll('.accordion-content.open').forEach(content => {
        content.style.maxHeight = content.scrollHeight + "px";
    });
});

/* ==========================================================================
   2. Glitter Confetti/Sparkles Click Effect (Purpurina Canvas)
   ========================================================================== */

let canvas, ctx;
let particles = [];
const transColors = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#9C59D1', '#FCF434'];

function initGlitterCanvas() {
    canvas = document.getElementById('glitterCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Listen for click events anywhere on the document
    document.addEventListener('click', (e) => {
        // Ignore clicks on links or buttons to avoid visual interference
        if (e.target.closest('a') || e.target.closest('button')) {
            createGlitterBurst(e.clientX, e.clientY, 10);
            return;
        }
        createGlitterBurst(e.clientX, e.clientY, 20);
    });
    
    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // Gravity
            p.vx *= 0.98; // Friction
            p.life--;
            
            // Draw particle as a sparkling diamond shape
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.7, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.7, 0);
            ctx.closePath();
            
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fill();
            ctx.restore();
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createGlitterBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 6 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2, // Slight upward force
            size: Math.random() * 6 + 3,
            color: transColors[Math.floor(Math.random() * transColors.length)],
            rotation: Math.random() * Math.PI,
            life: Math.random() * 30 + 30,
            maxLife: 60
        });
    }
}

/* ==========================================================================
   3. Evolution Slideshow Logic (Interactive & Auto-playing)
   ========================================================================== */

function initEvolutionSlideshow() {
    const slideshow = document.querySelector('.evolution-slideshow-container');
    if (!slideshow) return;

    const slides = slideshow.querySelectorAll('.evolution-slide');
    const prevBtn = slideshow.querySelector('.prev-btn');
    const nextBtn = slideshow.querySelector('.next-btn');
    const progressBar = slideshow.querySelector('.evolution-progress-bar');
    const dotsContainer = slideshow.querySelector('.evolution-dots-container');

    let currentIndex = 0;
    let progressInterval = null;
    const slideDuration = 4000; // 4 seconds per slide
    const progressUpdateInterval = 50; // Update progress bar every 50ms
    let progressTimeElapsed = 0;
    let isHovered = false;

    // Create dot indicators dynamically
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `evolution-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.evolution-dot');

    function updateSlides() {
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Reset progress bar animation
        progressTimeElapsed = 0;
        if (progressBar) progressBar.style.width = '0%';
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlides();
    }

    function startAutoplay() {
        stopAutoplay();
        
        // Start progress bar interval
        progressInterval = setInterval(() => {
            if (!isHovered) {
                progressTimeElapsed += progressUpdateInterval;
                const percentage = Math.min((progressTimeElapsed / slideDuration) * 100, 100);
                if (progressBar) progressBar.style.width = `${percentage}%`;

                if (progressTimeElapsed >= slideDuration) {
                    nextSlide();
                }
            }
        }, progressUpdateInterval);
    }

    function stopAutoplay() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    // Set up manual navigation listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
        });
    }

    // Pause autoplay on mouse hover
    slideshow.addEventListener('mouseenter', () => {
        isHovered = true;
    });

    slideshow.addEventListener('mouseleave', () => {
        isHovered = false;
    });

    // Handle touch gestures for swipe functionality on mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    slideshow.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isHovered = true;
    }, { passive: true });

    slideshow.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        isHovered = false;
        handleGesture();
    }, { passive: true });

    function handleGesture() {
        const threshold = 50; // swipe minimum distance in pixels
        if (touchStartX - touchEndX > threshold) {
            nextSlide(); // Swipe left -> next slide
        } else if (touchEndX - touchStartX > threshold) {
            prevSlide(); // Swipe right -> prev slide
        }
    }

    // Start everything
    updateSlides();
    startAutoplay();
}

/* ==========================================================================
   4. Simple Toast Notifications Helper
   ========================================================================== */

function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 400);
    }, 3500);
}
