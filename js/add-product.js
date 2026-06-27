/* ==========================================================================
   Add Product UI Interactivity Script
   ========================================================================== */

// Store keywords as an array
let productKeywords = [];

document.addEventListener('DOMContentLoaded', () => {
    // Setup dropzone events
    setupImageDropzone();
    
    // Setup tags input events
    setupTagsInput();
    
    // Setup form events
    setupFormActions();
});

/**
 * Toggle Collapsible Card
 */
function toggleCard(headerElement) {
    const card = headerElement.closest('.form-card');
    card.classList.toggle('collapsed');
}

/**
 * Handle dynamic fields depending on category choice
 */
function handleCategoryChange() {
    const category = document.getElementById('prodCategory').value;
    const apiCard = document.getElementById('dynamic-api-card');
    const surgicalCard = document.getElementById('dynamic-surgical-card');
    
    // Hide both by default
    apiCard.classList.add('d-none');
    surgicalCard.classList.add('d-none');
    
    // Remove inputs from standard validation when hidden
    toggleInputsRequired(apiCard, false);
    toggleInputsRequired(surgicalCard, false);
    
    if (category === 'apis-bulk') {
        apiCard.classList.remove('d-none');
        apiCard.classList.remove('collapsed'); // auto open
        toggleInputsRequired(apiCard, false); // No fields are explicitly required in spec sheet for API but standard inputs are there
    } else if (category === 'surgical-supplies') {
        surgicalCard.classList.remove('d-none');
        surgicalCard.classList.remove('collapsed'); // auto open
        toggleInputsRequired(surgicalCard, false);
    }
}

/**
 * Helper to turn on/off validation requirements for dynamic fields
 */
function toggleInputsRequired(container, isRequired) {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Only set required if it had it originally (we don't have mandatory dynamic fields specified, but it's good practice)
        if (isRequired) {
            // Can add specific logic here if needed
        } else {
            input.removeAttribute('required');
        }
    });
}

/**
 * setupImageDropzone
 */
function setupDropzoneElement(dropzoneId, fileInputId, previewOverlayId, previewImgId) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    
    if (!dropzone || !fileInput) return;
    
    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-preview')) return;
        fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-color)';
        dropzone.style.backgroundColor = 'var(--secondary-color)';
    });
    
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#cbd5e1';
        dropzone.style.backgroundColor = '#fafbfc';
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#cbd5e1';
        dropzone.style.backgroundColor = '#fafbfc';
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleImagePreviewElement(fileInput.files[0], fileInputId, previewOverlayId, previewImgId);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files && fileInput.files[0]) {
            handleImagePreviewElement(fileInput.files[0], fileInputId, previewOverlayId, previewImgId);
        }
    });
}

function setupImageDropzone() {
    setupDropzoneElement('imageUploadZone', 'prodImage', 'imagePreviewOverlay', 'imagePreviewImg');
    setupDropzoneElement('imageUploadZone2', 'prodImage2', 'imagePreviewOverlay2', 'imagePreviewImg2');
}

/**
 * Handles image selection validation and preview
 */
function handleImagePreviewElement(file, fileInputId, previewOverlayId, previewImgId) {
    if (!file) return;
    
    // Check type: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid Type', 'Please upload a JPG, JPEG, PNG, or WEBP image.', 'error');
        resetImageUploadElement(fileInputId, previewOverlayId, previewImgId);
        return;
    }
    
    // Check size: Max 500 KB
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
        showNotification('File Too Large', 'Product image size cannot exceed 500 KB.', 'error');
        resetImageUploadElement(fileInputId, previewOverlayId, previewImgId);
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewOverlay = document.getElementById(previewOverlayId);
        const previewImg = document.getElementById(previewImgId);
        
        previewImg.src = e.target.result;
        previewOverlay.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
}

/**
 * Reset upload zones
 */
function resetImageUploadElement(fileInputId, previewOverlayId, previewImgId) {
    const fileInput = document.getElementById(fileInputId);
    const previewOverlay = document.getElementById(previewOverlayId);
    const previewImg = document.getElementById(previewImgId);
    
    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.src = '';
    if (previewOverlay) previewOverlay.classList.add('d-none');
}

function resetImageUpload() {
    resetImageUploadElement('prodImage', 'imagePreviewOverlay', 'imagePreviewImg');
}

function resetImageUpload2() {
    resetImageUploadElement('prodImage2', 'imagePreviewOverlay2', 'imagePreviewImg2');
}

/**
 * Setup keyword tags input
 */
function setupTagsInput() {
    const tagInput = document.getElementById('seoKeywordsInput');
    const tagContainer = document.getElementById('tagsContainer');
    
    if (!tagInput || !tagContainer) return;
    
    // Listen for keys: comma, enter
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tagValue = tagInput.value.trim().replace(/,/g, '');
            
            if (tagValue && !productKeywords.includes(tagValue)) {
                productKeywords.push(tagValue);
                renderTags();
            }
            tagInput.value = '';
        }
    });
    
    // Lose focus -> add tag
    tagInput.addEventListener('blur', () => {
        const tagValue = tagInput.value.trim().replace(/,/g, '');
        if (tagValue && !productKeywords.includes(tagValue)) {
            productKeywords.push(tagValue);
            renderTags();
        }
        tagInput.value = '';
    });
}

/**
 * Render badges in tags input wrapper
 */
function renderTags() {
    const tagContainer = document.getElementById('tagsContainer');
    const tagInput = document.getElementById('seoKeywordsInput');
    
    // Clear old tags except input
    const existingBadges = tagContainer.querySelectorAll('.tag-badge');
    existingBadges.forEach(badge => badge.remove());
    
    // Render current keywords array before the input element
    productKeywords.forEach((tag, index) => {
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        badge.innerHTML = `
            ${escapeHTML(tag)}
            <i class="fa-solid fa-xmark tag-remove" onclick="removeTag(${index})"></i>
        `;
        tagContainer.insertBefore(badge, tagInput);
    });
}

/**
 * Remove keyword tag by index
 */
function removeTag(index) {
    productKeywords.splice(index, 1);
    renderTags();
}

/**
 * SEO character counter helpers
 */
function updateSeoCounters() {
    const metaTitle = document.getElementById('seoMetaTitle');
    const metaDesc = document.getElementById('seoMetaDesc');
    
    if (metaTitle) {
        updateCounterElement(metaTitle, 'titleCounter', 60);
    }
    if (metaDesc) {
        updateCounterElement(metaDesc, 'descCounter', 160);
    }
}

function updateCounterElement(input, counterId, limit) {
    const counter = document.getElementById(counterId);
    if (!counter) return;
    
    const count = input.value.length;
    counter.textContent = `${count} / ${limit}`;
    
    // Style logic
    counter.classList.remove('warning', 'danger');
    if (count > limit) {
        counter.classList.add('danger');
    } else if (count >= limit * 0.8) {
        counter.classList.add('warning');
    }
}

/**
 * Regulatory Info toggle active class helper
 */
function toggleRegulatory(element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    element.classList.toggle('active', checkbox.checked);
}

// Support actual clicks on the toggle checkbox itself
function preventCheckboxBubble(e) {
    e.stopPropagation();
    const item = e.target.closest('.regulatory-item');
    if (item) {
        item.classList.toggle('active', e.target.checked);
    }
}

/**
 * Form action handlers (Save, Reset, Preview)
 */
function setupFormActions() {
    const form = document.getElementById('addProductForm');
    if (!form) return;
    
    // Validate required inputs and redirect/focus to the first invalid field
    const saveBtn = form.querySelector('.btn-action-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            const invalidInput = form.querySelector(':invalid');
            if (invalidInput) {
                // Expand all collapsed parent cards to ensure the input is visible
                let parent = invalidInput.closest('.form-card');
                while (parent) {
                    if (parent.classList.contains('collapsed')) {
                        parent.classList.remove('collapsed');
                    }
                    parent = parent.parentElement.closest('.form-card');
                }
                
                // Scroll to the invalid element
                invalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Focus and report validity
                setTimeout(() => {
                    invalidInput.focus();
                    invalidInput.reportValidity();
                }, 300);
                
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    
    // Save/Add Product
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Ensure firebase db and storage are loaded
        if (!window.db || !window.storage) {
            showNotification('Firebase Error', 'Firebase database or storage is not initialized. Please reload page.', 'error');
            return;
        }
        
        const saveBtn = form.querySelector('.btn-action-save');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Adding Product...';
        
        // 1. Determine if updating existing or adding new product
        const isEditing = !!window.editingProductId;
        const productId = isEditing ? window.editingProductId : window.db.ref('add-product').push().key;
        const newProductRef = window.db.ref('add-product/' + productId);
        
        // Helper function to save product JSON data
        const saveProductData = (downloadURL, downloadURL2) => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            const timestamp = now.getTime();

            const regulatoryCompliance = {};
            document.querySelectorAll('.regulatory-item input[type="checkbox"]').forEach(cb => {
                regulatoryCompliance[cb.value] = cb.checked;
            });
            
            const documentsAvailable = {};
            document.querySelectorAll('#documents-card input[type="checkbox"]').forEach(cb => {
                documentsAvailable[cb.value] = cb.checked;
            });
            
            const productData = {
                date: dateStr,
                time: timeStr,
                timestamp: timestamp,
                'basic-information': {
                    productName: document.getElementById('prodName').value.trim(),
                    productCategory: document.getElementById('prodCategory').value,
                    productDescription: document.getElementById('prodDesc').value.trim(),
                    productImageUrl: downloadURL,
                    productImageUrl2: downloadURL2
                },
                'specifications': {
                    strength: document.getElementById('specStrength').value.trim(),
                    dosageForm: document.getElementById('specDosage').value.trim(),
                    packing: document.getElementById('specPacking').value.trim(),
                    shelfLife: document.getElementById('specShelfLife').value.trim(),
                    storageConditions: document.getElementById('specStorage').value.trim()
                },
                'packaging': {
                    cartonSize: document.getElementById('pkgCartonSize').value.trim(),
                    quantityPerBox: document.getElementById('pkgQtyPerBox').value ? parseInt(document.getElementById('pkgQtyPerBox').value) : '',
                    exportPackagingDetails: document.getElementById('pkgExportDetails').value.trim()
                },
                'manufacturer': {
                    manufacturerName: document.getElementById('mfgName').value.trim(),
                    countryOfOrigin: document.getElementById('mfgCountry').value,
                    brandName: document.getElementById('mfgBrand').value.trim()
                },
                'regulatory-compliance': regulatoryCompliance,
                'applications-indications': {
                    applicationsIndications: document.getElementById('appIndications').value.trim()
                },
                'availability': {
                    stockStatus: document.getElementById('availStockStatus').value,
                    minimumOrderQuantity: document.getElementById('availMoq').value ? parseInt(document.getElementById('availMoq').value) : ''
                },
                'documents-available': documentsAvailable,
                'seo-catalog': {
                    productSku: document.getElementById('prodSku').value.trim(),
                    productUrlSlug: document.getElementById('prodSlug').value.trim(),
                    metaTitle: document.getElementById('seoMetaTitle').value.trim(),
                    metaDescription: document.getElementById('seoMetaDesc').value.trim(),
                    productKeywords: productKeywords
                }
            };
            
            // Add dynamic API information if selected category matches
            const category = document.getElementById('prodCategory').value;
            if (category === 'apis-bulk') {
                productData['api-information'] = {
                    casNumber: document.getElementById('apiCasNumber').value.trim(),
                    molecularFormula: document.getElementById('apiFormula').value.trim(),
                    molecularWeight: document.getElementById('apiWeight').value.trim(),
                    pharmacopoeiaStandard: document.getElementById('apiStandard').value,
                    grade: document.getElementById('apiGrade').value.trim(),
                    purity: document.getElementById('apiPurity').value.trim(),
                    apiShelfLife: document.getElementById('apiShelfLife').value.trim()
                };
            } else if (category === 'surgical-supplies') {
                productData['surgical-information'] = {
                    material: document.getElementById('surgMaterial').value.trim(),
                    sterilityStatus: document.getElementById('surgSterility').value,
                    disposableReusable: document.getElementById('surgDisposable').value,
                    sizeVariants: document.getElementById('surgSize').value.trim(),
                    intendedUse: document.getElementById('surgIntendedUse').value.trim()
                };
            }
            
            // Save product object to Realtime Database
            newProductRef.set(productData)
                .then(() => {
                    const msg = isEditing ? 'Product has been successfully updated!' : 'Product has been successfully added to catalog!';
                    showNotification('Success', msg, 'success');
                    resetProductForm();
                })
                .catch((dbError) => {
                    console.error('Database write error:', dbError);
                    showNotification('Database Error', 'Failed to save product details: ' + dbError.message, 'error');
                })
                .finally(() => {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Add Product';
                });
        };

        const uploadImagePromise = (fileInputId, fileNamePrefix, productId) => {
            return new Promise((resolve, reject) => {
                const imgInput = document.getElementById(fileInputId);
                if (!imgInput || !imgInput.files || imgInput.files.length === 0) {
                    resolve("");
                    return;
                }
                const file = imgInput.files[0];
                const fileExtension = file.name.split('.').pop();
                const fileName = `${fileNamePrefix}_product_${productId}.${fileExtension}`;
                const storageRef = window.storage.ref();
                const fileRef = storageRef.child(`products/${productId}/${fileName}`);
                
                const uploadTask = fileRef.put(file);
                uploadTask.on('state_changed', null,
                    (error) => reject(error),
                    () => {
                        uploadTask.snapshot.ref.getDownloadURL()
                            .then(url => resolve(url))
                            .catch(err => reject(err));
                    }
                );
            });
        };

        const hasPrimary = document.getElementById('prodImage').files && document.getElementById('prodImage').files.length > 0;
        
        if (hasPrimary) {
            showNotification('Uploading', 'Uploading product image...', 'info');
            uploadImagePromise('prodImage', 'primary', productId).then((primaryUrl) => {
                saveProductData(primaryUrl, "");
            }).catch((error) => {
                console.error('Image upload error:', error);
                showNotification('Upload Error', 'Failed to upload product image: ' + error.message, 'error');
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Add Product';
            });
        } else {
            saveProductData("", "");
        }
    });
}

/**
 * Reset form action
 */
function resetProductForm() {
    const form = document.getElementById('addProductForm');
    if (!form) return;
    
    form.reset();
    resetImageUpload();
    resetImageUpload2();
    productKeywords = [];
    renderTags();
    
    // Reset counters
    updateSeoCounters();
    
    // Reset regulatory toggles active class
    const regItems = document.querySelectorAll('.regulatory-item');
    regItems.forEach(item => item.classList.remove('active'));
    
    // Hide category dynamic cards
    handleCategoryChange();

    // Clear edit state
    window.editingProductId = null;
    const saveBtn = form.querySelector('.btn-action-save');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Add Product';
    }
    
    showNotification('Form Reset', 'The product form has been completely cleared.', 'info');
}

/**
 * Open Preview Product modal
 */
function previewProduct() {
    // Basic checks
    const prodName = document.getElementById('prodName').value.trim();
    const prodCategory = document.getElementById('prodCategory');
    const categoryText = prodCategory.options[prodCategory.selectedIndex].text;
    const prodDesc = document.getElementById('prodDesc').value.trim();
    
    if (!prodName || !prodCategory.value || !prodDesc) {
        showNotification('Preview Blocked', 'Please fill in the Product Name, Category, and Description to view preview.', 'error');
        // Expand basic info card
        document.getElementById('basic-info-card').classList.remove('collapsed');
        document.getElementById('basic-info-card').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Populate preview details
    document.getElementById('prev-name').textContent = prodName;
    document.getElementById('prev-category').textContent = categoryText;
    document.getElementById('prev-desc').textContent = prodDesc;
    
    // Specifications
    setPrevValue('prev-strength', document.getElementById('specStrength').value);
    setPrevValue('prev-dosage', document.getElementById('specDosage').value);
    setPrevValue('prev-packing', document.getElementById('specPacking').value);
    setPrevValue('prev-shelf-life', document.getElementById('specShelfLife').value);
    setPrevValue('prev-storage', document.getElementById('specStorage').value);
    
    // Manufacturer
    setPrevValue('prev-mfg', document.getElementById('mfgName').value);
    setPrevValue('prev-country', document.getElementById('mfgCountry').value);
    setPrevValue('prev-brand', document.getElementById('mfgBrand').value);
    
    // Regulatory
    const regulatoryList = [];
    document.querySelectorAll('.regulatory-item input[type="checkbox"]').forEach(cb => {
        if (cb.checked) regulatoryList.push(cb.value);
    });
    document.getElementById('prev-regulatory').textContent = regulatoryList.length > 0 ? regulatoryList.join(', ') : 'None selected';
    
    // Applications
    setPrevValue('prev-applications', document.getElementById('appIndications').value);
    
    // Packaging
    setPrevValue('prev-carton', document.getElementById('pkgCartonSize').value);
    setPrevValue('prev-qty', document.getElementById('pkgQtyPerBox').value);
    setPrevValue('prev-export-pkg', document.getElementById('pkgExportDetails').value);
    
    // Availability
    const stockStatus = document.getElementById('availStockStatus').value;
    document.getElementById('prev-stock').textContent = stockStatus || 'Not selected';
    setPrevValue('prev-moq', document.getElementById('availMoq').value);
    
    // Documents
    const documentList = [];
    document.querySelectorAll('#documents-card input[type="checkbox"]').forEach(cb => {
        if (cb.checked) documentList.push(cb.value);
    });
    document.getElementById('prev-documents').textContent = documentList.length > 0 ? documentList.join(', ') : 'None selected';
    
    // Dynamic fields preview
    const apiPreviewSection = document.getElementById('prev-section-api');
    const surgPreviewSection = document.getElementById('prev-section-surgical');
    
    apiPreviewSection.classList.add('d-none');
    surgPreviewSection.classList.add('d-none');
    
    if (prodCategory.value === 'apis-bulk') {
        apiPreviewSection.classList.remove('d-none');
        setPrevValue('prev-api-cas', document.getElementById('apiCasNumber').value);
        setPrevValue('prev-api-formula', document.getElementById('apiFormula').value);
        setPrevValue('prev-api-weight', document.getElementById('apiWeight').value);
        setPrevValue('prev-api-standard', document.getElementById('apiStandard').value);
        setPrevValue('prev-api-grade', document.getElementById('apiGrade').value);
        setPrevValue('prev-api-purity', document.getElementById('apiPurity').value);
        setPrevValue('prev-api-shelf', document.getElementById('apiShelfLife').value);
    } else if (prodCategory.value === 'surgical-supplies') {
        surgPreviewSection.classList.remove('d-none');
        setPrevValue('prev-surg-material', document.getElementById('surgMaterial').value);
        setPrevValue('prev-surg-sterility', document.getElementById('surgSterility').value);
        setPrevValue('prev-surg-usage', document.getElementById('surgDisposable').value);
        setPrevValue('prev-surg-variants', document.getElementById('surgSize').value);
        setPrevValue('prev-surg-use', document.getElementById('surgIntendedUse').value);
    }
    
    // SEO
    setPrevValue('prev-seo-title', document.getElementById('seoMetaTitle').value);
    setPrevValue('prev-seo-desc', document.getElementById('seoMetaDesc').value);
    document.getElementById('prev-seo-keywords').textContent = productKeywords.length > 0 ? productKeywords.join(', ') : 'None added';
    setPrevValue('prev-seo-sku', document.getElementById('prodSku').value);
    setPrevValue('prev-seo-slug', document.getElementById('prodSlug').value);
    
    // Preview image
    const previewImg = document.getElementById('imagePreviewImg');
    const prevImageContainer = document.getElementById('prev-image-container');
    prevImageContainer.innerHTML = '';
    
    let hasPreview = false;
    if (previewImg && previewImg.src) {
        const img = document.createElement('img');
        img.src = previewImg.src;
        img.style.maxWidth = '100%';
        img.style.marginBottom = '10px';
        img.style.display = 'block';
        prevImageContainer.appendChild(img);
        hasPreview = true;
    }
    
    if (!hasPreview) {
        prevImageContainer.innerHTML = '<span class="text-muted">No product image uploaded</span>';
    }
    
    // Open modal (setting style display flex explicitly overrides inline display none)
    const modal = document.getElementById('product-preview-modal');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        modal.classList.add('show');
    }
    const backdrop = document.getElementById('product-preview-backdrop');
    if (backdrop) {
        backdrop.classList.add('show');
    }
}

function closePreviewModal() {
    const modal = document.getElementById('product-preview-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    const backdrop = document.getElementById('product-preview-backdrop');
    if (backdrop) {
        backdrop.classList.remove('show');
    }
}

/**
 * Set preview value or show placeholder
 */
function setPrevValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (value && value.trim() !== '') {
        el.textContent = value;
        el.classList.remove('empty');
    } else {
        el.textContent = 'Not specified';
        el.classList.add('empty');
    }
}

/**
 * Display toast notifications
 */
function showNotification(title, msg, type = 'success') {
    if (typeof showToast === 'function') {
        showToast(title, msg, type);
    } else {
        alert(`${title}: ${msg}`);
    }
}

/**
 * Simple HTML escaper
 */
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
