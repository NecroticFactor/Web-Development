import { formattedDate} from "./functions.js";
import { getAllPosts, getUserPostByID ,getPostByID ,sendPost, deletePost} from "./functions.js";
import { getComentsByPostID, createComment, deleteComment } from "./functions.js";
import { initialLikeStatus, likePost, unlikePost } from "./functions.js";


document.addEventListener("DOMContentLoaded", function() {

    indexLoader();
    logoutClear();

    // Check if the element exists before adding event listener
    const postsListView = document.querySelector(".posts-list-view");
    if (postsListView) {
        postsListView.addEventListener('click', function() {
            if (!authenticated){
                window.location.href = "/register";
            }
        });
    }

    const createPostBtn = document.querySelector(".create-post-btn");
    if (createPostBtn) {
        createPostBtn.addEventListener('click', showPostForm);
    }

    const postsFollowing = document.querySelector("#posts-following");
    if (postsFollowing) {
        postsFollowing.addEventListener("click", getPostsByFollowing);
    }

    const submitPost = document.querySelector('#submit-post');
    if (submitPost) {
        submitPost.addEventListener('click', sendToPost);
    }

    const allPosts = document.querySelector("#all-posts");
    if (allPosts) {
        allPosts.addEventListener("click", getPostsAll, indexLoader);
    }

});

// Loads the indexPage View
function indexLoader() {
    // Check if the elements exist before applying style changes
    const postsListFollowing = document.querySelector('.posts-list-following');
    const createPostForm = document.querySelector('.create-post-form');
    const createPostOverlay = document.querySelector('.create-post-overlay');
    const postsDetailedView = document.querySelector('.posts-detailed-view');
    const postDetailContainer = document.querySelector('.post-detail-container');
    const postsListView = document.querySelector('.posts-list-view');
    const createPostBtn = document.querySelector('.create-post-btn');

    // Hide elements by default if they exist
    if (postsListFollowing) {
        postsListFollowing.style.display = 'none';
    }
    if (createPostForm) {
        createPostForm.style.display = 'none';
    }
    if (createPostOverlay) {
        createPostOverlay.style.display = 'none';
    }
    if (postsDetailedView) {
        postsDetailedView.style.display = 'none';
    }
    if (postDetailContainer) {
        postDetailContainer.style.display = 'none';
    }

    // Show elements that exist
    if (postsListView) {
        postsListView.style.display = 'grid';
    }
    if (createPostBtn) {
        createPostBtn.style.display = 'block';
    }
}

// Loads the Post Detail View Page
function postDetailLoader() {
    const postsListFollowing = document.querySelector('.posts-list-following');
    const createPostForm = document.querySelector('.create-post-form');
    const createPostOverlay = document.querySelector('.create-post-overlay');
    const postsListView = document.querySelector(".posts-list-view");
    const postsDetailedView = document.querySelector('.posts-detailed-view');
    const postDetailContainer = document.querySelector('.post-detail-container');

    if (postsListFollowing) {
        postsListFollowing.style.display = 'none';
    }
    if (createPostForm) {
        createPostForm.style.display = 'none';
    }
    if (createPostOverlay) {
        createPostOverlay.style.display = 'none';
    }
    if (postsListView) {
        postsListView.style.display = 'none';
    }

    if (postsDetailedView) {
        postsDetailedView.style.display = 'grid';
    }
    if (postDetailContainer) {
        postDetailContainer.style.display = 'grid';
    }
}

// Loads the Post Form
function showPostForm() {
    const postsListFollowing = document.querySelector('.posts-list-following');
    const postsListView = document.querySelector(".posts-list-view");
    const createPostBtn = document.querySelector('.create-post-btn');
    const createPostForm = document.querySelector('.create-post-form');
    const postTitle = document.querySelector("#post-title");
    const postBody = document.querySelector('#post-body');

    if (postsListFollowing) {
        postsListFollowing.style.display = 'none';
    }
    if (postsListView) {
        postsListView.style.display = 'none';
    }
    if (createPostBtn) {
        createPostBtn.style.display = 'none';
    }

    // Show the post form
    if (createPostForm) {
        createPostForm.style.display = 'grid';
    }

    // Reset form fields
    if (postTitle) {
        postTitle.value = '';
    }
    if (postBody) {
        postBody.value = '';
    }
}

// Loads the Post By Following Page
function getPostsByFollowing() {
    const postsListFollowing = document.querySelector('.posts-list-following');
    const postsListView = document.querySelector(".posts-list-view");
    const createPostForm = document.querySelector('.create-post-form');
    const postDetailContainer = document.querySelector('.post-detail-container');

    if (postsListFollowing) {
        postsListFollowing.style.display = 'block';
    }

    if (postsListView) {
        postsListView.style.display = 'none';
    }
    if (createPostForm) {
        createPostForm.style.display = 'none';
    }
    if (postDetailContainer) {
        postDetailContainer.style.display = 'none';
    }
}

function logoutClear() {
    const logoutButton = document.querySelector('#logout');

    if (window.location.pathname === "/logout" || window.location.pathname === "/login") {
        localStorage.clear();
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
        });
    } else {
        console.warn('Logout button not found!');
    }
}


// Get public posts and render
async function getPostsAll(){
        try {
        const posts = await getAllPosts();
        const postsListViewContainer = document.querySelector('.posts-list-view');
        postsListViewContainer.innerHTML = '';

        if (Array.isArray(posts) && posts.length > 0) {
            posts.forEach(post => {

                // Truncate the body if > 150 char
                let truncatedBody = post.body;
                if(post.body.length > 100) {
                    truncatedBody = post.body.substring(0,100) + '<span>....</span>';
                }
                const newDiv = document.createElement('div');
                // Add class for styling
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
                    if(authenticated === 'False'){
                        window.location.href = "/login";
                    } else {
                        getPostDetail(post.id)
                        postDetailLoader()
                    }
                    
                    
                });
                postsListViewContainer.appendChild(newDiv);
                
            });
        } else {
            postsListViewContainer.innerHTML = '<p class="no-posts-message">No posts found.</p>';
        } 
    } catch(error) {
            alert(error)
        }
    } 
    getPostsAll();



// Function to get a particular post using getPostByID and its comment, like API
async function getPostDetail(id) {
    try {
        const post = await getPostByID(id);

        const postDetailViewContainer = document.querySelector('.posts-detailed-view');
        postDetailViewContainer.innerHTML = ''; // Clear previous content

        if (post) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('post-detail-content');
            newDiv.innerHTML = `
                <div class="post-header">
                    <h4 class="post-user">Posted by: <span>${post.user.username}</span></h4>
                    <p class="post-date">${formattedDate(post.created_at)}</p>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <p class="post-body">${post.body}</p>
            `;

            // Conditionally render the delete button
            if (post.user.username === loggedInUser) {
                const postDeleteButton = document.createElement('button');
                postDeleteButton.classList.add('delete-post-btn');
                postDeleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                postDeleteButton.addEventListener('click', async () => {
                    await deletePost(post.id);
                    indexLoader(); // Redirects to index
                });
                newDiv.appendChild(postDeleteButton);
            }

            postDetailViewContainer.appendChild(newDiv);

            // Get the like status of the post for the user and pass it 
            const likeStatus = await initialLikeStatus(post.id);
            likeButtonToggle(likeStatus.liked, likeStatus.like_id ,post.id);
            
            // Attach event listener for adding a comment
            const commentButton = document.querySelector('#comment-btn');
            if (commentButton) {
                commentButton.addEventListener('click', async (event) => {
                    event.preventDefault();
                    await makeComment(post.id);
                    document.querySelector('#comment').value = '';
                    await getComments(post.id); // Reload comments after adding
                });
            }

        } else {
            postDetailViewContainer.innerHTML = `<p class="no-posts-message">No posts found.</p>`;
        }

        // Fetch and display comments
        await getComments(id);

    } catch (error) {
        alert(`Failed to fetch post: ${error}`);
    }
}


// Function to toggle like button
async function likeButtonToggle(status, like_id, post_id) {
    const likeButton = document.querySelector('#like-icon');
    if (status === true) {
        // Apply 'liked' class
        likeButton.classList.add('liked'); 
    } else {
        // Remove 'liked' class
        likeButton.classList.remove('liked'); 
    }
    likeButton.onclick = async () => { 
        if (status === false) {
            // Call like function
            await likePost(post_id, likeButton);
        } else {
            // Call unlike function
            await unlikePost(post_id, like_id, likeButton);
        }
        // Re-fetch the like status and update the button
        const likeStatus = await initialLikeStatus(post_id);
        likeButtonToggle(likeStatus.liked, likeStatus.like_id, post_id);
    };
}


// Function to fetch and display comments
async function getComments(postId) {
    try {
        const comments = await getComentsByPostID(postId);

        const commentsViewContainer = document.querySelector('.posts-comments-view');
        commentsViewContainer.innerHTML = ''; 

        if (Array.isArray(comments) && comments.length > 0) {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comments-list');
            commentDiv.innerHTML = '<h5>Comments:</h5><div class="comments-list">';
        
            comments.forEach(comment => {
                const commentBox = document.createElement('div');
                commentBox.classList.add('comment-box');
                commentBox.innerHTML = `
                    <p><strong>${comment.user.username}:</strong> ${comment.comments}</p>
                    <div>${formattedDate(comment.created_at)}</div>
                `;

                // Conditionally render the delete button for comments
                if (comment.user.username === loggedInUser) {
                    const commentDeleteButton = document.createElement('button');
                    commentDeleteButton.classList.add('delete-comment-btn');
                    commentDeleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                    commentDeleteButton.addEventListener('click', async () => {
                        await deleteComment(postId, comment.id);
                        await getComments(postId); // Reload comments after deleting
                    });
                    commentBox.appendChild(commentDeleteButton);
                }

                commentDiv.appendChild(commentBox);
            });

            commentsViewContainer.appendChild(commentDiv);
        } else {
            commentsViewContainer.innerHTML = `<p class="no-comments-message">Be the first to comment.</p>`;
        }

    } catch (error) {
        alert(`Failed to fetch comments: ${error}`);
    }
}



// Function that uses sendPost function to create a post
async function sendToPost(event) {
    const title = document.querySelector("#post-title").value.trim();
    const body = document.querySelector('#post-body').value.trim();
    if(!title || !body ) {
        return;
    }

    try {
        // Await the sendPost function to ensure the post is submitted
        await sendPost(title, body);

        // Reload the index and fetch updated posts
        indexLoader();
        await getPostsAll();
    } catch (error) {
        console.error("Error submitting post:", error);
        alert("Failed to submit the post. Please try again.");
    }
}


// Function to use create comment using comment form
async function makeComment(id){
    const comment = document.querySelector('#comment').value.trim()
    try{
        // Await the createComment function to ensure the comment is created
        await createComment(id, comment);
    } catch (error) {
        console.error("Error submitting comment:", error);
        alert("Failed to submit the comment. Please try again.");
    }
}
