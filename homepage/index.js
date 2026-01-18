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
    } else {
        // No user logged in, redirect to login
        console.log("No user logged in");
        window.location.href = "../index.html";
    }
});

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

// Logout with Firebase Auth
function handleLogout(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
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