document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const usr = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const loginData = {
        username: usr,
        password: pass
    };

    fetch('http://localhost:8080/api/auth/signin', { // Replace with your actual endpoint
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
            showPopup(data.message,type = 'success');
        }
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
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