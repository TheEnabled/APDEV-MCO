document.addEventListener('DOMContentLoaded', function () {
    const cartItems = document.querySelectorAll('.cart-item');

    function updateCartStorage() {
        const cartData = [];
        cartItems.forEach(item => {
            const name = item.querySelector('h2').textContent;
            const quantity = parseInt(item.querySelector('.quantity-input').value, 10);
            const basePrice = parseFloat(item.querySelector('.price').getAttribute('data-price'));
            if (quantity > 0) { // Store only items with quantity > 0
                cartData.push({ name, quantity, price: basePrice });
            }
        });

        // Save updated cart to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartData));
    }

    cartItems.forEach(item => {
        const minusBtn = item.querySelector('.bx-minus-circle');
        const plusBtn = item.querySelector('.bx-plus-circle');
        const quantityInput = item.querySelector('.quantity-input');

        // Increase Quantity
        plusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityInput.value, 10);
            quantityInput.value = quantity + 1;
            updateCartStorage();
        });

        // Decrease Quantity (Allow 0, Prevent Negative)
        minusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityInput.value, 10);
            if (quantity > 0) {
                quantityInput.value = quantity - 1;
                updateCartStorage();
            }
        });

        // Manual input update
        quantityInput.addEventListener('input', function () {
            updateCartStorage();
        });
    });

    // Save cart when clicking "Proceed to Checkout"
    document.querySelector('.show-more a').addEventListener('click', function () {
        updateCartStorage(); 
    });

    // Load cart data in Checkout.html
    if (window.location.pathname.includes('Checkout.html')) {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartContainer = document.getElementById('checkout-cart');
        cartContainer.innerHTML = '';

        if (storedCart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            storedCart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('checkout-item');
                itemElement.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: ₱${(item.quantity * item.price).toFixed(2)}</p>
                `;
                cartContainer.appendChild(itemElement);
            });
        }
    }
});
