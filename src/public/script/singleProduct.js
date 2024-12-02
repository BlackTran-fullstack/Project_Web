document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll(".actions");

    forms.forEach((form) => {
        const reduceBtn = form.querySelector(".reduce");
        const increaseBtn = form.querySelector(".increase");
        const quantityInput = form.querySelector(".quantity");

        reduceBtn.addEventListener("click", () => {
            let currentQuantity = parseInt(quantityInput.value, 10);
            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
            }
        });

        increaseBtn.addEventListener("click", () => {
            let currentQuantity = parseInt(quantityInput.value, 10);
            quantityInput.value = currentQuantity + 1;
        });
    });
});
