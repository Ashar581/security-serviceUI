// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Check if live location is enabled in local storage
    if (localStorage.getItem('isLive') === 'true') {
        getCurrentLocation();
    }
    setupSearchInput();
    initializeTabs();
});

// === Tab Functionality === //
let fetchedData = {}; // Store fetched data for each tab

function initializeTabs() {
    // Load the initial content for 'view all' tab
    fetchContent('view all');

    // Add click event listeners to all tabs
    document.querySelectorAll('.tab').forEach(button => {
        button.addEventListener('click', () => {
            setActiveTab(button);
            const tabType = button.textContent.trim().toLowerCase();
            fetchContent(tabType);
        });
    });
}

// Set the clicked tab as active and clear content for other tabs
function setActiveTab(button) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.content').forEach(content => content.innerHTML = '');
}

// Fetch and display content based on the selected tab
async function fetchContent(type) {
    const url = 'https://security-service-f8c1.onrender.com/api/user/view-contacts';
    // const url = 'http://localhost:8080/api/user/view-contacts';
    const token = localStorage.getItem('token');
    let queryParam = '';

    switch (type) {
        case 'view all':
            queryParam = '';
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
        showSpinner();
        const response = await fetch(url + queryParam, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        fetchedData[type] = data.data; // Store fetched data
        displayContent(type, fetchedData[type]);
    } catch (error) {
        console.error('Error fetching content:', error);
        showPopup('Error fetching content', 'error');
    } finally {
        hideSpinner();
    }
}

// Display the fetched content
function displayContent(type, data) {
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = '';

    if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
            const itemDiv = createContentItem(item);
            contentDiv.appendChild(itemDiv);
        });
    } else {
        contentDiv.innerHTML = `<p>No data available for ${type}.</p>`;
    }
}

// Create content item with remove button
function createContentItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'content-item';

    const itemText = document.createElement('span');
    itemText.textContent = item;
    itemDiv.appendChild(itemText);

    const removeButton = document.createElement('button');
    removeButton.textContent = '×';
    removeButton.className = 'remove-btn';
    removeButton.addEventListener('click', () => removeItem(item));
    itemDiv.appendChild(removeButton);

    return itemDiv;
}

// === Search Input Functionality === //
function setupSearchInput() {    
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.log('searchInput element not found');
        return;
    }
    
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        const activeTab = document.querySelector('.tab.active').textContent.trim().toLowerCase();
        filterContent(query, activeTab);
    }, 300));
}

// Filter content based on search query
function filterContent(query, type) {
    const filteredData = fetchedData[type].filter(item => item.toLowerCase().includes(query));
    displayContent(type, filteredData);
}

// === Utility Functions === //
// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Show a popup message
function showPopup(message, type) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    
    popupMessage.textContent = message;
    popup.style.backgroundColor = getPopupBackgroundColor(type);
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

// Get the background color based on popup type
function getPopupBackgroundColor(type) {
    switch (type) {
        case 'success':
            return 'green';
        case 'error':
            return 'red';
        default:
            return 'gray';
    }
}
// Show notification popup based on toggle state
function notificationPopup() {
    const isChecked = document.getElementById('location-permission').checked;
    const message = isChecked ? 'Live Location Was Turned On' : 'Live Location Was Turned Off';
    const type = isChecked ? 'success' : 'error';
    showPopup(message, type);
}
// Dummy function to simulate getting the current location
//Fetching live location
async function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log('Current Location:', { latitude, longitude });

            await sendLocationToBackend(latitude, longitude);
        }, (error) => {
            console.error('Error getting location:', error.message);
            showPopup('Live Location Was Denied','error');
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

async function sendLocationToBackend(latitude, longitude) {
    const token = localStorage.getItem('token');
    const location = {
        latitude: latitude,
        longitude: longitude
    };

    try {
       const response = await fetch('https://security-service-f8c1.onrender.com/api/location/send-live', {
        // const response = await fetch('http://localhost:8080/api/location/send-live', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(location)
        });

        const data = await response.json();
        console.log('Live Location Update Response:', data); // Debugging

        if (data.status) {
            getCurrentLocation();
            console.log('Location updated successfully');
        } else {
            console.error('Error updating location:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Live Location Stopped','error');
    }
}

// Function to remove an item
function removeItem(item) {
    const url = 'https://security-service-f8c1.onrender.com//api/user/remove-contact';
    // const url = 'http://localhost:8080/api/user/remove-contact';
    const token = localStorage.getItem('token');

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item }) 
    })
    .then(response => response.json())
    .then(data => {
        showPopup('Item removed successfully', 'success');
        const activeTab = document.querySelector('.tab.active').textContent.trim().toLowerCase();
        fetchContent(activeTab);
    })
    .catch(error => {
        console.error('Error removing item:', error);
        showPopup('Error removing item', 'error');
    });
}

function showSpinner() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('loading').classList.add('hidden');
}


// Handle the closing of the popup
document.getElementById('close-btn').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hide');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 500);
});
