document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('documents-tab').addEventListener('click', function() {
        setActiveTab('documents');
    });

    document.getElementById('location-tab').addEventListener('click', function() {
        setActiveTab('location');
    });

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

    document.querySelector('.emergency-button').addEventListener('click', function() {
        alert('Emergency button clicked!');
        // Add emergency button handling code here
    });
});

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

function logout() {
    showLoadingBar();
    localStorage.removeItem('token');
    window.location.href = "login.html";
}

async function fetchUserName() {
    showLoadingBar();
//    const token = 'eyJ0IjoiV1ZoT2IxbFlTWFZqTW1ob1lVZEdhVkZIVW5CYU1td3dXVmQ0ZW1GSFZubGpSMFYxV1ZkclBRPT0iLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJBc2hhciBTaGFoYWIiLCJqdGkiOiJhc2hhci5zaGFoYWJAZGlnaXRhbHNoZXJwYS5haSIsImlhdCI6MTcyMTA1OTYzMCwiZXhwIjoxNzIxMzE4ODMwLCJBbGxvd2VkIjp7Ikd1YXJkaWFuIjpudWxsfX0.oKckrzVK1uCPJQ5TGT_B02DrUefxqQgj8v_AkY_yyBoPIG87201CAy9HNVBD-2dI'; // Replace with your actual token, or retrieve it from localStorage/sessionStorage
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:8080/api/user/view', {
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
//            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();

        if (data.status) {
            document.getElementById('welcomeMessage').textContent = `HEY, ${data.data.firstName} ${data.data.lastName}`;
        } else {
            showPopup(data.message);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    } finally {
        hideLoadingBar();
    }
}

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

document.getElementById('closeBtn').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hide');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 500); // Sync with the fade-out transition duration
});

window.onload = fetchUserName;

// Function to show the loading bar
function showLoadingBar() {
    document.getElementById('loadingBar').style.display = 'block';
}

// Function to hide the loading bar
function hideLoadingBar() {
    document.getElementById('loadingBar').style.display = 'none';
}