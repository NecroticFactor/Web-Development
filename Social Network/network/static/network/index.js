import { formattedDate} from "./functions.js";
import { getAllPosts, getUserPostByID ,getPostByID ,sendPost, deletePost} from "./functions.js";
import { getComentsByPostID, createComment, deleteComment } from "./functions.js";
import { fetchInitialLikeStatus, handleLike, handleUnlike } from "./functions.js";


document.addEventListener("DOMContentLoaded", function() {

    indexLoader()
    document.querySelector(".create-post-btn").addEventListener('click', showPostForm)
    if(document.querySelector("#posts-following")) {
        document.querySelector("#posts-following").addEventListener("click", getPostsByFollowing)
    } else {
        return false;
    }
    document.querySelector('#submit-post').addEventListener('click', sendToPost)
    
    document.querySelector("#all-posts").addEventListener("click", getPostsAll)


    
});

// Loads the indexPage View
function indexLoader() {
    document.querySelector('.posts-list-following').style.display = 'none';
    document.querySelector('.create-post-form').style.display = 'none';
    document.querySelector('.create-post-overlay').style.display = 'none';
    document.querySelector('.posts-detailed-view').style.display = 'none';
    document.querySelector('.post-detail-container').style.display = 'none';

        
    document.querySelector('.posts-list-view').style.display = 'grid';
    document.querySelector('.create-post-btn').style.display = 'block';

    

}

// Loads the Post Detail View Page
function postDetailLoader() {
    document.querySelector('.posts-list-following').style.display = 'none';
    document.querySelector('.create-post-form').style.display = 'none';
    document.querySelector('.create-post-overlay').style.display = 'none';
    document.querySelector(".posts-list-view").style.display = 'none';

    document.querySelector('.posts-detailed-view').style.display = 'grid';
    document.querySelector('.post-detail-container').style.display = 'grid';

}


// Loads the Post Form
function showPostForm() {
    //H
    document.querySelector('.posts-list-following').style.display = 'none';
    document.querySelector(".posts-list-view").style.display = 'none';
    document.querySelector('.create-post-btn').style.display = 'none';

    // Show the post form
    document.querySelector('.create-post-form').style.display = 'grid';

    document.querySelector("#post-title").value = '';
    document.querySelector('#post-body').value = '';


}
 

// Loads the Post By Following Page
function getPostsByFollowing(){
    document.querySelector('.posts-list-following').style.display = 'block';
    
    document.querySelector(".posts-list-view").style.display = 'none';
    document.querySelector('.create-post-form').style.display = 'none';
    document.querySelector('.post-detail-container').style.display = 'none';
    
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
                    getPostDetail(post.id)
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



// Function to fetch a particular post and its comments, likes, and other details
async function getPostDetail(id) {
    try {
        // Fetch the expanded view of the post
        const post = await getPostByID(id);

        const postDetailViewContainer = document.querySelector('.posts-detailed-view');
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
                <div class="posts-like-view">
                    <i class="fas fa-heart like-icon" id="like-btn" data-post-id="${post.id}"></i>
                    <span class="like-count" id="likeCount">${post.total_likes || 0}</span>
                </div>
            `;

            // Conditionally render the delete button based on user match
            if (post.user.username === loggedInUser) {
                const postDeleteButton = document.createElement('button');
                postDeleteButton.classList.add('delete-post-btn');
                postDeleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                postDeleteButton.addEventListener('click', () => removePost(post.id));
                postDetailViewContainer.appendChild(postDeleteButton);
            }

            postDetailViewContainer.appendChild(newDiv);

            // Initialize like button functionality
            // const likeButton = document.getElementById('like-btn');
            // const totalLikesElement = document.getElementById('likeCount');
            // initializeLikeButton(likeButton, totalLikesElement);

            // Attach comment button event listener
            document.querySelector('#comment-btn').addEventListener('click', () => makeComment(post.id));

        } else {
            postDetailViewContainer.innerHTML = `<p class="no-posts-message">No posts found.</p>`;
        }

        // Fetch comments for the post
        try {
            const comments = await getComentsByPostID(id);

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
                        commentDeleteButton.addEventListener('click', async () => await deleteComment(post.id, comment.id));
                        commentBox.appendChild(commentDeleteButton);
                    }
            
                    commentDiv.appendChild(commentBox);
                });
            
                commentsViewContainer.appendChild(commentDiv);
            } else {
                commentsViewContainer.innerHTML = `<p class="no-comments-message">Be the first to comment.</p>`;
            }

            postDetailLoader();

        } catch (error) {
            alert(`Failed to fetch comments: ${error}`);
        }

    } catch (error) {
        alert(`Failed to fetch post: ${error}`);
    }
}

// // Initialize the like button functionality
// function initializeLikeButton(likeButton, totalLikesElement) {
//     const postId = likeButton.dataset.postId;

//     // Update the like button state
//     function updateLikeButtonState(liked) {
//         if (liked) {
//             likeButton.classList.add('liked');
//             likeButton.classList.remove('not-liked');
//         } else {
//             likeButton.classList.add('not-liked');
//             likeButton.classList.remove('liked');
//         }
//     }

//     // Update the total likes display
//     function updateTotalLikes(totalLikes) {
//         totalLikesElement.textContent = `${totalLikes}`;
//     }

//     // Fetch initial like status and update the button state
//     async function initializeLikeStatus() {
//         const liked = await fetchInitialLikeStatus(postId);
//         updateLikeButtonState(liked);
//     }

//     // Add event listener for like/unlike button
//     likeButton.addEventListener('click', async () => {
//         const isLiked = likeButton.classList.contains('liked');
//         if (isLiked) {
//             const totalLikes = await handleUnlike(postId);
//             if (totalLikes !== null) {
//                 updateLikeButtonState(false);
//                 updateTotalLikes(totalLikes);
//             }
//         } else {
//             const totalLikes = await handleLike(postId);
//             if (totalLikes !== null) {
//                 updateLikeButtonState(true);
//                 updateTotalLikes(totalLikes);
//             }
//         }
//     });

//     // Initialize like status on page load
//     initializeLikeStatus();
// }






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

// Function to delete post
async function removePost(id) {
    try{
        await deletePost(id);

        indexLoader()
        getPostsAll()
    } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete the post. Please try again.");
    }
}


// Function to use create comment using comment form
async function makeComment(id){
    const comment = document.querySelector('#comment').value.trim()
    try{
        // Await the createComment function to ensure the comment is created
        await createComment(id, comment);

        postDetailLoader()
        getPostDetail(id)
    } catch (error) {
        console.error("Error submitting comment:", error);
        alert("Failed to submit the comment. Please try again.");
    }
}



// Function to delete comment using the form