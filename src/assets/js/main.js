  // Scroll reveal
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('vis'), i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Nav scroll state
  const nav = document.getElementById('navbar');
  if (nav) {
    let tick = false;
    window.addEventListener('scroll', () => {
      if (!tick) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 50);
          tick = false;
        });
        tick = true;
      }
    });
  }

  // Hamburger menu
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      hamburger.classList.toggle('open');
    });
  }

  // Smooth scroll
  document.querySelectorAll('.nav-scroll').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navMenu) navMenu.classList.remove('mobile-open');
      if (hamburger) hamburger.classList.remove('open');
    });
  });

  // Resume modal
  const resumeModal = document.getElementById('resumeModal');
  const resumeViewBtn = document.getElementById('resumeViewBtn');
  const resumeModalClose = document.getElementById('resumeModalClose');
  const resumeModalIframe = document.getElementById('resumeModalIframe');

  function openResumeModal() {
    if (!resumeModal || !resumeModalIframe) return;
    const pdfPath = document.querySelector('a[download="Daniel-Magro-Resume.pdf"]');
    const src = pdfPath ? pdfPath.getAttribute('href') : 'Daniel%20Magro%20Resume.pdf';
    resumeModalIframe.src = src;
    resumeModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    resumeModalClose?.focus();
  }

  function closeResumeModal() {
    if (!resumeModal || !resumeModalIframe) return;
    resumeModal.classList.remove('open');
    resumeModalIframe.src = '';
    document.body.style.overflow = '';
  }

  resumeViewBtn?.addEventListener('click', openResumeModal);
  resumeModalClose?.addEventListener('click', closeResumeModal);
  resumeModal?.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResumeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal?.classList.contains('open')) closeResumeModal();
  });

  // Screenshot carousels
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    if (slides.length <= 1) return;

    const dots = [...carousel.querySelectorAll('.carousel-dot')];
    const interval = parseInt(carousel.dataset.interval || '5000', 10);
    let current = 0;
    let timer = null;
    let paused = false;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      if (reducedMotion || paused) return;
      stop();
      timer = setInterval(next, interval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(parseInt(dot.dataset.goto, 10));
        start();
      });
    });

    carousel.addEventListener('mouseenter', () => { paused = true; stop(); });
    carousel.addEventListener('mouseleave', () => { paused = false; start(); });
    carousel.addEventListener('focusin', () => { paused = true; stop(); });
    carousel.addEventListener('focusout', () => { paused = false; start(); });

    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); start(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); start(); }
    });

    start();
  });
