(function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var siteNav = document.getElementById('site-nav');
  var currentYear = document.getElementById('current-year');
  var navLinks = document.querySelectorAll('.site-nav a');

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
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

    revealEls.forEach(function (el) {
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
  window.addEventListener('scroll', updateActiveNav);
})();
