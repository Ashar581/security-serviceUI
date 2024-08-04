document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const usr = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const loginData = {
        username: usr,
        password: pass
    };
    
    // Show loading bar when form is submitted
    showLoadingBar();
    fetch('http://localhost:8080/api/auth/signin', { // Replace with your actual endpoint
//    fetch('https://security-service-f8c1.onrender.com/api/auth/signin', { // Replace with your actual endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === false){
            showPopup(data.message,type = 'error');
        }
        else{
            localStorage.setItem('token',data.data.token);
            localStorage.setItem('fname',data.data.userDto.firstName);
            localStorage.setItem('name',data.data.userDto.firstName + ' ' + data.data.userDto.lastName);
            localStorage.setItem('phone', data.data.userDto.phoneNumber);
            localStorage.setItem('email',data.data.userDto.email);
            localStorage.setItem('isLive',data.data.userDto.live);
            console.log(localStorage.getItem('isLive'));
            showPopup(data.message,type = 'success');
            window.location.href = 'user.html';
        }
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    // Hide loading bar when API call completes
    .finally(() => {
        hideLoadingBar();
    });
});

//here are some pop up changes...check css for it as well..
function showPopup(message, type) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;

    if (type === 'error') {
        popup.style.backgroundColor = 'red';
    } else if (type === 'success'){
        popup.style.backgroundColor = 'green';
    }
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Function to show the loading bar
function showLoadingBar() {
    document.getElementById('loadingBar').style.display = 'block';
}

// Function to hide the loading bar
function hideLoadingBar() {
    document.getElementById('loadingBar').style.display = 'none';
}