import { searchUser } from "./functions.js";

export async function filterFunction() {
    const input = document.getElementById('search-input');
    const filter = input.value.toLowerCase();
    const dropdown = document.getElementById('search-results');

    // Clear the dropdown before adding new items
    dropdown.innerHTML = '';

    // Check if the input is empty
    if (!filter) {
        dropdown.style.display = 'none';
        return;
    }

    const userdata = await searchUser(filter);

    // Ensure userdata is an array before filtering
    if (!Array.isArray(userdata)) {
        dropdown.style.display = 'none';
        return;
    }

    // Filter the data based on the input
    const filteredData = userdata.filter(user =>
        user?.username?.toLowerCase().startsWith(filter) // Left-to-right matching
    );

    // Show the dropdown if there are matching items
    dropdown.style.display = filteredData.length > 0 ? 'block' : 'none';

    // Populate the dropdown with filtered items
    filteredData.forEach(user => {
        const div = document.createElement('div');
        div.classList.add('search-item'); // CSS for styling

        const profilePic = document.createElement('img');
        profilePic.src = user.profile_picture || 'https://robohash.org/example.png?size=50x50'; 
        profilePic.alt = user.username;
        profilePic.classList.add('profile-pic'); // CSS for styling

        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');        

        const usernameText = document.createElement('span');
        usernameText.textContent = user.username;
        usernameText.classList.add('username');

        const firstNameText = document.createElement('small');
        firstNameText.textContent = user.first_name || ''; // Show first name below
        firstNameText.classList.add('first-name');

        textContainer.appendChild(usernameText);
        textContainer.appendChild(firstNameText);

        div.appendChild(profilePic);
        div.appendChild(textContainer);

        div.onclick = function () {
            input.value = user.username;
            dropdown.style.display = 'none';
        
            // Update URL with query parameter (e.g., /profile?user=johndoe)
            const newUrl = `/profile?user=${encodeURIComponent(user.username)}`;
            window.history.pushState({ username: user.username }, '', newUrl);
            
        
            // Call profileLoader to load the selected profile
            if (typeof window.profileLoader === 'function') {
                window.profileLoader(user.username);
            }
        };

        dropdown.appendChild(div);
    });
}

// Attach event listener to search input
document.getElementById('search-input').addEventListener('input', filterFunction);

// Close the dropdown if clicked outside
window.onclick = function (event) {
    if (!event.target.matches('#search-input')) {
        document.getElementById('search-results').style.display = 'none';
        const searchInput = document.getElementById('search-input');
        searchInput.value = '';
    }
};



