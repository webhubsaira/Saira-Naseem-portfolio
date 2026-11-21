/**
 * Saira Naseem | Full Stack Web Developer Portfolio
 * Script: js/script.js
 * Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // DOM Elements
  const navbar = document.getElementById('mainNavbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbarCollapse = document.getElementById('navbarResponsive');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const currentYearSpan = document.getElementById('currentYear');
  const contactForm = document.getElementById('portfolioContactForm');
  const formSuccessAlert = document.getElementById('formSuccessAlert');
  const formErrorAlert = document.getElementById('formErrorAlert');
  const formErrorText = document.getElementById('formErrorText');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  const revealElements = document.querySelectorAll('.reveal-item');
  const sectionElements = document.querySelectorAll('.section-reveal');
  const aboutSection = document.getElementById('about');
  const statNumbers = document.querySelectorAll('#about .stat-number');
  const experienceSection = document.getElementById('experience');
  const timelineContainer = document.querySelector('.timeline-container');

  // 1. Dynamic Copyright Year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // 2. Sticky Navbar on Scroll
  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (navbar) {
      if (scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. Scroll to Top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 4. Auto-collapse mobile navigation on click
  if (navbarCollapse) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }

  // 5. Project Category Filtering
  if (filterBtns.length > 0 && projectItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter') || 'all';

        projectItems.forEach(item => {
          const categories = (item.getAttribute('data-category') || '').split(' ');
          if (filterValue === 'all' || categories.includes(filterValue)) {
            item.classList.remove('project-filter-exit');
            item.classList.add('project-filter-enter');
            item.style.display = '';
            requestAnimationFrame(() => {
              item.classList.remove('project-filter-enter');
              item.classList.add('revealed');
            });
          } else {
            item.classList.add('project-filter-exit');
            window.setTimeout(() => {
              if (item.classList.contains('project-filter-exit')) {
                item.style.display = 'none';
              }
            }, 320);
          }
        });

      });
    });
  }

  // 6. Reveal Elements on Scroll
  if ('IntersectionObserver' in window && (revealElements.length > 0 || sectionElements.length > 0)) {
    document.body.classList.add('reveal-enabled');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
    sectionElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if observer not supported
    revealElements.forEach(el => el.classList.add('revealed'));
    sectionElements.forEach(el => el.classList.add('revealed'));
  }

  // 6b. About Section Staggered Content and Stat Counters
  const animateStatCounters = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      statNumbers.forEach(number => {
        number.textContent = `${number.dataset.count}${number.dataset.suffix || ''}`;
      });
      return;
    }

    statNumbers.forEach((number, index) => {
      const target = Number(number.dataset.count || 0);
      const suffix = number.dataset.suffix || '';
      const duration = 1200;
      const startTime = performance.now() + (index * 180);

      const updateCounter = (currentTime) => {
        if (currentTime < startTime) {
          requestAnimationFrame(updateCounter);
          return;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        number.textContent = `${Math.round(target * easedProgress)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  if (aboutSection && statNumbers.length > 0) {
    if ('IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            aboutSection.querySelectorAll('.about-gradient-heading, .about-description, .stat-item')
              .forEach((element, index) => {
                window.setTimeout(() => element.classList.add('about-revealed'), index * 120);
              });
            animateStatCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18 });

      aboutObserver.observe(aboutSection);
    } else {
      aboutSection.querySelectorAll('.about-gradient-heading, .about-description, .stat-item')
        .forEach(element => element.classList.add('about-revealed'));
      animateStatCounters();
    }
  }

  // 6c. Experience Timeline Draw and Entry
  if (experienceSection && timelineContainer) {
    const updateTimeline = () => {
      const rect = experienceSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const progress = Math.min(
        1,
        Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height * 0.65))
      );

      timelineContainer.style.setProperty(
        '--timeline-progress',
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '1' : progress.toFixed(3)
      );

      if (progress > 0.08) {
        experienceSection.classList.add('timeline-active');
      }
    };

    if ('IntersectionObserver' in window) {
      const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            experienceSection.classList.add('timeline-active');
            window.addEventListener('scroll', updateTimeline, { passive: true });
            updateTimeline();
          } else {
            window.removeEventListener('scroll', updateTimeline);
          }
        });
      }, { threshold: 0.08 });

      timelineObserver.observe(experienceSection);
    } else {
      experienceSection.classList.add('timeline-active');
      updateTimeline();
    }
  }

  // 7. Contact Form with Web3Forms AJAX
  const showFormMessage = (type, message) => {
    if (formSuccessAlert) {
      formSuccessAlert.classList.toggle('d-none', type !== 'success');
      formSuccessAlert.classList.toggle('form-alert-visible', type === 'success');
    }

    if (formErrorAlert) {
      formErrorAlert.classList.toggle('d-none', type !== 'error');
      formErrorAlert.classList.toggle('form-alert-visible', type === 'error');
    }

    if (formErrorText && type === 'error') {
      formErrorText.textContent = message;
    }

    const alertToFocus = type === 'success' ? formSuccessAlert : formErrorAlert;
    if (alertToFocus) {
      alertToFocus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        showFormMessage('error', 'Please complete all required fields before sending your message.');
        return;
      }

      contactForm.classList.add('was-validated');

      const submitBtn = document.getElementById('contactSubmitBtn');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'SEND MESSAGE';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...';
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          if (formSuccessAlert) {
            formSuccessAlert.classList.remove('d-none');
            formSuccessAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          contactForm.reset();
          contactForm.classList.remove('was-validated');
          if (formErrorAlert) {
            formErrorAlert.classList.add('d-none');
          }
        } else {
          showFormMessage('error', data.message || 'Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        showFormMessage('error', 'Network error occurred. Please reach out directly to sairanaseem606729@gmail.com');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

});
