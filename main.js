// Navigation Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Auth Modal Functions
function openLoginModal(e) {
    if (e) e.preventDefault();
    document.getElementById('authModal').classList.add('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    clearFormErrors();
}

function switchToSignup(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    clearFormErrors();
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    clearFormErrors();
}

function showForgotPassword(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
    clearFormErrors();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('active');
    });
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    document.querySelectorAll('.success-message').forEach(msg => {
        msg.classList.remove('active');
    });
}

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.closest('.form-group').classList.add('error');
    error.textContent = message;
    error.classList.add('active');
}

function hideError(errorId) {
    const error = document.getElementById(errorId);
    error.classList.remove('active');
    error.closest('.form-group').classList.remove('error');
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    clearFormErrors();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('loginEmail', 'loginEmailError', 'Please enter a valid email');
        isValid = false;
    }

    // Password validation
    if (password.length < 6) {
        showError('loginPassword', 'loginPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (isValid) {
        // Show loading spinner with login text
        const spinnerText = document.querySelector('.spinner-text');
        spinnerText.textContent = 'Logging you in...';
        document.getElementById('loadingSpinner').classList.add('active');
        
        // Sign in with Firebase Authentication
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Hide spinner
                document.getElementById('loadingSpinner').classList.remove('active');
                
                alert('Welcome back! Login successful.');
                console.log("User logged in:", userCredential.user.email);
                
                closeAuthModal();
                // The onAuthStateChanged listener will handle the redirect
            })
            .catch((error) => {
                // Hide spinner
                document.getElementById('loadingSpinner').classList.remove('active');
                
                const errorCode = error.code;
                
                if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                    showError('loginEmail', 'loginEmailError', 'Invalid email or password');
                } else {
                    alert('Error logging in: ' + error.message);
                }
                console.error("Login error:", error);
            });
    }
}

// Signup Handler
function handleSignup(e) {
    e.preventDefault();
    clearFormErrors();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    let isValid = true;

    // Name validation
    if (name.trim().length < 2) {
        showError('signupName', 'signupNameError', 'Please enter your full name');
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('signupEmail', 'signupEmailError', 'Please enter a valid email');
        isValid = false;
    }

    // Password validation
    if (password.length < 8) {
        showError('signupPassword', 'signupPasswordError', 'Password must be at least 8 characters');
        isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        showError('signupConfirmPassword', 'signupConfirmPasswordError', 'Passwords don\'t match');
        isValid = false;
    }

    if (isValid) {
        // Show loading spinner with signup text
        const spinnerText = document.querySelector('.spinner-text');
        spinnerText.textContent = 'Creating your account...';
        document.getElementById('loadingSpinner').classList.add('active');
        
        // Create user with Firebase Authentication
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // User created successfully
                const user = userCredential.user;
                
                // Store additional user data in Realtime Database
                return set(ref(db, 'users/' + user.uid), {
                    username: name,
                    email: email,
                    createdAt: new Date().toISOString()
                });
            })
            .then(() => {
                // Hide spinner
                document.getElementById('loadingSpinner').classList.remove('active');
                
                alert('Account created successfully! Welcome to PEACE-SCENT.');
                console.log("User account created and data stored in database!");
                
                closeAuthModal();
                // The onAuthStateChanged listener will handle the redirect
            })
            .catch((error) => {
                // Hide spinner
                document.getElementById('loadingSpinner').classList.remove('active');
                
                const errorCode = error.code;
                const errorMessage = error.message;
                
                console.error("Error creating account:", errorCode, errorMessage);
                
                // Show appropriate error message
                if (errorCode === 'auth/email-already-in-use') {
                    showError('signupEmail', 'signupEmailError', 'This email is already registered');
                } else if (errorCode === 'auth/weak-password') {
                    showError('signupPassword', 'signupPasswordError', 'Password is too weak');
                } else {
                    alert('Error creating account: ' + errorMessage);
                }
            });
    }
}

// Forgot Password Handler
function handleForgotPassword(e) {
    e.preventDefault();
    clearFormErrors();

    const email = document.getElementById('resetEmail').value;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('resetEmail', 'resetEmailError', 'Please enter a valid email');
        return;
    }

    // Simulate sending reset link
    setTimeout(() => {
        document.getElementById('resetSuccessMessage').classList.add('active');
        document.getElementById('resetEmail').value = '';
        
        // Auto switch back to login after 3 seconds
        setTimeout(() => {
            switchToLogin(new Event('click'));
        }, 3000);
    }, 500);
}

// Social Login Handler
function socialLogin(provider) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would be initiated here. This is a demo.`);
    closeAuthModal();
}

// Close modal when clicking outside
document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('authModal')) {
        closeAuthModal();
    }
});

// Product Array - Easy to manage and add new products
const products = [
    { id: 1, name: 'Black Orchid', brand: 'Tom Ford', price: 7000, image: '../Assets/7k.jpeg' },
        { id: 2, name: 'Sauvage', brand: 'Dior', price: 7000, image: '../Assets/7k(2).jpeg' },
        { id: 3, name: 'Bleu de Chanel', brand: 'Chanel', price: 7000, image: '../Assets/7k(3).jpeg' },
        { id: 4, name: 'La Vie Est Belle', brand: 'Lancôme', price: 25000, image: '../Assets/25k.jpeg' },
        { id: 5, name: 'Midnight Essence', brand: 'Lancôme', price: 35000, image: '../Assets/35k.jpeg' },
        { id: 6, name: 'Rose Garden', brand: 'Lancôme', price: 30000, image: '../Assets/30k.jpeg' },
        { id: 7, name: 'Summer Breeze', brand: 'Lancôme', price: 6000, image: '../Assets/6k.jpeg' },
        { id: 8, name: 'Ocean Mist', brand: 'Lancôme', price: 4000, image: '../Assets/4k.jpeg' },
        { id: 9, name: 'Citrus Fresh', brand: 'Lancôme', price: 2000, image: '../Assets/2k.jpeg' },
        { id: 10, name: 'Royal Oud', brand: 'Lancôme', price: 80000, image: '../Assets/80k.jpeg' },
        { id: 11, name: 'Amber Nights', brand: 'Lancôme', price: 39000, image: '../Assets/39k.jpeg' },
        { id: 12, name: 'Vanilla Dreams', brand: 'Lancôme', price: 8000, image: '../Assets/8k.jpeg' },
        { id: 13, name: 'Velvet Touch', brand: 'Lancôme', price: 47000, image: '../Assets/47k.jpeg' }
];

const newArrivals = [
    { id: 1, name: 'Black Orchid', brand: 'Tom Ford', price: 7000, image: '../Assets/7k.jpeg' },
    { id: 2, name: 'Sauvage', brand: 'Dior', price: 7000, image: '../Assets/7k(2).jpeg' },
    { id: 3, name: 'Bleu de Chanel', brand: 'Chanel', price: 7000, image: '../Assets/7k(3).jpeg' },
    { id: 4, name: 'La Vie Est Belle', brand: 'Lancôme', price: 25000, image: '../Assets/25k.jpeg' },
    { id: 5, name: 'Midnight Essence', brand: 'Lancôme', price: 35000, image: '../Assets/35k.jpeg' },
    { id: 6, name: 'Rose Garden', brand: 'Lancôme', price: 30000, image: '../Assets/30k.jpeg' },
    { id: 7, name: 'Summer Breeze', brand: 'Lancôme', price: 6000, image: '../Assets/6k.jpeg' },
    { id: 8, name: 'Ocean Mist', brand: 'Lancôme', price: 4000, image: '../Assets/4k.jpeg' },
    { id: 9, name: 'Citrus Fresh', brand: 'Lancôme', price: 2000, image: '../Assets/2k.jpeg' },
    { id: 10, name: 'Royal Oud', brand: 'Lancôme', price: 80000, image: '../Assets/80k.jpeg' },
    { id: 11, name: 'Amber Nights', brand: 'Lancôme', price: 39000, image: '../Assets/39k.jpeg' },
    { id: 12, name: 'Vanilla Dreams', brand: 'Lancôme', price: 8000, image: '../Assets/8k.jpeg' },
    { id: 13, name: 'Velvet Touch', brand: 'Lancôme', price: 47000, image: '../Assets/47k.jpeg' }
];

// Global auth variable
let auth, db;
let currentUser = null;

// Function to create product card HTML
function createProductCard(product) {
    const discountBadge = product.discount ? `<div class="discount-badge">${product.discount}</div>` : '';
    const oldPriceHTML = product.oldPrice ? `<span class="product-price-old">₦${product.oldPrice.toLocaleString()}</span>` : '';
    
    return `
        <div class="product-card">
            ${discountBadge}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-size">${product.size}</p>
                <div class="product-pricing">
                    <span class="product-price">₦${product.price.toLocaleString()}</span>
                    ${oldPriceHTML}
                </div>
                <button class="add-to-cart" data-product-id="${product.id}">ADD TO CART</button>
            </div>
        </div>
    `;
}

// Function to render products - FIXED TO USE getElementById
function renderProducts() {
    const featuredGrid = document.getElementById('featuredProducts');
    const newArrivalsGrid = document.getElementById('newArrivalsProducts');
    
    if (featuredGrid) {
        featuredGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        console.log('Featured products rendered:', products.length);
    }
    
    if (newArrivalsGrid) {
        newArrivalsGrid.innerHTML = newArrivals.map(product => createProductCard(product)).join('');
        console.log('New arrivals rendered:', newArrivals.length);
    }
    
    // Add event listeners to all "Add to Cart" buttons
    attachCartListeners();
}

// Function to attach event listeners to cart buttons
function attachCartListeners() {
    const cartButtons = document.querySelectorAll('.add-to-cart');
    
    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if user is logged in
            if (!currentUser) {
                // User not logged in, show signup/login modal
                openLoginModal(e);
                return;
            }
            
            // User is logged in, proceed with add to cart
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
            
            // Visual feedback
            this.textContent = 'ADDED!';
            setTimeout(() => {
                this.textContent = 'ADD TO CART';
            }, 1000);
        });
    });
}

// Function to add product to cart
function addToCart(productId) {
    // Find product in either featured or new arrivals
    let product = products.find(p => p.id === productId);
    if (!product) {
        product = newArrivals.find(p => p.id === productId);
    }
    
    if (!product) {
        console.error('Product not found');
        return;
    }
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('peacescent_cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Increase quantity
        cart[existingItemIndex].quantity++;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('peacescent_cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    console.log('Product added to cart:', product.name);
}

// Function to update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('peacescent_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// making toggleMenu function accessible globally
window.toggleMenu = toggleMenu;
window.openLoginModal = openLoginModal;
window.closeAuthModal = closeAuthModal;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.showForgotPassword = showForgotPassword;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.socialLogin = socialLogin;
window.togglePassword = togglePassword;

// initializing firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged 
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
db = getDatabase(app);
auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    currentUser = user;
    console.log("User logged in:", user.email);
    
    // Update UI to show account link instead of login
    const loginLink = document.querySelector('a[onclick*="openLoginModal"]');
    if (loginLink) {
        loginLink.textContent = 'My Account';
        loginLink.onclick = (e) => {
            e.preventDefault();
            window.location.href = "./homepage/index.html";
        };
    }
    
    // Update cart count on load
    updateCartCount();
  } else {
    currentUser = null;
    console.log("No user logged in");
    // User not logged in - stay on landing page
  }
});

// Initialize products when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
});