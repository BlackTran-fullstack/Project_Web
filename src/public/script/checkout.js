const form = document.querySelector('form'); // Select the form element

form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(form); // Create a FormData object
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value; // Populate the data object with form data
    });

    // fetch() POST request
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                window.location.href = '/confirmation';
            } else {
                alert('An error occurred. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('deliveryUnit').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    const deliveryFee = selectedOption.value;
    document.getElementById('deliveryFee').textContent = deliveryFee;
});