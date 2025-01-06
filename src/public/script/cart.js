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

                    loadCartProducts();
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

    async function loadCartProducts(page = 1, limit = 3) {
        try {
            const queryParams = new URLSearchParams({
                page,
                limit,
            });

            const response = await fetch(
                `/cart/api/products?${queryParams.toString()}`
            );
            const data = await response.json();

            if (response.ok) {
                renderCartProducts(data.cart);
                const checkoutBtn = document.querySelector(".checkout-btn");
                if (data.cart.length !== 0) {
                    renderPagination(data.page, data.totalPages);
                    checkoutBtn.classList.remove("disabled");
                } else {
                    const pagination = document.querySelector(".pagination");
                    pagination.innerHTML = "";
                    checkoutBtn.classList.add("disabled");
                }
            } else {
                console.error("Error fetching cart data:", data.error);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    function renderCartProducts(products) {
        const cartTable = document.querySelector(".list-items tbody");
        cartTable.innerHTML = "";

        products.forEach((product) => {
            const row = document.createElement("tr");
            row.classList.add("item");

            row.setAttribute("data-product-id", product.productId);

            row.innerHTML = `
                <td><img
                        src="${product.imagePath}"
                        alt="${product.name}"
                        class="cart-item-image"
                    /></td>
                <td class="name">${product.name}</td>
                <td
                    class="product-price"
                    data-price="${product.price}"
                >${formatCurrency(product.price)}</td>
                <td class="quantity">${product.quantity}</td>
                <td
                    class="product-price product-subtotal"
                    data-price="${product.subtotal}"
                >${formatCurrency(product.subtotal)}</td>
                <td>
                    <button
                        type="button"
                        class="remove-btn"
                        data-product-id="${product.productId}"
                    >
                        <img src="/img/remove.svg" alt="Remove" />
                    </button>
                </td>
            `;

            cartTable.appendChild(row);
        });
    }

    function renderPagination(current, totalPages) {
        const pagination = document.querySelector(".pagination");
        pagination.innerHTML = "";

        if (current > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "Previous";
            prevButton.classList.add("prev-btn");
            prevButton.addEventListener("click", () =>
                loadCartProducts(current - 1)
            );
            pagination.appendChild(prevButton);
        }

        const currentPage = document.createElement("span");
        currentPage.textContent = current;
        currentPage.classList.add("current-page");
        pagination.appendChild(currentPage);

        if (current < totalPages) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.classList.add("next-btn");
            nextButton.addEventListener("click", () =>
                loadCartProducts(current + 1)
            );
            pagination.appendChild(nextButton);
        }
    }

    loadCartProducts();
});
