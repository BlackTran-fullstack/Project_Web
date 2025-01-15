const productsContainer = document.querySelector(".list-products");
const paginationContainer = document.querySelector(".shop-pagination");
let currentFilters = {
    categories: [],
    brands: [],
    priceMin: 0,
    priceMax: 20000000,
    sortBy: null,
};

function isAjaxRequest() {
    return !!window.XMLHttpRequest;
}

// Hàm tải dữ liệu từ API
async function loadProducts(page = 1, limit = 8) {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit,
            categories: currentFilters.categories.join(","),
            brands: currentFilters.brands.join(","),
            priceMin: currentFilters.priceMin,
            priceMax: currentFilters.priceMax,
            sortBy: currentFilters.sortBy,
        });

        if (!isAjaxRequest()) {
            window.location.href = `/shop?${queryParams.toString()}`;
            return;
        }

        const response = await fetch(
            `/shop/api/products?${queryParams.toString()}`
        );
        const data = await response.json();

        history.pushState(null, "", `/shop?${queryParams.toString()}`);

        // Xử lý hiển thị sản phẩm
        renderProducts(data.results);
        renderPagination(
            data.previous, // Trang trước (previous)
            data.current, // Trang hiện tại (current)
            data.next, // Trang tiếp theo (next)
            data.totalPages
        );

        const startIndex = (page - 1) * limit + 1;
        const endIndex = startIndex + data.results.length - 1;

        const resultsCountElement = document.querySelector(".results-count");
        resultsCountElement.textContent = `Showing ${startIndex}–${endIndex} of ${data.totalDocuments} results`;
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

function applyFilters() {
    const selectedCategories = Array.from(
        document.querySelectorAll(
            ".filter-category input[type='checkbox']:checked"
        )
    ).map((checkbox) => checkbox.value);

    const selectedBrands = Array.from(
        document.querySelectorAll(
            ".filter-brand input[type='checkbox']:checked"
        )
    ).map((checkbox) => checkbox.value);

    const priceMin = 0;
    const priceMaxInput = document.getElementById("price").value;
    const priceMax =
        parseInt(priceMaxInput) === 0 || priceMaxInput === ""
            ? 20000000 // Đặt lại giá trị mặc định
            : parseInt(priceMaxInput);

    const limit = document.getElementById("show-count").value;
    const sortBy = document.getElementById("sort-by").value;

    currentFilters = {
        categories: selectedCategories,
        brands: selectedBrands,
        priceMin,
        priceMax,
        sortBy,
    };

    loadProducts(1, limit);
}

// Hàm hiển thị sản phẩm
function renderProducts(products) {
    productsContainer.innerHTML = ""; // Xóa nội dung cũ
    products.forEach((product) => {
        const productHTML = `<li class="product">
                        <div class="product-card">
                            <a href="#!" class="product-btn">
                                <img
                                    src="${product.imagePath}"
                                    alt=${product.name}"
                                    class="product-image"
                                />

                                <div class="product-info">
                                    <h3 class="product-name">${
                                        product.name
                                    }</h3>

                                    <p
                                        class="product-desc"
                                    >${product.description}</p>

                                    <p
                                        class="product-price"
                                        data-price="${product.price}"
                                    >${formatCurrency(product.price)}</p>
                                </div>
                            </a>
                        </div>

                        <div class="product-hover">
                            <div class="product-actions">
                                <a
                                    href="/shop/${product.slug}"
                                    class="button cart-btn"
                                >View details</a>

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
}

function renderPagination(previous, current, next, totalPages) {
    paginationContainer.innerHTML = ""; // Xóa nội dung cũ
    const limit = document.getElementById("show-count").value;

    // Nút "Previous"
    if (previous) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.classList.add("page", "page-in-de");
        prevButton.addEventListener("click", () =>
            loadProducts(previous.page, limit)
        );
        paginationContainer.appendChild(prevButton);
    }

    // Hiển thị các trang liên tiếp (tối đa 3 trang)
    const startPage = Math.max(1, current - 1); // Bắt đầu hiển thị từ trang hiện tại - 1
    const endPage = Math.min(startPage + 2, totalPages); // Chỉ hiển thị tối đa 3 trang

    for (let page = startPage; page <= endPage; page++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = page;
        pageButton.classList.add("page");
        if (page === current) {
            pageButton.classList.add("active"); // Đánh dấu trang hiện tại
        }
        pageButton.addEventListener("click", () => loadProducts(page, limit));
        paginationContainer.appendChild(pageButton);
    }

    // Nút "Next"
    if (next) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.classList.add("page", "page-in-de");
        nextButton.addEventListener("click", () =>
            loadProducts(next.page, limit)
        );
        paginationContainer.appendChild(nextButton);
    }
}

function updatePrice(value) {
    document.getElementById("price-value").textContent = `${formatCurrency(
        value
    )}`;
}

function filter_toggle() {
    const filterSidebar = document.getElementById("filter-sidebar");
    filterSidebar.classList.toggle("active");
}

window.addEventListener("popstate", (event) => {
    const queryParams = new URLSearchParams(window.location.search);
    const page = parseInt(queryParams.get("page")) || 1;
    const limit = parseInt(queryParams.get("limit")) || 8;
    loadProducts(page, limit); // Gọi lại hàm tải dữ liệu
});

loadProducts();
