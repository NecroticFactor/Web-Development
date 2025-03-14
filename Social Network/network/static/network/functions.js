import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants.js";
import { showToast } from "./toast.js"


// Handles date formatting
export function formattedDate(timestamp) {
    dayjs.extend(window.dayjs_plugin_relativeTime);
    const relativeTime = dayjs(timestamp).fromNow();
    if (relativeTime.includes('hour') || relativeTime.includes('minute')) {
        return relativeTime;
    }
    const daysCount = parseInt(relativeTime.split(' ')[0]);

    if (daysCount >= 3) {
        return dayjs(timestamp).format("D MMMM YYYY");
    } else {
        return relativeTime;
    }
} 

// Handles Logging in and Token authentication
export async function login(username, password, CSRFToken) {
    // Create a FormData object to send
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
        // Send the data to the server using fetch
        const response = await fetch("/login/", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": CSRFToken
            }
        });

        // Parse the response as JSON
        const data = await response.json();

        if (data.success) {
            // If login is successful, store tokens in localStorage
            localStorage.setItem("access", data.access_token);
            localStorage.setItem("refresh", data.refresh_token);

            // Redirect to the index page
            window.location.href = "/";
        } else {
            // If login fails, show an error message
            showToast("Invalid username or password.", 'error');
        }
    } catch (error) {
        console.error("Error during login:", error);
        showToast("An error occurred. Please try again.", 'error');
    }
}



// Helper function to intercept API to add headers
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/'
});

// Helper function to check if token has expired
const isTokenExpired = (token) => {
    if (!token) return true;

    // Decode the token
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;

    // Compare the expiration time with the current time
    return decodedToken.exp < currentTime;
};

// Checks if token is valid, gets new token, intercepts, and adds to headers
api.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem(ACCESS_TOKEN);
        
        // If no access token, force redirect to login
        if (!token) {
            redirectToLogin();
            return Promise.reject("No access token found, redirecting to login.");
        }

        if (isTokenExpired(token)) {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            
            if (!refreshToken) {
                redirectToLogin();
                return Promise.reject("No refresh token found, redirecting to login.");
            }

            try {
                const response = await axios.post("/token/refresh/", {
                    refresh: refreshToken,
                });

                // Update access token
                token = response.data.access;
                localStorage.setItem(ACCESS_TOKEN, token);
            } catch (error) {
                // Refresh token is expired or invalid then Force logout
                window.location.href = "/logout";
                return Promise.reject("Refresh token expired, redirecting to login.");
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle responses
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

// Function to handle logout and redirect
function redirectToLogin() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    window.location.href = "/login";
}

///-------------------------------------------ALL LOGICS RELATED TO POSTS-----------------------------------////

// Function to fetch all posts by public accounts only
export async function getAllPosts() {
    try {
        const res = await axios.get('posts/');
        return res.data.length > 0 ? res.data : [];
    } catch (error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to fetch posts: ${error.message}`);
        return [];
    }
}

// Function that fetches posts of specific user
export async function getUserPostByID(id) {
    try {
        const res = await api.get(`posts/`,{
            params: {user_id: id},
            
        });

        return res.data.length > 0 ? res.data : [];
    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to fetch posts: ${error.message}`);
        
        return [];
    }
}

// Function to get following user's posts
export async function getPostsByFollowed(){
    try{
        const res = await api.get(`following-posts/`)
        
        if(res.status !== 200 && res.status !== 201){
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error')
        }
        return res.data
    } catch(error){
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage,'error');

        console.error(`Failed to fetch posts: ${error.message}`);
    }

}

// Function that fetches specific post
export async function getPostByID(id) {
    try {
        const res = await api.get(`posts/${id}`);

        return res.data;
    } catch(error) {
        console.error(`Failed to fetch posts: Login to view`);
        
        return [];
    }
}

// Function that sends the post
export async function sendPost(title, body) {
    try {
        const res = await api.post('posts/',{
                title: title,
                body: body,
        });

        if(res.status !== 200 && res.status !== 201) {
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error')
            return null;
        }
        return res.data

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to fetch posts: ${error.message}`);
    }
}

// Function that updates the post
export async function updatePost(id,title, body) {
    try {
        const res = await api.patch(`posts/${id}/`,{
                title: title,
                body: body,
        });

        if(res.status !== 200 && res.status !== 201) {
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error')
            return null;
        }
        return res.data

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to fetch posts: ${error.message}`);
    }
}

// Function that deletes the post
export async function deletePost(id) {
    try {
        const res = await api.delete(`posts/${id}/`)

        if(res.status !== 204) {
            showToast('Unexpected error occurred.', 'error')
            console.log(`Error: ${res.data?.message}`);
            return false
            
        }
        showToast('Post deleted successfully.', 'success');
        window.location.href = '/';
        return true;

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to fetch posts: ${error.message}`);
        return false
    }
}
//// ---------------------------------------------------------------------------------------------------------------------------------////

//// ---------------------------------------ALL LOGICS RELATED TO SPECIFIC POSTS-> COMMENTING AND LIKING----------------------------------------------------------////

// Function to fetch comments related to a post
export async function getCommentsByPostID(id) {
    try {
        const res = await api.get(`posts/${id}/comments/`)

        if(res.status !== 200) {
            showToast('Unexpected error occured.', 'error')
            console.log(`Error: ${res.data?.message}`);
            return false
        }
        return res.data
    } catch(error){
        showToast(error, 'error')
    }
}



// Function to create a comment
export async function createComment(id, comment) {
    try {
        const res = await api.post(`posts/${id}/comments/`,{
            comments: comment,
        });

        if(!res.status == 200 && res.status == 201){
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error')
            return null;
        }
        return res.data

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to create comment: ${error.message}`);
    }
}



// Function to delete a comment
export async function deleteComment(postID,commentID){
    try {
        const res = await api.delete(`/posts/${postID}/comments/${commentID}/`)

        if(!res.status == 204) {
            console.log(`Error:${res.data?.message || 'Unexpected error occured.'}`)
            showToast('Unexpected error occured.', 'error')
            return null
        } 
        showToast('Comment deleted successfully', 'success');
        return true;

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');

        console.error(`Failed to delete comment: ${error.message}`);
    }
}




// Function to check like status for a user and a post
export async function initialLikeStatus(id) {
    try {
        const res = await api.get(`posts/${id}/like-status/`);
        return res.data
    } catch(error) {
        console.log(error)
        showToast('Unexpected error occured', 'error')
    }
}

// Function to like a post  
export async function likePost(id, likeButton) {
    try {
        const res = await api.post(`posts/${id}/likes/`, {});
        

        if (res.status !== 200 && res.status !== 201) {
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
            return null;
        }
        // Apply 'liked' class
        likeButton.classList.add('liked');
        return res.data;
        
    } catch (error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');
        console.error(`Error liking post: ${error.message}`); 
    }
}

// Function to delete/remove a like
export async function unlikePost(post_id, like_id, likeButton) {
    try {
        const res = await api.delete(`posts/${post_id}/likes/${like_id}/`, {});
        

        if (res.status !== 204) {
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
            return null;
        } 
        // Remove 'liked' class
        likeButton.classList.remove('liked'); 
        return true;

    } catch (error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');
        console.error(`Failed to unlike post: ${error.message}`);
    }
}


//// ---------------------------------------ALL LOGICS RELATED PROFILE PAGE----------------------------------------------------------////

// get the user details
export async function getUserDetails(username){
    try {
        const res = await api.get(`user/${username}`)

        if(res.status !== 200 && res.status !== 201){
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
        } 
        return res.data
    } catch (error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error')
        console.log(`Failed to fetch user details: ${error.message}`)
    }
}

// Get follow status for logged in user and account user
export async function checkStatus(id){
    try{
        const res = await api.get('follow/check-status/',{
            params: {
                followed_id:id
            }
        });
        // Handle non-success status codes
        if (res.status >= 400) {
            console.error(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
            return null;
        }
        return res.data;

    }catch(error){
        console.error(error);
            showToast('Unexpected error occurred.', 'error');
            return null;
    }
}

// get the profiles the user is following
export async function getFollowing(){
    try{
        const res = await api.get(`following/`)

        if(res.status !== 200 && res.status !== 201){
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
        }
        console.log(res.data)
        return res.data;
    } catch(error){
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error')
        console.log(`Failed to fetch user details: ${error.message}`)
    }
}

// get the profiles of the followers of the user
export async function getFollowers(){
    try{
        const res = await api.get(`followers/`)

        if(res.status !== 200 && res.status !== 201){
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
        }
        console.log(res.data)
        return res.data;
    } catch(error){
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error')
        console.log(`Failed to fetch user details: ${error.message}`)
    }
}

// Update user profile
export async function updateProfile({username = null, account_type = null , bio = null} = {}){
    try{
        const res = await api.patch(`update_profile/`,{
            username: username,
            account_type: account_type,
            bio: bio,
        });
        if(res.status !== 200 && res.status !== 201){
            console.log(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
        }
        return res.data
    }catch(error){
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');
        console.error(`Failed to update profile: ${errorMessage}`);
        return null;
    }
}

// Search user from search bar
export async function searchUser(searchQuery) {
    try {
        const res = await api.get('search/user/', {
            params: { username: searchQuery }
        });

        // Handle non-success status codes
        if (res.status >= 400) {
            console.error(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
            return null;
        }

        return res.data;
    } catch (error) {
        return null;
    }
}

//---------------------------------------------FOLLOW LOGICS----------------------------------------//
export async function followUser(id){
    try{
        const res = await api.post(`follow/`,{
            followed_id:id
        });
        // Handle non-success status codes
        if (res.status >= 400) {
            console.error(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
            return null;
        }
        return(res.data)
    } catch(error){
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');
        console.error(`Failed to update profile: ${errorMessage}`);
        return null;
    }
}

export async function unfollowUser(id){
    try{
        const res = await api.delete(`follow/${id}/`);
        // Handle non-success status codes
        if (res.status >= 400) {
            console.error(`Error: ${res.data?.message || 'Unexpected error occurred.'}`);
            showToast('Unexpected error occurred.', 'error');
            return null;
        }
        return(res.data)
    } catch(error){
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        showToast(errorMessage, 'error');
        console.error(`Failed to update profile: ${errorMessage}`);
        return null;
    }
}