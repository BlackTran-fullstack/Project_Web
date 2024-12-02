document.addEventListener("DOMContentLoaded", () => {
    const cartTable = document.querySelector(".cart-detail");

    if (cartTable) {
        cartTable.addEventListener("click", async (event) => {
            const target = event.target;

            // Kiểm tra nếu nhấn vào nút "Remove"
            if (target.closest(".remove-btn")) {
                const removeBtn = target.closest(".remove-btn");
                const productId = removeBtn.getAttribute("data-product-id");

                if (productId) {
                    // Tìm và ẩn dòng sản phẩm ngay lập tức
                    const productRow = document.querySelector(
                        `tr[data-product-id="${productId}"]`
                    );

                    if (productRow) {
                        productRow.style.display = "none"; // Ẩn dòng sản phẩm
                    }

                    try {
                        // Gửi yêu cầu xoá đến server
                        const response = await fetch("/cart/remove", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ productId }),
                        });

                        if (!response.ok) {
                            // Nếu server phản hồi lỗi, hiển thị lại dòng sản phẩm
                            if (productRow) {
                                productRow.style.display = ""; // Hiện lại dòng sản phẩm
                            }
                            console.error("Error: Unable to remove product.");
                        }
                    } catch (error) {
                        // Nếu có lỗi khi gửi yêu cầu, hiện lại dòng sản phẩm
                        if (productRow) {
                            productRow.style.display = ""; // Hiện lại dòng sản phẩm
                        }
                        console.error("Error removing product:", error);
                    }
                }
            }
        });
    }
});
