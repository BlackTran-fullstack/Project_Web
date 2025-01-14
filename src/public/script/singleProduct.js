document.addEventListener("DOMContentLoaded", () => {
    const quantityElement = document.querySelector(".quantity");
    const increaseBtn = document.querySelector(".quantity-btn.increase");
    const reduceBtn = document.querySelector(".quantity-btn.reduce");
    const addToCartBtn = document.getElementById("addToCart");

    const mainImage = document.querySelector(".main-image img");
    const thumbnails = document.querySelectorAll(".thumbnail img");

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
            const tempSrc = mainImage.src;

            mainImage.src = thumbnail.src;

            thumbnail.src = tempSrc;
        });
    });

    if (!quantityElement || !increaseBtn || !reduceBtn || !addToCartBtn) {
        console.error("Required DOM elements not found.");
        return;
    }

    const star = document.querySelector(".star");
    if (star) {
        document.querySelector(".partition").style.display = "flex";
        document.querySelector(".review-count").style.display = "flex";
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

        let productStock = parseInt(
            addToCartBtn.getAttribute("data-stock"),
            10
        );

        if (productStock - _productQuantity === 0) {
            addToCartBtn.classList.add("disabled");
            addToCartBtn.setAttribute("disabled", "true");
            addToCartBtn.textContent = "Out of Stock";
        }

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
                    updateCartCount();
                } else if (res.status === 401) {
                    saveToLocalCart(cartItem);
                    alert(
                        "Product has been added to your local cart. Please log in to checkout."
                    );
                    updateCartCountNotLogin();
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
                // window.location.href = "/login";
            }
        } catch (error) {
            console.error("Error occurred while adding to cart:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = "Add to Cart";
        }
    });

    function saveToLocalCart(cartItem) {
        let localCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItemIndex = localCart.findIndex(
            (item) => item.productId === cartItem.productId
        );

        if (existingItemIndex !== -1) {
            localCart[existingItemIndex].quantity += cartItem.quantity;
        } else {
            localCart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(localCart));
    }

    const tabs = document.querySelectorAll(".heading .tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");
            if (target === "reviews") {
                loadReviewsProduct();
                const overviewPicture =
                    document.querySelector(".overview-picture");
                overviewPicture.style.display = "none";
            } else {
                const overviewPicture =
                    document.querySelector(".overview-picture");
                overviewPicture.style.display = "flex";
            }

            // Remove active class from all tabs and contents
            tabs.forEach((t) => t.classList.remove("active"));
            tabContents.forEach((tc) => tc.classList.remove("active"));

            // Add active class to the clicked tab and corresponding content
            tab.classList.add("active");
            document.getElementById(target).classList.add("active");
        });
    });

    const stars = document.querySelectorAll(".fa-star");

    stars.forEach((star) => {
        star.addEventListener("click", starClick);
    });

    function starClick(event) {
        const value = event.target.getAttribute("value");
        stars.forEach((star) => {
            star.style.color = "black";
        });
        for (let i = stars.length; i >= value; i--) {
            stars[i - 1].style.color = "gold";
        }
    }

    const submitFeedbackButton = document.querySelector(".submit-feedback");
    submitFeedbackButton.addEventListener("click", SubmitFeedback);

    async function SubmitFeedback() {
        let rating = 0;

        for (let i = 0; i < stars.length; i++) {
            if (stars[i].style.color === "gold") {
                rating = stars.length - i;
                break;
            }
        }

        const feedback = document.querySelector(".feedback-text").value;
        const Ids = submitFeedbackButton.getAttribute("data-product_user-id");
        const [productId, userId, orderDetailsId] = Ids.split(",");

        const feedbackData = {
            rating,
            feedback,
            productId,
            userId,
            orderDetailsId,
        };

        submitFeedbackButton.disabled = true;
        submitFeedbackButton.textContent = "Submitting...";

        try {
            const response = await fetch("/shop/postFeedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            if (data.success) {
                alert("Feedback submitted successfully.");
                window.location.reload();
            } else {
                alert(data.message || "Failed to submit feedback.");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("An error occurred while submitting feedback.");
        } finally {
            submitFeedbackButton.disabled = false;
            submitFeedbackButton.textContent = "Submit";
            feedback.value = "";
            const feedbackContainer = document.querySelector(".dialog-content");
            feedbackContainer.classList.add("hidden");
        }
    }

    async function loadReviewsProduct(page = 1, limit = 5) {
        try {
            const currentPath = window.location.pathname;
            console.log(currentPath);
            const queryParams = new URLSearchParams({
                page,
                limit,
            });

            const res = await fetch(
                `${currentPath}/api/reviews?${queryParams.toString()}`
            );

            const data = await res.json();

            if (res.ok) {
                renderReviewsProduct(data.feedback);
                updatePagination(data.page, data.totalPages);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    }

    const productReviews = document.querySelector(".productReviews-content");

    function renderReviewsProduct(feedbacks) {
        console.log("Feedback data:", feedbacks);
        productReviews.innerHTML = "";
        feedbacks.forEach((feedback) => {
            const reviewHTML = `<div class="feedback-item">
                                    <div class="feedback-item-container">
                                        <img src="${feedback.avatar}" />
                                    </div>
                                    <div class="feedback-content">
                                        <div class="feedback-content-header">
                                            <div class="feedback-content-header-left">
                                                <h3>${feedback.email}</h3>
                                                <div class="feedback-rating">
                                                    <img src="/img/star_full.svg" alt="" />
                                                    <p>${feedback.rating}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="feedback-content-body">
                                            <p>${feedback.message}</p>
                                        </div>
                                    </div>
                                </div>`;
            productReviews.insertAdjacentHTML("beforeend", reviewHTML);
        });
    }

    function updatePagination(currentPage, totalPages) {
        const previousButton = document.querySelector(".btn-prev");
        const nextButton = document.querySelector(".btn-next");

        if (currentPage > 1) {
            previousButton.classList.remove("disabled");
            previousButton.onclick = () =>
                loadReviewsProduct(currentPage - 1, 5);
        } else {
            previousButton.classList.add("disabled");
            previousButton.onclick = null;
        }

        if (currentPage < totalPages) {
            nextButton.classList.remove("disabled");
            nextButton.onclick = () => loadReviewsProduct(currentPage + 1, 5);
        } else {
            nextButton.classList.add("disabled");
            nextButton.onclick = null;
        }
    }
});
