async function reviewProduct(id, orderDetailId) {
    try {
        const isReviewed = await checkReviewed(orderDetailId);
        if (isReviewed) {
            alert("You have already reviewed this product.");
            return;
        }
        const response = await fetch(`/shop/api/get-slug/${id}`);
        const data = await response.json();
        window.location.href = `/shop/${data.slug}`;
    } catch (error) {
        console.error("Error fetching product:", error);
    }
}

async function checkReviewed(orderDetailId) {
    try {
        const response = await fetch(`/list-orders/detail/${orderDetailId}`);
        const data = await response.json();
        return data.isReview;
    } catch (error) {
        console.error("Error fetching product:", error);
    }
}