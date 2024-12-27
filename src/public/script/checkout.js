document.addEventListener('DOMContentLoaded', () => {
    const placeOrderButton = document.querySelector('.place-order-btn'); // Select the place order button

    document.getElementById('deliveryUnit').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const temp_deliveryFee = selectedOption.value;
        document.getElementById('deliveryFee').textContent = temp_deliveryFee;
    });

    placeOrderButton.addEventListener("click", (event) => {
        const requiredFields = document.querySelectorAll('.required'); // Select all the required fields
        
        // Check if all the required fields are not filled
        for (let i = 0; i < requiredFields.length; i++) {
            if (requiredFields[i].value === '') {
                alert('Please fill in all the required fields.');
                return;
            }
        }

        // Get the form values at the time of the button click
        const deliveryFee = document.getElementById('deliveryUnit').value; // Get the delivery fee
        const deliveryUnit = document.getElementById('deliveryUnit').options[document.getElementById('deliveryUnit').selectedIndex].text; // Get the delivery unit
        const paymentMethod = document.getElementById("payment").value; // Get the payment method
        const firstName = document.querySelector('#first-name').value; // Get the first name
        const lastName = document.querySelector('#last-name').value; // Get the last name
        const companyName = document.querySelector('#company-name').value; // Get the company name
        const country = document.querySelector('#country').value; // Get the country
        const streetAddress = document.querySelector('#street-address').value; // Get the street address
        const townCity = document.querySelector('#city').value; // Get the town/city
        const zipCode = document.querySelector('#zip-code').value; // Get the zip code
        const phone = document.querySelector('#phone').value; // Get the phone number
        const email = document.querySelector('#email').value; // Get the email
        const additionalInformation = document.querySelector('#additional-info').value; // Get the additional information

        // Create an object to store the form data
        const data = {
            deliveryFee,
            deliveryUnit,
            paymentMethod,
            firstName,
            lastName,
            companyName,
            country,
            streetAddress,
            townCity,
            zipCode,
            phone,
            email,
            additionalInformation,
        };

        alert('Form data will be sent to the server: ' + JSON.stringify(data));

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
                    alert('Order placed successfully.');
                    window.location.href = '/';
                } else {
                    alert('An error occurred. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});