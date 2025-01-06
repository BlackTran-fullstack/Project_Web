document.getElementById("btn-show-all").addEventListener("click", function () {
    const query = this.getAttribute("data-query");
    
    fetch(`/search-ajax?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const productsContainer = document.querySelector(".list-products");
            productsContainer.innerHTML = ""; // Xóa danh sách hiện tại
            
            // Thêm sản phẩm mới từ kết quả tìm kiếm
            data.products.forEach(product => {
                const productHTML = `
                    <li class="product">
                        <div class="product-card">
                            <a href="#!" class="product-btn">
                                <img src="${product.imagePath}" alt="${product.name}" class="product-image"/>
                                <div class="product-info">
                                    <h3 class="product-name">${product.name}</h3>
                                    <p class="product-desc">${product.description}</p>
                                    <p class="product-price" data-price="${product.price}">${formatCurrency(product.price)}</p>
                                </div>
                            </a>
                        </div>
                        <div class="product-hover">
                            <div class="product-actions">
                                <a href="/shop/${product.slug}" class="button cart-btn">View details</a>
                                <div class="actions">
                                    <a href="#!" class="action share">
                                        <img src="/img/share.svg" alt="" />
                                        <p class="action-name">Share</p>
                                    </a>
                                    <a href="#!" class="action compare">
                                        <img src="/img/compare.svg" alt="" />
                                        <p class="action-name">Compare</p>
                                    </a>
                                    <a href="#!" class="action like">
                                        <img src="/img/like.svg" alt="" />
                                        <p class="action-name">Like</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </li>`;
                productsContainer.insertAdjacentHTML("beforeend", productHTML);
            });

            // Ẩn nút "Show All Result"
            document.querySelector(".show-all").style.display = "none";
        })
        .catch(err => console.error("Error:", err));
});

