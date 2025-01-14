import { login } from "./functions.js";

document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector(".login-form");

    form.addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get the form data
        const username = form.querySelector("input[name='username']").value;
        const password = form.querySelector("input[name='password']").value;
        const CSRFToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // Call the login function from the imported module
        await login(username, password, CSRFToken);
    });
});