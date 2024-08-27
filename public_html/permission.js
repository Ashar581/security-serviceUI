// Function to show the loader
function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

// Function to hide the loader
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// Initialize toggle button states based on localStorage
function initializeToggleStates() {
    const permissions = {
        locationPermission: localStorage.getItem('isLive') === 'true'
    };

    document.getElementById('location-permission').checked = permissions.locationPermission;

    updateToggleStyles();
}

// Update the toggle button styles based on their state
function updateToggleStyles() {
    document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
        const textWrapper = toggle.nextElementSibling.nextElementSibling;
        if (toggle.checked) {
            textWrapper.style.fontWeight = 'bold';
            textWrapper.style.color = '#4caf50';
        } else {
            textWrapper.style.fontWeight = 'normal';
            textWrapper.style.color = 'black';
        }
    });
}

// Handle toggle button change event
async function handleToggleChange() {
    const apiUrl = 'https://securellance.onrender.com/api/user/update';
    // const apiUrl = 'http://localhost:8080/api/user/update';
    const token = localStorage.getItem('token');  

    document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', async function() {
            // Save the state to localStorage
            localStorage.setItem(this.id, this.checked);

            // Prepare data for API call
            const data = {
                live: document.getElementById('location-permission').checked,
                storagePermission: document.getElementById('storage-permission').checked,
                notificationsPermission: document.getElementById('notifications-permission').checked,
                smsPermission: document.getElementById('sms-permission').checked
            };

            // Update the toggle styles
            updateToggleStyles();

            // Show the loader
            showLoader();

            // Call the API to update the state
            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result.data.live);
                localStorage.setItem('isLive',result.data.live);
                console.log('API response:', result);
                //checking if location was switched on/off
                notificationPopup();
                getCurrentLocation(localStorage.getItem('isLive'))
            } catch (error) {
                console.error('Error:', error);
            } finally {
                // Hide the loader
                hideLoader();
            }
        });
    });
}

function openModal() {
    document.getElementById("emailModal").style.display = "block";
}

function closeModal() {
    document.getElementById("emailModal").style.display = "none";
}

window.onclick = function(event) {
    var modal = document.getElementById("emailModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function addEmail() {
    var emailInput = document.getElementById("new-email");
    var email = emailInput.value.trim();
    if (email) {
        var emailList = document.querySelector(".email-list");
        var emailItem = document.createElement("div");
        emailItem.className = "email-item";
        emailItem.innerHTML = `
            <span>${email}</span>
            <button onclick="deleteEmail(this)">Delete</button>
        `;
        emailList.appendChild(emailItem);
        emailInput.value = "";
    }
}

function deleteEmail(button) {
    var emailItem = button.parentElement;
    emailItem.remove();
}

//Fetching live location
async function getCurrentLocation(status) {
    if (navigator.geolocation) {
        if(status==='true'){
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log('Current Location:', { latitude, longitude });

                await sendLocationToBackend(latitude, longitude);
            }, (error) => {
                console.error('Error getting location:', error.message);
                showPopup('Live Location Was Denied','error');
            });
        }
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
       const response = await fetch('https://securellance.onrender.com/api/location/send-live', {
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
            getCurrentLocation(localStorage.getItem('isLive'));
            console.log('Location updated successfully');
        } else {
            console.error('Error updating location:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Live Location Stopped','error');
    }
}
// Event listener for close button on popup
document.getElementById('closeBtn').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hide');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 500); // Sync with the fade-out transition duration
});

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
// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('isLive')==='true'){
        document.addEventListener("deviceready", onDeviceReady, false);
        getCurrentLocation('true');
    }
    else{
        getCurrentLocation('false');
    }
    initializeToggleStates();
    handleToggleChange();
});

//Toggle Button turned on or off popup function helper
function notificationPopup(){
    if(document.getElementById('location-permission').checked){
        showPopup('Live Location Was Turned On','success');
    }else if(!document.getElementById('location-permission').checked) {
        showPopup('Live Location Was Turned OFF','err');
    }
}

//asking permission for location in mobile phone
function onDeviceReady() {
    // Check for location permissions
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function(status) {
        if (!status.hasPermission) {
            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, success, error);
        } else {
            // Permission already granted, fetch location
            getCurrentLocation();
        }
    }, function(error) {
        console.error("Failed to check permissions: ", error);
    });

    function success(status) {
        if (status.hasPermission) {
            console.log('inside hasPermission for phone')
            // Permission granted, fetch location
            getCurrentLocation();
        } else {
            console.warn("Location permission not granted");
        }
    }

    function error() {
        console.error("Permission request failed");
    }
}