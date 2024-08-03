document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const suggestionsList = document.getElementById('suggestions');
    const tagsContainer = document.getElementById('tagsContainer');
    const addWatcherBtn = document.getElementById('addWatcherBtn');
    const responseMessage = document.getElementById('responseMessage');

    const backButton = document.querySelector('.back-btn');
    
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'user.html'; 
        });
    }

    let controller;

    emailInput.addEventListener('input', () => {
        const query = emailInput.value.trim();
        if (query.length > 0) {
            emailInput.placeholder = ''; // Remove placeholder on input
            fetchEmailSuggestions(query);
        } else {
            emailInput.placeholder = 'Enter email addresses'; // Restore placeholder if input is empty
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        }
    });

    suggestionsList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            addTag(e.target.textContent);
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        }
    });

    addWatcherBtn.addEventListener('click', () => {
        const emailList = getTags().map(email => email.trim()); // Ensure no spaces around emails
        addLocationWatchers(emailList);
    });

    function fetchEmailSuggestions(query) {
        if (controller) {
            controller.abort();
        }

        controller = new AbortController();
        const signal = controller.signal;
        const token = localStorage.getItem('token'); // Get token from localStorage

        fetch(`http://localhost:8080/api/user/email-search?query=${query}`, {
            signal,
            headers: {
                'Authorization': `Bearer ${token}` // Add Authorization header
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data.length > 0) {
                displaySuggestions(data.data);
            } else {
                suggestionsList.innerHTML = '';
                suggestionsList.style.display = 'none';
            }
        })
        .catch(error => {
            if (error.name !== 'AbortError') {
                console.error('Error fetching email suggestions:', error);
            }
        });
    }

    function displaySuggestions(suggestions) {
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion.trim(); // Ensure no spaces around suggestions
            suggestionsList.appendChild(li);
        });
        suggestionsList.style.display = 'block';
    }

    function addTag(tag) {
        const tags = getTags();
        if (!tags.includes(tag.trim())) {
            tags.push(tag.trim());
            renderTags(tags);
            emailInput.value = '';
            emailInput.focus();
        }
    }

    function renderTags(tags) {
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span>${tag}</span>
                <span class="remove">&times;</span>
            `;
            tagElement.querySelector('.remove').addEventListener('click', () => removeTag(tag));
            tagsContainer.appendChild(tagElement);
        });
    }

    function removeTag(tag) {
        const tags = getTags().filter(t => t !== tag.trim());
        renderTags(tags);
    }

    function getTags() {
        return Array.from(tagsContainer.children).map(child => child.textContent.trim().slice(0, -1));
    }

    function addLocationWatchers(emailList) {
        const token = localStorage.getItem('token');
        fetch('http://localhost:8080/api/user/add-live-listeners', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ allowedUsers: emailList }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                responseMessage.textContent = 'Watchers added successfully!';
                responseMessage.className = 'response-message success';
                clearAll(); // Clear everything after successful response
            } else {
                responseMessage.textContent = 'Failed to add watchers.';
                responseMessage.className = 'response-message error';
            }
        })
        .catch(error => {
            responseMessage.textContent = 'An error occurred.';
            responseMessage.className = 'response-message error';
            console.error('Error adding location watchers:', error);
        });
    }

    function clearAll() {
        tagsContainer.innerHTML = '';
        emailInput.value = '';
        emailInput.placeholder = 'Enter email addresses'; // Restore placeholder
        responseMessage.textContent = '';
    }
});
