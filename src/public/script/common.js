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
        const passwordInput = this.parentElement.querySelector("input");
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

if (document.getElementById("error-message")) {
    const errorMessage = document.getElementById("error-message");

    // Hiển thị thông báo lỗi
    errorMessage.style.display = "flex";
    setTimeout(() => {
        errorMessage.style.opacity = 1; // Tăng dần độ mờ lên 1 (hiển thị rõ ràng)
    }, 10); // Thêm độ trễ nhỏ để kích hoạt transition

    // Ẩn thông báo sau 2 giây
    setTimeout(() => {
        errorMessage.style.opacity = 0; // Giảm độ mờ về 0
        setTimeout(() => {
            errorMessage.style.display = "none"; // Ẩn hoàn toàn sau khi hiệu ứng kết thúc
        }, 500); // Phải chờ thời gian của transition (0.5s)
    }, 2000); // Ẩn sau 2 giây
}

function updateCartCount() {
    fetch("/cart/summary")
        .then((res) => res.json())
        .then((data) => {
            const cartCountElement =
                document.querySelector(".quantity-in-cart");
            cartCountElement.textContent = data.totalQuantity;
        })
        .catch((error) => console.error("Error updating cart count:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            updateCartCount();
        }
    });
});
