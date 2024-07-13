document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const usr = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const loginData = {
        username: usr,
        password: pass
    };

    fetch('/login-user-endpoint', { // Replace with your actual endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    const signupData = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        password: pass
    };

    fetch('/signup-user-endpoint', { // Replace with your actual signup endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});