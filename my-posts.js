import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, query, where, getDocs, deleteDoc, doc, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const postsGrid = document.getElementById('my-posts-grid');

// FIX 1: Trigger the fetch function inside the auth observer
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else if (!user.emailVerified) {
        alert("Email not verified. Redirecting...");
        window.location.href = "login.html";
    } else {
        // This is the missing piece: Call the fetch function once we have the user's ID
        fetchMyPosts(user.uid);
    }
});

async function fetchMyPosts(uid) {
    try {
        const q = query(
            collection(db, "posts"), 
            where("authorId", "==", uid),
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        postsGrid.innerHTML = ""; 

        if (querySnapshot.empty) {
            postsGrid.innerHTML = `<p class="text-gray-400 italic">You haven't written any posts yet.</p>`;
            return;
        }

        querySnapshot.forEach((postDoc) => {
            const data = postDoc.data();
            const postId = postDoc.id;

            const postCard = document.createElement('div');
            // Restoring your "Old UI" card style
            postCard.className = "bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mb-4";
            
            postCard.innerHTML = `
                <div class="flex-1 min-w-0 w-full text-left">
                    <h2 class="text-xl font-bold truncate mb-1">${data.title}</h2>
                    <p class="text-gray-400 text-sm leading-relaxed line-clamp-2">
                        ${data.description || "No description provided for this story."}
                    </p>
                </div>
                <div class="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button onclick="location.href='dashboard.html?edit=${postId}'" 
                        class="flex-1 md:flex-none bg-blue-50 text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-100 transition">
                        Edit
                    </button>
                    <button id="del-${postId}" 
                        class="flex-1 md:flex-none bg-red-50 text-red-500 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition">
                        Delete
                    </button>
                </div>
            `;

            postsGrid.appendChild(postCard);

            document.getElementById(`del-${postId}`).addEventListener('click', () => deletePost(postId));
        });
    } catch (err) {
        console.error("Firestore Error:", err);
        // FIX 2: Check for Index Error in console
        postsGrid.innerHTML = `<p class="text-red-500">Error loading posts. Please check your browser console for a link to create a 'Composite Index' in Firebase.</p>`;
    }
}

async function deletePost(id) {
    if (confirm("Are you sure you want to delete this article? This cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "posts", id));
            location.reload(); 
        } catch (err) {
            alert("Error deleting post: " + err.message);
        }
    }
}
