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
