/* =====================================================
   CASCADIA WILDLIFE LAB — MAIN JAVASCRIPT
   ===================================================== */

(function () {
  'use strict';

  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Respect an explicit data-saver preference before pulling down video.
  const conn = navigator.connection || {};
  const saveData = conn.saveData === true;

  /* --------------------------------------------------
     NAV: scroll-aware background
     -------------------------------------------------- */
  if (nav && !nav.classList.contains('scrolled')) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* --------------------------------------------------
     NAV: mobile toggle
     -------------------------------------------------- */
  if (toggle && links) {
    const closeNav = () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // close on any link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeNav);
    });

    // close on outside click
    document.addEventListener('click', e => {
      if (nav && !nav.contains(e.target)) closeNav();
    });

    // close on Escape, and hand focus back to the toggle
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* --------------------------------------------------
     SMOOTH SCROLL for anchor links on the same page
     -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      // Section elements are not focusable by default, so keyboard focus
      // would otherwise stay behind at the link that was just activated.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* --------------------------------------------------
     SCROLL REVEAL via IntersectionObserver
     -------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      // No animation wanted (or possible) — show everything immediately.
      revealEls.forEach(el => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // fire once
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach(el => observer.observe(el));
    }
  }

  /* --------------------------------------------------
     VIDEO: play only while on screen.
     The clips are decorative, so when motion is unwanted
     or data is precious we just leave the poster up.
     -------------------------------------------------- */
  const lazyVideos = document.querySelectorAll('video[autoplay]');

  if (reduceMotion || saveData) {
    lazyVideos.forEach(v => {
      v.removeAttribute('autoplay');
      v.pause();
    });
  } else if ('IntersectionObserver' in window && lazyVideos.length) {
    const videoObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {}); // ignore autoplay policy errors silently
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    lazyVideos.forEach(v => videoObserver.observe(v));
  }

  /* --------------------------------------------------
     NAV: highlight active section
     -------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navAnchors.forEach(a => {
              a.classList.toggle(
                'active',
                a.getAttribute('href') === '#' + entry.target.id
              );
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => sectionObserver.observe(s));
  }

  /* --------------------------------------------------
     VIDEO EMBEDS: click to load
     The thumbnail is a plain image until someone presses
     play, so no YouTube script or cookie reaches a visitor
     who never watches anything. It also keeps three
     embeds from costing three page-loads' worth of weight.
     -------------------------------------------------- */
  document.querySelectorAll('.video-thumb[data-video-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.videoId;
      if (!id) return;

      const frame = document.createElement('iframe');
      frame.className = 'video-thumb-frame';
      // youtube-nocookie.com would be the privacy-preferable host, but its
      // player fails here with "Error 153 — Video Player Configuration Error".
      // Since the embed only loads after an explicit click, the visitor has
      // already chosen to load YouTube, so the practical difference is small.
      frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(id) +
                  '?autoplay=1&rel=0';
      frame.title = btn.getAttribute('aria-label') || 'Video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;

      btn.replaceWith(frame);
      frame.focus({ preventScroll: true });
    });
  });

  /* --------------------------------------------------
     FOOTER: keep the copyright year current
     -------------------------------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();
