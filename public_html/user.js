document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for tabs
    document.getElementById('documents-tab').addEventListener('click', function() {
        setActiveTab('documents');
    });

    document.getElementById('location-tab').addEventListener('click', function() {
        setActiveTab('location');
    });

    // Event listener for emergency button
    document.querySelector('.emergency-button').addEventListener('click', function() {
        alert('Emergency button clicked!');
        // Add emergency button handling code here
    });

    // Event listener for close button on popup
    document.getElementById('closeBtn').addEventListener('click', () => {
        const popup = document.getElementById('popup');
        popup.classList.add('hide');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500); // Sync with the fade-out transition duration
    });

    // Fetch user name and load files on page load
    fetchUserName();
    loadFiles();

    // Start the location tracking
    sendLocation();
});

// Function to handle form submission for file upload
document.getElementById('fileUploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('file');
    const userId = document.getElementById('userId').value;
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('userId', userId);

    showLoadingBar(); // Show loading bar when form is submitted
    const token = localStorage.getItem('token');
//    fetch('http://localhost:8080/api/files/add', {

    fetch('https://security-service-f8c1.onrender.com/api/files/add', { // Replace with your actual endpoint
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.toLowerCase().includes('success')) {
            showPopup(data.message, 'success');
    //Resetting the selected file after successful api call
            document.getElementById('fileUploadForm').reset();
        } else {
            showPopup(data.message, 'error');
        }
        console.log('Success:', data);
    })
    .catch((error) => {
        showPopup('Error uploading file', 'error');
        console.error('Error:', error);
    })
    .finally(() => {
        hideLoadingBar(); // Hide loading bar when API call completes
        loadFiles(); //calling the load file API
    });
});

// Function to set active tab
function setActiveTab(tab) {
    document.querySelectorAll('nav button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');

    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tab}-section`).classList.add('active');
}

// Sidebar functions
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

// Show the logout confirmation modal
function showLogoutConfirmation() {
    document.getElementById('logoutConfirmationModal').style.display = 'block';
}

// Close the logout confirmation modal
function closeLogoutConfirmation() {
    document.getElementById('logoutConfirmationModal').style.display = 'none';
}

// Logout function
function logout() {
    showLoadingBar();
    localStorage.removeItem('token');
    window.location.href = "login.html";
}

// Optional: Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('logoutConfirmationModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}


// Fetch user name
async function fetchUserName() {
    showLoadingBar();
    const token = localStorage.getItem('token');
    try {
//        const response = await fetch('http://localhost:8080/api/user/view', {
        const response = await fetch('https://security-service-f8c1.onrender.com/api/user/view', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if(response.status === 401){
                showPopup("Unauthorized user");
                logout();
            }
        }

        const data = await response.json();

        if (data.status) {
            document.getElementById('welcomeMessage').textContent = `HEY, ${data.data.firstName.toUpperCase()}`;
        } else {
            showPopup(data.message);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    } finally {
        hideLoadingBar();
    }
}

// Show popup message
function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.add('hide');
        popup.classList.remove('show');
    }, 3000);
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3500);
}

// Show/hide loading bar
function showLoadingBar() {
    document.getElementById('loadingBar').style.display = 'block';
}

function hideLoadingBar() {
    document.getElementById('loadingBar').style.display = 'none';
}

// Map functions
let map;
let marker;

function initMap(latitude, longitude) {
    const zoomLevel = 16; // Set your desired zoom level

    if (!map) {
        map = L.map('map', {
            scrollWheelZoom: false, // Disable zoom by scrolling
            doubleClickZoom: false, // Disable zoom by double-clicking
            boxZoom: false, // Disable zoom by dragging a box
            touchZoom: false // Disable zoom by touch
        }).setView([latitude, longitude], zoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([latitude, longitude]).addTo(map);

        // Ensure map size is correctly calculated
        setTimeout(() => {
            map.invalidateSize();
        }, 0);
    } else {
        marker.setLatLng([latitude, longitude]);
    }
}

async function updateLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const location = {
        latitude: latitude,
        longitude: longitude
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://security-service-f8c1.onrender.com/api/location/get-live', {

//        const response = await fetch('http://localhost:8080/api/location/get-live', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(location)
        });

        const data = await response.text();
        // document.getElementById('status').innerHTML = data;

        // Only update the marker position, without resetting the map view
        if (marker) {
            marker.setLatLng([latitude, longitude]);
        } else {
            initMap(latitude, longitude);
        }

        // Call the function again to continue tracking
        sendLocation();
    } catch (error) {
        document.getElementById('status').innerHTML = 'Error: ' + error;
    }
}

function sendLocation() {
    setTimeout(() => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(function (permissionStatus) {
                if (permissionStatus.state === 'granted') {
                    // If permission is already granted, get the location
                    navigator.geolocation.getCurrentPosition(updateLocation, showError, {
                        maximumAge: 0,
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                } else if (permissionStatus.state === 'prompt') {
                    // Request permission if not already granted
                    navigator.geolocation.getCurrentPosition(updateLocation, showError, {
                        maximumAge: 0,
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                } else {
                    document.getElementById('status').innerHTML = "Geolocation permission is denied.";
                }

                // Listen for changes to the permission state
                permissionStatus.onchange = function () {
                    if (permissionStatus.state === 'granted') {
                        navigator.geolocation.getCurrentPosition(updateLocation, showError, {
                            maximumAge: 0,
                            timeout: 10000,
                            enableHighAccuracy: true
                        });
                    }
                };
            });
        } else {
            // Fallback for browsers that do not support the permissions API
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(updateLocation, showError, {
                    maximumAge: 0,
                    timeout: 10000,
                    enableHighAccuracy: true
                });
            } else {
                document.getElementById('status').innerHTML = "Geolocation is not supported by this browser.";
            }
        }
    }, 5000); // 5 seconds delay before requesting location
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('new-folder').addEventListener('click', sendLocation);
});

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('status').innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('status').innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById('status').innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('status').innerHTML = "An unknown error occurred.";
            break;
    }
}

// Function to show error messages if location fetching fails
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('status').innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('status').innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById('status').innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('status').innerHTML = "An unknown error occurred.";
            break;
    }
}

// Initialize map with a default location
initMap(20.5937, 78.9629); // Coordinates for India

// Function to load files from the backend
function loadFiles() {
    showLoadingBar();
    const token = localStorage.getItem('token');
//    fetch('http://localhost:8080/api/files/view-all', { // Replace with your actual endpoint
    fetch('https://security-service-f8c1.onrender.com/api/files/view-all', { // Replace with your actual endpoint
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            const files = data.data;
            const initialFiles = files.slice(0, 4); // Display only the first 4 files

            function renderFiles(filesToRender, showAll = true) {
                fileList.innerHTML = ''; // Clear current files
                filesToRender.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'document';
                    fileItem.innerHTML = `
                        <button class="delete-btn" onclick="deleteFile(${file.fileId})">X</button>
                        <div class="file-name" onclick="viewFile(${file.fileId})">${file.fileName}</div>
                    `;
                    fileList.appendChild(fileItem);
                });

                const toggleBtn = document.createElement('div');
                toggleBtn.className = 'show-all';
                toggleBtn.innerText = showAll ? 'SHOW ALL' : 'SHOW LESS';
                toggleBtn.onclick = () => {
                    if (showAll) {
                        renderFiles(files, false); // Show all files
                    } else {
                        renderFiles(initialFiles, true); // Show initial files
                    }
                };
                fileList.appendChild(toggleBtn);
            }

            renderFiles(initialFiles, true); // Initially show only the first 4 files
            showPopup( data.message, 'error');
        } else {
            showPopup('Error: ' + data.message, 'error');
        }
    })
    .catch((error) => {
        showPopup('Error loading files', 'error');
        console.error('Error:', error);
    })
    .finally(() => {
        hideLoadingBar();
    });
}
// Hide the loading bar once the entire page is fully loaded
window.addEventListener('load', function() {
    hideLoadingBar();
    loadFiles();
});

//Delete file
function deleteFile(fileId) {
    showLoadingBar();
    const token = localStorage.getItem('token');
//    fetch(`http://localhost:8080/api/files/delete/${fileId}`, { // Replace with your actual endpoint
    fetch(`https://security-service-f8c1.onrender.com/api/files/delete/${fileId}`, { // Replace with your actual endpoint
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            loadFiles(); // Reload files after deletion
            showPopup('File deleted successfully', 'success');
        } else {
            showPopup('Error: ' + data.message, 'error');
        }
    })
    .catch((error) => {
        showPopup('Error deleting file', 'error');
        console.error('Error:', error);
    })
    .finally(() => {
        hideLoadingBar();
    });
}