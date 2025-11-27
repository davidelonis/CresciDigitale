// ===========================
// Mobile Menu Toggle
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    mobileToggle.addEventListener('click', function() {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar')) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ===========================
// Navbar Scroll Effect
// ===========================
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===========================
// Smooth Scroll for Anchor Links
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if href is just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// Counter Animation for Stats
// ===========================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateCounter(entry.target, target);
            entry.target.classList.add('counted');
        }
    });
}, observerOptions);

// Observe all stat numbers
document.querySelectorAll('.stat-number').forEach(stat => {
    counterObserver.observe(stat);
});

// ===========================
// Scroll Reveal Animation
// ===========================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe elements for reveal animation
const revealElements = document.querySelectorAll('.service-card, .training-card, .about-content, .contact-wrapper');
revealElements.forEach(el => {
    revealObserver.observe(el);
});

// ===========================
// Form Handling
// ===========================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Here you would typically send the data to your backend
        console.log('Form submitted:', data);

        // Show success message
        showNotification('Grazie per averci contattato! Ti risponderemo al più presto.', 'success');

        // Reset form
        contactForm.reset();
    });
}

// ===========================
// Notification System
// ===========================
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        backgroundColor: type === 'success' ? '#48bb78' : '#f56565',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '400px'
    });

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Active Nav Link on Scroll
// ===========================
const sections = document.querySelectorAll('section[id]');
const navLinksForActive = document.querySelectorAll('.nav-link[href^="#"]');

function activateNavLink() {
    let current = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinksForActive.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', activateNavLink);

// ===========================
// Parallax Effect for Hero Background
// ===========================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero && scrolled < hero.offsetHeight) {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }
});


// ===========================
// Loading Animation
// ===========================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');

    // Trigger initial animations
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.animation = 'fadeInUp 0.8s ease-out';
        }
    }, 100);
});

// ===========================
// Prevent animations on page resize
// ===========================
let resizeTimer;
window.addEventListener('resize', function() {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

// Add style to stop animations during resize
const resizeStyle = document.createElement('style');
resizeStyle.textContent = `
    .resize-animation-stopper * {
        animation: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(resizeStyle);

// ===========================
// 3D Interactive Nebula Mouse Tracking
// ===========================
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

// Smooth mouse tracking
document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Animate nebulae with parallax effect
function animateNebulae() {
    // Smooth interpolation for fluid movement
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    const nebula1 = document.querySelector('.nebula-1');
    const nebula2 = document.querySelector('.nebula-2');
    const nebula3 = document.querySelector('.nebula-3');

    if (nebula1 && window.innerWidth > 834) { // Only on desktop
        const moveX1 = (targetX - window.innerWidth / 2) * 0.02;
        const moveY1 = (targetY - window.innerHeight / 2) * 0.02;
        nebula1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
    }

    if (nebula2 && window.innerWidth > 834) {
        const moveX2 = (targetX - window.innerWidth / 2) * 0.015;
        const moveY2 = (targetY - window.innerHeight / 2) * 0.015;
        nebula2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
    }

    if (nebula3 && window.innerWidth > 834) {
        const moveX3 = (targetX - window.innerWidth / 2) * 0.025;
        const moveY3 = (targetY - window.innerHeight / 2) * 0.025;
        nebula3.style.transform = `translate(${moveX3}px, ${moveY3}px)`;
    }

    requestAnimationFrame(animateNebulae);
}

// Start animation
if (window.innerWidth > 834) {
    animateNebulae();
}

// ===========================
// Cursor Light Effect
// ===========================
const cursorLight = document.querySelector('.cursor-light');

if (cursorLight && window.innerWidth > 834) {
    document.addEventListener('mousemove', function(e) {
        cursorLight.style.left = e.clientX - 200 + 'px';
        cursorLight.style.top = e.clientY - 200 + 'px';
        cursorLight.style.opacity = '1';
    });

    // Hide cursor light when leaving the page
    document.addEventListener('mouseleave', function() {
        cursorLight.style.opacity = '0';
    });
}

// ===========================
// 3D Card Hover with Mouse Tracking
// ===========================
const interactiveCards = document.querySelectorAll('.service-card, .training-card');

interactiveCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 834) return; // Skip on mobile

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage position
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // Set CSS custom properties for the gradient effect
        card.style.setProperty('--mouse-x', `${xPercent}%`);
        card.style.setProperty('--mouse-y', `${yPercent}%`);

        // 3D tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        const rotateY = deltaX * 8; // Adjust intensity
        const rotateX = -deltaY * 8;

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-10px)
            scale3d(1.02, 1.02, 1.02)
        `;
    });

    card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
    });
});

// ===========================
// 3D Elements Parallax Scroll
// ===========================
function handleParallax3D() {
    if (window.innerWidth <= 834) return; // Skip on mobile

    const parallaxElements = document.querySelectorAll('.parallax-3d');
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(element => {
        const speed = parseFloat(element.getAttribute('data-speed')) || 0.3;
        const yPos = -(scrolled * speed);

        element.style.transform = `translateY(${yPos}px)`;
    });
}

// Throttle scroll event for performance
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            handleParallax3D();
            ticking = false;
        });
        ticking = true;
    }
});

// ===========================
// Scroll-Triggered Animations for 3D Elements
// ===========================
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, observerOptions);

// Observe all 3D geometric elements
document.querySelectorAll('.geometric-3d').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px) scale(0.9)';
    element.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(element);
});

// ===========================
// Motion Trail Effect for Organic Blob Shapes
// ===========================
const blobShapes = document.querySelectorAll('.geometric-3d');

blobShapes.forEach(blob => {
    let isHovering = false;
    let trail = null;

    blob.addEventListener('mouseenter', function(e) {
        if (window.innerWidth <= 834) return; // Skip on mobile
        isHovering = true;

        // Create trail element
        if (!trail) {
            trail = document.createElement('div');
            trail.className = 'blob-trail';
            Object.assign(trail.style, {
                position: 'absolute',
                width: this.offsetWidth + 'px',
                height: this.offsetHeight + 'px',
                borderRadius: this.style.borderRadius || '63% 37% 54% 46% / 55% 48% 52% 45%',
                background: window.getComputedStyle(this).background,
                opacity: '0.3',
                pointerEvents: 'none',
                zIndex: '-1',
                filter: 'blur(20px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            });
            this.parentElement.appendChild(trail);
        }

        // Position trail behind the blob
        const rect = this.getBoundingClientRect();
        const parentRect = this.parentElement.getBoundingClientRect();
        trail.style.left = (rect.left - parentRect.left) + 'px';
        trail.style.top = (rect.top - parentRect.top) + 'px';
    });

    blob.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 834 || !isHovering) return;

        // Get mouse position relative to blob
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Apply subtle movement based on mouse position
        const moveX = x * 0.15;
        const moveY = y * 0.15;

        // Update blob position
        this.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.08) rotate(5deg)`;

        // Update trail with delay
        if (trail) {
            setTimeout(() => {
                trail.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px) scale(1.05)`;
            }, 100);
        }
    });

    blob.addEventListener('mouseleave', function() {
        isHovering = false;

        // Reset blob transform
        this.style.transform = '';

        // Fade out and remove trail
        if (trail) {
            trail.style.opacity = '0';
            trail.style.transform = '';
            setTimeout(() => {
                if (trail && trail.parentElement) {
                    trail.remove();
                    trail = null;
                }
            }, 500);
        }
    });
});

// ===========================
// Micro-Animations on Hover
// ===========================
const hoverElements = document.querySelectorAll('.btn, .service-card, .training-card, .nav-link');

hoverElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
});

// ===========================
// Console Welcome Message
// ===========================
console.log('%cCresciDigitale', 'font-size: 3em; font-weight: bold; background: linear-gradient(90deg, #FF6B35 0%, #B8458D 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cFormazione che Trasforma', 'font-size: 1.2em; color: #FF6B35;');
console.log('%cInteressato a lavorare con noi? Contattaci a info@crescidigitale.it', 'color: #B8458D;');
