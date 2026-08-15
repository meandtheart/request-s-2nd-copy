// =========================================================================
// 1. SHOPPING CART — SHARED HELPERS
// =========================================================================

// Every price in this site is Bangladeshi Taka. Pass in a plain number
// (e.g. 25) or a string that may already contain symbols/commas, and this
// always returns a clean "৳25" style string.
function formatBDT(amount) {
    const num = parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
    // Show decimals only if the price actually has cents/paisa.
    const isWhole = Number.isInteger(num);
    return `BDT ${isWhole ? num : num.toFixed(2)}`;
}

// Adds a product to the cart in localStorage (used by both the shop page
// and the homepage product modal). If the same product is already in the
// cart, its quantity is increased instead of creating a duplicate row.
function addToCart(product) {
    if (!product || !product.title) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.title === product.title);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            title: product.title,
            price: product.price,
            images: product.images || (product.image ? [product.image] : []),
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalItems = cart.reduce((sum, item) => {
        return sum + (item.quantity || 1);
    }, 0);

    const badge = document.getElementById('cartCount');

    if (!badge) return;

    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'flex';
        badge.style.opacity = '1';
    } else {
        badge.textContent = '';
        badge.style.display = 'none';
        badge.style.opacity = '0';
    }
}


// =========================================================================
// 3. PAGE INITIALIZATION LISTENER
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});

// 3D STACK CAROUSEL & POP-UP MODAL LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('stackContainer');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');

    if (!container) return;

    let slots = ['slot-far-left', 'slot-mid-left', 'slot-center', 'slot-mid-right', 'slot-far-right'];
    const cards = Array.from(container.querySelectorAll('.stack-card'));

    function updateCardPositions() {
        cards.forEach((card, index) => {
            card.className = `stack-card ${slots[index]}`;
        });
    }

    function rotateRight() {
        slots.unshift(slots.pop());
        updateCardPositions();
    }

    function rotateLeft() {
        slots.push(slots.shift());
        updateCardPositions();
    }
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCartBtn = document.getElementById('modalAddToCart');
const modalBuyNowBtn = document.getElementById('modalBuyNow');

// Holds the product that's currently shown in the homepage pop-up so the
// Add to Basket / Buy Now buttons know what to add.
let currentStackProduct = null;

// OPEN MODAL
cards.forEach((card) => {
    card.addEventListener('click', () => {
        const img = card.querySelector('img');
        if (img && modal && modalImg) {
            modalImg.src = img.src;

            const title = card.getAttribute('data-title') || img.alt || "Handmade Creation";
            const price = card.getAttribute('data-price') || "15";
            const priceLabel = formatBDT(price);

            if (modalTitle) {
                modalTitle.textContent = title;
            }

            if (modalPrice) {
                modalPrice.textContent = priceLabel;
            }

            currentStackProduct = { title, price: priceLabel, images: [img.src] };

            // Add 'active' class instead of changing display style directly
            modal.classList.add('active');
            container.classList.add('modal-active');
        }
    });
});

// ADD TO BASKET / BUY NOW from the homepage pop-up
if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentStackProduct) {
            addToCart(currentStackProduct);
            const original = modalAddToCartBtn.textContent;
            modalAddToCartBtn.textContent = 'Added ✓';
            setTimeout(() => { modalAddToCartBtn.textContent = original; }, 1200);
        }
    });
}

if (modalBuyNowBtn) {
    modalBuyNowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentStackProduct) {
            addToCart(currentStackProduct);
            window.location.href = 'cart.html';
        }
    });
}

// CLOSE MODAL
if (modal) {
    modal.addEventListener('click', (e) => {
        // Don't close when clicking the action buttons inside the modal
        if (e.target === modalAddToCartBtn || e.target === modalBuyNowBtn) return;
        // Remove 'active' class to trigger the smooth fade-out animation
        modal.classList.remove('active');
        container.classList.remove('modal-active');
    });
}
// SWIPE GESTURES (UPDATED WITH DIRECTIONAL FILTER)
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Check:
        // 1. Horizontal movement must be greater than vertical movement (User is swiping sideways, not scrolling).
        // 2. Horizontal movement must exceed 40px threshold.
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) rotateRight();
            else rotateLeft();
        }
        isDragging = false;
    }, { passive: true });

    container.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        const diffX = startX - e.clientX;
        const diffY = startY - e.clientY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) rotateRight();
            else rotateLeft();
        }
        isDragging = false;
    });

    container.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        const diffX = startX - e.clientX;
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) rotateRight();
            else rotateLeft();
        }
        isDragging = false;
    });
});



// Custom Order Modal Handler
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openCustomModal');
    const closeBtn = document.getElementById('closeCustomModal');
    const customModal = document.getElementById('customOrderModal');

    if (!openBtn || !closeBtn || !customModal) return;

    // Open Modal
    openBtn.addEventListener('click', () => {
        customModal.classList.add('active');
    });

    // Close via Close Button (X)
    closeBtn.addEventListener('click', () => {
        customModal.classList.remove('active');
    });

    // Close when clicking outside card area
    customModal.addEventListener('click', (e) => {
        if (e.target === customModal) {
            customModal.classList.remove('active');
        }
    });
});


// =========================================================================
// FLOATING NAV — SLIDING PILL INDICATOR (smooth page-to-page animation)
// =========================================================================
// This site is multi-page (each tap on Home/Shop/Cart is a real page load),
// so there's no single running app to animate "between" pages. Instead we
// fake a seamless slide by remembering which tab was active before the tap
// (sessionStorage) and, on the NEW page's load, snapping the pill to the
// OLD tab's position first, then animating it over to the new tab. Because
// this all happens within the same paint cycle, it reads as one continuous
// glide even though it's technically two separate page loads.
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.floating-nav');
    const indicator = document.getElementById('navIndicator');
    if (!nav || !indicator) return;

    const items = Array.from(nav.querySelectorAll('.nav-item'));
    if (items.length === 0) return;

    const activeItem = nav.querySelector('.nav-item.active') || items[0];
    const activeIndex = items.indexOf(activeItem);

    // Moves the pill to sit exactly under `item`. When `animate` is false,
    // the transition is switched off for one frame so the move is instant.
    function placeIndicator(item, animate) {
        if (!item) return;
        const navRect = nav.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const x = itemRect.left - navRect.left;

        if (!animate) indicator.style.transition = 'none';
        indicator.style.width = itemRect.width + 'px';
        indicator.style.transform = `translateX(${x}px)`;
        if (!animate) {
            // Force a reflow so the "no transition" instant jump is
            // actually applied before we hand transitions back on.
            void indicator.offsetHeight;
            indicator.style.transition = '';
        }
    }

    const storedIndex = sessionStorage.getItem('navActiveIndex');

    if (storedIndex !== null && Number(storedIndex) !== activeIndex && items[storedIndex]) {
        // Snap to where the pill "was" on the previous page...
        placeIndicator(items[storedIndex], false);
        // ...then glide it to where it belongs on this page.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => placeIndicator(activeItem, true));
        });
    } else {
        // First visit this session, or same tab reloaded — just place it.
        placeIndicator(activeItem, false);
    }

    sessionStorage.setItem('navActiveIndex', activeIndex);

    // Remember which tab was tapped right before navigating away, so the
    // next page knows where to start its glide from.
    items.forEach((item, idx) => {
        item.addEventListener('click', () => {
            sessionStorage.setItem('navActiveIndex', idx);
        });
    });

    // Keep the pill aligned if the viewport is resized/rotated.
    window.addEventListener('resize', () => {
        const current = nav.querySelector('.nav-item.active') || items[0];
        placeIndicator(current, false);
    });
});


// Center the category scroll position when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const categoryRow = document.getElementById('categoryRow');
    if (categoryRow) {
        // Calculate total scrollable width and divide by 2 to find the center
        const maxScroll = categoryRow.scrollWidth - categoryRow.clientWidth;
        categoryRow.scrollLeft = maxScroll / 2;
    }
});

// =========================================================================
// CATEGORY ROW — tap ripple + squish feedback
// =========================================================================
// Category items are plain links (they need to work with a middle-click /
// long-press / "open in new tab" too), so instead of hijacking navigation
// entirely we just play a very quick ripple + squish, then let the browser
// follow the link a beat later — long enough to actually see the effect,
// short enough that it never feels like it's slowing the tap down.
document.addEventListener('DOMContentLoaded', () => {
    const categoryItems = document.querySelectorAll('.category-item');
    if (!categoryItems.length) return;

    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Respect modified clicks (new tab, etc.) — don't delay those.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

            const icon = item.querySelector('.category-icon');
            if (!icon) return;

            e.preventDefault();

            const ripple = document.createElement('span');
            ripple.className = 'tap-ripple';
            icon.appendChild(ripple);

            item.classList.add('tapped');

            const destination = item.href;
            setTimeout(() => {
                window.location.href = destination;
            }, 190);
        }, { passive: false });
    });
});
