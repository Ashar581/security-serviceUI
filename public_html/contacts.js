// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeToggleStates();
    handleToggleChange();

    if (localStorage.getItem('isLive') === 'true') {
        getCurrentLocation();
    }
});

// Initialize the tab functionality
function initializeTabs() {
    fetchContent('view all');
    document.querySelectorAll('.tab').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            // Add active class to the clicked tab
            button.classList.add('active');

            // Hide all tab contents
            document.querySelectorAll('.content').forEach(content => content.innerHTML = ''); // Clear content

            // Fetch and display content based on the clicked tab
            const tabType = button.textContent.trim().toLowerCase();
            fetchContent(tabType);
        });
    });
}

// Fetch content based on the tab type
async function fetchContent(type) {
    // showLoading(); // Show spinner
    const url = 'http://localhost:8080/api/user/view-contacts';
    const token = localStorage.getItem('token'); // Replace with your actual token

    let queryParam = '';

    switch (type) {
        case 'view all':
            queryParam = ''; // No additional parameter needed for 'View All'
            break;
        case 'live':
            queryParam = '?type=live';
            break;
        case 'sos':
            queryParam = '?type=sos';
            break;
        default:
            return;
    }

    try {
        const response = await fetch(url + queryParam, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        displayContent(type, data.data);
    } catch (error) {
        console.error('Error fetching content:', error);
        showPopup('Error fetching content', 'error');
    } finally {
        hideLoading(); // Ensure hideLoading is always called
    }
}

function displayContent(type, data) {
    const contentDiv = document.querySelector('.content');
    
    // Clear existing content
    contentDiv.innerHTML = '';

    if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
            // Create a div for each item
            const itemDiv = document.createElement('div');
            itemDiv.className = 'content-item';

            // Create a span to display the item
            const itemText = document.createElement('span');
            itemText.textContent = item;
            itemDiv.appendChild(itemText);

            // Create a remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = '×'; // Use a simple cross symbol
            removeButton.className = 'remove-btn';
            removeButton.addEventListener('click', () => removeItem(item));
            itemDiv.appendChild(removeButton);

            // Append the item div to the content div
            contentDiv.appendChild(itemDiv);
        });
    } else {
        contentDiv.innerHTML = `<p>No data available for ${type}.</p>`;
    }
}

// Function to remove an item
function removeItem(item) {
    const url = 'http://localhost:8080/api/user/remove-contact'; // Update with your actual endpoint
    const token = localStorage.getItem('token'); // Replace with your actual token

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item }) // Send the item to be removed
    })
    .then(response => response.json())
    .then(data => {
        // Handle success response if needed
        showPopup('Item removed successfully', 'success');
        // Optionally refresh the content
        const activeTab = document.querySelector('.tab.active').textContent.trim().toLowerCase();
        fetchContent(activeTab);
    })
    .catch(error => {
        console.error('Error removing item:', error);
        showPopup('Error removing item', 'error');
    });
}
// Show a popup message
function showPopup(message, type) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    
    popupMessage.textContent = message;

    switch (type) {
        case 'success':
            popup.style.backgroundColor = 'green';
            break;
        case 'error':
            popup.style.backgroundColor = 'red';
            break;
        default:
            popup.style.backgroundColor = 'gray';
            break;
    }

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

// Handle the closing of the popup
document.getElementById('closeBtn').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hide');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 500);
});

// Handle toggle button state change and show notification
function handleToggleChange() {
    document.getElementById('location-permission').addEventListener('change', notificationPopup);
}

// Show notification popup based on toggle button state
function notificationPopup() {
    if (document.getElementById('location-permission').checked) {
        showPopup('Live Location Was Turned On', 'success');
    } else {
        showPopup('Live Location Was Turned Off', 'error');
    }
}

// Function to initialize toggle states if needed
function initializeToggleStates() {
    // Your initialization code for toggle states
}

// Dummy function to simulate getting the current location
function getCurrentLocation() {
    // Your location retrieval logic
}