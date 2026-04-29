import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get elements from the page
const titleEl = document.getElementById('post-title');
const descEl = document.getElementById('post-description');
const contentEl = document.getElementById('full-content');
const authorEl = document.getElementById('post-author');
const dateEl = document.getElementById('post-date');

// 1. Get the Post ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

async function loadPostDetails() {
    if (!postId) {
        alert("No article ID found!");
        window.location.href = "index.html";
        return;
    }

    try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const data = postSnap.data();
            const divider = document.getElementById('divider');
            const footer = document.getElementById('footer');

            // Set the Browser Tab Title
            document.title = `${data.title} | DevLog`;
            

            // Fill in the Header Info
            titleEl.innerText = data.title;
            descEl.innerText = data.description || "No summary provided.";
            divider.classList.remove('hidden');
            footer.classList.remove('hidden');

            // Fill in the Main Content (CRITICAL: Using innerHTML for formatting)
            contentEl.innerHTML = data.content;

            // Fill in the Footer Metadata
            authorEl.innerText = `Written by ${data.author || "Anonymous"}`;

            if (data.createdAt) {
                // Convert Firebase Timestamp to readable date
                const date = data.createdAt.toDate();
                dateEl.innerText = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                dateEl.innerText = "Recently Published";
            }

        } else {
            // Post doesn't exist in Database
            contentEl.innerHTML = `
                <div class="text-center py-20">
                    <h2 class="text-2xl font-bold text-gray-300 dark:text-gray-500">Article not found.</h2>
                    <a href="index.html" class="text-blue-500 underline mt-4 block">Return to home</a>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching post details:", error);
        contentEl.innerText = "Failed to load content. Please check your internet connection.";
    }
}

// Start the loading process
loadPostDetails();
