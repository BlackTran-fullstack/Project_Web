function applyFilters(page) {
    const category = document.querySelectorAll(".category-filter-item")
    const brands = document.querySelectorAll(".brands-filter-item")
    const sortBy = document.getElementById('sort-by').value;
    const showCount = document.getElementById('show-count').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    let query = {};

    if(!page)
    {
        query.page = 1;
    }
    else
    {
        query.page = page;
    }

    if (category) {
        let selectedCategories = [];
        let ifAll = false;

        for(let i=0;i<category.length;i++)
        {
            if(category[i].checked)
            {
                selectedCategories.push(category[i].value);
            }

            if(category[i].checked && category[i].value === "all")
            {
                ifAll=true;
                unCheckedAll(category);
                break;
            }
        }

        if(!ifAll)
        {
            if (selectedCategories.length) {
                query.category = selectedCategories.join(',');
            }
        }
        else 
        {
            query.category="all";
        }
    }

    if (brands) {
        let selectedBrands = [];
        let ifAll = false;

        for(let i=0;i<brands.length;i++)
        {
            if(brands[i].checked)
            {
                selectedBrands.push(brands[i].value);
            }

            if(brands[i].checked && brands[i].value === "all")
            {
                ifAll=true;
                unCheckedAll(brands);
                break;
            }
        }

        if(!ifAll)
        {
            if (selectedBrands.length) {
                query.brand = selectedBrands.join(',');
            }
        }
        else 
        {
            query.brand="all";
        }
    }

    if (sortBy !== 'default') {
        query.sort = sortBy;
    }

    if (showCount) {
        query.limit = showCount;
    }

    if (minPrice) {
        query.minPrice = minPrice;
    }

    if (maxPrice) {
        query.maxPrice = maxPrice;
    }

    const queryString = new URLSearchParams(query).toString();
    console.log(queryString);

    fetch(`/api/products?${queryString}`)
        .then(response => response.json())
        .then(products => {
            updateProductList(products);
            renderPagination(
                products.previousPage,
                products.currentPage, 
                products.nextPage, 
                products.totalPages
            );
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function renderPagination(previous, current, next, totalPages) {
    paginationContainer.innerHTML = ""; // Xóa nội dung cũ

    // Nút "Previous"
    if (previous) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.classList.add("page", "page-in-de");
        prevButton.addEventListener("click", () => applyFilters(previous));
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
        pageButton.addEventListener("click", () => applyFilters(page));
        paginationContainer.appendChild(pageButton);
    }

    // Nút "Next"
    if (next) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.classList.add("page", "page-in-de");
        nextButton.addEventListener("click", () => applyFilters(next));
        paginationContainer.appendChild(nextButton);
    }
}


function updateProductList(products) {
    const productList = document.querySelector('.list-products');
    productList.innerHTML = ''; // Clear the current product list

    products.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
                <a href="#!" class="product-btn">
                    <img
                        src="${product.imagePath}"
                        alt="${product.name}"
                        class="product-image"
                    />

                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>

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
        `;

        const productHover = document.createElement('div');
        productHover.className = 'product-hover';
        productHover.innerHTML = `
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
        `;

        const productItem = document.createElement('li');
        productItem.className = 'product';
        productItem.appendChild(productCard);
        productItem.appendChild(productHover);

        productList.appendChild(productItem);
    });
}

const filter = document.getElementById('filter-selected');
function filter_toggle(){
    if(filter.style.display === 'none'){
        filter.style.display = 'block';
    }
    else{
        filter.style.display = 'none';
    }
}

function unCheckedAll(objects)
{
    objects.forEach(object => {
        if(object.value !== "all")
            object.checked = false;
    });
}

window.applyFilters = applyFilters;