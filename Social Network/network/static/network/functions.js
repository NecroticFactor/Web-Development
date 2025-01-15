import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants.js";
import jwt_decode from 'jwt-decode';
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
});

// Helper function check if token has expired
const isTokenExpired = (token) => {
    if(!token) return true;

    // Decode the toke
    const decodedToken = jwt_decode(token);
    // Get the time in milliseconds
    const currentTime = Date.now() / 1000;

    // Compare if token time is < current time
    return decodedToken < currentTime;
}

// Checks if token is valid, get's new token, interceptors and adds to headers
api.interceptors.request.use(
    async(config) => {
        let accessToken = localStorage.getItem(ACCESS_TOKEN);

        if (isTokenExpired(accessToken)) {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN)
            try {
                const response = await axios.request('http://127.0.0.1:8000/token/refresh/', { refresh: refreshToken })
                token = response.data.access;
                localStorage.setItem(ACCESS_TOKEN, token)
            } catch(error){
                return Promise.reject(error);
            }
        }
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;   
        }
        return config
    },
    (error) => {
        return Promise.reject(error); 
    } 
);

// Response interceptor to handle responses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error); 
    }
);