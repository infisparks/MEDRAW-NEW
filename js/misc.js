/* ==============================================================
   misc.js – shared on EVERY page
   ==============================================================
   • Put ALL your helper / utility functions here.
   • Visit-counter is added at the bottom – it runs automatically.
   ============================================================== */

(function (global) {
    'use strict';



    // ←←←  ADD ANY OTHER FUNCTIONS HERE  ←←←

    /* --------------------------------------------------------------
       PHONE COUNTRY CODE – auto-injects a country-code dropdown
       next to every input[name="phone"] on the page.
       On form submit (capture phase) the selected code is prepended
       to the phone number so all API handlers receive a single
       merged value, e.g. "+919876543210".
       -------------------------------------------------------------- */
    const PHONE_CODES = [
        ['+1',   '🇺🇸', 'US / Canada'],
        ['+1242','🇧🇸', 'Bahamas'],
        ['+1246','🇧🇧', 'Barbados'],
        ['+1268','🇦🇬', 'Antigua & Barbuda'],
        ['+1473','🇬🇩', 'Grenada'],
        ['+1758','🇱🇨', 'Saint Lucia'],
        ['+1767','🇩🇲', 'Dominica'],
        ['+1784','🇻🇨', 'Saint Vincent & Grenadines'],
        ['+1787','🇵🇷', 'Puerto Rico'],
        ['+1809','🇩🇴', 'Dominican Republic'],
        ['+1868','🇹🇹', 'Trinidad & Tobago'],
        ['+1869','🇰🇳', 'Saint Kitts & Nevis'],
        ['+1876','🇯🇲', 'Jamaica'],
        ['+7',   '🇷🇺', 'Russia'],
        ['+20',  '🇪🇬', 'Egypt'],
        ['+27',  '🇿🇦', 'South Africa'],
        ['+30',  '🇬🇷', 'Greece'],
        ['+31',  '🇳🇱', 'Netherlands'],
        ['+32',  '🇧🇪', 'Belgium'],
        ['+33',  '🇫🇷', 'France'],
        ['+34',  '🇪🇸', 'Spain'],
        ['+36',  '🇭🇺', 'Hungary'],
        ['+39',  '🇮🇹', 'Italy'],
        ['+40',  '🇷🇴', 'Romania'],
        ['+41',  '🇨🇭', 'Switzerland'],
        ['+43',  '🇦🇹', 'Austria'],
        ['+44',  '🇬🇧', 'United Kingdom'],
        ['+45',  '🇩🇰', 'Denmark'],
        ['+46',  '🇸🇪', 'Sweden'],
        ['+47',  '🇳🇴', 'Norway'],
        ['+48',  '🇵🇱', 'Poland'],
        ['+49',  '🇩🇪', 'Germany'],
        ['+51',  '🇵🇪', 'Peru'],
        ['+52',  '🇲🇽', 'Mexico'],
        ['+53',  '🇨🇺', 'Cuba'],
        ['+54',  '🇦🇷', 'Argentina'],
        ['+55',  '🇧🇷', 'Brazil'],
        ['+56',  '🇨🇱', 'Chile'],
        ['+57',  '🇨🇴', 'Colombia'],
        ['+58',  '🇻🇪', 'Venezuela'],
        ['+60',  '🇲🇾', 'Malaysia'],
        ['+61',  '🇦🇺', 'Australia'],
        ['+62',  '🇮🇩', 'Indonesia'],
        ['+63',  '🇵🇭', 'Philippines'],
        ['+64',  '🇳🇿', 'New Zealand'],
        ['+65',  '🇸🇬', 'Singapore'],
        ['+66',  '🇹🇭', 'Thailand'],
        ['+81',  '🇯🇵', 'Japan'],
        ['+82',  '🇰🇷', 'South Korea'],
        ['+84',  '🇻🇳', 'Vietnam'],
        ['+86',  '🇨🇳', 'China'],
        ['+90',  '🇹🇷', 'Turkey'],
        ['+91',  '🇮🇳', 'India'],
        ['+92',  '🇵🇰', 'Pakistan'],
        ['+93',  '🇦🇫', 'Afghanistan'],
        ['+94',  '🇱🇰', 'Sri Lanka'],
        ['+95',  '🇲🇲', 'Myanmar'],
        ['+98',  '🇮🇷', 'Iran'],
        ['+211', '🇸🇸', 'South Sudan'],
        ['+212', '🇲🇦', 'Morocco'],
        ['+213', '🇩🇿', 'Algeria'],
        ['+216', '🇹🇳', 'Tunisia'],
        ['+218', '🇱🇾', 'Libya'],
        ['+220', '🇬🇲', 'Gambia'],
        ['+221', '🇸🇳', 'Senegal'],
        ['+222', '🇲🇷', 'Mauritania'],
        ['+223', '🇲🇱', 'Mali'],
        ['+224', '🇬🇳', 'Guinea'],
        ['+225', '🇨🇮', "Côte d'Ivoire"],
        ['+226', '🇧🇫', 'Burkina Faso'],
        ['+227', '🇳🇪', 'Niger'],
        ['+228', '🇹🇬', 'Togo'],
        ['+229', '🇧🇯', 'Benin'],
        ['+230', '🇲🇺', 'Mauritius'],
        ['+231', '🇱🇷', 'Liberia'],
        ['+232', '🇸🇱', 'Sierra Leone'],
        ['+233', '🇬🇭', 'Ghana'],
        ['+234', '🇳🇬', 'Nigeria'],
        ['+235', '🇹🇩', 'Chad'],
        ['+236', '🇨🇫', 'Central African Republic'],
        ['+237', '🇨🇲', 'Cameroon'],
        ['+238', '🇨🇻', 'Cabo Verde'],
        ['+239', '🇸🇹', 'São Tomé & Príncipe'],
        ['+240', '🇬🇶', 'Equatorial Guinea'],
        ['+241', '🇬🇦', 'Gabon'],
        ['+242', '🇨🇬', 'Congo'],
        ['+243', '🇨🇩', 'Congo (DR)'],
        ['+244', '🇦🇴', 'Angola'],
        ['+245', '🇬🇼', 'Guinea-Bissau'],
        ['+248', '🇸🇨', 'Seychelles'],
        ['+249', '🇸🇩', 'Sudan'],
        ['+250', '🇷🇼', 'Rwanda'],
        ['+251', '🇪🇹', 'Ethiopia'],
        ['+252', '🇸🇴', 'Somalia'],
        ['+253', '🇩🇯', 'Djibouti'],
        ['+254', '🇰🇪', 'Kenya'],
        ['+255', '🇹🇿', 'Tanzania'],
        ['+256', '🇺🇬', 'Uganda'],
        ['+257', '🇧🇮', 'Burundi'],
        ['+258', '🇲🇿', 'Mozambique'],
        ['+260', '🇿🇲', 'Zambia'],
        ['+261', '🇲🇬', 'Madagascar'],
        ['+263', '🇿🇼', 'Zimbabwe'],
        ['+264', '🇳🇦', 'Namibia'],
        ['+265', '🇲🇼', 'Malawi'],
        ['+266', '🇱🇸', 'Lesotho'],
        ['+267', '🇧🇼', 'Botswana'],
        ['+268', '🇸🇿', 'Eswatini'],
        ['+269', '🇰🇲', 'Comoros'],
        ['+291', '🇪🇷', 'Eritrea'],
        ['+351', '🇵🇹', 'Portugal'],
        ['+352', '🇱🇺', 'Luxembourg'],
        ['+353', '🇮🇪', 'Ireland'],
        ['+354', '🇮🇸', 'Iceland'],
        ['+355', '🇦🇱', 'Albania'],
        ['+356', '🇲🇹', 'Malta'],
        ['+357', '🇨🇾', 'Cyprus'],
        ['+358', '🇫🇮', 'Finland'],
        ['+359', '🇧🇬', 'Bulgaria'],
        ['+370', '🇱🇹', 'Lithuania'],
        ['+371', '🇱🇻', 'Latvia'],
        ['+372', '🇪🇪', 'Estonia'],
        ['+373', '🇲🇩', 'Moldova'],
        ['+374', '🇦🇲', 'Armenia'],
        ['+375', '🇧🇾', 'Belarus'],
        ['+376', '🇦🇩', 'Andorra'],
        ['+377', '🇲🇨', 'Monaco'],
        ['+378', '🇸🇲', 'San Marino'],
        ['+380', '🇺🇦', 'Ukraine'],
        ['+381', '🇷🇸', 'Serbia'],
        ['+382', '🇲🇪', 'Montenegro'],
        ['+383', '🇽🇰', 'Kosovo'],
        ['+385', '🇭🇷', 'Croatia'],
        ['+386', '🇸🇮', 'Slovenia'],
        ['+387', '🇧🇦', 'Bosnia & Herzegovina'],
        ['+389', '🇲🇰', 'North Macedonia'],
        ['+420', '🇨🇿', 'Czech Republic'],
        ['+421', '🇸🇰', 'Slovakia'],
        ['+423', '🇱🇮', 'Liechtenstein'],
        ['+501', '🇧🇿', 'Belize'],
        ['+502', '🇬🇹', 'Guatemala'],
        ['+503', '🇸🇻', 'El Salvador'],
        ['+504', '🇭🇳', 'Honduras'],
        ['+505', '🇳🇮', 'Nicaragua'],
        ['+506', '🇨🇷', 'Costa Rica'],
        ['+507', '🇵🇦', 'Panama'],
        ['+509', '🇭🇹', 'Haiti'],
        ['+591', '🇧🇴', 'Bolivia'],
        ['+592', '🇬🇾', 'Guyana'],
        ['+593', '🇪🇨', 'Ecuador'],
        ['+595', '🇵🇾', 'Paraguay'],
        ['+597', '🇸🇷', 'Suriname'],
        ['+598', '🇺🇾', 'Uruguay'],
        ['+670', '🇹🇱', 'Timor-Leste'],
        ['+673', '🇧🇳', 'Brunei'],
        ['+674', '🇳🇷', 'Nauru'],
        ['+675', '🇵🇬', 'Papua New Guinea'],
        ['+676', '🇹🇴', 'Tonga'],
        ['+677', '🇸🇧', 'Solomon Islands'],
        ['+678', '🇻🇺', 'Vanuatu'],
        ['+679', '🇫🇯', 'Fiji'],
        ['+680', '🇵🇼', 'Palau'],
        ['+685', '🇼🇸', 'Samoa'],
        ['+686', '🇰🇮', 'Kiribati'],
        ['+688', '🇹🇻', 'Tuvalu'],
        ['+691', '🇫🇲', 'Micronesia'],
        ['+692', '🇲🇭', 'Marshall Islands'],
        ['+855', '🇰🇭', 'Cambodia'],
        ['+856', '🇱🇦', 'Laos'],
        ['+880', '🇧🇩', 'Bangladesh'],
        ['+886', '🇹🇼', 'Taiwan'],
        ['+960', '🇲🇻', 'Maldives'],
        ['+961', '🇱🇧', 'Lebanon'],
        ['+962', '🇯🇴', 'Jordan'],
        ['+963', '🇸🇾', 'Syria'],
        ['+964', '🇮🇶', 'Iraq'],
        ['+965', '🇰🇼', 'Kuwait'],
        ['+966', '🇸🇦', 'Saudi Arabia'],
        ['+967', '🇾🇪', 'Yemen'],
        ['+968', '🇴🇲', 'Oman'],
        ['+970', '🇵🇸', 'Palestine'],
        ['+971', '🇦🇪', 'UAE'],
        ['+972', '🇮🇱', 'Israel'],
        ['+973', '🇧🇭', 'Bahrain'],
        ['+974', '🇶🇦', 'Qatar'],
        ['+975', '🇧🇹', 'Bhutan'],
        ['+976', '🇲🇳', 'Mongolia'],
        ['+977', '🇳🇵', 'Nepal'],
        ['+992', '🇹🇯', 'Tajikistan'],
        ['+993', '🇹🇲', 'Turkmenistan'],
        ['+994', '🇦🇿', 'Azerbaijan'],
        ['+995', '🇬🇪', 'Georgia'],
        ['+996', '🇰🇬', 'Kyrgyzstan'],
        ['+998', '🇺🇿', 'Uzbekistan'],
    ];

    function initPhoneCountryCode() {
        document.querySelectorAll('input[name="phone"]').forEach(function (input) {
            if (input.closest('.phone-cc-group')) return; // already initialised

            // Build the select
            var select = document.createElement('select');
            select.className = 'form-select phone-cc-select';
            select.setAttribute('aria-label', 'Country code');
            select.setAttribute('autocomplete', 'tel-country-code');

            PHONE_CODES.forEach(function (c) {
                var opt = document.createElement('option');
                opt.value = c[0];
                opt.textContent = c[1] + ' ' + c[0];
                opt.title = c[2];
                if (c[0] === '+91') opt.selected = true;
                select.appendChild(opt);
            });

            // Wrap input + select in an input-group
            var group = document.createElement('div');
            group.className = 'input-group phone-cc-group';
            input.parentNode.insertBefore(group, input);
            group.appendChild(select);
            group.appendChild(input);

            // Copy placeholder hint
            if (!input.placeholder || input.placeholder.match(/^\+?\d/)) {
                input.placeholder = 'Phone number';
            }
            input.setAttribute('autocomplete', 'tel-national');
        });

        // Capture-phase submit: merge code + number into the phone field value
        // so all form handlers (FormData, inline submit) see the merged value.
        document.querySelectorAll('form').forEach(function (form) {
            var ccSelect = form.querySelector('.phone-cc-select');
            if (!ccSelect) return;
            form.addEventListener('submit', function () {
                var phoneInput = form.querySelector('input[name="phone"]');
                if (!phoneInput) return;
                var raw = phoneInput.value.trim()
                    .replace(/^\+\d{1,4}\s*/, '')  // strip existing country code if typed
                    .replace(/^0+/, '')              // strip leading zeros (e.g. 07911 → 7911)
                    .replace(/[\s\-().]/g, '');      // strip spaces, dashes, brackets
                phoneInput.value = ccSelect.value + raw;
            }, true); // capture phase — fires before any bubble-phase handlers
        });
    }

    function applyCountryCode(dialCode) {
        document.querySelectorAll('.phone-cc-select').forEach(function (select) {
            // Exact match first, then prefix match (e.g. +1 matches +1xxx)
            var exact = Array.from(select.options).find(function (o) { return o.value === dialCode; });
            if (exact) { select.value = exact.value; return; }
            // Fallback: match longest prefix
            var best = null, bestLen = 0;
            Array.from(select.options).forEach(function (o) {
                if (dialCode.startsWith(o.value) && o.value.length > bestLen) {
                    best = o; bestLen = o.value.length;
                }
            });
            if (best) select.value = best.value;
        });
    }

    function detectAndApplyCountryCode() {
        var cached = sessionStorage.getItem('gnh_dial_code');
        if (cached) { applyCountryCode(cached); return; }

        fetch('https://ipapi.co/json/', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var code = d.country_calling_code; // e.g. "+44"
                if (code) {
                    sessionStorage.setItem('gnh_dial_code', code);
                    applyCountryCode(code);
                }
            })
            .catch(function () { /* silent — keep default +91 */ });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initPhoneCountryCode();
        detectAndApplyCountryCode();
    });
    // Also expose for pages that build their form dynamically after DOMContentLoaded
    global.initPhoneCountryCode = initPhoneCountryCode;

    /* --------------------------------------------------------------
       VISIT COUNTER – runs once per real page load
       -------------------------------------------------------------- */
    const API_URL = '/laravel/api/vcount';   // <-- change only if endpoint moves

    function trackVisit() {
        let img = new Image();
        img.src = API_URL + '?_=' + Date.now() + Math.random().toString(36).substr(2, 5);
        img.style.display = 'none';
        img.onload = img.onerror = function () { img = null; };
    }


    // Run only once per full page load
    if (!global.__visitTracked) {
        trackVisit();
        global.__visitTracked = true;
    }

    // Expose for SPA / manual calls
    global.trackVisit = trackVisit;

})(window);   // ← passes `window` as `global`