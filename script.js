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
  // 3. PRE-LAUNCH VORMERKUNG & MITWIRKUNG (3D-RIGGING & STORYWRITING)
  // ========================================================
  const optRigging = document.getElementById('opt-rigging');
  const optStory = document.getElementById('opt-story');
  const riggingDetailsWrap = document.getElementById('rigging-details-wrap');
  const riggingNoteInput = document.getElementById('portal-rigging-note');

  if ((optRigging || optStory) && riggingDetailsWrap) {
    const syncCollabField = () => {
      const wantR = optRigging ? optRigging.checked : false;
      const wantS = optStory ? optStory.checked : false;
      riggingDetailsWrap.classList.toggle('is-visible', wantR || wantS);
      if (riggingNoteInput) {
        if (wantR && wantS) {
          riggingNoteInput.placeholder = 'Optional: Kurze Notiz zu 3D-Rigging & Storywriting (Tools, Ideen oder Portfolio-Link)...';
        } else if (wantS) {
          riggingNoteInput.placeholder = 'Optional: Schreibst du lieber kleine Erzählungen oder epische Schlachten? (Notiz / Leseprobe)...';
        } else {
          riggingNoteInput.placeholder = 'Optional: Dein Tool (z. B. Blender), kurze Notiz oder Portfolio-Link...';
        }
      }
    };
    if (optRigging) optRigging.addEventListener('change', syncCollabField);
    if (optStory) optStory.addEventListener('change', syncCollabField);
    syncCollabField();
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
      const wantsStory = optStory ? optStory.checked : false;
      const riggingNote = riggingNoteInput ? riggingNoteInput.value.trim() : '';

      try {
        const raw = localStorage.getItem('baalphemor_gaming_leads');
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          email,
          types: selectedTypes,
          games: selectedGames,
          wantsRigging,
          wantsStory,
          collabNote: riggingNote,
          timestamp: new Date().toISOString(),
          source: 'baalphemor-gaming.de pre-launch'
        });
        localStorage.setItem('baalphemor_gaming_leads', JSON.stringify(list));
      } catch (err) {}

      const gamesText = selectedGames.length > 0 ? selectedGames.join(', ') : 'Auritan: Vanguard';

      if (wantsRigging || wantsStory) {
        const roles = [];
        if (wantsRigging) roles.push('3D-Rigging (Skelett & Bewegungsabläufe)');
        if (wantsStory) roles.push('Stories, kleine Erzählungen & epische Schlachten');
        const rolesLabel = roles.join(' & ');

        const subject = encodeURIComponent(`Mitwirkung (${rolesLabel}) — BAALPHEMOR GAMING / Auritan`);
        const bodyLines = [
          'Hallo Michael,',
          '',
          `ich möchte gerne bei Auritan / BAALPHEMOR GAMING mitwirken (${rolesLabel})!`,
          `Meine E-Mail: ${email}`,
          riggingNote ? `Hinweis / Ideen / Portfolio: ${riggingNote}` : '',
          '',
          'Viele Grüße'
        ].filter(Boolean).join('\n');
        const mailHref = `mailto:info@baalphemor.de?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;

        portalFeedback.innerHTML = `🤝 <strong>Stark — danke für dein Interesse an der Mitwirkung (${rolesLabel})!</strong> Deine Vormerkung (<em>${email}</em> · <strong>${gamesText}</strong>) ist gespeichert.<br>Damit wir uns direkt austauschen können, schick uns gerne mit einem Klick eine kurze Mail: <a href="${mailHref}" style="color:#ffd700; font-weight:700; text-decoration:underline;">Direkt an info@baalphemor.de senden ➔</a>`;
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
