import { formattedDate} from "./functions.js";
import { getAllPosts, getPostsByFollowed, getPostByID ,sendPost, deletePost, updatePost} from "./functions.js";
import { getCommentsByPostID, createComment, deleteComment } from "./functions.js";
import { initialLikeStatus, likePost, unlikePost } from "./functions.js";


// Wait for the DOM to load completely
document.addEventListener("DOMContentLoaded", function() {

    // Loads the index page hiding other elements
    indexLoader();
    // Calls the logout clearing function
    logoutClear();

    // Gets the create post button to display post form
    const createPostBtn = document.querySelector(".create-post-btn");
    if (createPostBtn) {
        createPostBtn.addEventListener('click', showPostForm);
    }

    // Add event listener to following section
    const postsFollowing = document.querySelector("#posts-following");
    if (postsFollowing) {
        postsFollowing.addEventListener("click", () => {
            // call the function to fetch posts by following
            followedUserPosts();
            // call the function to load the view 
            getPostsByFollowingView();
        });
    }

    // add event listener to all posts section
    const allPosts = document.querySelector("#all-posts");
    if (allPosts) {
        allPosts.addEventListener("click", () => {
            // call the function to fetch all the posts
            getPostsAll();
            // call the function to dispaly the view of the index page
            indexLoader();
        });
    }

    // add event listener to the submit button to save a post
    const submitPost = document.querySelector('#submit-post');
    if (submitPost) {
        submitPost.addEventListener('click',() =>{
            const title = document.querySelector("#post-title").value.trim();
            const body = document.querySelector('#post-body').value.trim();
            // call the function to send the post
            sendToPost(title,body)
        });
    }

});


// Loads the indexPage/All posts View
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

    // Show elements needed in this page
    if (postsListView) {
        postsListView.style.display = 'grid';
    }
    if (createPostBtn) {
        createPostBtn.style.display = 'block';
    }
}



// Loads the Post Detail View Page on clicking on a post either on index or profile
export function postDetailLoader() {
    const postsListFollowing = document.querySelector('.posts-list-following');
    const createPostForm = document.querySelector('.create-post-form');
    const createPostOverlay = document.querySelector('.create-post-overlay');
    const postsListView = document.querySelector(".posts-list-view");
    const userPostsListView = document.querySelector(".User-Post-View");
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
    if(userPostsListView){
        userPostsListView.style.display = 'none';
    }
    // show the elements that are needed in this page
    if (postsDetailedView) {
        postsDetailedView.style.display = 'grid';
    }
    if (postDetailContainer) {
        postDetailContainer.style.display = 'grid';
    }
}

// Loads the Post Form either from index or profile
export function showPostForm() {
    const postsListFollowing = document.querySelector('.posts-list-following');
    const postsListView = document.querySelector(".posts-list-view");
    const userPostsListView = document.querySelector(".User-Post-View");
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
    if(userPostsListView){
        userPostsListView.style.display = 'none';
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


// Loads the Post By Following Page on clicking Following
function getPostsByFollowingView() {
    const postsListFollowing = document.querySelector('.posts-list-following');
    const postsListView = document.querySelector(".posts-list-view");
    const createPostForm = document.querySelector('.create-post-form');
    const postDetailContainer = document.querySelector('.post-detail-container');

    if (postsListFollowing) {
        postsListFollowing.style.display = 'grid';
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


// Handles localstorage on logout
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
        null;
    }
}


// Generic function to render posts in index page and following page
export function renderPosts(posts, container, emptyMessage) {
    const postsListViewContainer = document.querySelector(container);

    // Prevent TypeError if the container does not exist
    if (!postsListViewContainer) {
        return;
    }


    postsListViewContainer.innerHTML = '';

    // take the post object and iterate over and fill the element
    if (Array.isArray(posts) && posts.length > 0) {
        posts.forEach(post => {
            // Truncate the body if > 100 chars
            let truncatedBody = post.body.length > 100 ? post.body.substring(0, 100) + '<span>....</span>' : post.body;

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

            // add event listener to the enitre div to go to detailed view on click
            newDiv.addEventListener('click', () => {
                // go to login if viewing in signed out view
                if (authenticated === 'False') {
                    window.location.href = "/login";
                } else {
                    // call the function to see post in detail
                    getPostDetail(post.id);
                    // call the function to show the view
                    postDetailLoader();
                }
            });

            postsListViewContainer.appendChild(newDiv);
        });
    } else {
        postsListViewContainer.innerHTML = `<p class="no-posts-message">${emptyMessage}</p>`;
    }
}

// Get public posts
async function getPostsAll() {
    try {
        const posts = await getAllPosts();
        renderPosts(posts, '.posts-list-view', 'No posts found.');
    } catch (error) {
        alert(error);
    }
}
getPostsAll();

// Get posts by following
async function followedUserPosts() {
    try {
        const posts = await getPostsByFollowed();
        renderPosts(posts, '.posts-list-following' ,'No posts found. You are not following any user.');
    } catch (error) {
        alert(error);
    }
}





// Function to get a particular post using getPostByID and its comment, like API
export async function getPostDetail(id) {
    try {
        const post = await getPostByID(id);

        const postDetailViewContainer = document.querySelector('.posts-detailed-view');

        // Prevent TypeError if the container does not exist
        if (!postDetailViewContainer) {
            return;
        }
        postDetailViewContainer.innerHTML = '';

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
                const postActionsContainer = document.createElement('div');
                postActionsContainer.classList.add('post-actions');
            
                // Edit Button
                const editButton = document.createElement('button');
                editButton.classList.add('edit-post-btn');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.addEventListener('click', () => enableEditMode(post, newDiv));
            
                // Delete Button
                const postDeleteButton = document.createElement('button');
                postDeleteButton.classList.add('delete-post-btn');
                postDeleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                postDeleteButton.addEventListener('click', async () => {
                    await deletePost(post.id);
                    window.location.reload(); 
                });
            
                postActionsContainer.appendChild(editButton);
                postActionsContainer.appendChild(postDeleteButton);
                newDiv.appendChild(postActionsContainer);
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

function enableEditMode(post, postContainer) {
    // Find existing post elements
    const postTitle = postContainer.querySelector('.post-title');
    const postBody = postContainer.querySelector('.post-body');
    const editButton = postContainer.querySelector('.edit-post-btn'); 

    // Hide the edit button
    if (editButton) {
        editButton.style.display = 'none';
    }

    // Replace with input fields
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = post.title;
    titleInput.classList.add('edit-title-input');

    const bodyTextarea = document.createElement('textarea');
    bodyTextarea.value = post.body;
    bodyTextarea.classList.add('edit-body-textarea');

    postTitle.replaceWith(titleInput);
    postBody.replaceWith(bodyTextarea);

    // Add Save button
    const saveButton = document.createElement('button');
    saveButton.classList.add('save-post-btn');
    saveButton.innerText = 'Save';
    saveButton.addEventListener('click', async () => {
        await saveEditedPost(post.id, titleInput.value, bodyTextarea.value, postContainer);
        
        // Show edit button again after saving
        if (editButton) {
            editButton.style.display = 'inline-block';
        }
    });

    // Append Save button
    postContainer.appendChild(saveButton);
}

// Function to save the edited post
async function saveEditedPost(postid, titleInputvalue, bodyTextareavalue, postContainer){
    const updatedPost = await updatePost(postid, titleInputvalue, bodyTextareavalue, postContainer)

    // Restore the updated post view
    postContainer.querySelector('.edit-title-input').replaceWith(
        Object.assign(document.createElement('h2'), { 
            className: 'post-title', 
            innerText: updatedPost.title 
        })
    );

    postContainer.querySelector('.edit-body-textarea').replaceWith(
        Object.assign(document.createElement('p'), { 
            className: 'post-body', 
            innerText: updatedPost.body 
        })
    );

    // Remove Save button
    postContainer.querySelector('.save-post-btn').remove();
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
        const comments = await getCommentsByPostID(postId);

        const commentsViewContainer = document.querySelector('.posts-comments-view');

        // Prevent TypeError if the container does not exist
        if (!commentsViewContainer) {
            return;
        }

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
                        // call the delete function
                        await deleteComment(postId, comment.id);
                        // Reload comments after deleting
                        await getComments(postId); 
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
export async function sendToPost(title, body, event) {
    if(!title || !body ) {
        return;
    }

    try {
        // Await the sendPost function to ensure the post is submitted
        await sendPost(title, body);

        // Reload the page from where the post was sent
        window.location.reload();
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
