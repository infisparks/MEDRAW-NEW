// js/cart.js

function getEnquiryList() {
  try {
    const raw = localStorage.getItem('enquiryList');
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) return parsed;
    return { items: [] };
  } catch (e) {
    console.error("Error parsing enquiryList", e);
    return { items: [] };
  }
}



function updateCartCount() {
  const count = getEnquiryList().items.length;

  const desktopBadge = document.getElementById('cart-count');
  const mobileBadge = document.getElementById('cart-count-mobile');

  if (desktopBadge) {
    desktopBadge.textContent = count;
    desktopBadge.classList.remove('d-none');
  }

  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.classList.remove('d-none');
  }
}

function initEnquiryCart() {
  updateCartCount();
  window.addEventListener('storage', (e) => {
    if (e.key === 'enquiryList') updateCartCount();
  });
}

document.addEventListener('DOMContentLoaded', initEnquiryCart);
