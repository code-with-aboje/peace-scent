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

// Update UI after login
function updateLoginState(email) {
    const loginLink = document.querySelector('.nav-links a[onclick*="openLoginModal"]');
    if (loginLink) {
        loginLink.textContent = 'Account';
        loginLink.onclick = (e) => {
            e.preventDefault();
            alert(`Logged in as: ${email}\n\nAccount settings would be shown here.`);
        };
    }
}

// Close modal when clicking outside
document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('authModal')) {
        closeAuthModal();
    }
});

// storing image path in variables
const pefImgs = {
    image1 : "/Assets/pef1.png",
    image2 : "/Assets/pef2.png",
    image3 : "/Assets/pef3.png",
    image4 : "/Assets/pef4.png",
    image5 : "/Assets/pef5.png",
    image6 : "/Assets/pef6.png",
    image7 : "/Assets/pef7.png",
    image8 : "/Assets/pef8.png",
    image9 : "/Assets/pef9.png",
    image10 : "/Assets/pef10.png",
    image11 : "/Assets/pef11.png",
    image12 : "/Assets/pef12.png"
}

// getting dom elements
const img1 = document.getElementById("image1");
const img2 = document.getElementById("image2");
const img3 = document.getElementById("image3");
const img4 = document.getElementById("image4");
const img5 = document.getElementById("image5");
const img6 = document.getElementById("image6");
const img7 = document.getElementById("image7");
const img8 = document.getElementById("image8");
const img9 = document.getElementById("image9");
const img10 = document.getElementById("image10");
const img11 = document.getElementById("image11");
const img12 = document.getElementById("image12");

// setting image src attribute
img1.src = pefImgs.image1;
img2.src = pefImgs.image2;
img3.src = pefImgs.image3;
img4.src = pefImgs.image4;
img5.src = pefImgs.image5;
img6.src = pefImgs.image6;
img7.src = pefImgs.image7;
img8.src = pefImgs.image8;
img9.src = pefImgs.image9;
img10.src = pefImgs.image10;
img11.src = pefImgs.image11;
img12.src = pefImgs.image12;

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
const db = getDatabase(app);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in → redirect to account/dashboard
    console.log("User logged in:", user.email);
    // Only redirect if not already on homepage
    if (!window.location.pathname.includes('/homepage/')) {
      window.location.href = "./homepage/index.html";
    }
  } else {
    console.log("No user logged in");
    // stay on homepage
  }
});