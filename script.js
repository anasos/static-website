// Lightweight scroll reveal + mobile menu toggle (no frameworks)

(function () {
  // Scroll reveal: add .reveal to common elements then observe
  const selectors = [
    '.hero-copy',
    '.hero-visual',
    '.section-title',
    '.eyebrow',
    '.service-card',
    '.step',
    '.work-card',
    '.why-feat',
    '.why-logo',
    '.cta-banner',
  ];
  const targets = document.querySelectorAll(selectors.join(','));
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 8) * 60 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('in'));
  }

  // Mobile menu toggle (basic show/hide of nav-links overlay)
  const toggle = document.querySelector('[data-testid="menu-toggle"]');
  const links = document.querySelector('[data-testid="primary-nav"]');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });
    // Close on link click
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      })
    );
  }
})();