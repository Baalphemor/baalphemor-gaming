// ========================================================
// BAALPHEMOR GAMING — SPIELE-PORTAL (baalphemor-gaming.de)
// Welt Auritan · Wiki & Legal Modals · Mobile Navigation · DSGVO Consent
// ========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. MODALS (PRE-LAUNCH NOTICE, WIKI ARCHIVES, IMPRESSUM, DATENSCHUTZ, DISCLAIMER)
  // ========================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    if (!document.querySelector('.modal-overlay.is-open')) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.locked-portal-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('modal-locked-portal');
    });
  });

  const wikiTriggers = [
    document.getElementById('nav-wiki-btn'),
    document.getElementById('mobile-wiki-btn'),
    document.getElementById('wiki-teaser-btn'),
    ...document.querySelectorAll('.open-wiki-modal-link')
  ];

  wikiTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('modal-wiki-notice');
      });
    }
  });

  document.querySelectorAll('.modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal');
      if (targetId) openModal(targetId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
    const actionBtn = modal.querySelector('.modal-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => closeModal(modal));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m));
    }
  });

  // ========================================================
  // 2. MOBILE MENU DRAWER
  // ========================================================
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => mobileDrawer.classList.toggle('is-open'));
    mobileDrawer.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => mobileDrawer.classList.remove('is-open'));
    });
  }

  // ========================================================
  // 3. DSGVO COOKIE CONSENT BANNER
  // ========================================================
  const cookieBanner = document.getElementById('cookie-banner');
  const btnNecessary = document.getElementById('cookie-necessary-btn');
  const btnAcceptAll = document.getElementById('cookie-accept-all-btn');
  const btnOpenCookie = document.getElementById('open-cookie-settings-btn');

  function saveCookieChoice(choice) {
    try {
      localStorage.setItem('baalphemor_gaming_cookie_consent', JSON.stringify({
        choice,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}
    if (cookieBanner) cookieBanner.classList.remove('is-visible');
  }

  try {
    const existing = localStorage.getItem('baalphemor_gaming_cookie_consent');
    if (!existing && cookieBanner) {
      cookieBanner.classList.add('is-visible');
    }
  } catch (e) {}

  if (btnNecessary) btnNecessary.addEventListener('click', () => saveCookieChoice('necessary'));
  if (btnAcceptAll) btnAcceptAll.addEventListener('click', () => saveCookieChoice('all'));
  if (btnOpenCookie) {
    btnOpenCookie.addEventListener('click', (e) => {
      e.preventDefault();
      if (cookieBanner) cookieBanner.classList.add('is-visible');
    });
  }
});
