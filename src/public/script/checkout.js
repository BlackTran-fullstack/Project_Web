document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.getElementById("checkout-form");
    const deliveryUnit = document.getElementById("deliveryUnit"); // Select the delivery unit dropdown
    const deliveryFee = document.getElementById("deliveryFee"); // Select the delivery fee
    const paymentMethod = document.getElementById("payment"); // Select the payment method
    const productTotal = document.querySelector(".product-total"); // Select the product total
    const placeOrderButton = document.querySelector(".place-order-btn"); // Select the place order button
    const phoneInput = document.getElementById("phone"); // Select the phone input
    const emailInput = document.getElementById("email"); // Select the email input
    const phoneForm = document.querySelector(".form-phone"); // Select the phone form
    const emailForm = document.querySelector(".form-email"); // Select the email form

    document
        .getElementById("deliveryUnit")
        .addEventListener("change", function () {
            const selectedOption = this.options[this.selectedIndex];
            const temp_deliveryFee = selectedOption.value;

            document.getElementById("deliveryFee").textContent =
                formatCurrency(temp_deliveryFee);
        });

    const validatePhone = () => {
        const phonePattern = /^[0-9]{10}$/;
        if (!phoneInput.value.match(phonePattern)) {
            phoneForm.classList.add("invalid");
            return false;
        }
        phoneForm.classList.remove("invalid");
        return true;
    };

    const validateEmail = () => {
        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        if (!emailInput.value.match(emailPattern)) {
            emailForm.classList.add("invalid");
            return false;
        }
        emailForm.classList.remove("invalid");
        return true;
    };

    phoneInput.addEventListener("keyup", validatePhone);
    emailInput.addEventListener("keyup", validateEmail);

    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const isPhoneValid = validatePhone();
        const isEmailValid = validateEmail();

        if (isPhoneValid && isEmailValid) {
            const formData = {
                deliveryFee: deliveryUnit.value,
                paymentMethod: paymentMethod.value,
                productTotal: productTotal.textContent,
                phone: phoneInput.value,
                email: emailInput.value,
            };

            try {
                const res = await fetch("/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    if (data.paymentUrl) {
                        // Nếu server trả về URL thanh toán MoMo
                        window.location.href = data.paymentUrl;
                    } else {
                        alert("Order placed successfully.");
                        window.location.href = "/list-orders";
                    }
                } else {
                    alert("An error occurred. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    });
});
