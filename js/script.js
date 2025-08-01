document.addEventListener("DOMContentLoaded", () => {
    // --- Sticky Header Logic ---
    const header = document.querySelector('.main-header');
    const heroSection = document.querySelector('.hero-section');
    const headerHeight = header.offsetHeight;

    if (heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > heroSection.offsetHeight - headerHeight) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Scroll-in Animations with Intersection Observer ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // --- Filter Logic for Shop Page ---
    const filterCheckboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
    const productCards = document.querySelectorAll('#product-list .product-card');

    if (filterCheckboxes.length > 0 && productCards.length > 0) {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedFilters = getSelectedFilters();
                filterProducts(selectedFilters);
            });
        });
    }

    function getSelectedFilters() {
        const filters = {
            category: [],
            collection: []
        };

        filterCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                filters[checkbox.name].push(checkbox.value);
            }
        });

        return filters;
    }

    function filterProducts(filters) {
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardCollection = card.dataset.collection;

            const categoryMatch = filters.category.length === 0 || filters.category.includes(cardCategory);
            const collectionMatch = filters.collection.length === 0 || filters.collection.includes(cardCollection);

            if (categoryMatch && collectionMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // --- New Cart and Checkout Logic ---
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const successModal = document.getElementById('success-modal');
    const cartCountEl = document.getElementById('cart-count');
    const cartMenu = document.getElementById('cart-menu');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsMenu = document.getElementById('cart-items-menu');
    const cartTotalMenu = document.getElementById('cart-total-menu');

    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay();

    // Event listeners for cart menu
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            cartMenu.classList.add('open');
            populateCartMenu();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            cartMenu.classList.remove('open');
        });
    }

    // Add to cart functionality
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const product = {
                name: document.querySelector('.product-info h1').textContent,
                price: parseFloat(document.querySelector('.product-price').textContent.replace('$', '')),
                size: document.getElementById('size').value,
                image: document.querySelector('.product-gallery img').src,
            };
            addToCart(product);

            // Visual feedback on button
            const originalText = addToCartBtn.textContent;
            addToCartBtn.textContent = 'Item Added!';
            addToCartBtn.classList.add('added');
            setTimeout(() => {
                addToCartBtn.textContent = originalText;
                addToCartBtn.classList.remove('added');
            }, 2000);
        });
    }

    function addToCart(product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }

    function updateCartDisplay() {
        const totalItems = cart.length;
        cartCountEl.textContent = totalItems;
        if (totalItems > 0) {
            cartCountEl.classList.add('active');
        } else {
            cartCountEl.classList.remove('active');
        }

        populateCartMenu();
    }

    function populateCartMenu() {
        cartItemsMenu.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsMenu.innerHTML = '<p style="text-align: center; margin-top: 2rem;">Your cart is empty.</p>';
            cartTotalMenu.textContent = `$0.00`;
            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size.toUpperCase()}</p>
                </div>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            `;
            cartItemsMenu.appendChild(itemElement);
            total += item.price;
        });

        cartTotalMenu.textContent = `$${total.toFixed(2)}`;
    }

    // Populate checkout page on load
    if (document.querySelector('.checkout-section')) {
        if (cart.length > 0) {
            populateCheckout();
        } else {
            // Redirect if cart is empty
            window.location.href = 'shop.html';
        }
    }

    function populateCheckout() {
        const orderItemsDiv = document.getElementById('order-items');
        const subtotalSpan = document.getElementById('subtotal');
        const shippingSpan = document.getElementById('shipping');
        const grandTotalSpan = document.getElementById('grand-total');

        let subtotal = 0;
        let itemsHTML = '';

        cart.forEach(item => {
            itemsHTML += `
                <div class="order-item">
                    <span>${item.name} (Size: ${item.size.toUpperCase()})</span>
                    <span>$${item.price.toFixed(2)}</span>
                </div>
            `;
            subtotal += item.price;
        });

        orderItemsDiv.innerHTML = itemsHTML;

        const shippingCost = 10.00;
        const grandTotal = subtotal + shippingCost;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        shippingSpan.textContent = `$${shippingCost.toFixed(2)}`;
        grandTotalSpan.textContent = `$${grandTotal.toFixed(2)}`;
    }

    // Handle form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(checkoutForm);
            const orderDetails = {};
            for (let [key, value] of formData.entries()) {
                orderDetails[key] = value;
            }

            // IMPORTANT: Replace with your actual Formspree.io endpoint
            const emailEndpoint = 'https://formspree.io/f/YOUR_UNIQUE_ID';

            fetch(emailEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...orderDetails,
                    cart: cart,
                    total: document.getElementById('grand-total').textContent
                })
            })
                .then(response => {
                    if (response.ok) {
                        showSuccessModal();
                        localStorage.removeItem('cart');
                        cart = [];
                        updateCartDisplay();
                    } else {
                        alert('There was an error placing your order. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error placing your order. Please try again.');
                });
        });
    }

    function showSuccessModal() {
        successModal.style.display = 'flex';
    }
});