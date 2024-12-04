// document.addEventListener("DOMContentLoaded", () => {
//     const quantityElement = document.querySelector(".quantity");
//     const increaseBtn = document.querySelector(".quantity-btn.increase");
//     const reduceBtn = document.querySelector(".quantity-btn.reduce");
//     const addToCartBtn = document.getElementById("addToCart");

//     increaseBtn.addEventListener("click", () => {
//         const quantity = parseInt(quantityElement.textContent.trim());
//         if (!isNaN(quantity)) {
//             quantityElement.textContent = quantity + 1;
//         }
//     });

//     reduceBtn.addEventListener("click", () => {
//         const quantity = parseInt(quantityElement.textContent.trim());
//         if (!isNaN(quantity) && quantity > 1) {
//             quantityElement.textContent = quantity - 1;
//         }
//     });

//     addToCartBtn.addEventListener("click", async () => {
//         const productIdElement = document.querySelector(".product-id");
//         const _productId = productIdElement.dataset.id;
//         const _productQuantity = parseInt(quantityElement.textContent.trim());

//         // Kiểm tra số lượng hợp lệ
//         if (isNaN(_productQuantity) || _productQuantity < 1) {
//             alert("Quantity must be a valid number and greater than 0.");
//             return;
//         }

//         const cartItem = {
//             productId: _productId,
//             quantity: _productQuantity,
//         };

//         // Disable nút Add to Cart để ngăn spam
//         addToCartBtn.disabled = true;

//         try {
//             const res = await fetch("/cart/add", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(cartItem),
//             });

//             const contentType = res.headers.get("content-type");
//             if (contentType && contentType.includes("application/json")) {
//                 const data = await res.json();

//                 if (res.ok && data.success) {
//                     alert("Product has been added to cart!");
//                 } else {
//                     console.warn(
//                         "Add to cart failed:",
//                         data.message || res.statusText
//                     );
//                     alert(data.message || "Failed to add product to cart.");
//                 }
//             } else {
//                 const text = await res.text();
//                 console.warn("Unexpected response format:", text);
//                 window.location.href = "/login";
//             }
//         } catch (error) {
//             console.error("Error occurred while adding to cart:", error);
//             alert("An error occurred. Please try again later.");
//         } finally {
//             // Kích hoạt lại nút Add to Cart
//             addToCartBtn.disabled = false;
//         }
//     });
// });

document.addEventListener("DOMContentLoaded", () => {
    const quantityElement = document.querySelector(".quantity");
    const increaseBtn = document.querySelector(".quantity-btn.increase");
    const reduceBtn = document.querySelector(".quantity-btn.reduce");
    const addToCartBtn = document.getElementById("addToCart");

    if (!quantityElement || !increaseBtn || !reduceBtn || !addToCartBtn) {
        console.error("Required DOM elements not found.");
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
        const _productId = productIdElement.dataset.id;
        const _productQuantity = parseInt(quantityElement.textContent.trim());

        if (isNaN(_productQuantity) || _productQuantity < 1) {
            alert("Quantity must be a valid number and greater than 0.");
            return;
        }

        const cartItem = {
            productId: _productId,
            quantity: _productQuantity,
        };

        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Adding...";

        try {
            const res = await fetch("/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cartItem),
            });

            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok && data.success) {
                    alert("Product has been added to cart!");
                } else {
                    console.warn(
                        "Add to cart failed:",
                        data.message || res.statusText
                    );
                    alert(data.message || "Failed to add product to cart.");
                }
            } else {
                const text = await res.text();
                console.warn("Unexpected response format:", text);
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Error occurred while adding to cart:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = "Add to Cart";
        }
    });
});
