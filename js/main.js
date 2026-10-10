(function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var siteNav = document.getElementById('site-nav');
  var currentYear = document.getElementById('current-year');
  var navLinks = document.querySelectorAll('.site-nav a');
  var progressBar = document.querySelector('.scroll-progress span');
  var heroLab = document.querySelector('.hero-lab');
  var bubbles = document.querySelectorAll('.bubble');
  var motionCards = document.querySelectorAll('.metric-card, .timeline-item, .project-card, .skill-board article');
  var ticking = false;
  var lastScrollY = window.scrollY;
  var scrollVelocity = 0;

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  function updateScrollMotion() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    scrollVelocity += (window.scrollY - lastScrollY - scrollVelocity) * 0.16;
    lastScrollY = window.scrollY;

    if (progressBar) {
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }

    if (heroLab) {
      heroLab.style.setProperty('--scroll-shift', Math.min(window.scrollY * 0.08, 34) + 'px');
    }

    bubbles.forEach(function (bubble, index) {
      var speed = 0.08 + index * 0.025;
      var drift = Math.sin(window.scrollY * 0.004 + index) * (8 + index * 2);
      bubble.style.setProperty('--bubble-y', window.scrollY * speed + drift + 'px');
      bubble.style.setProperty('--bubble-sway', drift + 'px');
    });

    motionCards.forEach(function (card, index) {
      var bounds = card.getBoundingClientRect();
      var distance = (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight;
      card.style.setProperty('--parallax-y', Math.max(-10, Math.min(10, distance * -10)) + 'px');
      card.style.setProperty('--parallax-rotate', Math.max(-1.2, Math.min(1.2, distance * 1.2)) + 'deg');
      card.style.setProperty('--scroll-breathe', Math.min(Math.abs(scrollVelocity) * 0.015, 0.35));
    });

    ticking = false;
  }

  function requestScrollMotion() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollMotion);
      ticking = true;
    }
  }

  updateScrollMotion();
  window.addEventListener('scroll', requestScrollMotion, { passive: true });

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach(function (el, index) {
      el.style.setProperty('--reveal-delay', (index % 4) * 70 + 'ms');
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  var metricNums = document.querySelectorAll('.metric-number');
  var metricsStarted = false;

  function formatValue(value) {
    if (value >= 1000) {
      return value.toLocaleString('en-US');
    }
    return String(value);
  }

  function animateMetrics() {
    if (metricsStarted) {
      return;
    }
    metricsStarted = true;

    metricNums.forEach(function (metric) {
      var target = Number(metric.getAttribute('data-target') || '0');
      var prefix = metric.getAttribute('data-prefix') || '';
      var suffix = metric.getAttribute('data-suffix') || '';
      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) {
          startTime = timestamp;
        }
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(target * eased);
        metric.textContent = prefix + formatValue(current) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  var metrics = document.getElementById('metrics');
  if (metrics && 'IntersectionObserver' in window) {
    var metricObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateMetrics();
            metricObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    metricObserver.observe(metrics);
  } else {
    animateMetrics();
  }

  var sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    var scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');
      var matching = document.querySelector('.site-nav a[href="#' + id + '"]');

      if (!matching) {
        return;
      }

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
        });
        matching.classList.add('active');
      }
    });
  }

  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive: true });
})();
