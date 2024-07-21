document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for tabs
    document.getElementById('documents-tab').addEventListener('click', function() {
        setActiveTab('documents');
    });

    document.getElementById('location-tab').addEventListener('click', function() {
        setActiveTab('location');
        if (!map) {
            initMap();
        }
        fetchLocation(); // Call fetchLocation immediately when location tab is clicked
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
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('file').addEventListener('change', showFilePopup);
});

//After file is getting selected, pop up is shown
function showFilePopup() {
    const fileInput = document.getElementById('file');
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        showPopup(`Selected file: ${fileName}`, 'info'); // Using 'info' for file information
    }
}


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
    fetch('https://security-service-f8c1.onrender.com/api/files/add', {    
//    fetch('http://localhost:8080/api/files/add', {
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
            // Resetting the selected file after successful api call
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
        loadFiles(); // Calling the load file API
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
        const response = await fetch('https://security-service-f8c1.onrender.com/api/user/view', {        
//        const response = await fetch('http://localhost:8080/api/user/view', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                showPopup("Unauthorized user",'error');
                logout();
            }
        }

        const data = await response.json();

        if (data.status) {
            document.getElementById('welcomeMessage').textContent = `HEY, ${data.data.firstName.toUpperCase()}`;
            if(data.data.live){
                getCurrentLocation();
            }
        } else {
            showPopup(data.message,'error');
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    } finally {
        hideLoadingBar();
    }
}

// Show popup message
function showPopup(message, type) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    
    popupMessage.textContent = message;
    
    // Set the background color based on the type of message
    if (type === 'success') {
        popup.style.backgroundColor = 'green'; // Green for success
    } else if (type === 'error') {
        popup.style.backgroundColor = 'red'; // Red for error
    } else {
        popup.style.backgroundColor = 'gray'; // Default color if needed
    }
    
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

// Map Function
let map;
let markers = {}; // Object to store markers by user ID
let selectedMarker = null; // To store the currently selected marker
const defaultLocation = [20.5937, 78.9629]; // Default coordinates (India)

function initMap() {
    map = L.map('map', {
        scrollWheelZoom: false, // Disable zoom by scrolling
        doubleClickZoom: false, // Disable zoom by double-clicking
        boxZoom: false, // Disable zoom by dragging a box
        touchZoom: false // Disable zoom by touch
    }).setView(defaultLocation, 5); // Set initial view to default location with a default zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Ensure map size is correctly calculated
    setTimeout(() => {
        map.invalidateSize();
    }, 500); // Small delay to ensure the map container is fully rendered
}

async function fetchLocation(retryDelay = 5000) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://security-service-f8c1.onrender.com/api/location/get-location', {        
//        const response = await fetch('http://localhost:8080/api/location/get-location', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Location data:', data); // Debugging: Log location data

        if (data.status && data.data.length > 0) {
            let firstMarkerPosition = null;

            data.data.forEach(user => {
                const { latitude, longitude, name, email } = user;
                const userId = email; // Assuming email is unique for each user

                if (markers[userId]) {
                    markers[userId].setLatLng([latitude, longitude]);
                    if (!selectedMarker || markers[userId] === selectedMarker) {
                        markers[userId].setPopupContent(name).openPopup();
                    } else {
                        markers[userId].setPopupContent('').closePopup();
                    }
                } else {
                    markers[userId] = L.marker([latitude, longitude])
                        .addTo(map)
                        .bindPopup(name);

                    markers[userId].on('click', function () {
                        selectedMarker = markers[userId];
                        updateMarkers();
                        map.setView(markers[userId].getLatLng(), map.getZoom());
                    });

                    if (!firstMarkerPosition) {
                        firstMarkerPosition = [latitude, longitude];
                    }
                }
            });

            if (!selectedMarker) {
                if (Object.keys(markers).length > 0) {
                    const group = L.featureGroup(Object.values(markers));
                    map.fitBounds(group.getBounds());
                } else if (firstMarkerPosition) {
                    map.setView(firstMarkerPosition, 15);
                }
            }
        } else {
            document.getElementById('status').innerHTML = 'No location data available';
        }

        // Reset the retry delay after a successful call
        setTimeout(fetchLocation, 5000); // 5 seconds delay before the next location fetch
    } catch (error) {
        document.getElementById('status').innerHTML = 'Error: ' + error;
        const nextRetryDelay = Math.min(retryDelay * 2, 30000); // Double the delay, max 30 seconds
        setTimeout(() => fetchLocation(nextRetryDelay), nextRetryDelay); // Retry with an increased delay
    }
}


function updateMarkers() {
    Object.keys(markers).forEach(userId => {
        if (!selectedMarker) {
            markers[userId].bindPopup(userId).openPopup();
        } else if (markers[userId] === selectedMarker) {
            markers[userId].getPopup().setContent(userId).openPopup();
        } else {
            markers[userId].getPopup().setContent('').closePopup();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize map when the location tab is clicked
    document.getElementById('location-tab').addEventListener('click', () => {
        if (!map) {
            initMap();
        } else {
            map.invalidateSize();
        }
        fetchLocation(); // Call fetchLocation immediately when the location tab is clicked
    });

    // Fetch location data when the page is loaded
    fetchLocation();
});

// Handle window resize to ensure map resizes correctly
window.addEventListener('resize', () => {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 500); // Ensure delay for better accuracy
    }
});

// Function to load files from the backend
function loadFiles() {
    showLoadingBar();
    const token = localStorage.getItem('token');
    fetch('https://security-service-f8c1.onrender.com/api/files/view-all', {
//    fetch('http://localhost:8080/api/files/view-all', {
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
            showPopup(data.message, 'success');
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
});

// Delete file
function deleteFile(fileId) {
    showLoadingBar();
    const token = localStorage.getItem('token');
    fetch(`https://security-service-f8c1.onrender.com/api/files/delete/${fileId}`, {
//    fetch(`http://localhost:8080/api/files/delete/${fileId}`, {
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
            // Handle errors here (e.g., user denied location access)
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
        const response = await fetch('https://security-service-f8c1.onrender.com/api/location/get-live', {
//        const response = await fetch('http://localhost:8080/api/location/get-live', {
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
        showPopup('Live Location Stopped','error')
    }
}


