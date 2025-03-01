import { getUserDetails, 
    getUserPostByID, 
    getFollowing, 
    getFollowers, 
    checkStatus,
    updateProfile,
} from "./functions.js";
import { formattedDate } from "./functions.js";
import { getPostDetail, postDetailLoader } from "./index.js";
import { followUser, unfollowUser } from "./functions.js";
import { showToast } from "./toast.js";


document.addEventListener("DOMContentLoaded", function() {
    profileLoader()

});

// Loads the profile view page completely
function profileLoader() {
    const postForm = document.querySelector('.create-post-form');

    // Extract username from query string
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('user');  // Get username from URL parameter

    // If no username in URL, get it from the navbar
    if (!username) {
        username = document.querySelector('.nav-link.username strong')?.textContent.trim();
    }

    if (username) {
        userLoader(username);  // Load the selected user's profile
    }

    if (postForm) {
        postForm.style.display = 'none';
    }

    // Check if logged-in user is viewing their own profile
    if (loggedInUser === username) {
        attachBioEditHandler();
    }
}


// Make it accessible globally
window.profileLoader = profileLoader;

// Handle Bio Editing 
function attachBioEditHandler() {
    const bioText = document.getElementById("bio-text");
    const bioInput = document.getElementById("bio-input");
    const saveButton = document.getElementById("save-bio");

    if (!bioText || !bioInput || !saveButton) return;

    let originalBio = bioText.innerText.trim(); // Store original bio

    // Click to edit bio
    bioText.addEventListener("click", function () {
        bioInput.value = originalBio;  // Set input to current bio
        bioText.classList.add("hidden");
        bioInput.classList.remove("hidden");
        saveButton.classList.remove("hidden");
        bioInput.focus();
    });

    // Save bio on button click
    saveButton.addEventListener("click", async function () {
        const newBio = bioInput.value.trim();
        if (!newBio || newBio.length > 100) {
            showToast("Bio should be between 1 and 100 characters.", 'warning');
            return;
        } 

        // Check if bio has changed before calling API
        if (newBio === originalBio) {
            bioText.classList.remove("hidden");
            bioInput.classList.add("hidden");
            saveButton.classList.add("hidden");
            return;
        }

        try {
            await updateProfile({ bio: newBio });

            // Update UI & store new bio
            bioText.innerText = newBio;
            originalBio = newBio; // Update stored value

            // Hide input & save button
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
async function renderUserDetails(details) {

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
    let follow_status = null; 

    // Don't call check status if logged in user profile page
    if (loggedInUser !== details.username) {
        follow_status = await checkStatus(details.id);
    }

    userPostLoader(details.id, details.account_type, follow_status);
    
    // Handle follow button toggle
    async function followToggle(account_type, follow_status) {
        const status = follow_status?.status?.toLowerCase(); 

        // Define a mapping of statuses to button text
        const buttonLabels = {
            'not followed': 'Follow',
            'accepted': 'Unfollow',
            'pending': 'Request Sent',
            'rejected': 'Follow'
        };

        // Check if account is public or private, and return the corresponding button
        if (account_type === 'public' || account_type === 'private') {
            const buttonLabel = buttonLabels[status] || 'Follow';
            return {
                buttonHTML: `<button class="follow-btn">${buttonLabel}</button>`,
                buttonLabel: buttonLabel
            };
        }

        return '';  
    }

    // Determine if the follow button should be displayed
    const { buttonHTML = '', buttonLabel = '' } = details.username !== loggedInUser 
    ? await followToggle(details.account_type, follow_status)
    : {};

    
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
                    ${buttonHTML}         
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
                    <p id="bio-text" class="profile-bio">${details?.bio || 'Click to add a bio'}</p>
                    <textarea id="bio-input" class="hidden"></textarea>
                    <button id="save-bio" class="hidden">Save</button>
                </div>
            </div>
        </div>
    `;

    detailContainer.innerHTML = profileHTML;

    attachBioEditHandler();

    // If the button is 'Follow', add the event listener
    if (buttonLabel === 'Follow') {
        const followButton = document.querySelector('.follow-btn');
        followButton.addEventListener('click', async () => {
            // Call followUser function
            await followUser(details.id);
            // Re-render the user details to update the follow status
            userLoader(details.username)  
        });
    }

    // If the button is 'unfollow', add EL and call unfollow
    if (buttonLabel === 'Unfollow') {
        const followButton = document.querySelector('.follow-btn');
        followButton.addEventListener('click', async () => {
            // Call followUser function
            await unfollowUser(details.id);
            // Re-render the user details to update the follow status  
            userLoader(details.username) 
        });
    }
}




// Get the posts by this user
async function userPostLoader(id, account_type, follow_status) {
    const postContainer = document.querySelector('.User-Post-View');

    if (!postContainer) return;

    // Always clear old posts when switching profiles
    postContainer.innerHTML = '';

    // Extract status safely
    const status = follow_status?.status?.toLowerCase();  

    // Call renderUserPost to show the private account message when needed
    if (account_type.toLowerCase() !== 'public' && status !== 'accepted') {
        renderUserPost(null, account_type, follow_status);
        return null;
    }

    try {
        const posts = await getUserPostByID(id);
        renderUserPost(posts, account_type, follow_status);
        return posts;
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return null;
    }
}

// Renders user posts with conditions for private/public accounts
function renderUserPost(posts, account_type, follow_status) {
    const postContainer = document.querySelector('.User-Post-View');

    // Prevent TypeError if container is missing
    if (!postContainer) return;

    postContainer.innerHTML = '';

    // Extract status safely
    const status = follow_status?.status?.toLowerCase();  

    // If account is private & follow request is NOT accepted
    if (account_type.toLowerCase() === 'private' && status !== 'accepted') {
        postContainer.innerHTML = `
            <div class="private-account-message">
                <i class="fas fa-lock"></i>
                <p>This account is private.</p>
                <p>Follow to see their posts.</p>
            </div>
        `;
        return;
    }

    // If public OR private but accepted, and no posts exist
    if (!posts || posts.length === 0) {
        postContainer.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-camera"></i>
                <p>No posts yet.</p>
            </div>
        `;
        return;
    }

    // Render user posts
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