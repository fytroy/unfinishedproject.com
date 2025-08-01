document.addEventListener("DOMContentLoaded", () => {

    // --- Sticky Header Logic ---
    const header = document.querySelector('.main-header');
    const heroSection = document.querySelector('.hero-section');
    const headerHeight = header.offsetHeight;

    window.addEventListener('scroll', () => {
        if (window.scrollY > heroSection.offsetHeight - headerHeight) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Scroll-in Animations with Intersection Observer ---
    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.1 // 10% of the element must be visible to trigger
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the animation class when the element is visible
                entry.target.classList.add('is-visible');
                // Stop observing the element after it has been animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with the 'fade-in' class to observe
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(el => observer.observe(el));
});