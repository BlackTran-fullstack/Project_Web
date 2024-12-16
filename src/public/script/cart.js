document.addEventListener("DOMContentLoaded", () => {
    const cartTable = document.querySelector(".list-items");

    cartTable.addEventListener("click", async (e) => {
        if (e.target.closest(".remove-btn")) {
            const button = e.target.closest(".remove-btn");
            const productId = button.dataset.productId;

            try {
                const res = await fetch("/cart/remove", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId }),
                });

                const result = await res.json();

                if (result.success) {
                    const row = button.closest("tr");
                    row.remove();

                    removeSubtotal(productId);

                    updateCartTotals(result.newTotal);

                    updateCartCount();
                } else {
                    alert(result.message || "The product cannot be deleted");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred, please try again!");
            }
        }
    });

    function removeSubtotal(productId) {
        const subtotalElement = document.querySelector(
            `.product-price.product-subtotal[data-product-id="${productId}"]`
        );
        if (subtotalElement) {
            subtotalElement.remove();
        }
    }

    function updateCartTotals(newTotal) {
        const totalElement = document.querySelector(
            ".product-price.product-total"
        );
        if (totalElement) {
            totalElement.textContent = formatCurrency(newTotal);
            totalElement.dataset.price = newTotal;
        }
    }
});
