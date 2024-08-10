document.addEventListener('DOMContentLoaded', () => {
    const emailInputWatchers = document.getElementById('emailInputWatchers');
    const suggestionsListWatchers = document.getElementById('suggestionsWatchers');
    const tagsContainerWatchers = document.getElementById('tagsContainerWatchers');
    const addWatcherBtn = document.getElementById('addWatcherBtn');

    const emailInputSOS = document.getElementById('emailInputSOS');
    const suggestionsListSOS = document.getElementById('suggestionsSOS');
    const tagsContainerSOS = document.getElementById('tagsContainerSOS');
    const addSosBtn = document.getElementById('addSOSBtn');

    const backButton = document.querySelector('.back-btn');

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'user.html';
        });
    }

    let controller;

    function handleInput(inputElement, suggestionsList) {
        inputElement.addEventListener('input', () => {
            const query = inputElement.value.trim();
            if (query.length > 0) {
                inputElement.placeholder = ''; // Remove placeholder on input
                fetchEmailSuggestions(query, suggestionsList);
            } else {
                inputElement.placeholder = 'Enter email addresses'; // Restore placeholder if input is empty
                suggestionsList.innerHTML = '';
                suggestionsList.style.display = 'none';
            }
        });
    }

    function handleSuggestionsList(suggestionsList, tagsContainer, inputElement) {
        suggestionsList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                addTag(e.target.textContent, tagsContainer, inputElement);
                suggestionsList.innerHTML = '';
                suggestionsList.style.display = 'none';
            }
        });
    }

    function handleAddButton(addButton, tagsContainer, apiUrl, successMessage, failureMessage, emailInput, key) {
        addButton.addEventListener('click', () => {
            const emailList = getTags(tagsContainer).map(email => email.trim()); // Ensure no spaces around emails
            addItems(emailList, apiUrl, successMessage, failureMessage, tagsContainer, emailInput, key);
        });
    }

    handleInput(emailInputWatchers, suggestionsListWatchers);
    handleInput(emailInputSOS, suggestionsListSOS);

    handleSuggestionsList(suggestionsListWatchers, tagsContainerWatchers, emailInputWatchers);
    handleSuggestionsList(suggestionsListSOS, tagsContainerSOS, emailInputSOS);

    handleAddButton(addWatcherBtn, tagsContainerWatchers, 'http://localhost:8080/api/user/add-live-listeners', 'Watchers added successfully!', 'Failed to add watchers.', emailInputWatchers, 'allowedUsers');
    handleAddButton(addSosBtn, tagsContainerSOS, 'http://localhost:8080/api/user/add-sos', 'SOS contacts added successfully!', 'Failed to add SOS contacts.', emailInputSOS, 'sosContacts');

    // handleAddButton(addWatcherBtn, tagsContainerWatchers, 'https://security-service-f8c1.onrender.com/api/user/add-live-listeners', 'Watchers added successfully!', 'Failed to add watchers.', emailInputWatchers, 'allowedUsers');
    // handleAddButton(addSosBtn, tagsContainerSOS, 'https://security-service-f8c1.onrender.com/api/user/add-sos', 'SOS contacts added successfully!', 'Failed to add SOS contacts.', emailInputSOS, 'sosContacts');

    function fetchEmailSuggestions(query, suggestionsList) {
        if (controller) {
            controller.abort();
        }

        controller = new AbortController();
        const signal = controller.signal;
        const token = localStorage.getItem('token'); // Get token from localStorage

        // fetch(`https://security-service-f8c1.onrender.com/api/user/email-search?query=${query}`,{
        fetch(`http://localhost:8080/api/user/email-search?query=${query}`, {
            signal,
            headers: {
                'Authorization': `Bearer ${token}` // Add Authorization header
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data.length > 0) {
                displaySuggestions(data.data, suggestionsList);
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

    function displaySuggestions(suggestions, suggestionsList) {
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion.trim(); // Ensure no spaces around suggestions
            suggestionsList.appendChild(li);
        });
        suggestionsList.style.display = 'block';
    }

    function addTag(tag, tagsContainer, emailInput) {
        const tags = getTags(tagsContainer);
        if (!tags.includes(tag.trim())) {
            tags.push(tag.trim());
            renderTags(tags, tagsContainer);
            emailInput.value = '';
            emailInput.focus();
        }
    }

    function renderTags(tags, tagsContainer) {
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span>${tag}</span>
                <span class="remove">&times;</span>
            `;
            tagElement.querySelector('.remove').addEventListener('click', () => removeTag(tag, tagsContainer));
            tagsContainer.appendChild(tagElement);
        });
    }

    function removeTag(tag, tagsContainer) {
        const tags = getTags(tagsContainer).filter(t => t !== tag.trim());
        renderTags(tags, tagsContainer);
    }

    function getTags(tagsContainer) {
        return Array.from(tagsContainer.children).map(child => child.textContent.trim().slice(0, -1));
    }

    function addItems(emailList, apiUrl, successMessage, failureMessage, tagsContainer, emailInput, key) {
        showLoading();
        const token = localStorage.getItem('token');
        const body = {};
        body[key] = emailList;
        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                showPopup(successMessage, 'success');
                clearAll(tagsContainer, emailInput); // Clear everything after successful response
            } else {
                showPopup(failureMessage, 'error');
            }
        })
        .catch(error => {
            showPopup('An error occurred.', 'error');
            console.error('Error:', error);
        })
        .finally(() => hideLoading());
    }

    function clearAll(tagsContainer, emailInput) {
        tagsContainer.innerHTML = '';
        emailInput.value = '';
        emailInput.placeholder = 'Enter email addresses'; // Restore placeholder
        const responseMessage = document.getElementById('responseMessage');
        if (responseMessage) responseMessage.textContent = '';
    }

    // Show popup message
    function showPopup(message, type) {
        const popup = document.getElementById('popup');
        const popupMessage = document.getElementById('popupMessage');
        
        popupMessage.textContent = message;

        if (type === 'success') {
            popup.style.backgroundColor = 'green'; // Green for success
        } else if (type === 'error') {
            popup.style.backgroundColor = 'red'; // Red for error
        } else {
            popup.style.backgroundColor = 'gray'; // Default color if needed
        }
        // Ensure the popup is shown
        popup.style.display = 'block';
        popup.classList.add('show');
        popup.classList.remove('hide');

        setTimeout(() => {
            popup.classList.add('hide');
            popup.classList.remove('show');
        }, 3000);
        
        setTimeout(() => {
            popup.style.display = 'none';
        }, 3500);
    }

    function showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    function hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
});
