import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('posts-grid');
    const navRight = document.getElementById('nav-right');

    // 1. Auth State Observer
    onAuthStateChanged(auth, (user) => {
        if (!navRight) return; // Exit if element isn't found

        if (user) {
            let profileMarkup = "";
            if (user.photoURL) {
                profileMarkup = `<img src="${user.photoURL}" class="w-10 h-10 rounded-full border border-gray-200">`;
            } else {
                const initial = (user.displayName || "U").charAt(0).toUpperCase();
                profileMarkup = `<div class="w-10 h-10 bg-gray-800 text-white flex items-center justify-center rounded-full font-black text-lg font-sans">${initial}</div>`;
            }
            navRight.innerHTML = `<a href="profile.html">${profileMarkup}</a>`;
        } else {
            navRight.innerHTML = `<a href="login.html" class="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Login</a>`;
        }
    });

    // 2. Fetch Posts
    const fetchAllPosts = async () => {
        if (!postsGrid) return; // Exit if element isn't found

        try {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            postsGrid.innerHTML = ""; 

            if (querySnapshot.empty) {
                postsGrid.innerHTML = `<p class="text-gray-400 dark:text-gray-100 italic text-center col-span-full">No stories found.</p>`;
                return;
            }

            querySnapshot.forEach((doc) => {
                const post = doc.data();
                const postElement = document.createElement('div');
                postElement.className = "card-old-ui cursor-pointer group bg-white dark:bg-black/50 shadow-md dark:shadow-gray-800 shadow-gray-200 p-[2.5rem] rounded-3xl";
                postElement.innerHTML = `
                    <div onclick="location.href='post-details.html?id=${doc.id}'">
                        <h2 class="text-2xl font-black mb-2 truncate-title">${post.title}</h2>
                        <p class="text-gray-500 dark:text-gray-100 text text-sm line-clamp-2">${post.description || ""}</p>
                    </div>
                `;
                postsGrid.appendChild(postElement);
            });
        } catch (err) {
            console.error("Error fetching posts:", err);
            if (postsGrid) postsGrid.innerHTML = `<p class="text-red-500">Failed to load posts.</p>`;
        }
    };

    fetchAllPosts();
});
