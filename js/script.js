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

    // Attach event listener to the "Add to Cart" button on the product page
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const product = {
                name: document.querySelector('.product-info h1').textContent,
                price: parseFloat(document.querySelector('.product-price').textContent.replace('$', '')),
                size: document.getElementById('size').value
            };
            localStorage.setItem('cartItem', JSON.stringify(product));
            window.location.href = 'checkout.html';
        });
    }

    // Populate checkout page on load
    if (document.querySelector('.checkout-section')) {
        const cartItem = JSON.parse(localStorage.getItem('cartItem'));
        if (cartItem) {
            populateCheckout(cartItem);
        } else {
            window.location.href = 'shop.html';
        }
    }

    function populateCheckout(item) {
        const orderItemsDiv = document.getElementById('order-items');
        const subtotalSpan = document.getElementById('subtotal');
        const shippingSpan = document.getElementById('shipping');
        const grandTotalSpan = document.getElementById('grand-total');

        const itemHTML = `
            <div class="order-item">
                <span>${item.name} (Size: ${item.size.toUpperCase()})</span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `;
        orderItemsDiv.innerHTML = itemHTML;

        const shippingCost = 10.00;
        const subtotal = item.price;
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

            const cartItem = JSON.parse(localStorage.getItem('cartItem'));

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
                    product: cartItem,
                    total: document.getElementById('grand-total').textContent
                })
            })
                .then(response => {
                    if (response.ok) {
                        showSuccessModal();
                        localStorage.removeItem('cartItem');
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