import { login } from "./functions.js";

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', submitLogin);
    } else {
        console.error('Login form not found');
    }

});

// Submit login form 
async function submitLogin(event) {
        event.preventDefault(); // Prevent default form submission

        try{
            // Get the form data
            const form = event.target;
            const username = form.querySelector("input[name='username']").value;
            const password = form.querySelector("input[name='password']").value;
            const CSRFToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Call the login function from the imported module
            await login(username, password, CSRFToken);
        } catch(error) {
            alert(error)
        }
    };