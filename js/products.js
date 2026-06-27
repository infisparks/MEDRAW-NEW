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
    // CONFIGURATION & CACHE
    // ────────────────────────────────────────────────
    const CACHE_KEY         = 'gnh_hero_main_cache_v1';
    const CACHE_MAX_AGE_MIN = 60;
    const CACHE_STALE_MIN   = 1440;

    const DEFAULT_PRODUCTS = [
        { name: "Keytruda 100mg/4ml", drug: "Pembrolizumab", image: "images/1.png", slug: "keytruda-100mg" },
        { name: "Saxenda 6mg/3ml", drug: "Liraglutide", image: "images/2.png", slug: "saxenda-6mg" },
        { name: "Stelara 90mg", drug: "Ustekinumab", image: "images/3.png", slug: "stelara-90mg" },
        { name: "Vyzulta 2.5ml", drug: "Latanoprostene bunod", image: "images/4.png", slug: "vyzulta-25ml" },
        { name: "Wilate 500IU+500IU", drug: "von Willebrand Factor / Factor VIII", image: "images/5.png", slug: "wilate-500iu" },
        { name: "Mounjaro KwikPen 5mg", drug: "Tirzepatide", image: "images/6.png", slug: "mounjaro-5mg" },
        { name: "Ocrevus", drug: "Ocrelizumab", image: "images/7.png", slug: "ocrevus" },
        { name: "Thymogam", drug: "Anti-Thymocyte Globulin", image: "images/8.png", slug: "thymogam" },
        { name: "VIVJOA", drug: "Oteseconazole", image: "images/9.png", slug: "vivjoa" },
        { name: "TORSEMIDE 20MG", drug: "TORSEMIDE", image: "images/10.png", slug: "torsemide-20mg" },
        { name: "Ef-Cort 100", drug: "Hydrocortisone Sodium Succinate IP", image: "images/12.png", slug: "ef-cort-100" },
        { name: "Duomate Transhaler", drug: "Formoterol Fumarate and Beclomethasone Dipropionate Powder For Inhalation", image: "images/13.png", slug: "duomate-transhaler" },
        { name: "Forxiga 10mg", drug: "Dapagliflozin", image: "images/14.png", slug: "forxiga-10mg" },
        { name: "Ezanic 15gm Gel", drug: "Azelaic Acid Gel", image: "images/15.png", slug: "ezanic-15gm" },
        { name: "Loxoject", drug: "Naloxone", image: "images/16.png", slug: "loxoject" },
        { name: "Sabril", drug: "Vigabatrinum", image: "images/17.png", slug: "sabril" },
        { name: "Aristada - 1064mg", drug: "Aripiprazole Lauroxil", image: "images/18.png", slug: "aristada-1064mg" },
        { name: "ZBD 400", drug: "Albendazole", image: "images/19.png", slug: "zbd-400" },
        { name: "Oxacilline Pour Inj USP", drug: "Oxacillin Sodium USP", image: "images/20.png", slug: "oxacilline-usp" }
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

    let allProducts = [];
    let searchQuery = '';
    let currentPage = 1;
    const ITEMS_PER_PAGE = 12;

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
        const container = document.querySelector('.container.mt-5'); // products page search area or listing
        if (!container || document.getElementById('cache-notice')) return;

        const notice = document.createElement('small');
        notice.id = 'cache-notice';
        notice.className = 'text-muted d-block text-center mt-3';
        notice.textContent = '(Showing recently cached content)';
        container.appendChild(notice);
    }

    function removeLoading() {
        const wrapper = document.getElementById('products-wrapper');
        if (!wrapper) return;
        const loadingImg = wrapper.querySelector('img[src="../images/loading.gif"]');
        if (loadingImg) loadingImg.remove();
        // Remove parent div of loading image if it exists
        const loadingParent = wrapper.querySelector('.text-center.py-5');
        if (loadingParent) loadingParent.remove();
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
    // MAIN LOGIC - FETCH PRODUCTS
    // ────────────────────────────────────────────────
    function loadProductsContent() {
        const staticProducts = DEFAULT_PRODUCTS.map(item => ({
            ...item,
            image: `../${item.image}`,
            image2: '',
            slug: item.slug || '',
            id: '',
            category: 'Pharmaceuticals'
        }));

        if (!db) {
            // Fallback to static default list
            allProducts = staticProducts;
            populateEnquiryOptions(allProducts);
            updateProductDisplay();
            return;
        }

        db.ref('add-product').on('value', snapshot => {
            allProducts = [];
            
            // 1. Fetch dynamic products from Firebase database
            snapshot.forEach(childSnapshot => {
                const val = childSnapshot.val();
                const basic = val['basic-information'] || {};
                const seo = val['seo-catalog'] || {};
                
                allProducts.push({
                    id: childSnapshot.key,
                    name: basic.productName || 'Unnamed Product',
                    category: basic.productCategory || 'N/A',
                    image: basic.productImageUrl || '',
                    image2: basic.productImageUrl2 || '',
                    slug: seo.productUrlSlug || '',
                    sku: seo.productSku || '',
                    metaTitle: seo.metaTitle || '',
                    metaDesc: seo.metaDescription || '',
                    keywords: seo.productKeywords || []
                });
            });

            // 2. Append the 20 static dummy products so they are also available
            allProducts = [...allProducts, ...staticProducts];

            removeLoading();
            populateEnquiryOptions(allProducts);
            updateProductDisplay();
        }, error => {
            console.error("Firebase read blocked on add-product: ", error);
            removeLoading();
            allProducts = staticProducts;
            populateEnquiryOptions(allProducts);
            updateProductDisplay();
        });
    }

    function updateProductDisplay() {
        const wrapper = document.getElementById('products-wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        const clearBtn = document.getElementById('clear-large-search');

        // Apply filter if search query is active
        const query = searchQuery.trim().toLowerCase();
        let filteredProducts = allProducts;
        
        if (query) {
            filteredProducts = allProducts.filter(item => 
                item.name.toLowerCase().includes(query) || 
                (item.category && item.category.toLowerCase().includes(query))
            );
            if (clearBtn) clearBtn.classList.remove('d-none');
        } else {
            if (clearBtn) clearBtn.classList.add('d-none');
        }

        // Compute pagination parameters
        const totalItems = filteredProducts.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        // Adjust currentPage if it exceeds totalPages
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const displayItems = filteredProducts.slice(startIndex, endIndex);

        if (displayItems.length === 0) {
            wrapper.innerHTML = `
                <div class="col-12 text-center py-5 wow fadeInUp">
                    <div class="mb-3">
                        <i class="fa-solid fa-circle-info text-muted" style="font-size: 3rem;"></i>
                    </div>
                    <h4 class="text-muted">No medicines found</h4>
                    <p class="text-muted">Try searching for a different keyword or category.</p>
                </div>
            `;
            observeDynamicWowElements(wrapper);
            renderPagination(0);
            return;
        }

        displayItems.forEach((item, index) => {
            const delay = ((index % 4) * 0.12).toFixed(2);
            
            // Image Fallback Handling
            const primaryImage = item.image || item.image2 || '../images/product-by-default-img.png';
            const secondaryImage = item.image2 || '../images/product-by-default-img.png';
            
            // Format Category string beautifully
            let categoryText = item.category || 'N/A';
            if (categoryText === 'pharmaceuticals') categoryText = 'Pharmaceuticals';
            else if (categoryText === 'apis-bulk') categoryText = 'APIs & Bulk Drugs';
            else if (categoryText === 'surgical-supplies') categoryText = 'Surgical Supplies';
            else if (categoryText === 'medical-devices') categoryText = 'Medical Devices';
            else if (categoryText === 'lab-equipment') categoryText = 'Laboratory Equipment';

            const card = `
                <div class="col-6 col-md-6 col-lg-3">
                    <div class="card wow fadeInUp product-card" data-wow-delay="${delay}s" data-id="${item.id || ''}" data-slug="${item.slug || ''}" style="cursor: pointer;">
                        <div class="product-img-wrapper">
                            <img src="${primaryImage}" class="product-img" alt="${item.name}" onerror="if(this.src !== '${secondaryImage}') { this.src = '${secondaryImage}'; } else { this.src = '../images/product-by-default-img.png'; this.parentElement.classList.add('show-default-overlay'); }">
                            <div class="default-img-overlay">www.medrawpharma.com</div>
                        </div>
                        <hr class="my-2">
                        <div class="card-body">
                            <h5 class="card-title text-truncate" title="${item.name}">
                                ${item.name}
                            </h5>
                            <p class="card-text text-nowrap overflow-hidden text-truncate text-muted" style="font-size: 13px;" title="${categoryText}">
                                ${categoryText}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            wrapper.insertAdjacentHTML('beforeend', card);
        });

        // Re-observe scroll animations
        observeDynamicWowElements(wrapper);

        // Render premium pagination controls
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('products-pagination');
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) {
            return; // No pagination needed
        }

        // Previous button
        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        let paginationHtml = `
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = currentPage === i ? 'active' : '';
            paginationHtml += `
                <li class="page-item ${activeClass}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next button
        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        paginationHtml += `
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationContainer.innerHTML = paginationHtml;

        // Attach click listeners to pagination links
        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = Number(this.getAttribute('data-page'));
                if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                    currentPage = targetPage;
                    updateProductDisplay();

                    // Smooth scroll to top of search results/header
                    const header = document.querySelector('.large-search-box-wrapper');
                    if (header) {
                        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // ────────────────────────────────────────────────
    // EVENT LISTENERS
    // ────────────────────────────────────────────────
    loadProductsContent();

    const searchInput = document.getElementById('large-product-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            currentPage = 1; // Reset to first page on search
            updateProductDisplay();
        });
    }

    const clearBtn = document.getElementById('clear-large-search');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                currentPage = 1;
                updateProductDisplay();
                searchInput.focus();
            }
        });
    }

    // Handle card click to launch product detail page
    $(document).on('click', '.product-card', function() {
        const slug = $(this).attr('data-slug');
        const id = $(this).attr('data-id');
        if (slug) {
            window.location.href = `../product/?slug=${slug}`;
        } else if (id) {
            window.location.href = `../product/?id=${id}`;
        } else {
            const productName = $(this).find('.card-title').text().trim();
            window.location.href = `../product/?name=${encodeURIComponent(productName)}`;
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

    // Auto-popup after 2 seconds
    let autoPopupTimer = setTimeout(function() {
        showEnquiryPopup(true);
    }, 2000);

    // Hide when scrolling down (auto-triggered only)
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop && st > 100) {
            if (wasAutoTriggered) {
                hideEnquiryPopup();
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // Close buttons
    const closeBtn = document.getElementById('close-enquiry-popup');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            hideEnquiryPopup();
            clearTimeout(autoPopupTimer);
        });
    }

    const backdrop = document.getElementById('enquiry-popup-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', function() {
            hideEnquiryPopup();
            clearTimeout(autoPopupTimer);
        });
    }

    // Enquire buttons
    $(document).on('click', '#enquire-now-btn, .menu-enquire-btn', function(e) {
        e.preventDefault();
        showEnquiryPopup(false);
        clearTimeout(autoPopupTimer);

        try {
            if ($('#menu').slicknav) {
                $('#menu').slicknav('close');
            }
        } catch(err) {
            console.warn('SlickNav close failed:', err);
        }
    });

    // Custom select drop logic in Enquiry Form
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

    // Enquiry form submit logic
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
});
