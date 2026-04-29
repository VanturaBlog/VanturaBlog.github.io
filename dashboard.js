import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const titleInput = document.getElementById('post-title');
const descArea = document.getElementById('post-description');
const contentInput = document.getElementById('post-content');
const publishBtn = document.getElementById('publish-btn');

const urlParams = new URLSearchParams(window.location.search);
const editPostId = urlParams.get('edit');

// Format Function: Handles Styles, H2, and Lists
window.format = (command, value = null) => {
    if (command === 'removeFormat') {
        document.execCommand('removeFormat', false, value); // Inline styles
        document.execCommand('formatBlock', false, 'div');   // Reset H2
        document.execCommand('outdent', false, value);      // Reset Lists
    } else {
        document.execCommand(command, false, value);
    }
};

window.insertImage = () => {
    const url = prompt("Enter Image URL:");
    if (url) {
        const imgHtml = `<img src="${url}"><br>`;
        document.execCommand('insertHTML', false, imgHtml);
    }
};

// Description Auto-grow
descArea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else if (!user.emailVerified) {
        // Even if they are logged in, if they aren't verified, send them to login
        alert("Email not verified. Redirecting...");
        window.location.href = "login.html";
    }
});


publishBtn.onclick = async () => {
    const title = titleInput.value.trim();
    const description = descArea.value.trim();
    const content = contentInput.innerHTML;

    if (!title || content === "" || content === "<br>") return alert("Missing fields!");

    publishBtn.disabled = true;
    publishBtn.innerText = "Publishing...";

    try {
        const postData = {
            title, description, content,
            updatedAt: serverTimestamp()
        };

        if (editPostId) {
            await updateDoc(doc(db, "posts", editPostId), postData);
        } else {
            await addDoc(collection(db, "posts"), {
                ...postData,
                author: auth.currentUser.displayName || auth.currentUser.email,
                authorId: auth.currentUser.uid,
                createdAt: serverTimestamp()
            });
        }
        window.location.href = "index.html";
    } catch (err) {
        alert(err.message);
        publishBtn.disabled = false;
    }
};
