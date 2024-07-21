document.addEventListener('DOMContentLoaded', (event) => {
    loadProfile();
    document.getElementById('edit-icon').addEventListener('click', enableEditing);
    document.getElementById('save-button').addEventListener('click', saveProfile);
    document.getElementById('profile-picture').addEventListener('click', () => {
        document.getElementById('upload-picture').click();
    });
    document.getElementById('upload-picture').addEventListener('change', uploadPicture);
    document.getElementById('delete-picture-icon').addEventListener('click', deletePicture);
    document.getElementById('popup-close-button').addEventListener('click', hidePopup);
});

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function loadProfile() {
    showLoading();
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const contact = localStorage.getItem('phone');
    const homeLocation = localStorage.getItem('home-location');
    const officeLocation = localStorage.getItem('office-location');

    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('contact').value = contact;
    document.getElementById('home-location').value = homeLocation;
    document.getElementById('office-location').value = officeLocation;

    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/profile/view', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status && data.data.data) {
            const imageUrl = 'data:image/jpeg;base64,' + data.data.data;
            document.getElementById('profile-picture').src = imageUrl;
        } else {
            showPopup('Error loading profile picture: ' + data.message, 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showPopup('Error loading profile picture: ' + error.message, 'error');
    });
}

function saveProfile() {
    showLoading();
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const homeLocation = document.getElementById('home-location').value;
    const officeLocation = document.getElementById('office-location').value;

    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/user/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            contact,
            homeLocation,
            officeLocation
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status) {
            localStorage.setItem('name', name);
            localStorage.setItem('phone', contact);
            localStorage.setItem('home-location', homeLocation);
            localStorage.setItem('office-location', officeLocation);
            showPopup('Profile updated successfully!', 'success');
            disableEditing();
        } else {
            showPopup('Error updating profile: ' + data.message, 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showPopup('Error: ' + error.message, 'error');
    });
}

function uploadPicture(event) {
    showLoading();
    const file = event.target.files[0];
    if (!file) return; // No file selected

    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/profile/add', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status) {
            showPopup('Profile picture updated successfully!', 'success');
            loadProfile(); // Reload profile to display the new picture
        } else {
            showPopup('Error updating profile picture: ' + data.message, 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showPopup('Error: ' + error.message, 'error');
    });
}

function deletePicture() {
    showLoading();
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/profile/remove', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status) {
            document.getElementById('profile-picture').src = 'images/user.jpg'; // Reset to default image
            showPopup('Profile picture deleted successfully!', 'success');
        } else {
            showPopup('Error deleting profile picture: ' + data.message, 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showPopup('Error: ' + error.message, 'error');
    });
}

function showPopup(message, type) {
    const popup = document.getElementById('popup-message');
    const messageText = document.getElementById('popup-message-text');
    
    messageText.textContent = message;
    popup.className = `popup ${type}`;
    popup.style.display = 'flex';
    
    setTimeout(() => {
        hidePopup();
    }, 3000);
}

function hidePopup() {
    const popup = document.getElementById('popup-message');
    popup.style.display = 'none';
}
