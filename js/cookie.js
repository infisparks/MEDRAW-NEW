document.addEventListener('DOMContentLoaded', function () {
  // Inject HTML
  const cookieUI = `
    <!-- Cookie Consent Banner -->
    <div id="cookieConsent" class="position-fixed bottom-0 start-0 end-0 p-3 bg-light border-top shadow d-none" style="z-index: 1055;">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div class="text-muted">
          We use cookies to enhance your experience, analyze traffic, and support chat functionality. Manage your preferences in the settings. See our
          <a href="privacy-policy.html" class="text-decoration-underline">Privacy Policy</a>.
        </div>
        <div class="text-end">
          <button id="acceptCookies" class="btn btn-success btn-sm me-2">Accept All</button>
          <button id="rejectCookies" class="btn btn-outline-secondary btn-sm me-2">Reject</button>
          <button id="settingsCookies" class="btn btn-link btn-sm">Settings</button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal fade" id="cookieSettingsModal" tabindex="-1" aria-labelledby="cookieSettingsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="cookieSettingsModalLabel">Cookie Preferences</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>You can choose which types of cookies to accept:</p>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="essentialCookies" checked disabled>
              <label class="form-check-label" for="essentialCookies">
                Essential Cookies (required)
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="analyticsCookies">
              <label class="form-check-label" for="analyticsCookies">
                Analytics Cookies (e.g., Google Analytics)
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button id="saveSettings" class="btn btn-primary">Save Preferences</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', cookieUI);

  // After DOM is ready and HTML is injected
  const cookieBanner = document.getElementById('cookieConsent');

  if (!localStorage.getItem('cookieConsent')) {
    cookieBanner.classList.remove('d-none');
  } else {
    const consent = JSON.parse(localStorage.getItem('cookieConsent'));
    if (consent.analytics) {
      loadAnalytics();
    }
  }

  document.getElementById('acceptCookies').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ essential: true, analytics: true }));
    cookieBanner.classList.add('d-none');
    loadAnalytics();
  });

  document.getElementById('rejectCookies').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ essential: true, analytics: false }));
    cookieBanner.classList.add('d-none');
  });

  document.getElementById('settingsCookies').addEventListener('click', () => {
    const consent = JSON.parse(localStorage.getItem('cookieConsent')) || {};
    document.getElementById('analyticsCookies').checked = !!consent.analytics;

    const modal = new bootstrap.Modal(document.getElementById('cookieSettingsModal'));
    modal.show();
  });


  document.getElementById('saveSettings').addEventListener('click', () => {
    const analytics = document.getElementById('analyticsCookies').checked;
    localStorage.setItem('cookieConsent', JSON.stringify({ essential: true, analytics }));
    bootstrap.Modal.getInstance(document.getElementById('cookieSettingsModal')).hide();
    cookieBanner.classList.add('d-none');
    if (analytics) {
      loadAnalytics();
    }
  });

  // Analytics loading
  function loadAnalytics() {
    // Prevent duplicate loading
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-73SDREVTQD';
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', 'G-73SDREVTQD');
  }

});
