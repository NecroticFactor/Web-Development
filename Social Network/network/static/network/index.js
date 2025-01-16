import { formattedDate, getAllPosts } from "./functions.js";


document.addEventListener("DOMContentLoaded", function() {

    indexLoader()
    document.querySelector(".create-post-btn").addEventListener('click', showPostForm)
    document.querySelector("#posts-following").addEventListener("click", getPostsByFollowing)
    document.querySelector("#all-posts").addEventListener("click", getPostsAll)
    
});

function indexLoader() {
    document.querySelector('.posts-list-following').style.display = 'none';
    document.querySelector('.create-post-form').style.display = 'none';
    document.querySelector('.create-post-overlay').style.display = 'none';

    
    document.querySelector('.posts-list-view').style.display = 'grid';
    document.querySelector('.create-post-btn').style.display = 'block';

}

function showPostForm() {
    document.querySelector('.posts-list-following').style.display = 'none';
    document.querySelector(".posts-list-view").style.display = 'none';
    document.querySelector('.create-post-btn').style.display = 'none';

    document.querySelector('.create-post-form').style.display = 'grid';


}
 

function getPostsByFollowing(){
    document.querySelector('.posts-list-following').style.display = 'block';
    
    document.querySelector(".posts-list-view").style.display = 'none';
    document.querySelector('.create-post-form').style.display = 'none';
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
