document.addEventListener('DOMContentLoaded', function () {
    const cartItems = document.querySelectorAll('.cart-item');

    cartItems.forEach(item => {
        const minusBtn = item.querySelector('.bx-minus-circle');
        const plusBtn = item.querySelector('.bx-plus-circle');
        const quantityInput = item.querySelector('.quantity-input');
        const priceElement = item.querySelector('.price');
        const basePrice = parseFloat(priceElement.getAttribute('data-price')); // Get unique price

        // Increase Quantity
        plusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityInput.value, 10);
            quantityInput.value = quantity + 1;
            updatePrice();
        });

        // Decrease Quantity (Allow 0, Prevent Negative)
        minusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityInput.value, 10);
            if (quantity > 0) {
                quantityInput.value = quantity - 1;
                updatePrice();
            }
        });

        // Update the price display dynamically
        function updatePrice() {
            let quantity = parseInt(quantityInput.value, 10);
            priceElement.textContent = `₱${(basePrice * quantity).toFixed(2)}`;
        }
    });
});




checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    const { subtotal, deliveryFee, total } = calculateTotals(cartItems);

    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        username: username || null, // Include username if logged in
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        orderItems: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        subtotal,
        deliveryFee,
        total
    };

    try {
        // Send data to server
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            // Clear cart after successful order
            localStorage.removeItem('cartItems');

            // Show success message
            alert(`Order placed successfully! Your order ID is: ${result.orderId}`);

            // Redirect to confirmation page or home
            window.location.href = 'OrderConfirmation.html?orderId=' + result.orderId;
        } else {
            alert(`Error: ${result.message || 'There was an error processing your order'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error connecting to the server. Please try again later.');
    }
});
