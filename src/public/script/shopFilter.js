function applyFilters() {
    const category = document.getElementById('categories').value;
    const sortBy = document.getElementById('sort-by').value;
    const showCount = document.getElementById('show-count').value;

    let query = {};

    if (category !== 'all') {
        query.category = category;
    }

    if (sortBy !== 'default') {
        query.sort = sortBy;
    }

    if (showCount) {
        query.limit = showCount;
    }

    const queryString = new URLSearchParams(query).toString();

    fetch(`/api/products?${queryString}`)
        .then(response => response.json())
        .then(products => {
            updateProductList(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function updateProductList(products) {
    const productList = document.querySelector('.list-products');
    productList.innerHTML = ''; // Clear the current product list

    products.forEach(product => {
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
                        >${product.price}</p>

                        <div class="rating_stock">
                            <p
                                class="product-rating"
                                data-rating="${product.rating}"
                                >${product.rate} 
                                <img src="/img/star_full.svg"/> 
                            </p>

                            <p
                                class="product-stock"
                                data-stock="${product.stock}"
                                >
                                ${product.stock} in stock
                            </p>
                        </div>
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

window.applyFilters = applyFilters;