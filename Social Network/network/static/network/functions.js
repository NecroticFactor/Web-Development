import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants.js";
import axios from 'axios';




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

        const data = await response.json();

        if (data.success) {
            // If login is successful, store tokens in localStorage
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

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
};

// Helper function to intercept API to add headers
const api = axios.create({
    base_url: 'http://127.0.0.1:8000/'
})
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
);

// Check if tokens are valid, else refresh and store during API call.
api.interceptors.response.use(
    (response) => {
        return response
    },
    async(error) => {
        const originalRequest = error.config;

        if(error.response.status === 401 && !originalRequest._retry) {
            originalRequest._= true;
            try{
                const refreshToken = localStorage.get(REFRESH_TOKEN);
                const response = await axios.post('http://127.0.0.1:8000/token/refresh/', { refresh: refreshToken });
                const newAccessToken = response.data.access;
                localStorage.setItem(ACCESS_TOKEN, newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                return api(originalRequest);

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                return Promise.reject(refreshError);
        } 
    }
    return Promise.reject(error);
}
);