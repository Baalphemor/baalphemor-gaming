// ========================================================
// BAALPHEMOR GAMING — PRE-LAUNCH LANDINGPAGE (baalphemor-gaming.de)
// Style Switcher (Classic vs Modern Cockpit), Pre-Launch Lead Capture,
// Locked-Release Notice Modal & DSGVO Cookie Consent
// ========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. UI STYLE (CLASSIC vs MODERN COCKPIT) & COLOR THEME SWITCHER
  // ========================================================
  const styleButtons = document.querySelectorAll('[data-set-style]');
  const themeDots = document.querySelectorAll('[data-set-theme]');

  function applyUiStyle(styleName) {
    const valid = styleName === 'modern' ? 'modern' : 'classic';
    document.body.setAttribute('data-ui-style', valid);
    styleButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-style') === valid);
    });
    try {
      localStorage.setItem('baalphemor_gaming_ui_style', valid);
    } catch (e) {}
  }

  function applyColorTheme(themeName) {
    const allowed = ['gold', 'nautical', 'crimson', 'cream'];
    const valid = allowed.includes(themeName) ? themeName : 'gold';
    document.body.setAttribute('data-color-theme', valid);
    themeDots.forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-set-theme') === valid);
    });
    try {
      localStorage.setItem('baalphemor_gaming_color_theme', valid);
    } catch (e) {}
  }

  try {
    const savedStyle = localStorage.getItem('baalphemor_gaming_ui_style');
    const savedTheme = localStorage.getItem('baalphemor_gaming_color_theme');
    if (savedStyle) applyUiStyle(savedStyle);
    if (savedTheme) applyColorTheme(savedTheme);
  } catch (e) {}

  styleButtons.forEach(btn => {
    btn.addEventListener('click', () => applyUiStyle(btn.getAttribute('data-set-style')));
  });

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => applyColorTheme(dot.getAttribute('data-set-theme')));
  });

  // ========================================================
  // 2. MODALS (PRE-LAUNCH NOTICE, IMPRESSUM, DATENSCHUTZ, DISCLAIMER)
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
  // 3. MOBILE MENU & PRE-LAUNCH LEAD CAPTURE
  // ========================================================
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => mobileDrawer.classList.toggle('is-open'));
    mobileDrawer.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => mobileDrawer.classList.remove('is-open'));
    });
  }

  const portalSignupForm = document.getElementById('portal-signup-form');
  const portalEmailInput = document.getElementById('portal-email-input');
  const portalFeedback = document.getElementById('portal-lead-feedback');

  if (portalSignupForm && portalEmailInput && portalFeedback) {
    portalSignupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = portalEmailInput.value.trim();
      if (!email) return;

      const selectedTypes = Array.from(portalSignupForm.querySelectorAll('input[name="lead_type"]:checked'))
        .map(cb => cb.value);
      const selectedGames = Array.from(portalSignupForm.querySelectorAll('input[name="game_interest"]:checked'))
        .map(cb => cb.value);

      try {
        const raw = localStorage.getItem('baalphemor_gaming_leads');
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          email,
          types: selectedTypes,
          games: selectedGames,
          timestamp: new Date().toISOString(),
          source: 'baalphemor-gaming.de pre-launch'
        });
        localStorage.setItem('baalphemor_gaming_leads', JSON.stringify(list));
      } catch (err) {}

      const gamesText = selectedGames.length > 0 ? selectedGames.join(', ') : 'Alle kommenden Titel';
      portalFeedback.innerHTML = `⚔️ <strong>Vormerkung erfolgreich:</strong> Deine Adresse (<em>${email}</em>) ist für die Pre-Launch-Liste eingetragen (<strong>${gamesText}</strong>).<br>Die ersten interaktiven Testspiele starten ab <strong>Januar 2027</strong> — du wirst rechtzeitig benachrichtigt!`;
      portalFeedback.style.display = 'block';
      portalEmailInput.value = '';
    });
  }

  // ========================================================
  // 4. COOKIE CONSENT BANNER
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
