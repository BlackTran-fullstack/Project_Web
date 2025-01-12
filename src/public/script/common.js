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

function updateCartCountNotLogin() {
    try {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];

        const totalUniqueProducts = localCart.length;

        const cartCountElement = document.querySelector(".quantity-in-cart");
        if (cartCountElement) {
            cartCountElement.textContent = totalUniqueProducts;
        }
    } catch (error) {
        console.error("Error updating cart count (not logged in):", error);
    }
}

async function isLoggedIn() {
    const res = await fetch("/auth/status", { credentials: "include" });
    const data = await res.json();
    return data.loggedIn;
}

async function setupCartCountUpdate() {
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
        syncCartAfterLogin();
        updateCartCount();
    } else {
        updateCartCountNotLogin();
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            syncCartAfterLogin();
            updateCartCount();
        } else {
            updateCartCountNotLogin();
        }
    });

    window.addEventListener("pageshow", async (event) => {
        if (event.persisted) {
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
                updateCartCount();
            } else {
                updateCartCountNotLogin();
            }
        }
    });
}

async function syncCartAfterLogin() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return;

    try {
        const res = await fetch("/cart/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cart),
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                localStorage.removeItem("cart");
                updateCartCount();
            } else {
                alert(data.message || "Failed to synchronize cart.");
            }
        }
    } catch (error) {
        console.error("Error synchronizing cart:", error);
        alert("An error occurred while synchronizing your cart.");
    }
}

setupCartCountUpdate();

