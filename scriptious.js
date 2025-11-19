/* scriptious.js - interactivity for navigation, forms, menu filter, job modals, and local demo storage */

document.addEventListener('DOMContentLoaded', () => {
  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // NAV toggle for mobile
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = !expanded ? 'block' : 'none';
    });

    // close nav on link click (mobile)
    mainNav.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          navToggle.setAttribute('aria-expanded', 'false');
          mainNav.setAttribute('aria-expanded', 'false');
          mainNav.style.display = 'none';
        }
      });
    });
  }

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // focus for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });

  // MENU FILTER
  const menuFilter = document.getElementById('menu-filter');
  if (menuFilter) {
    const items = document.querySelectorAll('.menu-item');
    menuFilter.addEventListener('change', () => {
      const val = menuFilter.value;
      items.forEach(it => {
        it.style.display = (val === 'all' || it.dataset.category === val) ? '' : 'none';
      });
    });
  }

  // RESERVATION FORM
  const resForm = document.getElementById('reservation-form');
  const resMsg = document.getElementById('reservation-msg');

  if (resForm) {
    resForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('res-name').value.trim();
      const phone = document.getElementById('res-phone').value.trim();
      const email = document.getElementById('res-email').value.trim();
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const party = document.getElementById('res-party').value;

      if (!name || !phone || !email || !date || !time || !party) {
        resMsg.textContent = 'Please complete all required fields.';
        resMsg.style.color = 'crimson';
        return;
      }

      const chosenDate = new Date(date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (chosenDate < today) {
        resMsg.textContent = 'Please choose today or a future date.';
        resMsg.style.color = 'crimson';
        return;
      }

      const reservations = JSON.parse(localStorage.getItem('pablitos_reservations') || '[]');
      const reservation = {
        id: Date.now(),
        name, phone, email, date, time, party,
        requests: document.getElementById('res-requests').value || ''
      };
      reservations.push(reservation);
      localStorage.setItem('pablitos_reservations', JSON.stringify(reservations));

      resMsg.textContent = `Thanks, ${name}! Your reservation for ${date} at ${time} for ${party} people has been received.`;
      resMsg.style.color = '#0b6b20';
      resForm.reset();
    });
  }

  // WAITLIST
  const openWaitBtn = document.getElementById('open-waitlist');
  const waitForm = document.getElementById('waitlist-form');
  const waitMsg = document.getElementById('waitlist-msg');
  const closeWaitBtn = document.getElementById('close-waitlist');

  if (openWaitBtn) {
    openWaitBtn.addEventListener('click', () => {
      const sec = document.getElementById('waitlist');
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => document.getElementById('wait-name').focus(), 600);
      }
    });
  }

  if (waitForm) {
    waitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('wait-name').value.trim();
      const phone = document.getElementById('wait-phone').value.trim();
      const party = document.getElementById('wait-party').value;

      if (!name || !phone || !party) {
        waitMsg.textContent = 'Please provide name, phone, and party size.';
        waitMsg.style.color = 'crimson';
        return;
      }

      const waitlist = JSON.parse(localStorage.getItem('pablitos_waitlist') || '[]');
      waitlist.push({ id: Date.now(), name, phone, party });
      localStorage.setItem('pablitos_waitlist', JSON.stringify(waitlist));

      waitMsg.textContent = `You're on the waitlist, ${name}. We'll contact you if a table opens up.`;
      waitMsg.style.color = '#0b6b20';
      waitForm.reset();
    });
  }

  if (closeWaitBtn) {
    closeWaitBtn.addEventListener('click', () => {
      waitForm.reset();
      waitMsg.textContent = '';
      const res = document.getElementById('reservation');
      if (res) res.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // JOB CARDS -> open modals
  const jobCards = document.querySelectorAll('.job-card');
  jobCards.forEach(card => {
    card.addEventListener('click', () => {
      const jobKey = card.dataset.job; // "linecook" or "shiftmanager"
      openJobModal(jobKey);
    });
  });

  // Modal utility
  function openJobModal(key) {
    const modal = document.getElementById(`modal-${key}`);
    if (!modal) return;
    modal.hidden = false;
    // trap focus lightly by focusing first input
    const firstInput = modal.querySelector('input, textarea, button');
    if (firstInput) firstInput.focus();
    document.documentElement.style.overflow = 'hidden';
  }
  function closeJobModal(modalEl) {
    modalEl.hidden = true;
    document.documentElement.style.overflow = '';
    // return focus to the previously focused job card if possible
    const key = modalEl.id.replace('modal-','');
    const card = document.querySelector(`.job-card[data-job="${key}"]`);
    if (card) card.focus();
  }

  // Close handlers for modals
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) closeJobModal(modal);
    });
  });

  // click outside to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeJobModal(modal);
    });
  });

  // Apply forms (store in localStorage as demo)
  document.querySelectorAll('.apply-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const job = form.dataset.job || 'Unknown';
      const name = form.applicantName?.value?.trim() || '';
      const email = form.applicantEmail?.value?.trim() || '';
      const phone = form.applicantPhone?.value?.trim() || '';
      const message = form.applicantMessage?.value?.trim() || '';

      const msgEl = form.querySelector('.apply-msg');

      if (!name || !email || !phone) {
        if (msgEl) { msgEl.textContent = 'Please provide name, email, and phone.'; msgEl.style.color = 'crimson'; }
        return;
      }

      const apps = JSON.parse(localStorage.getItem('pablitos_applications') || '[]');
      apps.push({
        id: Date.now(),
        job,
        name,
        email,
        phone,
        message
      });
      localStorage.setItem('pablitos_applications', JSON.stringify(apps));

      if (msgEl) {
        msgEl.textContent = `Thanks ${name}! Your application for "${job}" was received.`;
        msgEl.style.color = '#0b6b20';
      }

      form.reset();

      // close modal after short delay
      setTimeout(() => {
        const modal = form.closest('.modal');
        if (modal) closeJobModal(modal);
      }, 1200);
    });
  });

  // Accessibility: close modals with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        if (!modal.hidden) closeJobModal(modal);
      });
    }
  });

  // Responsive behavior: ensure nav state on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      mainNav.style.display = '';
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.setAttribute('aria-expanded', 'false');
    } else {
      mainNav.style.display = 'none';
    }
  });

  // Debug helpers (dev-only)
  window._pablitosDebug = {
    reservations: () => JSON.parse(localStorage.getItem('pablitos_reservations') || '[]'),
    waitlist: () => JSON.parse(localStorage.getItem('pablitos_waitlist') || '[]'),
    applications: () => JSON.parse(localStorage.getItem('pablitos_applications') || '[]')
  };
});
