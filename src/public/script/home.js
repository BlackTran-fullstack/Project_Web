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
