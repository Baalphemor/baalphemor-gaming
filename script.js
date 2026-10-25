// ========================================================
// BAALPHEMOR GAMING — PRE-LAUNCH PORTAL (baalphemor-gaming.de)
// Welt Auritan · Lead Capture & 3D-Rigging Callout · Wiki & Legal Modals · DSGVO Consent
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
  // 3. PRE-LAUNCH VORMERKUNG & 3D-RIGGING UNTERSTÜTZUNG
  // ========================================================
  const optRigging = document.getElementById('opt-rigging');
  const riggingDetailsWrap = document.getElementById('rigging-details-wrap');
  const riggingNoteInput = document.getElementById('portal-rigging-note');

  if (optRigging && riggingDetailsWrap) {
    const syncRiggingField = () => {
      riggingDetailsWrap.classList.toggle('is-visible', optRigging.checked);
    };
    optRigging.addEventListener('change', syncRiggingField);
    syncRiggingField();
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
      const wantsRigging = optRigging ? optRigging.checked : false;
      const riggingNote = riggingNoteInput ? riggingNoteInput.value.trim() : '';

      try {
        const raw = localStorage.getItem('baalphemor_gaming_leads');
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          email,
          types: selectedTypes,
          games: selectedGames,
          wantsRigging,
          riggingNote,
          timestamp: new Date().toISOString(),
          source: 'baalphemor-gaming.de pre-launch'
        });
        localStorage.setItem('baalphemor_gaming_leads', JSON.stringify(list));
      } catch (err) {}

      const gamesText = selectedGames.length > 0 ? selectedGames.join(', ') : 'Alle kommenden Titel in Auritan';

      if (wantsRigging) {
        const subject = encodeURIComponent('3D-Rigging Unterstützung — BAALPHEMOR GAMING / Auritan');
        const bodyLines = [
          'Hallo Michael,',
          '',
          'ich möchte euch gerne beim 3D-Rigging (Skelett für Bewegungsabläufe) für Auritan / BAALPHEMOR GAMING unterstützen!',
          `Meine E-Mail: ${email}`,
          riggingNote ? `Hinweis / Tools / Portfolio: ${riggingNote}` : '',
          '',
          'Viele Grüße'
        ].filter(Boolean).join('\n');
        const mailHref = `mailto:info@baalphemor.de?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;

        portalFeedback.innerHTML = `🦴 <strong>Stark — danke für dein Interesse am 3D-Rigging!</strong> Deine Vormerkung (<em>${email}</em> · <strong>${gamesText}</strong>) ist gespeichert.<br>Damit wir uns direkt zu deinen 3D-Rigs & Tools austauschen können, schick uns gerne mit einem Klick eine kurze Mail: <a href="${mailHref}" style="color:#ffd700; font-weight:700; text-decoration:underline;">Direkt an info@baalphemor.de senden ➔</a>`;
      } else {
        portalFeedback.innerHTML = `⚔️ <strong>Vormerkung erfolgreich:</strong> Deine Adresse (<em>${email}</em>) ist für die Pre-Launch-Liste eingetragen (<strong>${gamesText}</strong>).<br>Mit einer frühen Alpha ist ab <strong>2027</strong> zu rechnen — du wirst rechtzeitig benachrichtigt!`;
      }

      portalFeedback.style.display = 'block';
      portalEmailInput.value = '';
      if (riggingNoteInput) riggingNoteInput.value = '';
    });
  }

  // ========================================================
  // 4. DSGVO COOKIE CONSENT BANNER
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
