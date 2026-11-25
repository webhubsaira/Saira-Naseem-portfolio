/**
 * Saira Naseem — Personal Developer Portfolio
 * Script: js/script.js
 * Pure ES6+ Vanilla JavaScript
 */

const initPortfolio = () => {
  'use strict';

  /* ========================================================================
     1. Dynamic Copyright Year
     ======================================================================== */
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* ========================================================================
     2. Sticky Header & Mobile Navigation Drawer
     ======================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-contact-btn');

  const updateHeaderScroll = () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  const closeMobileMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.hidden = isExpanded;
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    });
  }

  /* ========================================================================
     3. Active Section Highlighting in Navigation
     ======================================================================== */
  const navLinks = Array.from(document.querySelectorAll('.site-nav .nav-link'));
  const trackedSections = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.replace('#', '');
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;
            navLinks.forEach((link) => {
              const matches = link.getAttribute('href') === `#${activeId}`;
              link.classList.toggle('active', matches);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    trackedSections.forEach((section) => navObserver.observe(section));
  }

  /* ========================================================================
     4. Interactive Skills Category Filter
     ======================================================================== */
  const skillChips = Array.from(document.querySelectorAll('.skill-chip'));
  const stackItems = Array.from(document.querySelectorAll('#workStackGrid .stack-item'));
  let activeSkillFilter = null;

  const applySkillFilter = (filterKey) => {
    activeSkillFilter = activeSkillFilter === filterKey ? null : filterKey;

    skillChips.forEach((chip) => {
      const isMatch = chip.dataset.skillFilter === activeSkillFilter;
      chip.classList.toggle('active', isMatch);
      chip.setAttribute('aria-pressed', String(isMatch));
    });

    stackItems.forEach((item) => {
      if (!activeSkillFilter) {
        item.classList.remove('is-dimmed', 'is-highlighted');
        return;
      }
      const categories = (item.dataset.cat || '').split(/\s+/);
      const matches = categories.includes(activeSkillFilter);
      item.classList.toggle('is-highlighted', matches);
      item.classList.toggle('is-dimmed', !matches);
    });
  };

  skillChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      applySkillFilter(chip.dataset.skillFilter || null);
    });
  });

  /* ========================================================================
     5. Interactive Projects Showcase Carousel & Full-Preview Lightbox
     ======================================================================== */
  const thumbButtons = Array.from(document.querySelectorAll('.project-thumb'));
  const tabletImg = document.getElementById('projectTabletImg');
  const phoneImg = document.getElementById('projectPhoneImg');
  const detailsRow = document.getElementById('projectDetailsRow');
  const projectTitle = document.getElementById('projectTitle');
  const projectMetric1 = document.getElementById('projectMetric1');
  const projectMetric2 = document.getElementById('projectMetric2');
  const projectLiveLink = document.getElementById('projectLiveLink');
  const projectCodeLink = document.getElementById('projectCodeLink');
  const projectDescription = document.getElementById('projectDescription');
  const prevBtn = document.getElementById('projectPrevBtn');
  const nextBtn = document.getElementById('projectNextBtn');

  // Lightbox elements
  const lightbox = document.getElementById('projectLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxImg = document.getElementById('lightboxImg');
  const openLightboxTrigger = document.getElementById('openLightboxTrigger');
  const projectPreviewBtn = document.getElementById('projectPreviewBtn');

  let currentProjectIndex = 0;
  let swapTimeoutId = null;

  const getThumbImageSrc = (btn) => {
    const img = btn.querySelector('img');
    return img ? img.currentSrc || img.src || img.getAttribute('src') || '' : '';
  };

  const renderProject = (index, animate = true) => {
    if (thumbButtons.length === 0) return;

    const total = thumbButtons.length;
    currentProjectIndex = ((index % total) + total) % total;
    const activeBtn = thumbButtons[currentProjectIndex];

    thumbButtons.forEach((btn, idx) => {
      const isActive = idx === currentProjectIndex;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    const imgSrc = getThumbImageSrc(activeBtn);
    const title = activeBtn.dataset.title || '';
    const metric1Bold = activeBtn.dataset.metric1Bold || '';
    const metric1Rest = activeBtn.dataset.metric1Rest || '';
    const metric2Bold = activeBtn.dataset.metric2Bold || '';
    const metric2Rest = activeBtn.dataset.metric2Rest || '';
    const liveUrl = activeBtn.dataset.live || '#';
    const codeUrl = activeBtn.dataset.code || '#';
    const desc = activeBtn.dataset.desc || '';
    const tabletPos = activeBtn.dataset.tabletPos || 'center top';
    const phonePos = activeBtn.dataset.phonePos || 'center top';

    const applyContent = () => {
      if (tabletImg) {
        tabletImg.src = imgSrc;
        tabletImg.alt = `${title} desktop preview`;
        tabletImg.style.objectPosition = tabletPos;
      }
      if (phoneImg) {
        phoneImg.src = imgSrc;
        phoneImg.style.objectPosition = phonePos;
      }
      if (projectTitle) projectTitle.textContent = title;
      if (projectMetric1) {
        projectMetric1.innerHTML = '';
        const strong = document.createElement('strong');
        strong.textContent = metric1Bold;
        projectMetric1.appendChild(strong);
        projectMetric1.appendChild(document.createTextNode(` ${metric1Rest}`));
      }
      if (projectMetric2) {
        projectMetric2.innerHTML = '';
        const strong = document.createElement('strong');
        strong.textContent = metric2Bold;
        projectMetric2.appendChild(strong);
        projectMetric2.appendChild(document.createTextNode(` ${metric2Rest}`));
      }
      if (projectLiveLink) projectLiveLink.href = liveUrl;
      if (projectCodeLink) projectCodeLink.href = codeUrl;
      if (projectDescription) projectDescription.textContent = desc;
    };

    if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyContent();
      return;
    }

    window.clearTimeout(swapTimeoutId);
    tabletImg?.classList.add('is-swapping');
    phoneImg?.classList.add('is-swapping');
    detailsRow?.classList.add('is-swapping');

    swapTimeoutId = window.setTimeout(() => {
      applyContent();
      requestAnimationFrame(() => {
        tabletImg?.classList.remove('is-swapping');
        phoneImg?.classList.remove('is-swapping');
        detailsRow?.classList.remove('is-swapping');
      });
    }, 140);
  };

  thumbButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      if (idx !== currentProjectIndex) {
        renderProject(idx, true);
      }
    });
  });

  prevBtn?.addEventListener('click', () => {
    renderProject(currentProjectIndex - 1, true);
  });

  nextBtn?.addEventListener('click', () => {
    renderProject(currentProjectIndex + 1, true);
  });

  // Keyboard navigation on thumbnail strip
  const thumbsTray = document.querySelector('.project-thumbs-tray');
  thumbsTray?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      renderProject(currentProjectIndex + 1, true);
      thumbButtons[currentProjectIndex]?.focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      renderProject(currentProjectIndex - 1, true);
      thumbButtons[currentProjectIndex]?.focus();
    }
  });

  // Initial sync without animation
  renderProject(0, false);

  // Full-screenshot Lightbox Modal
  const openLightbox = () => {
    if (!lightbox || !lightboxImg) return;
    const activeBtn = thumbButtons[currentProjectIndex];
    if (!activeBtn) return;

    const fullImgSrc = getThumbImageSrc(activeBtn);
    const title = activeBtn.dataset.title || 'Project Preview';

    lightboxImg.src = fullImgSrc;
    lightboxImg.alt = `${title} full page screenshot`;
    if (lightboxTitle) lightboxTitle.textContent = title;

    const body = lightbox.querySelector('.lightbox-body');
    if (body) body.scrollTop = 0;

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
  };

  openLightboxTrigger?.addEventListener('click', openLightbox);
  openLightboxTrigger?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox();
    }
  });
  projectPreviewBtn?.addEventListener('click', openLightbox);
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
      closeMobileMenu();
    }
  });

  /* ========================================================================
     6. Contact Form Quick-Intent Chips & Web3Forms AJAX Submission
     ======================================================================== */
  const intentChips = Array.from(document.querySelectorAll('.intent-chip'));
  const subjectInput = document.getElementById('contactSubjectInput');
  const contactForm = document.getElementById('portfolioContactForm');
  const formSuccessAlert = document.getElementById('formSuccessAlert');
  const formErrorAlert = document.getElementById('formErrorAlert');
  const formErrorText = document.getElementById('formErrorText');
  const submitBtn = document.getElementById('contactSubmitBtn');

  intentChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const wasActive = chip.classList.contains('active');
      intentChips.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });

      if (!wasActive) {
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        if (subjectInput) {
          subjectInput.value = chip.dataset.intent || 'Portfolio Inquiry';
        }
      } else if (subjectInput) {
        subjectInput.value = 'Portfolio Inquiry';
      }
    });
  });

  const showAlert = (type, message) => {
    if (formSuccessAlert) formSuccessAlert.hidden = type !== 'success';
    if (formErrorAlert) formErrorAlert.hidden = type !== 'error';
    if (formErrorText && type === 'error' && message) {
      formErrorText.textContent = message;
    }
  };

  if (contactForm) {
    const inputs = Array.from(contactForm.querySelectorAll('.form-input, .form-textarea'));
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    });

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      showAlert('none');

      let isValid = true;
      inputs.forEach((input) => {
        const value = input.value.trim();
        const emailInvalid =
          input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!value || emailInvalid) {
          input.classList.add('is-invalid');
          isValid = false;
        }
      });

      if (!isValid) {
        showAlert('error', 'Please fill in your name, a valid email address, and your message.');
        return;
      }

      const btnLabel = submitBtn?.querySelector('.btn-label');
      const originalLabel = btnLabel ? btnLabel.textContent : 'Send Message';

      if (submitBtn) submitBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = 'Sending...';

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          showAlert('success');
          contactForm.reset();
          intentChips.forEach((c) => {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
          });
          if (subjectInput) subjectInput.value = 'Portfolio Inquiry';
        } else {
          showAlert('error', data.message || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        console.error('Contact form error:', err);
        showAlert(
          'error',
          'Network error occurred. Please reach out directly at sairanaseem606729@gmail.com'
        );
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = originalLabel;
      }
    });
  }

  /* ========================================================================
     7. Scroll Reveal Animations
     ======================================================================== */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealEls.length > 0) {
    document.body.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
