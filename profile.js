import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI Elements
const nameTag = document.getElementById('display-name');
const emailTag = document.getElementById('display-email');
const iconContainer = document.getElementById('user-icon');
const logoutBtn = document.getElementById('logout-btn');

/**
 * AUTH OBSERVER
 * This monitors the user's login status and updates the UI accordingly.
 */
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 1. Set Name & Email
        const name = user.displayName || "Dev Creator";
        nameTag.innerText = name;
        emailTag.innerText = user.email;

        // 2. LOGIC: Decide which logo to show
        if (user.photoURL) {
            // Person logged in with Google: Show their real photo
            iconContainer.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover shadow-sm">`;
            iconContainer.style.background = "transparent";
        } else {
            // Person logged in with Email: Generate a logo from their username
            const initial = name.charAt(0).toUpperCase();
            iconContainer.innerHTML = `<span class="text-white font-black text-8xl font-sans bg-gray-800 p-5">${initial}</span>`;
            
            // Apply the "Old UI" styling for the generated icon
            iconContainer.className = "w-32 h-32 gray-800 rounded-full flex items-center justify-center shadow-inner border-4 border-white";
        }
    } else {
        // No user is signed in, boot them to the login page
        window.location.href = "login.html";
    }
});

/**
 * LOGOUT LOGIC
 */
logoutBtn.onclick = async () => {
    const confirmLogout = confirm("Are you sure you want to sign out of DevLog?");
    if (confirmLogout) {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (err) {
            alert("Error logging out: " + err.message);
        }
    }
};
