import { getUserDetails, getUserPostByID, getFollowing, getFollowers, updateProfile } from "./functions.js";
import { formattedDate } from "./functions.js";
import { getPostDetail, postDetailLoader } from "./index.js";


document.addEventListener("DOMContentLoaded", function() {
    profileLoader()

});


function profileLoader() {
    const postForm = document.querySelector('.create-post-form');
    const username = document.querySelector('.nav-link.username strong')?.textContent.trim();

    if(username){
        userLoader(username);
    }
    if(postForm) {
        postForm.style.display = 'none';
    }

}


// Handle Bio editing 
function attachBioEditHandler() {
    const bioText = document.getElementById("bio-text");
    const bioInput = document.getElementById("bio-input");
    const saveButton = document.getElementById("save-bio");

    if (!bioText || !bioInput || !saveButton) return;

    // Click to edit bio
    bioText.addEventListener("click", function () {
        bioInput.value = bioText.innerText.trim();
        bioText.classList.add("hidden");
        bioInput.classList.remove("hidden");
        saveButton.classList.remove("hidden");
        bioInput.focus();
    });

    // Save bio on button click
    saveButton.addEventListener("click", async function () {
        const newBio = bioInput.value.trim();
        if (!newBio) return;

        try {
            await updateProfile({ bio: newBio });

            // Update bio text in the UI
            bioText.innerText = newBio;

            // Hide input & save button, show updated bio text
            bioText.classList.remove("hidden");
            bioInput.classList.add("hidden");
            saveButton.classList.add("hidden");
        } catch (error) {
            console.log("Error updating bio:", error);
        }
    });

    // Save bio on Enter keypress
    bioInput.addEventListener("keypress", async function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            saveButton.click();
        }
    });
}


// Function to get the userdetails and pass it to renderer
async function userLoader(username){
    try {
        const details = await getUserDetails(username)
        renderUserDetails(details)
    } catch(error){
        console.log(error)
    }
    
}


// Render the user details as profile
function renderUserDetails(details) {
    const detailContainer = document.querySelector('.User-Detail-view');

    // Prevent TypeError
    if(!detailContainer){
        return;
    }

    detailContainer.innerHTML = ``; 

    if (!details) {
        detailContainer.innerHTML = `<p class="no-detail-message">Failed to fetch user details</p>`;
        return;
    }

    userPostLoader(details.id)

    // Determine if the follow button should be displayed
    const followButton = details.username !== loggedInUser 
        ? `<button class="follow-btn">Follow</button>` 
        : '';

    // Create the user profile container
    const profileHTML = `
        <div class="profile-container">
            <!-- Profile Picture -->
            <div class="profile-image">
                <img src="https://robohash.org/example.png?size=200x200" alt="User Avatar">
                <i class="fas fa-user-circle"></i>
            </div>

            <!-- User Details -->
            <div class="profile-info">
                <div class="profile-header">
                    <h2>${details.username}</h2>
                    ${followButton}             
                </div>
                <div class="profile-stats">
                    <span><strong>${details.total_posts}</strong> Posts</span>
                    <span><strong>${details.total_followers}</strong> Followers</span>
                    <span><strong>${details.total_following}</strong> Following</span>
                </div>
                <div class="profile-name">
                    <h3>${details.first_name} ${details.last_name}</h3>
                </div>
                <div id="bio-container">
                    <p id="bio-text" class="profile-bio">${details?.details?.bio || 'Click to add a bio'}</p>
                    <textarea id="bio-input" class="hidden"></textarea>
                    <button id="save-bio" class="hidden">Save</button>
                </div>
            </div>
        </div>
    `;

    detailContainer.innerHTML = profileHTML;

    attachBioEditHandler();
}


// Get the posts by this user
async function userPostLoader(id){
    try{
        const posts = await getUserPostByID(id)
        renderUserPost(posts)
        return posts
    } catch(error) {
        return null
    }
}

// Renders user posts
function renderUserPost(posts) {
    const postContainer = document.querySelector('.User-Post-View');

    // Prevent TypeError
    if(!postContainer){
        return;
    }

    postContainer.innerHTML = '';

    if (!posts || posts.length === 0) {
        postContainer.innerHTML = `<p class="no-posts-message">No posts yet</p>`;
        return;
    }

    posts.forEach(post => {
        // Truncate the body if > 100 chars
        let truncatedBody = post.body.length > 100 
            ? post.body.substring(0, 100) + '<span>....</span>' 
            : post.body;

        const newDiv = document.createElement('div');
        newDiv.className = 'post-card';
        newDiv.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-user">By: <strong>${post.user.username}</strong></p>
            </div>
            <div class="post-body">
                <p>${truncatedBody}</p>
            </div>
            <div class="post-footer">
                <div class="post-meta">
                    <span><i class="fas fa-heart"></i> ${post.total_likes}</span>
                    <span><i class="fas fa-comment-dots"></i> ${post.total_comments}</span>
                </div>
                <p class="post-date">${formattedDate(post.created_at)}</p>
            </div>
        `;

        newDiv.addEventListener('click', () => {
                getPostDetail(post.id);
                postDetailLoader();
        });
        postContainer.appendChild(newDiv);
    });
}