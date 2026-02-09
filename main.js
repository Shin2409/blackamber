// Cart system using localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in navigation
function updateCartCount() {
  const cartCounts = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCounts.forEach(count => {
    count.textContent = totalItems;
  });
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });

  // Initialize cart count on page load
  updateCartCount();
});

// MENU PAGE - Category filter and Add to Cart
if (document.querySelector('.menu-section')) {
  const categoryBtns = document.querySelectorAll('.category-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  const addToCartBtns = document.querySelectorAll('.add-to-cart');

  // Category filter
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Update active button
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter menu items
      menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Quantity spinner controls
  menuItems.forEach(item => {
    const minusBtn = item.querySelector('.qty-btn.minus');
    const plusBtn = item.querySelector('.qty-btn.plus');
    const qtyValue = item.querySelector('.qty-value');

    if (minusBtn && plusBtn && qtyValue) {
      minusBtn.addEventListener('click', () => {
        let qty = parseInt(qtyValue.textContent);
        if (qty > 1) {
          qtyValue.textContent = qty - 1;
        }
      });

      plusBtn.addEventListener('click', () => {
        let qty = parseInt(qtyValue.textContent);
        qtyValue.textContent = qty + 1;
      });
    }
  });

  // Add to cart functionality
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const menuItem = btn.closest('.menu-item');
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const image = btn.dataset.image;
      const qtyValue = menuItem.querySelector('.qty-value');
      const quantity = qtyValue ? parseInt(qtyValue.textContent) : 1;

      // Get temperature selection for coffee items
      const tempRadios = menuItem.querySelectorAll('input[type="radio"][name^="temp-"]');
      let temperature = null;
      if (tempRadios.length > 0) {
        tempRadios.forEach(radio => {
          if (radio.checked) {
            temperature = radio.value;
          }
        });
      }

      // Create item name with temperature if applicable
      const itemName = temperature ? `${name} (${temperature})` : name;

      // Check if item already in cart (including temperature variant)
      const existingItem = cart.find(item => item.name === itemName);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          name: itemName,
          price: price,
          image: image,
          quantity: quantity
        });
      }

      saveCart();

      // Reset quantity to 1
      if (qtyValue) {
        qtyValue.textContent = '1';
      }

      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = 'Added!';
      btn.style.background = '#27ae60';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 1000);

      // Reset quantity to 1 after adding
      if (qtyValue) {
        qtyValue.textContent = '1';
      }
    });
  });
}

// CART PAGE - Display cart items and checkout
if (document.querySelector('.cart-section')) {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartDiv = document.getElementById('emptyCart');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function displayCart() {
    if (cart.length === 0) {
      cartItemsContainer.style.display = 'none';
      document.querySelector('.cart-summary').style.display = 'none';
      emptyCartDiv.style.display = 'block';
      return;
    }

    cartItemsContainer.style.display = 'flex';
    document.querySelector('.cart-summary').style.display = 'block';
    emptyCartDiv.style.display = 'none';

    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <div>
            <h3>${item.name}</h3>
            <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="quantity-btn decrease" data-index="${index}">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn increase" data-index="${index}">+</button>
            </div>
            <button class="remove-btn" data-index="${index}">🗑️</button>
          </div>
        </div>
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });

    // Add event listeners for quantity controls
    document.querySelectorAll('.increase').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        cart[index].quantity += 1;
        saveCart();
        displayCart();
        updateSummary();
      });
    });

    document.querySelectorAll('.decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }
        saveCart();
        displayCart();
        updateSummary();
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        cart.splice(index, 1);
        saveCart();
        displayCart();
        updateSummary();
      });
    });
  }

  function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  // Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = selectedPayment ? selectedPayment.value : 'cash';

    const paymentNames = {
      'cash': 'Cash',
      'card': 'Credit/Debit Card',
      'gcash': 'GCash',
      'paymaya': 'PayMaya'
    };

    const total = totalEl.textContent;

    alert(`Thank you for your order!\n\nTotal: ${total}\nPayment Method: ${paymentNames[paymentMethod]}\n\nYour order has been placed successfully!`);

    // Clear cart
    cart = [];
    saveCart();
    displayCart();
    updateSummary();
  });

  // Initialize cart display
  displayCart();
  updateSummary();
                          }
