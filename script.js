import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginBtnNav = document.getElementById('open-auth-btn');
const userProfileNav = document.getElementById('user-profile');
const editorSection = document.getElementById('editor-section');
const userDisplayName = document.getElementById('user-display-name');
const userPhoto = document.getElementById('user-photo');

// Logout Functionality
document.getElementById('logout-btn').onclick = () => {
    signOut(auth).then(() => {
        window.location.reload(); // Refresh to update UI
    });
};

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Logged In State
        loginBtnNav.classList.add('hidden');
        userProfileNav.classList.remove('hidden');
        editorSection.classList.remove('hidden');
        
        userDisplayName.innerText = user.displayName || user.email.split('@')[0];
        
        if (user.photoURL) {
            userPhoto.src = user.photoURL;
            userPhoto.classList.remove('hidden');
        }
    } else {
        // Logged Out State
        loginBtnNav.classList.remove('hidden');
        userProfileNav.classList.add('hidden');
        editorSection.classList.add('hidden');
    }
});
