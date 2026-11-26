/**
 * Saira Naseem — Signature Editorial Portfolio
 * Script: js/script.js
 * Pure ES6+ Vanilla JavaScript
 */

const initPortfolio = () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     1. Dynamic Copyright Year
     ======================================================================== */
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* ========================================================================
     2. Scroll Progress Bar, Sticky Header & Mobile Navigation Drawer
     ======================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const floatingTopBtn = document.getElementById('floatingTopBtn');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-contact-btn');

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', scrollTop > 24);
    }
    if (floatingTopBtn) {
      floatingTopBtn.classList.toggle('visible', scrollTop > 350);
    }
    if (scrollProgressBar) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)) : 0;
      scrollProgressBar.style.width = `${pct.toFixed(1)}%`;
    }
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  if (floatingTopBtn) {
    floatingTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

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
      if (window.innerWidth > 768) {
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
              link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
            });
          }
        });
      },
      { rootMargin: '-34% 0px -54% 0px', threshold: 0 }
    );

    trackedSections.forEach((section) => navObserver.observe(section));
  }

  /* ========================================================================
     4. Interactive Skills Category Filter (24-Icon Work Stack)
     ======================================================================== */
  const skillChips = Array.from(document.querySelectorAll('.skill-chip'));
  const stackItems = Array.from(document.querySelectorAll('#workStackGrid .stack-item'));
  let activeSkillFilter = 'all';

  const applySkillFilter = (filterKey) => {
    const nextFilter =
      !filterKey || filterKey === 'all' || (activeSkillFilter === filterKey && filterKey !== 'all')
        ? 'all'
        : filterKey;

    activeSkillFilter = nextFilter;

    skillChips.forEach((chip) => {
      const isMatch = chip.dataset.skillFilter === activeSkillFilter;
      chip.classList.toggle('active', isMatch);
      chip.setAttribute('aria-pressed', String(isMatch));
    });

    stackItems.forEach((item) => {
      if (activeSkillFilter === 'all') {
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
      applySkillFilter(chip.dataset.skillFilter || 'all');
    });
  });

  /* ========================================================================
     5. Interactive Dual-Device Projects Showcase & Full-Preview Lightbox
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
    const img = btn.querySelector('.thumb-img') || btn.querySelector('img:not(.phone-src-img)');
    return img ? img.currentSrc || img.src || img.getAttribute('src') || '' : '';
  };

  const getPhoneImageSrc = (btn) => {
    const phoneSource = btn.querySelector('.phone-src-img');
    if (phoneSource) {
      return phoneSource.currentSrc || phoneSource.src || phoneSource.getAttribute('src') || getThumbImageSrc(btn);
    }
    return getThumbImageSrc(btn);
  };

  const renderMetric = (el, boldText, restText) => {
    if (!el) return;
    el.textContent = '';
    const strong = document.createElement('strong');
    strong.textContent = boldText;
    el.appendChild(strong);
    el.appendChild(document.createTextNode(` ${restText}`));
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
    const phoneSrc = getPhoneImageSrc(activeBtn);
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
        phoneImg.src = phoneSrc;
        phoneImg.style.objectPosition = phonePos;
      }
      if (projectTitle) projectTitle.textContent = title;
      renderMetric(projectMetric1, metric1Bold, metric1Rest);
      renderMetric(projectMetric2, metric2Bold, metric2Rest);
      if (projectLiveLink) projectLiveLink.href = liveUrl;
      if (projectCodeLink) projectCodeLink.href = codeUrl;
      if (projectDescription) projectDescription.textContent = desc;
    };

    if (!animate || prefersReducedMotion) {
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
    }, 145);
  };

  thumbButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      if (idx !== currentProjectIndex) {
        renderProject(idx, true);
      }
    });
  });

  prevBtn?.addEventListener('click', () => renderProject(currentProjectIndex - 1, true));
  nextBtn?.addEventListener('click', () => renderProject(currentProjectIndex + 1, true));

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

  renderProject(0, false);

  // Full-Page Lightbox Modal
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
     6. One-Click Copy Direct Email
     ======================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyEmailLabel = document.getElementById('copyEmailLabel');
  let copyTimerId = null;

  if (copyEmailBtn && copyEmailLabel) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.dataset.email || 'sairanaseem606729@gmail.com';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const tempInput = document.createElement('textarea');
          tempInput.value = email;
          tempInput.setAttribute('readonly', '');
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        copyEmailLabel.textContent = 'Copied!';
        window.clearTimeout(copyTimerId);
        copyTimerId = window.setTimeout(() => {
          copyEmailLabel.textContent = 'Copy Email';
        }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  }

  /* ========================================================================
     7. Contact Form Quick-Intent Chips & Web3Forms AJAX Submission
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
    if (formSuccessAlert) {
      formSuccessAlert.hidden = type !== 'success';
      formSuccessAlert.classList.remove('form-alert-visible');
      if (type === 'success') {
        requestAnimationFrame(() => formSuccessAlert.classList.add('form-alert-visible'));
      }
    }
    if (formErrorAlert) {
      formErrorAlert.hidden = type !== 'error';
      formErrorAlert.classList.remove('form-alert-visible');
      if (type === 'error') {
        requestAnimationFrame(() => formErrorAlert.classList.add('form-alert-visible'));
      }
    }
    if (formErrorText && type === 'error' && message) {
      formErrorText.textContent = message;
    }
  };

  if (contactForm) {
    const inputs = Array.from(contactForm.querySelectorAll('.form-input, .form-textarea'));
    inputs.forEach((input) => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
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
     8. Scroll Reveal, About Stat Counters & Scroll-Drawing Experience Timeline
        (Restored from First Deployment)
     ======================================================================== */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const aboutSection = document.getElementById('about');
  const aboutStaggerEls = aboutSection
    ? Array.from(aboutSection.querySelectorAll('.about-stagger'))
    : [];
  const statNumbers = aboutSection
    ? Array.from(aboutSection.querySelectorAll('.stat-number'))
    : [];
  const experienceSection = document.getElementById('experience');
  const timelineContainer = document.getElementById('experienceTimeline');

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
      { threshold: 0.01, rootMargin: '0px 0px 40px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // 8b. About Staggered Cascade + Animated Counting Stat Numbers
  const animateStatCounters = () => {
    if (prefersReducedMotion) {
      statNumbers.forEach((numEl) => {
        numEl.textContent = `${numEl.dataset.count || 0}${numEl.dataset.suffix || ''}`;
      });
      return;
    }

    statNumbers.forEach((numEl, index) => {
      const target = Number(numEl.dataset.count || 0);
      const suffix = numEl.dataset.suffix || '';
      const duration = 1200;
      const startTime = performance.now() + index * 180;

      const updateCounter = (currentTime) => {
        if (currentTime < startTime) {
          requestAnimationFrame(updateCounter);
          return;
        }
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = `${Math.round(target * eased)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  if (aboutSection && (aboutStaggerEls.length > 0 || statNumbers.length > 0)) {
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              aboutStaggerEls.forEach((el, idx) => {
                window.setTimeout(() => el.classList.add('about-revealed'), idx * 120);
              });
              animateStatCounters();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16 }
      );
      aboutObserver.observe(aboutSection);
    } else {
      aboutStaggerEls.forEach((el) => el.classList.add('about-revealed'));
      animateStatCounters();
    }
  }

  // 8c. Scroll-Driven Experience Timeline Line Draw & Pop-In Markers
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
        prefersReducedMotion ? '1' : progress.toFixed(3)
      );

      if (progress > 0.08) {
        experienceSection.classList.add('timeline-active');
      }
    };

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const timelineObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              experienceSection.classList.add('timeline-active');
              window.addEventListener('scroll', updateTimeline, { passive: true });
              updateTimeline();
            } else {
              window.removeEventListener('scroll', updateTimeline);
            }
          });
        },
        { threshold: 0.08 }
      );
      timelineObserver.observe(experienceSection);
    } else {
      experienceSection.classList.add('timeline-active');
      timelineContainer.style.setProperty('--timeline-progress', '1');
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
