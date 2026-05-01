import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    updateProfile, GoogleAuthProvider, signInWithPopup, 
    sendEmailVerification, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Elements
const authForm = document.getElementById('auth-form');
const usernameContainer = document.getElementById('username-container');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleModeLink = document.getElementById('toggle-mode-link');
const togglePassBtn = document.getElementById('toggle-pass-btn');
const googleBtn = document.getElementById('google-btn');
const eyeContainer = document.getElementById('eye-icon-container');
const resendBtn = document.getElementById('resend-email-btn');

const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

let isLoginMode = true;

// Toggle Password
togglePassBtn.onclick = () => {
    const passInput = document.getElementById('auth-password');
    if (passInput.type === "password") {
        passInput.type = "text";
        eyeContainer.innerHTML = eyeClosed;
    } else {
        passInput.type = "password";
        eyeContainer.innerHTML = eyeOpen;
    }
};

// Toggle Login/Register
toggleModeLink.onclick = () => {
    isLoginMode = !isLoginMode;
    usernameContainer.classList.toggle('hidden');
    resendBtn.classList.add('hidden'); // Hide resend button if switching modes
    
    if (isLoginMode) {
        document.getElementById('auth-subtitle').innerText = "Welcome back, creator.";
        authSubmitBtn.innerText = "Login";
        document.getElementById('toggle-text').innerText = "New to DevLog?";
        toggleModeLink.innerText = "Create Account";
    } else {
        document.getElementById('auth-subtitle').innerText = "Join the community.";
        authSubmitBtn.innerText = "Create Account";
        document.getElementById('toggle-text').innerText = "Already a member?";
        toggleModeLink.innerText = "Login";
    }
};

// Form Logic
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('reg-username').value;

    try {
        if (isLoginMode) {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            if (!userCred.user.emailVerified) {
                alert("Please verify your email! Check your spam folder.");
                resendBtn.classList.remove('hidden');
                await signOut(auth);
                return;
            }
            window.location.href = "index.html";
        } else {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCred.user, { displayName: username });
            await sendEmailVerification(userCred.user);
            alert("Verification email sent! Check your inbox.");
            await signOut(auth);
            location.reload();
        }
    } catch (err) {
        alert(err.message);
    }
};

// Resend Verification Email
// Updated Resend Logic for login.js
resendBtn.onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (!email || !password) {
        alert("Please enter your email and password first.");
        return;
    }

    try {
        // We must sign in to get the user object to send the email
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCred.user);
        alert("Verification link re-sent! Check your inbox (and spam folder).");
        await signOut(auth); // Log them back out so they have to verify
    } catch (err) {
        alert("Error: " + err.message);
    }
};

// Google Login
googleBtn.onclick = async () => {
    try {
        await signInWithPopup(auth, provider);
        window.location.href = "index.html";
    } catch (err) {
        alert(err.message);
    }
};