// Core D2C Application State and Reusable Component Renderer

// Cart State
function getCart() {
    return JSON.parse(localStorage.getItem('gh_cart')) || [];
}

function addToCart(productId, qty = 1) {
    let cart = getCart();
    const existing = cart.find(item => item.id === productId);
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod) return;

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            qty: qty,
            image: prod.image
        });
    }
    localStorage.setItem('gh_cart', JSON.stringify(cart));
    updateBadges();
    showToast(`${prod.name} added to cart!`);
}

function changeQty(productId, delta) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.qty = Math.max(1, item.qty + delta);
    }
    localStorage.setItem('gh_cart', JSON.stringify(cart));
    updateBadges();
    if (window.renderCart) window.renderCart();
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('gh_cart', JSON.stringify(cart));
    updateBadges();
    if (window.renderCart) window.renderCart();
}

// Wishlist State
function getWishlist() {
    return JSON.parse(localStorage.getItem('gh_wishlist')) || [];
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod) return;

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`${prod.name} removed from Wishlist`);
    } else {
        wishlist.push(productId);
        showToast(`${prod.name} saved to Wishlist!`);
    }
    localStorage.setItem('gh_wishlist', JSON.stringify(wishlist));
    updateBadges();
    if (window.renderWishlist) window.renderWishlist();
    // Update icons in current cards if needed
    const heartBtns = document.querySelectorAll(`[data-wishlist-id="${productId}"]`);
    heartBtns.forEach(btn => {
        const isFav = wishlist.includes(productId);
        btn.querySelector('span').style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
    });
}

function updateBadges() {
    const cart = getCart();
    const totalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);
    const wishlist = getWishlist();
    
    // Header cart badge
    const headerCartBadge = document.getElementById('cart-badge-count');
    if (headerCartBadge) {
        headerCartBadge.innerText = totalItems;
        headerCartBadge.classList.toggle('hidden', totalItems === 0);
    }
    
    // Header wishlist badge
    const headerWishBadge = document.getElementById('wishlist-badge-count');
    if (headerWishBadge) {
        headerWishBadge.innerText = wishlist.length;
        headerWishBadge.classList.toggle('hidden', wishlist.length === 0);
    }

    // Mobile Bottom Nav Cart Badge
    const mobCartBadge = document.getElementById('mob-cart-badge-count');
    if (mobCartBadge) {
        mobCartBadge.innerText = totalItems;
        mobCartBadge.classList.toggle('hidden', totalItems === 0);
    }
}

// Toast Notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-8 z-[200] bg-on-background text-white px-6 py-4 shadow-xl border-l-4 border-primary flex items-center gap-3 animate-slide-in';
    toast.innerHTML = `
        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
        <span class="font-body-md text-sm font-semibold">${msg}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Header and Footer Rendering
function renderHeader() {
    const headerPlaceholder = document.getElementById('global-header');
    if (!headerPlaceholder) return;

    headerPlaceholder.innerHTML = `
        <!-- Announcement Bar -->
        <div class="bg-primary text-white text-xs py-2 px-margin-mobile md:px-margin-desktop font-label-sm font-semibold text-center tracking-widest relative overflow-hidden h-8">
            <div id="announcement-text" class="transition-transform duration-500 transform translate-y-0 text-center flex items-center justify-center h-full">
                FREE SHIPPING ON ORDERS ABOVE ₹999
            </div>
        </div>

        <!-- Sticky Header Body -->
        <header class="w-full bg-surface/95 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30">
            <nav class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex flex-col gap-4">
                <div class="flex justify-between items-center w-full">
                    
                    <!-- Left: Brand Logo -->
                    <div class="flex items-center gap-4">
                        <button onclick="toggleMobileMenu()" class="lg:hidden text-primary">
                            <span class="material-symbols-outlined text-3xl">menu</span>
                        </button>
                        <a class="font-display-lg text-headline-md text-primary tracking-tighter" href="index.html">Golden Heera</a>
                    </div>

                    <!-- Center: Search Bar -->
                    <div class="hidden md:flex flex-1 max-w-xl mx-8 relative">
                        <form onsubmit="handleSearch(event)" class="w-full relative">
                            <input id="header-search-input" class="w-full pl-4 pr-12 py-2.5 bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:ring-0 text-sm placeholder:text-on-surface-variant/50 outline-none" placeholder="Search for Kundan, American Diamond, Earrings, Jhumkas..." type="text"/>
                            <button type="submit" class="absolute right-3 top-2.5 text-primary">
                                <span class="material-symbols-outlined">search</span>
                            </button>
                        </form>
                    </div>

                    <!-- Right: Icons -->
                    <div class="flex items-center space-x-6 text-primary">
                        <!-- Search Icon for Mobile -->
                        <button onclick="toggleMobileSearch()" class="md:hidden">
                            <span class="material-symbols-outlined">search</span>
                        </button>
                        
                        <a href="wishlist.html" class="relative group flex items-center">
                            <span class="material-symbols-outlined hover:scale-105 transition-transform">favorite</span>
                            <span id="wishlist-badge-count" class="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold hidden">0</span>
                        </a>
                        <a href="cart.html" class="relative group flex items-center">
                            <span class="material-symbols-outlined hover:scale-105 transition-transform">shopping_bag</span>
                            <span id="cart-badge-count" class="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold hidden">0</span>
                        </a>
                        <button onclick="alert('My Account feature coming soon!')" class="hover:scale-105 transition-transform">
                            <span class="material-symbols-outlined">person</span>
                        </button>
                    </div>
                </div>

                <!-- Mobile Only Search Box (hidden by default) -->
                <div id="mobile-search-bar" class="hidden md:hidden w-full relative">
                    <form onsubmit="handleSearch(event)" class="w-full relative">
                        <input id="mob-search-input" class="w-full pl-4 pr-12 py-2 bg-surface-container-low border border-outline-variant/60 text-sm" placeholder="Search category, collection, etc..."/>
                        <button type="submit" class="absolute right-3 top-2 text-primary">
                            <span class="material-symbols-outlined">search</span>
                        </button>
                    </form>
                </div>

                <!-- Bottom: Main Navigation (Desktop Mega Menu) -->
                <div class="hidden lg:flex items-center space-x-10 border-t border-outline-variant/10 pt-3 mt-1">
                    <a class="font-body-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold" href="collections.html">Shop All</a>
                    
                    <!-- Categories Mega Menu -->
                    <div class="relative group">
                        <a class="font-body-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold flex items-center gap-1 cursor-pointer" href="collections.html">
                            Categories <span class="material-symbols-outlined text-sm">expand_more</span>
                        </a>
                        <div class="absolute top-full left-0 bg-white border border-outline-variant/30 shadow-2xl p-6 grid grid-cols-2 gap-x-8 gap-y-3 z-50 w-[300px] hidden group-hover:grid">
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=earrings">Earrings</a>
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=necklaces">Necklaces</a>
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=bangles">Bangles</a>
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=rings">Rings</a>
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=bracelets">Bracelets</a>
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=anklets">Anklets</a>
                            <a class="hover:text-primary transition-colors text-sm py-1" href="collections.html?category=nosepins">Nose Pins</a>
                        </div>
                    </div>

                    <!-- Collections Mega Menu -->
                    <div class="relative group">
                        <a class="font-body-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold flex items-center gap-1 cursor-pointer" href="collections.html">
                            Collections <span class="material-symbols-outlined text-sm">expand_more</span>
                        </a>
                        <div class="absolute top-full left-0 bg-white border border-outline-variant/30 shadow-2xl p-6 grid grid-cols-2 gap-x-8 gap-y-3 z-50 w-[320px] hidden group-hover:grid">
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=bridal">Bridal Collection</a>
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=temple">Temple Art</a>
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=kundan">Kundan Crafts</a>
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=ad">American Diamond</a>
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=oxidised">Oxidised Silver</a>
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=daily">Daily Wear</a>
                            <a class="hover:text-primary transition-colors text-sm py-1 font-medium" href="collections.html?collection=party">Party Wear</a>
                        </div>
                    </div>

                    <a class="font-body-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold" href="collections.html?tag=new">New Arrivals</a>
                    <a class="font-body-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-semibold" href="collections.html?tag=bestseller">Best Sellers</a>
                    <a class="font-body-md text-xs uppercase tracking-widest text-primary hover:opacity-80 transition-opacity font-semibold" href="collections.html?tag=offers">Offers %</a>
                </div>
            </nav>
        </header>

        <!-- Mobile Drawer Navigation Overlay -->
        <div id="mobile-menu-overlay" class="fixed inset-0 bg-black/50 z-[150] hidden" onclick="toggleMobileMenu()">
            <div class="bg-white w-[280px] h-full p-6 flex flex-col gap-6 z-[160]" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                    <span class="font-display-lg text-lg text-primary">Golden Heera</span>
                    <button onclick="toggleMobileMenu()" class="text-primary">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="flex flex-col gap-4 overflow-y-auto pr-2">
                    <a class="font-body-md text-sm uppercase tracking-wider text-on-background font-semibold" href="collections.html">Shop All</a>
                    
                    <div class="space-y-2">
                        <span class="font-body-md text-xs uppercase tracking-wider text-on-surface-variant font-bold">Categories</span>
                        <div class="grid grid-cols-2 gap-2 pl-2">
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?category=earrings">Earrings</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?category=necklaces">Necklaces</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?category=bangles">Bangles</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?category=rings">Rings</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?category=bracelets">Bracelets</a>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <span class="font-body-md text-xs uppercase tracking-wider text-on-surface-variant font-bold">Collections</span>
                        <div class="grid grid-cols-2 gap-2 pl-2">
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?collection=bridal">Bridal</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?collection=temple">Temple</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?collection=kundan">Kundan</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?collection=ad">AD Jewellery</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?collection=oxidised">Oxidised</a>
                            <a class="text-xs text-on-surface-variant hover:text-primary" href="collections.html?collection=daily">Daily Wear</a>
                        </div>
                    </div>

                    <a class="font-body-md text-sm uppercase tracking-wider text-on-background font-semibold" href="collections.html?tag=new">New Arrivals</a>
                    <a class="font-body-md text-sm uppercase tracking-wider text-on-background font-semibold" href="collections.html?tag=bestseller">Best Sellers</a>
                    <a class="font-body-md text-sm uppercase tracking-wider text-primary font-bold" href="collections.html?tag=offers">Offers %</a>
                </div>
            </div>
        </div>
    `;

    // Rotate Announcements
    const announcements = [
        "FREE SHIPPING ON ORDERS ABOVE ₹999",
        "CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE",
        "EASY 7-DAY RETURNS POLICY",
        "JUST DROPPED: NEW ARRIVALS EVERY WEEK"
    ];
    let index = 0;
    setInterval(() => {
        const textDiv = document.getElementById('announcement-text');
        if (textDiv) {
            textDiv.style.opacity = 0;
            setTimeout(() => {
                index = (index + 1) % announcements.length;
                textDiv.innerText = announcements[index];
                textDiv.style.opacity = 1;
            }, 300);
        }
    }, 4000);

    updateBadges();
}

function handleSearch(e) {
    e.preventDefault();
    const query = (document.getElementById('header-search-input')?.value || document.getElementById('mob-search-input')?.value || '').trim();
    if (query) {
        window.location.href = `collections.html?q=${encodeURIComponent(query)}`;
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu-overlay');
    if (menu) menu.classList.toggle('hidden');
}

function toggleMobileSearch() {
    const search = document.getElementById('mobile-search-bar');
    if (search) search.classList.toggle('hidden');
}

function renderFooter() {
    const footerPlaceholder = document.getElementById('global-footer');
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = `
        <footer class="bg-surface-container border-t border-outline-variant/30 text-on-surface">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
                <div class="space-y-6">
                    <h3 class="font-display-lg text-headline-sm text-primary">Golden Heera</h3>
                    <p class="font-body-md text-on-surface-variant text-sm leading-relaxed">
                        Redefining premium fashion & imitation jewellery in India. Stunning collections designed for everyday wear, weddings, and festivals.
                    </p>
                    <div class="flex gap-4 text-primary">
                        <a href="https://wa.me/919844442225" class="hover:scale-110 transition-transform"><span class="material-symbols-outlined">forum</span></a>
                        <a href="#" class="hover:scale-110 transition-transform"><span class="material-symbols-outlined">share</span></a>
                        <a href="#" class="hover:scale-110 transition-transform"><span class="material-symbols-outlined">public</span></a>
                    </div>
                </div>
                <div class="space-y-4">
                    <h4 class="font-label-sm uppercase tracking-widest text-on-surface text-xs font-bold">Shop Categories</h4>
                    <ul class="space-y-3 font-body-md text-sm text-on-surface-variant">
                        <li><a class="hover:text-primary transition-colors" href="collections.html?category=earrings">Earrings</a></li>
                        <li><a class="hover:text-primary transition-colors" href="collections.html?category=necklaces">Necklaces</a></li>
                        <li><a class="hover:text-primary transition-colors" href="collections.html?category=bangles">Bangles & Bracelets</a></li>
                        <li><a class="hover:text-primary transition-colors" href="collections.html?category=rings">Rings</a></li>
                    </ul>
                </div>
                <div class="space-y-4">
                    <h4 class="font-label-sm uppercase tracking-widest text-on-surface text-xs font-bold">Customer Support</h4>
                    <ul class="space-y-3 font-body-md text-sm text-on-surface-variant">
                        <li><a class="hover:text-primary transition-colors" href="#" onclick="alert('Support details!')">Shipping Policy</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#" onclick="alert('Easy returns policy details!')">Return Policy</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#" onclick="alert('FAQs page coming soon!')">FAQs</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#" onclick="alert('Contact Form details!')">Contact Us</a></li>
                    </ul>
                </div>
                <div class="space-y-4">
                    <h4 class="font-label-sm uppercase tracking-widest text-on-surface text-xs font-bold">Contact Info</h4>
                    <p class="text-sm text-on-surface-variant leading-relaxed">
                        <strong>Address:</strong> NO.212, 1ST FLOOR, SAFENA COMPLEX, OPP. TO FMC COMPLEX, KUMBARPET MAIN ROAD, BANGALORE-560002<br>
                        <strong>Phone:</strong> +91 98444 42225, +91 98867 97356, 080-41529374<br>
                        <strong>Email:</strong> VIJAYRAJ3543@GMAIL.COM
                    </p>
                    <form onsubmit="event.preventDefault(); alert('Joined the newsletter circle!'); this.reset();" class="relative mt-4">
                        <input class="w-full bg-transparent border-b border-on-background py-2 pr-10 focus:ring-0 focus:border-primary font-label-sm text-sm" placeholder="YOUR EMAIL" type="email" required/>
                        <button class="absolute right-0 bottom-2 text-primary font-label-sm uppercase tracking-widest type-submit">Join</button>
                    </form>
                </div>
            </div>
            
            <!-- Mobile Sticky Bottom Navigation -->
            <div class="fixed bottom-0 w-full flex justify-around items-center py-2.5 bg-surface-bright border-t border-outline-variant/30 shadow-2xl z-[100] md:hidden">
                <a class="flex flex-col items-center gap-0.5 text-secondary text-[10px] hover:text-primary transition-colors" href="index.html">
                    <span class="material-symbols-outlined text-[22px]">storefront</span>
                    <span>Home</span>
                </a>
                <a class="flex flex-col items-center gap-0.5 text-secondary text-[10px] hover:text-primary transition-colors" href="collections.html">
                    <span class="material-symbols-outlined text-[22px]">widgets</span>
                    <span>Shop</span>
                </a>
                <button onclick="toggleMobileSearch()" class="flex flex-col items-center gap-0.5 text-secondary text-[10px] hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-[22px]">search</span>
                    <span>Search</span>
                </button>
                <a class="flex flex-col items-center gap-0.5 text-secondary text-[10px] hover:text-primary transition-colors relative" href="wishlist.html">
                    <span class="material-symbols-outlined text-[22px]">favorite</span>
                    <span>Wishlist</span>
                    <span id="mob-wishlist-badge" class="absolute -top-1 right-2 bg-primary text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold hidden">0</span>
                </a>
                <a class="flex flex-col items-center gap-0.5 text-secondary text-[10px] hover:text-primary transition-colors relative" href="cart.html">
                    <span class="material-symbols-outlined text-[22px]">shopping_cart</span>
                    <span>Cart</span>
                    <span id="mob-cart-badge-count" class="absolute -top-1 right-2 bg-primary text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold hidden">0</span>
                </a>
            </div>

            <div class="px-margin-mobile md:px-margin-desktop py-6 border-t border-outline-variant/20 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant pb-20 md:pb-6">
                <span>© 2026 Golden Heera Luxury Jewellery. All Rights Reserved.</span>
                <div class="flex gap-4">
                    <a class="hover:text-primary" href="#">Privacy Policy</a>
                    <a class="hover:text-primary" href="#">Terms & Conditions</a>
                </div>
            </div>
        </footer>
    `;
}

// Quick View Modal
function triggerQuickView(productId) {
    const p = PRODUCTS_DATA.find(x => x.id === productId);
    if (!p) return;

    let quickViewModal = document.getElementById('quick-view-modal');
    if (!quickViewModal) {
        quickViewModal = document.createElement('div');
        quickViewModal.id = 'quick-view-modal';
        quickViewModal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4';
        document.body.appendChild(quickViewModal);
    }
    
    quickViewModal.innerHTML = `
        <div class="bg-white max-w-3xl w-full p-8 md:p-12 relative flex flex-col md:flex-row gap-8 shadow-2xl border border-primary animate-scale-in">
            <button onclick="closeQuickView()" class="absolute right-4 top-4 text-primary">
                <span class="material-symbols-outlined text-2xl">close</span>
            </button>
            <div class="w-full md:w-1/2 aspect-square overflow-hidden bg-surface-container-low border border-outline-variant/30">
                <img class="w-full h-full object-cover" src="${p.image}" alt="${p.name}"/>
            </div>
            <div class="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-primary">${p.category} / ${p.collection}</span>
                    <h2 class="font-display-lg text-headline-sm text-on-surface mt-2 mb-1">${p.name}</h2>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="flex text-primary">
                            <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                            <span class="text-xs font-bold text-on-surface-variant">${p.rating}</span>
                        </div>
                        <span class="text-xs text-on-surface-variant/70">(${p.reviewsCount} Reviews)</span>
                    </div>
                    <div class="flex items-baseline gap-3 mb-6">
                        <span class="text-xl font-bold text-primary">₹${p.price.toLocaleString()}</span>
                        <span class="text-sm text-on-surface-variant/50 line-through">₹${p.originalPrice.toLocaleString()}</span>
                        <span class="text-xs text-primary font-bold">${Math.round((p.originalPrice - p.price) / p.originalPrice * 100)}% OFF</span>
                    </div>
                    <p class="text-sm text-on-surface-variant leading-relaxed mb-6">${p.description}</p>
                </div>
                <div class="flex flex-col gap-3">
                    <button onclick="addToCart(${p.id}); closeQuickView();" class="w-full bg-primary text-white py-4 uppercase font-label-sm tracking-widest hover:opacity-90 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-sm">shopping_cart</span> Add to Cart
                    </button>
                    <a href="product-detail.html?product_id=${p.id}" class="w-full border border-primary text-primary py-4 uppercase font-label-sm tracking-widest hover:bg-primary/5 text-center">
                        View Full Details
                    </a>
                </div>
            </div>
        </div>
    `;
    quickViewModal.classList.remove('hidden');
    quickViewModal.classList.add('flex');
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    updateBadges();
});
