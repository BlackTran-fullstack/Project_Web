// Money format
function formatCurrency(amount) {
    const number = parseFloat(amount);
    if (isNaN(number)) return "Rp 0"; // Xử lý nếu `amount` không phải là số hợp lệ
    return (
        "Rp " +
        number.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })
    );
}

document.addEventListener("DOMContentLoaded", function () {
    const priceElements = document.querySelectorAll(".product-price");

    priceElements.forEach(function (element) {
        const price = element.getAttribute("data-price");
        element.textContent = formatCurrency(price);
    });
});

// Show/hide password
document.querySelectorAll(".hide_show_password").forEach((toggle) => {
    toggle.addEventListener("click", function () {
        const passwordInput =
            this.closest(".form-password").querySelector("input");
        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    });
});
