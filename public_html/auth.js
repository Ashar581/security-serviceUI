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
