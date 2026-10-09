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
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  const projectsViewport = document.getElementById('projectsViewport');
  const previousProjectBtn = document.getElementById('projectsPrev');
  const nextProjectBtn = document.getElementById('projectsNext');
  const projectsStatus = document.getElementById('projectsStatus');
  const revealElements = document.querySelectorAll('.reveal-item');

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

  // 5. Project Carousel Controls
  const getVisibleProjects = () => Array.from(projectItems).filter(item => item.style.display !== 'none');

  const updateProjectCarousel = () => {
    if (!projectsViewport) return;

    const visibleProjects = getVisibleProjects();
    const maxScroll = Math.max(0, projectsViewport.scrollWidth - projectsViewport.clientWidth);
    const viewportBounds = projectsViewport.getBoundingClientRect();
    const currentIndex = visibleProjects.findIndex(item => item.getBoundingClientRect().right > viewportBounds.left + 1);

    if (previousProjectBtn) previousProjectBtn.disabled = projectsViewport.scrollLeft <= 1;
    if (nextProjectBtn) nextProjectBtn.disabled = projectsViewport.scrollLeft >= maxScroll - 1;

    if (projectsStatus) {
      const index = Math.max(0, currentIndex);
      projectsStatus.textContent = visibleProjects.length
        ? `${String(index + 1).padStart(2, '0')} / ${String(visibleProjects.length).padStart(2, '0')}`
        : '00 / 00';
    }
  };

  const moveProjectCarousel = direction => {
    if (!projectsViewport) return;

    const firstVisibleProject = getVisibleProjects()[0];
    if (!firstVisibleProject) return;

    const track = document.getElementById('projectsContainer');
    const gap = track ? parseFloat(window.getComputedStyle(track).columnGap) || 0 : 0;
    const scrollAmount = firstVisibleProject.getBoundingClientRect().width + gap;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    projectsViewport.scrollBy({ left: direction * scrollAmount, behavior });
  };

  if (projectsViewport) {
    projectsViewport.addEventListener('scroll', updateProjectCarousel, { passive: true });
    window.addEventListener('resize', updateProjectCarousel);
    previousProjectBtn?.addEventListener('click', () => moveProjectCarousel(-1));
    nextProjectBtn?.addEventListener('click', () => moveProjectCarousel(1));
    updateProjectCarousel();
  }

  // 6. Project Category Filtering
  if (filterBtns.length > 0 && projectItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter') || 'all';

        projectItems.forEach(item => {
          const categories = (item.getAttribute('data-category') || '').split(' ');
          if (filterValue === 'all' || categories.includes(filterValue)) {
            item.style.display = '';
            item.classList.add('revealed');
          } else {
            item.style.display = 'none';
          }
        });

        if (projectsViewport) {
          projectsViewport.scrollLeft = 0;
          updateProjectCarousel();
        }
      });
    });
  }

  // 7. Reveal Elements on Scroll
  if ('IntersectionObserver' in window && revealElements.length > 0) {
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
  } else {
    // Fallback if observer not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 8. Contact Form with Web3Forms AJAX
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
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
        } else {
          alert(data.message || 'Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        alert('Network error occurred. Please reach out directly to sairanaseem606729@gmail.com');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // 9. Fullscreen Image Lightbox Viewer
  const lightboxModalEl = document.getElementById('imageLightboxModal');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('imageLightboxModalLabel');
  const lightboxLiveDemoBtn = document.getElementById('lightboxLiveDemoBtn');
  const lightboxZoomBtn = document.getElementById('lightboxZoomBtn');
  const lightboxZoomIcon = document.getElementById('lightboxZoomIcon');
  const zoomBtns = document.querySelectorAll('.btn-zoom-image');

  if (lightboxModalEl && lightboxImg && window.bootstrap) {
    const lightboxModal = new bootstrap.Modal(lightboxModalEl);
    const setLightboxZoom = (isZoomed) => {
      lightboxImg.classList.toggle('lightbox-image-zoomed', isZoomed);
      if (lightboxZoomBtn) {
        lightboxZoomBtn.setAttribute('aria-label', isZoomed ? 'Zoom image out' : 'Zoom image in');
        lightboxZoomBtn.title = isZoomed ? 'Zoom image out' : 'Zoom image in';
      }
      if (lightboxZoomIcon) {
        lightboxZoomIcon.className = isZoomed ? 'bi bi-zoom-out' : 'bi bi-zoom-in';
      }
    };

    if (lightboxZoomBtn) {
      lightboxZoomBtn.addEventListener('click', () => {
        setLightboxZoom(!lightboxImg.classList.contains('lightbox-image-zoomed'));
      });
    }

    zoomBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = btn.getAttribute('data-img-src');
        const imgTitle = btn.getAttribute('data-img-title') || 'Project Preview';
        const demoUrl = btn.getAttribute('data-demo-url') || '#';

        if (imgSrc) {
          setLightboxZoom(false);
          lightboxImg.src = imgSrc;
          lightboxImg.alt = imgTitle;
          if (lightboxTitle) {
            lightboxTitle.textContent = imgTitle;
          }
          if (lightboxLiveDemoBtn) {
            lightboxLiveDemoBtn.href = demoUrl;
            if (demoUrl === '#' || !demoUrl) {
              lightboxLiveDemoBtn.style.display = 'none';
            } else {
              lightboxLiveDemoBtn.style.display = 'inline-flex';
            }
          }
          lightboxModal.show();
        }
      });
    });
  }
});
