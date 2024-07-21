document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.nextElementSibling.style.fontWeight = 'bold';
            this.nextElementSibling.style.color = '#4caf50';
        } else {
            this.nextElementSibling.style.fontWeight = 'normal';
            this.nextElementSibling.style.color = 'black';
        }
    });
});

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

