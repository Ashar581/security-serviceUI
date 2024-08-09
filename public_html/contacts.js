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
    document.querySelectorAll('.tab').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            // Add active class to the clicked tab
            button.classList.add('active');

            // Hide all tab contents (if you had any content to display per tab)
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Show the content corresponding to the clicked tab (if applicable)
            const target = button.getAttribute('data-target');
            if (target) {
                document.getElementById(target).classList.add('active');
            }
        });
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
