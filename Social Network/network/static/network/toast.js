export function showToast(message, type = "info", duration = 3000) {
    const toastContainer = document.getElementById("toast-container");

    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `${message} <button class="toast-close">&times;</button>`;

    // Append to container
    toastContainer.appendChild(toast);

    // Show toast with animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Close button functionality
    toast.querySelector(".toast-close").addEventListener("click", () => removeToast(toast));

    // Auto remove after duration
    setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
}