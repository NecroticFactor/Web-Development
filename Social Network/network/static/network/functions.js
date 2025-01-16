import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants.js";


// Handles date formatting
export function formattedDate(timestamp){
    dayjs.extend(window.dayjs_plugin_relativeTime);
    const relativeTime =  dayjs(timestamp).fromNow();
    const day = relativeTime.split('')
    if (day[0] >= 3 ) {
        return dayjs(timestamp).format("D MMMM YYYY")
    } else {
        return relativeTime
    }
} 

// Handles Logging in and Token authentication
export async function login(username, password, CSRFToken) {
    // Create a FormData object to send
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    console.log(username,password)

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
        const data = await response.json();  // This is the missing part

        if (data.success) {
            // If login is successful, store tokens in localStorage
            localStorage.setItem("access", data.access_token);
            localStorage.setItem("refresh", data.refresh_token);

            // Redirect to the index page
            window.location.href = "/";
        } else {
            // If login fails, show an error message
            alert("Invalid username or password.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
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
    const currentTime = Date.now() / 1000; // Current time in seconds

    // Compare the expiration time with the current time
    return decodedToken.exp < currentTime;
};

// Checks if token is valid, gets new token, intercepts, and adds to headers
api.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem(ACCESS_TOKEN);

        if (isTokenExpired(token)) {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            try {
                const response = await axios.post('http://127.0.0.1:8000/token/refresh/', {
                    refresh: refreshToken,
                });
                token = response.data.access;
                localStorage.setItem(ACCESS_TOKEN, token);
            } catch (error) {
                return Promise.reject(error);
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

///-------------------------------------------ALL LOGICS RELATED TO POSTS-----------------------------------////

// Function to fetch all posts by public accounts only
export async function getAllPosts() {
    try {
        const res = await api.get('posts/');
        return res.data.length > 0 ? res.data : [];
    } catch (error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        alert(errorMessage);

        console.error(`Failed to fetch posts: ${error.message}`);
        return [];
    }
}

// Function that fetches posts by post_id to show individual posts onClick of post list
export async function getPostByID(id) {
    try {
        const res = await api.get(`posts/`,{
            params: {user_id: id},
            
        });

        return res.data.length > 0 ? res.data : [];
    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        alert(errorMessage);

        console.error(`Failed to fetch posts: ${error.message}`);
        
        return [];
    }
}

// Function that sends the post
export async function sendPost(title, body) {
    try {
        const res = await api.post('posts/',{
                title:title,
                body: body,
        });

        if(res.status !== 200 && res.status !== 201) {
            console.log(`Error: ${res.data.message || 'Unexpected error occurred.'}`);
            alert('Unexpected error occurred.')
            return null;
        }
        return res.data

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        alert(errorMessage);

        console.error(`Failed to fetch posts: ${error.message}`);
    }
}

// Function that deletes the post
export async function deletePost(id) {
    try {
        const res = await api.delete(`posts/${id}/`)

        if(res.status !== 204) {
            alert('Unexpected error occurred.')
            console.log(`Error: ${res.data?.message}`);
            return false
            
        }
        alert('Post deleted successfully.');
        return true;

    } catch(error) {
        const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
        alert(errorMessage);

        console.error(`Failed to fetch posts: ${error.message}`);
        return false
    }
}
//// ---------------------------------------------------------------------------------------------------------------------------------////

//// ---------------------------------------ALL LOGICS RELATED TO COMMENTING----------------------------------------------------------////

// Function to fetch comments related to a post
