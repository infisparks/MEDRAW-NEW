document.addEventListener('DOMContentLoaded', function () {
    // Firebase Configuration and Initialization
    const firebaseConfig = {
        apiKey: "AIzaSyBJ1CqTaQEap8A4lLYCMVl4uDkT1JowfMA",
        authDomain: "medraw-pharma.firebaseapp.com",
        databaseURL: "https://medraw-pharma-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "medraw-pharma",
        storageBucket: "medraw-pharma.firebasestorage.app",
        messagingSenderId: "448438989887",
        appId: "1:448438989887:web:6eb5cd0b52ceb594df348a",
        measurementId: "G-CXMTC7TB85"
    };

    let db = null;
    let analytics = null;
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
            analytics = firebase.analytics();
        } else {
            console.warn("Firebase SDK is not loaded. Form submissions will fallback to simulated mode.");
        }
    } catch (err) {
        console.error("Error initializing Firebase:", err);
    }

    // ────────────────────────────────────────────────
    // CUSTOM PREMIUM ALERT / TOAST NOTIFICATION SYSTEM
    // ────────────────────────────────────────────────
    function showToast(title, message, type = 'success') {
        let container = document.getElementById('custom-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'custom-toast-container';
            container.className = 'custom-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `custom-toast custom-toast-${type}`;

        const iconHtml = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' :
                         type === 'error' ? '<i class="fa-solid fa-circle-xmark"></i>' :
                                            '<i class="fa-solid fa-circle-info"></i>';

        toast.innerHTML = `
            <div class="custom-toast-icon">${iconHtml}</div>
            <div class="custom-toast-content">
                <h4 class="custom-toast-title">${title}</h4>
                <p class="custom-toast-msg">${message}</p>
            </div>
            <button class="custom-toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Slide-in animation
        setTimeout(() => {
            toast.classList.add('show-toast');
        }, 50);

        // Auto dismiss
        const autoDismiss = setTimeout(() => {
            closeToast(toast);
        }, 5000);

        // Close click
        toast.querySelector('.custom-toast-close').addEventListener('click', () => {
            clearTimeout(autoDismiss);
            closeToast(toast);
        });
    }

    function closeToast(toast) {
        toast.classList.remove('show-toast');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }

    function getCurrentDateTime() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const date = `${yyyy}-${mm}-${dd}`;

        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const time = `${hh}:${min}:${ss}`;

        return { date, time };
    }

    // ────────────────────────────────────────────────
    // CONFIGURATION
    // ────────────────────────────────────────────────
    const CACHE_KEY         = 'gnh_hero_main_cache_v1';     // change version when data structure changes
    const CACHE_MAX_AGE_MIN = 60;                           // consider data fresh for 60 minutes
    const CACHE_STALE_MIN   = 1440;                         // allow stale data up to 24 hours as last resort

    const LOADING_WRAPPERS = [
        { id: 'top-products-wrapper', name: 'Top Products' },
        { id: 'faqaccordion',         name: 'FAQs' },
        { id: 'blog-wrapper',         name: 'Blogs' }
    ];

    const DEFAULT_PRODUCTS = [
        { name: "Keytruda 100mg/4ml", drug: "Pembrolizumab", image: "images/1.png" },
        { name: "Saxenda 6mg/3ml", drug: "Liraglutide", image: "images/2.png" },
        { name: "Stelara 90mg", drug: "Ustekinumab", image: "images/3.png" },
        { name: "Vyzulta 2.5ml", drug: "Latanoprostene bunod", image: "images/4.png" },
        { name: "Wilate 500IU+500IU", drug: "von Willebrand Factor / Factor VIII", image: "images/5.png" },
        { name: "Mounjaro KwikPen 5mg", drug: "Tirzepatide", image: "images/6.png" },
        { name: "Ocrevus", drug: "Ocrelizumab", image: "images/7.png" },
        { name: "Thymogam", drug: "Anti-Thymocyte Globulin", image: "images/8.png" },
        { name: "VIVJOA", drug: "Oteseconazole", image: "images/9.png" },
        { name: "TORSEMIDE 20MG", drug: "TORSEMIDE", image: "images/10.png" },
        { name: "Ef-Cort 100", drug: "Hydrocortisone Sodium Succinate IP", image: "images/12.png" },
        { name: "Duomate Transhaler", drug: "Formoterol Fumarate and Beclomethasone Dipropionate Powder For Inhalation", image: "images/13.png" },
        { name: "Forxiga 10mg", drug: "Dapagliflozin", image: "images/14.png" },
        { name: "Ezanic 15gm Gel", drug: "Azelaic Acid Gel", image: "images/15.png" },
        { name: "Loxoject", drug: "Naloxone", image: "images/16.png" },
        { name: "Sabril", drug: "Vigabatrinum", image: "images/17.png" },
        { name: "Aristada - 1064mg", drug: "Aripiprazole Lauroxil", image: "images/18.png" },
        { name: "ZBD 400", drug: "Albendazole", image: "images/19.png" },
        { name: "Oxacilline Pour Inj USP", drug: "Oxacillin Sodium USP", image: "images/20.png" }
    ];

    function observeDynamicWowElements(container) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.style.animationDelay    = el.getAttribute('data-wow-delay')    || '0s';
                        el.style.animationDuration = el.getAttribute('data-wow-duration') || '1s';
                        el.classList.add('animated');
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

            container.querySelectorAll('.wow:not(.animated)').forEach(function (el) {
                observer.observe(el);
            });
        } else {
            container.querySelectorAll('.wow:not(.animated)').forEach(function (el) {
                el.classList.add('animated');
            });
        }
    }

    let allProducts = DEFAULT_PRODUCTS;
    let showingAll = false;
    let searchQuery = '';

    // ────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────
    function removeLoading(wrapperId) {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        const loadingImg = wrapper.querySelector('img[src="images/loading.gif"]');
        if (loadingImg) loadingImg.remove();
    }

    function showFallbackMessage(wrapperId, message = "Content temporarily unavailable. Please try again later.") {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        wrapper.innerHTML = `<p class="text-center text-muted my-5">${message}</p>`;
    }

    function getCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!parsed.timestamp || !parsed.data) return null;

            const ageMinutes = (Date.now() - parsed.timestamp) / 1000 / 60;

            if (ageMinutes <= CACHE_MAX_AGE_MIN) {
                return { data: parsed.data, fresh: true };
            }
            if (ageMinutes <= CACHE_STALE_MIN) {
                return { data: parsed.data, fresh: false };
            }
            return null;
        } catch (e) {
            console.warn('Cache read error:', e);
            return null;
        }
    }

    function saveCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        } catch (e) {
            console.warn('Cache write failed:', e);
        }
    }

    function addCacheNotice() {
        const container = document.querySelector('.container.mt-5.mb-5'); // top products section
        if (!container || document.getElementById('cache-notice')) return;

        const notice = document.createElement('small');
        notice.id = 'cache-notice';
        notice.className = 'text-muted d-block text-center mt-3';
        notice.textContent = '(Showing recently cached content)';
        container.appendChild(notice);
    }

    function populateEnquiryOptions(products) {
        const container = document.getElementById('custom-product-options');
        if (!container) return;
        container.innerHTML = '';
        products.forEach(p => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.setAttribute('data-value', p.name);
            option.textContent = p.name;
            container.appendChild(option);
        });
    }

    // ────────────────────────────────────────────────
    // MAIN LOGIC
    // ────────────────────────────────────────────────
    async function loadHeroContent() {
        let data = null;
        let source = 'live';
        let isStale = false;

        // 1. Try live fetch first
        try {
            const response = await fetch('/laravel/api/fetch-hero-main', {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            data = await response.json();
            saveCache(data); // update cache on success
        } catch (err) {
            console.warn('Live fetch failed:', err);

            // 2. Fallback to cache
            const cached = getCache();
            if (cached) {
                data = cached.data;
                source = 'cache';
                isStale = !cached.fresh;
            }
        }

        // 3. Remove all loading indicators and render static testimonials
        LOADING_WRAPPERS.forEach(w => removeLoading(w.id));
        renderReviews();

        // 4. Render if we have data
        if (data) {
            // Safety: ensure arrays exist
            loadHomepageProducts();
            renderFAQs(data.faqs       || []);
            renderBlogs(data.blogs      || []);

            if (source === 'cache') {
                addCacheNotice();
                if (isStale) {
                    console.warn('Using stale cached data');
                }
            }
        } else {
            // Ultimate fallback: show message in other sections, but render DEFAULT_PRODUCTS for Top Products
            LOADING_WRAPPERS.forEach(w => {
                if (w.id === 'top-products-wrapper') {
                    loadHomepageProducts();
                } else {
                    showFallbackMessage(w.id, `Unable to load ${w.name}. Please check your connection.`);
                }
            });
        }
    }

    // ────────────────────────────────────────────────
    // RENDER FUNCTIONS (your original code – unchanged)
    // ────────────────────────────────────────────────
    function loadHomepageProducts() {
        const staticProducts = DEFAULT_PRODUCTS.map(item => ({
            ...item,
            image: item.image,
            slug: item.slug || ''
        }));

        if (!db) {
            allProducts = staticProducts;
            populateEnquiryOptions(allProducts);
            updateProductDisplay();
            return;
        }

        db.ref('add-product').on('value', snapshot => {
            let portalProducts = [];
            snapshot.forEach(childSnapshot => {
                const val = childSnapshot.val();
                const basic = val['basic-information'] || {};
                const seo = val['seo-catalog'] || {};
                const specs = val['specifications'] || {};
                
                portalProducts.push({
                    id: childSnapshot.key,
                    name: basic.productName || 'Unnamed Product',
                    drug: specs.strength || basic.productCategory || 'Pharmaceuticals',
                    image: basic.productImageUrl || 'images/product-by-default-img.png',
                    slug: seo.productUrlSlug || ''
                });
            });

            allProducts = [...portalProducts, ...staticProducts];
            populateEnquiryOptions(allProducts);
            updateProductDisplay();
        }, error => {
            console.error("Firebase read blocked on add-product for homepage: ", error);
            allProducts = staticProducts;
            populateEnquiryOptions(allProducts);
            updateProductDisplay();
        });
    }

    function updateProductDisplay() {
        const wrapper = document.getElementById('top-products-wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        const viewMoreContainer = document.getElementById('view-more-container');

        // Always show exactly 8 products on home page, search was removed from home page.
        let displayItems = allProducts.slice(0, 8);
        if (viewMoreContainer) {
            viewMoreContainer.style.display = 'flex';
        }

        if (displayItems.length === 0) {
            wrapper.innerHTML = `
                <div class="col-12 text-center py-5 wow fadeInUp">
                    <div class="mb-3">
                        <i class="fa-solid fa-circle-info text-muted" style="font-size: 3rem;"></i>
                    </div>
                    <h4 class="text-muted">No medicines found</h4>
                    <p class="text-muted">Try searching for a different keyword or ingredient.</p>
                </div>
            `;
            observeDynamicWowElements(wrapper);
            return;
        }

        displayItems.forEach((item, index) => {
            // Stagger animation delays for visual beauty
            const delay = ((index % 4) * 0.15).toFixed(2);
            
            const card = `
                <div class="col-6 col-md-6 col-lg-3">
                    <div class="card wow fadeInUp product-card" data-slug="${item.slug || ''}" data-wow-delay="${delay}s" style="cursor: pointer;">
                        <div class="product-img-wrapper">
                            <img src="${item.image}" class="product-img" alt="${item.name}" onerror="this.src='images/product-by-default-img.png'; this.parentElement.classList.add('show-default-overlay');">
                            <div class="default-img-overlay">www.medrawpharma.com</div>
                        </div>
                        <hr class="my-2">
                        <div class="card-body">
                            <h5 class="card-title text-truncate" title="${item.name}">
                                ${item.name}
                            </h5>
                            <p class="card-text text-nowrap overflow-hidden text-truncate" title="${item.drug}">
                                ${item.drug}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            wrapper.insertAdjacentHTML('beforeend', card);
        });

        // Re-observe elements for scroll animation fade-ins
        observeDynamicWowElements(wrapper);
    }

    function renderFAQs(faqs) {
        const faqContainer = document.getElementById('faqaccordion');
        if (!faqContainer) return;
        faqContainer.innerHTML = '';

        const level1Faqs = faqs.filter(item => item.faq_level === '1');

        level1Faqs.forEach((item, index) => {
            const isFirst = index === 0 ? 'show' : '';
            const isExpanded = index === 0 ? 'true' : 'false';
            const collapsedClass = index === 0 ? '' : 'collapsed';
            const delay = (index * 0.2).toFixed(1);

            const faqItem = `
                <div class="accordion-item wow fadeInUp" data-wow-delay="${delay}s">
                    <h2 class="accordion-header" id="heading${item.faq_id}">
                        <button class="accordion-button ${collapsedClass}" type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse${item.faq_id}"
                                aria-expanded="${isExpanded}"
                                aria-controls="collapse${item.faq_id}">
                            ${item.faq_question || 'Question'}
                        </button>
                    </h2>
                    <div id="collapse${item.faq_id}"
                         class="accordion-collapse collapse ${isFirst}"
                         aria-labelledby="heading${item.faq_id}"
                         data-bs-parent="#faqaccordion">
                        <div class="accordion-body">
                            <p>${item.faq_answer || 'No answer available'}</p>
                        </div>
                    </div>
                </div>
            `;
            faqContainer.insertAdjacentHTML('beforeend', faqItem);
        });
    }

    const dummyReviews = [
        {
            review_stars: "5",
            review_content: "Medraw Pharmaceuticals has been an outstanding partner in sourcing orphan drugs. Their attention to cold-chain compliance and prompt documentation is unmatched.",
            review_cname: "Dr. Sarah Jenkins",
            review_cposition: "Clinical Director, Apex Oncology"
        },
        {
            review_stars: "5",
            review_content: "Incredible regulatory support and smooth shipping for our clinical trials. Medraw ensured all comparator drugs arrived with full GDP compliance paperwork.",
            review_cname: "Marcus Vance",
            review_cposition: "Head of Procurement, Veritas Research"
        },
        {
            review_stars: "5",
            review_content: "Excellent government supply services. Their ability to deliver critical vaccines on time under strict temperature controls has saved lives.",
            review_cname: "Hon. A. K. Mensah",
            review_cposition: "Director, Ministry of Health"
        },
        {
            review_stars: "5",
            review_content: "Sourcing medicines globally under Named Patient Supply was seamless with Medraw. They kept us updated on import permits and customs clearance at every step.",
            review_cname: "Elena Rostova",
            review_cposition: "Patient Care Coordinator"
        },
        {
            review_stars: "5",
            review_content: "Outstanding Active Pharmaceutical Ingredients (APIs) supply. The quality control and GMP documentation for their drug substances met all our specifications perfectly.",
            review_cname: "David Sterling",
            review_cposition: "VP Operations, Sterling Biotech"
        },
        {
            review_stars: "5",
            review_content: "Their reference standards and certified materials were key to our successful analytical validation. Very professional and highly details-oriented team.",
            review_cname: "Dr. Kenji Tanaka",
            review_cposition: "Quality Control Director"
        },
        {
            review_stars: "5",
            review_content: "Highly reliable partner for rare disease treatments. Medraw's global supply chain access allows us to treat patients who have run out of options.",
            review_cname: "Prof. Laura Bell",
            review_cposition: "Pediatric Immunologist"
        },
        {
            review_stars: "5",
            review_content: "Superb cold-chain packaging and real-time transit tracking. Every validated shipping container arrived with data logger reports showing zero temperature excursion.",
            review_cname: "Jean-Pierre Laurent",
            review_cposition: "Logistics Director, EuroPharma"
        },
        {
            review_stars: "5",
            review_content: "We have worked with many global pharmaceutical suppliers, but Medraw stands out for their honesty, speed, and complete adherence to ethical guidelines.",
            review_cname: "Sanjay Mehta",
            review_cposition: "Managing Director, LifeCare Distributors"
        },
        {
            review_stars: "5",
            review_content: "A truly responsive team that treats urgent medicine requests with the priority they deserve. We highly recommend Medraw Pharmaceuticals.",
            review_cname: "Clara Oswald",
            review_cposition: "Hospital Chief Pharmacist"
        }
    ];

    function renderReviews(reviews) {
        const wrapper = document.getElementById('testimonial-wrapper');
        if (!wrapper) return;
        let html = '';

        dummyReviews.forEach(review => {
            let stars = '';
            const starCount = Number(review.review_stars) || 0;
            for (let i = 0; i < starCount; i++) {
                stars += '<i class="fa-solid fa-star"></i>';
            }

            html += `
                <div class="swiper-slide">
                    <div class="testimonial-item">
                        <div class="testimonial-rating">
                            ${stars || '<i class="fa-solid fa-star-half-stroke"></i>'}
                        </div>
                        <div class="testimonial-content">
                            <p>${review.review_content || ''}</p>
                        </div>
                        <div class="testimonial-footer">
                            <div class="author-content">
                                <p class="fw-bold">${review.review_cname || 'Anonymous'}</p>
                                <p>${review.review_cposition || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        wrapper.innerHTML = html;

        // Initialize Swiper only if container exists
        const slider = document.querySelector('.testimonial-slider .swiper');
        if (slider && typeof Swiper !== 'undefined') {
            new Swiper(slider, {
                slidesPerView: 1,
                speed: 1000,
                spaceBetween: 30,
                loop: true,
                autoplay: { delay: 3000 },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.testimonial-btn-next',
                    prevEl: '.testimonial-btn-prev',
                },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    991: { slidesPerView: 3 }
                }
            });
        }
    }

    function renderBlogs(blogs) {
        const wrapper = document.getElementById('blog-wrapper');
        if (!wrapper) return;
        let html = '';

        const publishedBlogs = blogs
            .filter(blog => blog.blog_ispub == 1)
            .sort((a, b) => new Date(b.blog_created) - new Date(a.blog_created))
            .slice(0, 3);

        publishedBlogs.forEach((blog, index) => {
            const delay = index * 0.2;
            html += `
                <div class="col-lg-4 col-md-6">
                    <div class="post-item wow fadeInUp" data-wow-delay="${delay}s">
                        <div class="post-featured-image">
                            <a href="blog/${blog.blog_slug || '#'}" data-cursor-text="View">
                                <figure class="image-anime">
                                    <img src="images/blog/${blog.blog_heroimg || 'placeholder.jpg'}" 
                                         alt="${blog.blog_title || 'Blog post'}">
                                </figure>
                            </a>
                        </div>
                        <div class="post-item-body">
                            <div class="post-item-meta">
                                <ul>
                                    <li><a href="blog/${blog.blog_slug || '#'}">by ${blog.blog_author || 'Medraw Team'}</a></li>
                                    <li>${formatDate(blog.blog_created)}</li>
                                </ul>
                            </div>
                            <div class="post-item-content">
                                <h2 style="font-size: 1.3rem !important;">
                                    <a href="blog/${blog.blog_slug || '#'}">${blog.blog_title || 'Untitled'}</a>
                                </h2>
                            </div>
                            <div class="post-item-btn">
                                <a href="blog/${blog.blog_slug || '#'}" class="readmore-btn">Read more</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        wrapper.innerHTML = html;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Recent';
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options).toLowerCase();
        } catch {
            return 'Recent';
        }
    }

    // ────────────────────────────────────────────────
    // START LOADING & EVENT LISTENERS
    // ────────────────────────────────────────────────
    loadHeroContent();

    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            updateProductDisplay();
        });
    }

    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                updateProductDisplay();
                searchInput.focus();
            }
        });
    }

    // Handle click on product card to open details page
    $(document).on('click', '.product-card', function() {
        const slug = $(this).attr('data-slug');
        if (slug) {
            window.location.href = `product/?slug=${slug}`;
        } else {
            const productName = $(this).find('.card-title').text().trim();
            window.location.href = `product/?name=${encodeURIComponent(productName)}`;
        }
    });

    // ────────────────────────────────────────────────
    // QUICK ENQUIRY POPUP CARD LOGIC
    // ────────────────────────────────────────────────
    let wasAutoTriggered = false;

    function showEnquiryPopup(auto = false) {
        const popup = document.getElementById('enquiry-popup-card');
        const backdrop = document.getElementById('enquiry-popup-backdrop');
        if (!popup) return;
        wasAutoTriggered = auto;
        popup.classList.remove('hide-popup');
        popup.classList.add('show-popup');
        if (backdrop) {
            backdrop.classList.add('show-backdrop');
        }
    }

    function hideEnquiryPopup() {
        const popup = document.getElementById('enquiry-popup-card');
        const backdrop = document.getElementById('enquiry-popup-backdrop');
        if (!popup) return;
        popup.classList.remove('show-popup');
        popup.classList.add('hide-popup');
        if (backdrop) {
            backdrop.classList.remove('show-backdrop');
        }
    }

    // 1. Auto-popup after 2 seconds
    let autoPopupTimer = setTimeout(function() {
        showEnquiryPopup(true);
    }, 2000);

    // 2. Hide when user scrolls down (only if auto-triggered)
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop && st > 100) {
            // Scrolling down
            if (wasAutoTriggered) {
                hideEnquiryPopup();
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // 3. Close button action
    const closeBtn = document.getElementById('close-enquiry-popup');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            hideEnquiryPopup();
            clearTimeout(autoPopupTimer);
        });
    }

    // 3b. Backdrop click action
    const backdrop = document.getElementById('enquiry-popup-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', function() {
            hideEnquiryPopup();
            clearTimeout(autoPopupTimer);
        });
    }

    // 4. Enquire Now button click handler (Desktop and Mobile)
    $(document).on('click', '#enquire-now-btn, .menu-enquire-btn', function(e) {
        e.preventDefault();
        showEnquiryPopup(false); // User initiated
        clearTimeout(autoPopupTimer);
        
        // Gracefully close SlickNav menu if it's open on mobile/tablet
        try {
            if ($('#menu').slicknav) {
                $('#menu').slicknav('close');
            }
        } catch(err) {
            console.warn('SlickNav close failed:', err);
        }
    });

    // 5. Custom select sliding toggle
    $('#custom-product-select').on('click', function(e) {
        e.stopPropagation();
        $('#custom-product-options').slideToggle(300);
        $(this).find('.select-arrow').toggleClass('rotate-arrow');
    });

    $(document).on('click', '.custom-option', function() {
        const val = $(this).attr('data-value');
        $('#selected-product-text').text(val).removeClass('text-muted');
        $('#selected-product-value').val(val);
        $('#custom-product-options').slideUp(200);
        $('#custom-product-select .select-arrow').removeClass('rotate-arrow');
    });

    $(document).on('click', function() {
        $('#custom-product-options').slideUp(200);
        $('#custom-product-select .select-arrow').removeClass('rotate-arrow');
    });

    $('#custom-product-options').on('click', function(e) {
        if (!$(e.target).closest('.custom-option').length) {
            e.stopPropagation();
        }
    });

    // Handle Enquire form submit
    const enquiryForm = document.getElementById('popupEnquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = enquiryForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending...';
            
            const name = enquiryForm.querySelector('input[name="name"]').value.trim();
            const email = enquiryForm.querySelector('input[name="email"]').value.trim();
            const phone = enquiryForm.querySelector('input[name="phone"]').value.trim();
            const product = $('#selected-product-value').val();
            const requirement = enquiryForm.querySelector('textarea[name="requirement"]').value.trim();
            
            if (!product) {
                showToast('Validation Error', 'Please select a product you are interested in.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                return;
            }
            
            const { date, time } = getCurrentDateTime();
            
            if (db) {
                const uid = db.ref().child('Enquire-data').push().key;
                db.ref('Enquire-data/' + uid).set({
                    uid: uid,
                    name: name,
                    email: email,
                    phone: phone,
                    product: product,
                    requirement: requirement,
                    date: date,
                    time: time,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }, function(error) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    
                    if (error) {
                        showToast('Submission Error', 'Failed to save data: ' + error.message, 'error');
                    } else {
                        showToast('Enquiry Submitted', 'Thank you! Your enquiry has been received successfully.', 'success');
                        enquiryForm.reset();
                        $('#selected-product-text').text("Product I'm interested in").addClass('text-muted');
                        $('#selected-product-value').val('');
                        hideEnquiryPopup();
                    }
                });
            } else {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    showToast('Simulation Mode', 'Firebase database is currently offline.', 'info');
                    enquiryForm.reset();
                    $('#selected-product-text').text("Product I'm interested in").addClass('text-muted');
                    $('#selected-product-value').val('');
                    hideEnquiryPopup();
                }, 1000);
            }
        });
    }

    // Handle Contact form submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending...';
            
            const name = contactForm.querySelector('input[name="name"]').value.trim();
            const reason = contactForm.querySelector('select[name="reason"]').value;
            const email = contactForm.querySelector('input[name="email"]').value.trim();
            const phoneCc = contactForm.querySelector('select[name="phone_cc"]').value;
            const phoneNum = contactForm.querySelector('input[name="phone"]').value.trim();
            const message = contactForm.querySelector('textarea[name="message"]').value.trim();
            
            const phone = `${phoneCc} ${phoneNum}`;
            const { date, time } = getCurrentDateTime();
            
            if (db) {
                const uid = db.ref().child('Contact-data').push().key;
                db.ref('Contact-data/' + uid).set({
                    uid: uid,
                    name: name,
                    reason: reason,
                    email: email,
                    phone: phone,
                    message: message,
                    date: date,
                    time: time,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }, function(error) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    
                    if (error) {
                        showToast('Submission Error', 'Failed to save message: ' + error.message, 'error');
                    } else {
                        showToast('Message Sent', 'Thank you! Your message has been sent successfully.', 'success');
                        contactForm.reset();
                    }
                });
            } else {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    showToast('Simulation Mode', 'Firebase database is currently offline.', 'info');
                    contactForm.reset();
                }, 1000);
            }
        });
    }

    // Optional: clear cache for debugging (uncomment when needed)
    // localStorage.removeItem(CACHE_KEY);
});