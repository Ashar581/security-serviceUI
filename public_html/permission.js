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
