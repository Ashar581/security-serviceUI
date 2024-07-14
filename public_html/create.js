document.addEventListener('DOMContentLoaded', function() {
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
            phoneNumber: phone,
            email: email,
            password: pass
        };

        fetch('http://localhost:8080/api/user/add', { // Replace with your actual signup endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        })
        .then(response => response.json())
        //Here are some changes
        .then(data => {
            const messageDiv = document.getElementById('message');
                if (data.status === false) {
                    showPopup(data.message, type = 'error');
                }else{
                    showPopup(data.message,type = 'success');
                }
            console.log('Success:', data);
            
            document.getElementById('signupForm').reset();
        })
        .catch((error) => {
            window.alert(error);
            console.error('Error:', error);
        });
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