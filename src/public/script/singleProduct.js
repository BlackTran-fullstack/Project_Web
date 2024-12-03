document.addEventListener("DOMContentLoaded", () => {
    const quantityElement = document.querySelector(".quantity");
    const increaseBtn = document.querySelector(".quantity-btn.increase");
    const reduceBtn = document.querySelector(".quantity-btn.reduce");
    const addToCartBtn = document.getElementById("addToCart");

    if (!quantityElement || !increaseBtn || !reduceBtn || !addToCartBtn) {
        console.error("One or more required elements are missing in the DOM.");
        return;
    }

    increaseBtn.addEventListener("click", () => {
        const quantity = parseInt(quantityElement.textContent.trim());
        if (!isNaN(quantity)) {
            quantityElement.textContent = quantity + 1;
        }
    });

    reduceBtn.addEventListener("click", () => {
        const quantity = parseInt(quantityElement.textContent.trim());
        if (!isNaN(quantity) && quantity > 1) {
            quantityElement.textContent = quantity - 1;
        }
    });

    addToCartBtn.addEventListener("click", async () => {
        const productIdElement = document.querySelector(".product-id");
        const productNameElement = document.querySelector(".product-title");
        const productPriceElement = document.querySelector(".product-price");
        const productImageElement = document.querySelector(".main-image img");

        if (
            !productIdElement ||
            !productNameElement ||
            !productPriceElement ||
            !productImageElement
        ) {
            console.error("One or more product details elements are missing.");
            alert("Failed to retrieve product details. Please try again.");
            return;
        }

        const productId = productIdElement.dataset.id; // Lấy productId từ data-id
        const productName = productNameElement.textContent.trim();
        const productPrice = parseInt(productPriceElement.dataset.price);
        const productImage = productImageElement.getAttribute("src");
        const productQuantity = parseInt(quantityElement.textContent.trim());

        if (
            !productId ||
            isNaN(productPrice) ||
            isNaN(productQuantity) ||
            !productName ||
            !productImage
        ) {
            console.error("Invalid product details. Ensure all data is valid.");
            alert("Invalid product details. Please try again.");
            return;
        }

        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: productQuantity,
        };

        addToCartBtn.disabled = true;

        try {
            const response = await fetch("/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cartItem),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert("Product has been added to cart!");
                // Optional: Update cart icon or summary
            } else {
                console.warn(
                    "Add to cart failed:",
                    data.message || response.statusText
                );
                alert(data.message || "Failed to add product to cart.");
            }
        } catch (error) {
            console.error("Error occurred while adding to cart:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            addToCartBtn.disabled = false;
        }
    });
});
