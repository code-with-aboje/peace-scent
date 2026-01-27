import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAto--un1gxJc_bV9YlThtkSAzePZc4yK0",
    authDomain: "peacescents-cadf5.firebaseapp.com",
    databaseURL: "https://peacescents-cadf5-default-rtdb.firebaseio.com",
    projectId: "peacescents-cadf5",
    storageBucket: "peacescents-cadf5.firebasestorage.app",
    messagingSenderId: "503133188377",
    appId: "1:503133188377:web:f23f18d6700e64e4acd588"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("firebase initialized");
const db = getDatabase(app);
const auth = getAuth();

// Getting dom elements
const cartItemsDiv = document.getElementById("cartItemsDiv");
let cartAmount = document.getElementById("cartAmount");
let cart_count = document.getElementById("cart_count");
const products_grid = document.getElementById("products-grid");
const shipping = document.getElementById("shipping");
const total = document.getElementById("total");

// Setting public variables
let shipping_price = 4000; // Default to Warri
let cart_items = [];

// Check auth state and load user data
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        console.log("User logged in:", user.email);
        
        // Display user email
        document.getElementById('userEmail').textContent = user.email;
        
        // Fetch user data from database
        const userRef = ref(db, 'users/' + user.uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userName = userData.username || user.email.split('@')[0];
                console.log("User data loaded:", userName);
            }
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        });
        
        // Initialize cart after user is authenticated
        initializeCart();
    } else {
        // No user logged in, redirect to login
        console.log("No user logged in");
        window.location.href = "../index.html";
    }
});

// Initialize cart functionality
function initializeCart() {
    createProducts();
    createShippingSelector();
    loadCartFromStorage();
    updateTotalCount();
    initCheckoutButton();
}

// Load cart from localStorage on page load
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('peacescent_cart');
    const savedLocation = localStorage.getItem('peacescent_location');
    
    if (savedCart) {
        cart_items = JSON.parse(savedCart);
        cart_items.forEach(item => {
            createCart(item);
        });
    }
    
    if (savedLocation) {
        shipping_price = parseInt(savedLocation);
        updateShippingDisplay();
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('peacescent_cart', JSON.stringify(cart_items));
    localStorage.setItem('peacescent_location', shipping_price.toString());
}

// Create shipping location selector
function createShippingSelector() {
    const cartContent = document.getElementById('cartContent');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartContent || !cartSummary) {
        console.error('Cart elements not found');
        return;
    }
    
    // Check if shipping selector already exists
    if (document.querySelector('.shipping-selector')) {
        return;
    }
    
    const shippingSelector = document.createElement('div');
    shippingSelector.className = 'shipping-selector';
    shippingSelector.style.cssText = `
        background: #f8f8f8;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border: 1px solid #e0e0e0;
    `;
    
    shippingSelector.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-weight: 500; font-size: 1.1rem; letter-spacing: 1px;">Delivery Location</h3>
        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer; padding: 0.75rem; background: white; border: 2px solid #e0e0e0; transition: all 0.3s;">
            <input type="radio" name="location" value="4000" ${shipping_price === 4000 ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #000;">
            <span style="font-weight: ${shipping_price === 4000 ? '600' : 'normal'};">Within Warri (₦4,000)</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem; background: white; border: 2px solid #e0e0e0; transition: all 0.3s;">
            <input type="radio" name="location" value="5000" ${shipping_price === 5000 ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #000;">
            <span style="font-weight: ${shipping_price === 5000 ? '600' : 'normal'};">Outside Warri (₦5,000)</span>
        </label>
    `;
    
    cartContent.insertBefore(shippingSelector, cartSummary);
    
    // Add event listeners to radio buttons
    const radioButtons = shippingSelector.querySelectorAll('input[name="location"]');
    const labels = shippingSelector.querySelectorAll('label');
    
    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', (e) => {
            shipping_price = parseInt(e.target.value);
            
            // Update label styles
            labels.forEach((label, i) => {
                const span = label.querySelector('span');
                if (i === index) {
                    label.style.borderColor = '#000';
                    label.style.background = '#f8f8f8';
                    span.style.fontWeight = '600';
                } else {
                    label.style.borderColor = '#e0e0e0';
                    label.style.background = 'white';
                    span.style.fontWeight = 'normal';
                }
            });
            
            updateShippingDisplay();
            updateTotalCount();
            saveCartToStorage();
        });
        
        // Add hover effect
        labels[index].addEventListener('mouseenter', () => {
            if (!radio.checked) {
                labels[index].style.borderColor = '#000';
            }
        });
        
        labels[index].addEventListener('mouseleave', () => {
            if (!radio.checked) {
                labels[index].style.borderColor = '#e0e0e0';
            }
        });
    });
    
    // Set initial border for checked option
    labels.forEach((label, i) => {
        if (radioButtons[i].checked) {
            label.style.borderColor = '#000';
            label.style.background = '#f8f8f8';
        }
    });
}

// Update shipping display
function updateShippingDisplay() {
    shipping.textContent = `₦${shipping_price.toLocaleString()}`;
}

// Create products
function createProducts() {
    const products = [
        { id: 1, name: 'Valentino & You parfume', brand: 'Tom Ford', price: 7000, image: '../Assets/7k.jpeg' },
        { id: 2, name: 'Lamsat Hair parfumes', brand: 'Dior', price: 7000, image: '../Assets/7k(2).jpeg' },
        { id: 3, name: 'Bleu de Chanel', brand: 'Chanel', price: 7000, image: '../Assets/7k(3).jpeg' },
        { id: 4, name: 'La Vie Est Belle', brand: 'Lancôme', price: 25000, image: '../Assets/25k.jpeg' },
        { id: 5, name: 'Asad & Hyaati', brand: 'Lancôme', price: 35000, image: '../Assets/35k.jpeg' },
        { id: 6, name: 'Rose Garden', brand: 'Lancôme', price: 30000, image: '../Assets/30k.jpeg' },
        { id: 7, name: 'Summer Breeze', brand: 'Lancôme', price: 6000, image: '../Assets/6k.jpeg' },
        { id: 8, name: 'Ocean Mist', brand: 'Lancôme', price: 4000, image: '../Assets/4k.jpeg' },
        { id: 9, name: 'Citrus Fresh', brand: 'Lancôme', price: 2000, image: '../Assets/2k.jpeg' },
        { id: 10, name: 'Royal Oud', brand: 'Lancôme', price: 80000, image: '../Assets/80k.jpeg' },
        { id: 11, name: 'Amber Nights', brand: 'Lancôme', price: 39000, image: '../Assets/39k.jpeg' },
        { id: 12, name: 'Oud Touch', brand: 'Lancôme', price: 8000, image: '../Assets/8k.jpeg' },
        { id: 13, name: 'Asad & Hyaati', brand: 'Lancôme', price: 47000, image: '../Assets/47k.jpeg' }
    ];

    products.forEach(product => {
        const product_card = document.createElement("div");
        product_card.className = "product-card";
        product_card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-size">100ml | Eau de Parfum</p>
                <div class="product-pricing">
                    <span class="product-price">₦${product.price.toLocaleString()}</span>
                </div>
                <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-brand="${product.brand}" data-price="${product.price}" data-image="${product.image}">ADD TO CART</button>
            </div>
        `;
        
        products_grid.appendChild(product_card);
        
        // Add event listener to "Add to Cart" button
        const addBtn = product_card.querySelector('.add-to-cart');
        addBtn.addEventListener('click', () => {
            const itemData = {
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image,
                quantity: 1
            };
            
            // Check if item already exists in cart
            const existingItemIndex = cart_items.findIndex(item => item.id === product.id);
            
            if (existingItemIndex !== -1) {
                // Item exists, increase quantity
                cart_items[existingItemIndex].quantity++;
                updateCartItemDisplay(product.id);
            } else {
                // New item, add to cart
                cart_items.push(itemData);
                createCart(itemData);
            }
            
            saveCartToStorage();
            updateTotalCount();
            
            // Visual feedback
            addBtn.textContent = 'ADDED!';
            setTimeout(() => {
                addBtn.textContent = 'ADD TO CART';
            }, 1000);
        });
    });
}

// Update cart item display (when quantity changes from product grid)
function updateCartItemDisplay(productId) {
    const cartItem = document.querySelector(`[data-cart-id="${productId}"]`);
    if (cartItem) {
        const item = cart_items.find(i => i.id === productId);
        const quantityDisplay = cartItem.querySelector('.quantity-display');
        const priceDisplay = cartItem.querySelector('.cart-item-price');
        
        quantityDisplay.textContent = item.quantity;
        priceDisplay.textContent = `₦${(item.price * item.quantity).toLocaleString()}`;
        updateTotalCount();
    }
}

// Function to create cart item
function createCart(itemData) {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.setAttribute('data-cart-id', itemData.id);
    
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${itemData.image}" alt="${itemData.name}">
        </div>
        <div class="cart-item-details">
            <div class="cart-item-brand">${itemData.brand}</div>
            <div class="cart-item-name">${itemData.name}</div>
            <div class="cart-item-size">100ml | Eau de Parfum</div>
            <div class="quantity-controls">
                <button class="quantity-btn minus">-</button>
                <span class="quantity-display">${itemData.quantity}</span>
                <button class="quantity-btn plus">+</button>
            </div>
        </div>
        <div class="cart-item-actions">
            <div class="cart-item-price">₦${(itemData.price * itemData.quantity).toLocaleString()}</div>
            <button class="remove-item">Remove</button>
        </div>
    `;
    
    cartItemsDiv.appendChild(cartItem);
    
    // Get elements
    const minusBtn = cartItem.querySelector('.minus');
    const plusBtn = cartItem.querySelector('.plus');
    const quantityDisplay = cartItem.querySelector('.quantity-display');
    const priceDisplay = cartItem.querySelector('.cart-item-price');
    const removeBtn = cartItem.querySelector('.remove-item');
    
    // Plus button
    plusBtn.addEventListener('click', () => {
        const item = cart_items.find(i => i.id === itemData.id);
        item.quantity++;
        quantityDisplay.textContent = item.quantity;
        priceDisplay.textContent = `₦${(item.price * item.quantity).toLocaleString()}`;
        updateTotalCount();
        saveCartToStorage();
    });
    
    // Minus button
    minusBtn.addEventListener('click', () => {
        const item = cart_items.find(i => i.id === itemData.id);
        if (item.quantity > 1) {
            item.quantity--;
            quantityDisplay.textContent = item.quantity;
            priceDisplay.textContent = `₦${(item.price * item.quantity).toLocaleString()}`;
        } else {
            // Remove item if quantity is 1
            removeCartItem(itemData.id, cartItem);
        }
        updateTotalCount();
        saveCartToStorage();
    });
    
    // Remove button
    removeBtn.addEventListener('click', () => {
        removeCartItem(itemData.id, cartItem);
    });
    
    updateTotalCount();
}

// Remove cart item
function removeCartItem(itemId, cartElement) {
    cart_items = cart_items.filter(item => item.id !== itemId);
    cartElement.remove();
    updateTotalCount();
    saveCartToStorage();
}

// Function to update total count display
function updateTotalCount() {
    let totalItems = 0;
    let subtotal = 0;
    
    cart_items.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
    });
    
    cartAmount.textContent = totalItems;
    cart_count.textContent = totalItems;
    
    const totalAmount = subtotal + shipping_price;
    total.textContent = `₦${totalAmount.toLocaleString()}`;
    
    updateShippingDisplay();
}

// Toggle mobile menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Logout handler with Firebase Auth
function handleLogout(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        // Optionally clear cart on logout
        const clearCart = confirm('Do you want to clear your cart?');
        if (clearCart) {
            localStorage.removeItem('peacescent_cart');
            localStorage.removeItem('peacescent_location');
        }
        
        signOut(auth).then(() => {
            // Sign-out successful
            console.log('User signed out');
            alert('Logged out successfully!');
            window.location.href = '../index.html';
        }).catch((error) => {
            // An error happened
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        });
    }
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// Make functions globally accessible
window.toggleMenu = toggleMenu;
window.handleLogout = handleLogout;

// Checkout function - Send to WhatsApp
function proceedToCheckout() {
    if (cart_items.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
    }
    
    // WhatsApp number (replace with your actual WhatsApp number)
    const whatsappNumber = '2349117967019'; // Format: country code + number (no + or spaces)
    
    // Build the message
    let message = '🛍️ *NEW ORDER FROM PEACE-SCENT*\n\n';
    message += '📦 *ORDER DETAILS:*\n';
    message += '━━━━━━━━━━━━━━━━━\n\n';
    
    let subtotal = 0;
    
    cart_items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Brand: ${item.brand}\n`;
        message += `   Quantity: ${item.quantity}\n`;
        message += `   Price: ₦${item.price.toLocaleString()} each\n`;
        message += `   Subtotal: ₦${itemTotal.toLocaleString()}\n\n`;
    });
    
    message += '━━━━━━━━━━━━━━━━━\n';
    message += `💰 *Subtotal:* ₦${subtotal.toLocaleString()}\n`;
    
    const locationText = shipping_price === 4000 ? 'Within Warri' : 'Outside Warri';
    message += `🚚 *Shipping (${locationText}):* ₦${shipping_price.toLocaleString()}\n`;
    message += '━━━━━━━━━━━━━━━━━\n';
    
    const totalAmount = subtotal + shipping_price;
    message += `✨ *TOTAL:* ₦${totalAmount.toLocaleString()}\n\n`;
    
    message += '📍 Please confirm your delivery address to complete this order.';
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
}

// Add event listener to checkout button
function initCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}



