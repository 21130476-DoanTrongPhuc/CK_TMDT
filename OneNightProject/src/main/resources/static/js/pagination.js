const API_URL = "http://localhost:8081/api/v1/products/filter";

let currentPage = 0;
let totalPages = 0;

function getCategoryId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("categoryId");
}

let currentFilter = {
    keyword: null,
    categoryId: getCategoryId(),
    minPrice: null,
    maxPrice: null,
    allowCustomization: null,
    sortBy: "null"
};

/**
 * ==========================
 * INIT
 * ==========================
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        bindEvents();

        bindPriceFilter();

        loadProducts(0);
    }
);

/**
 * ==========================
 * EVENTS
 * ==========================
 */
function bindEvents() {

    const sorting =
        document.getElementById("sorting");

    sorting?.addEventListener(
        "change",
        () => {

            currentFilter.sortBy =
                sorting.value;

            loadProducts(0);
        }
    );

    document
        .getElementById("prev-page")
        ?.addEventListener(
            "click",
            previousPage
        );

    document
        .getElementById("next-page")
        ?.addEventListener(
            "click",
            nextPage
        );


    const searchInput =
    document.getElementById(
        "search-input"
    );

    searchInput?.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Enter") {

                searchProducts();
            }
        }
    );
}

/**
 * ==========================
 * LOAD PRODUCTS
 * ==========================
 */
async function loadProducts(page = 0) {

    try {

        const response =
            await fetch(
                `${API_URL}?page=${page}&size=9&categoryId=${currentFilter.categoryId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        currentFilter
                    )
                }
            );

        if (!response.ok) {

            throw new Error(
                "Cannot load products"
            );
        }

        const data =
            await response.json();

        currentPage =
            data.number;

        totalPages =
            data.totalPages;

        await renderProducts(
            data.content
        );

        renderPagination();

        updateProductCount(
            data.totalElements
        );

        updatePageIndicator();

        scrollToProducts();

    } catch (error) {

        console.error(
            "Load products error:",
            error
        );
    }
}
/**
 * ==========================
 * RENDER PRODUCTS
 * ==========================
 */
async function renderProducts(products) {

    const container =
        document.getElementById(
            "product-grid"
        );

    if (!container) {
        return;
    }

    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML = `
            <div class="col-12 text-center">
                <h5>
                    Không tìm thấy sản phẩm
                </h5>
            </div>
        `;

        return;
    }

    try {

        const html =
            await Promise.all(

                products.map(
                    async product => {

                        let checkWishlist = false;

                        try {

                            const token =
                                localStorage.getItem(
                                    "accessToken"
                                );

                            if (token) {

                                const wishlistResponse =
                                    await fetch(
                                        `http://localhost:8081/api/v1/wishlist/${product.id}/check`,
                                        {
                                            method: "GET",
                                            headers: {
                                                Authorization:
                                                    `Bearer ${token}`
                                            }
                                        }
                                    );

                                if (
                                    wishlistResponse.ok
                                ) {

                                    checkWishlist =
                                        await wishlistResponse.json();

                                    console.log(
                                        `Product ${product.id} wishlist:`,
                                        checkWishlist
                                    );
                                }
                            }

                        } catch (error) {

                            console.error(
                                "Wishlist check error:",
                                error
                            );
                        }

                        return createProductCard(
                            product,
                            checkWishlist
                        );
                    }
                )
            );

        container.innerHTML =
            html.join("");

    } catch (error) {

        console.error(
            "Render products error:",
            error
        );
    }
}
/**
 * ==========================
 * PRODUCT CARD
 * ==========================
 */
function createProductCard(product, checkWishlist) {

    const imageUrl =
        product.thumbnailUrl ||
        "img/shop/catalog/06.jpg";

    const hasDiscount =
        product.discountPrice &&
        product.discountPrice < product.price;

    const discountPercent = hasDiscount
        ? calculateDiscount(product.price, product.discountPrice)
        : 0;

    const saveMoney = hasDiscount
        ? product.price - product.discountPrice
        : 0;

    return `
        <div class="col-md-4 col-sm-6 px-2 mb-4">

            <div class="card product-card h-100">

                ${
        hasDiscount
            ? `
                            <span class="badge badge-danger badge-shadow"
                                  style="position:absolute;top:12px;left:12px;z-index:5;">
                                -${discountPercent}%
                            </span>

                            <span class="badge badge-warning"
                                  style="position:absolute;top:12px;right:12px;z-index:5;">
                                SALE
                            </span>
                        `
            : ""
    }

                <a
                    class="btn-wishlist btn-sm"
                    href="#"
                    data-wishlisted="${checkWishlist}"
                    onclick="addToWishlist(event, ${product.id}, this)">

                    <i class="czi-heart ${checkWishlist ? "text-danger" : ""}"></i>

                </a>

                <a
                    class="card-img-top d-block overflow-hidden"
                    href="shop-single-v1.html?id=${product.id}">

                    <img
                        src="${imageUrl}"
                        alt="${product.name}">

                </a>

                <div class="card-body py-2">

                    <a
                        class="product-meta d-block font-size-xs pb-1"
                        href="#">

                        ${product.categoryName ?? ""}

                    </a>

                    <h3 class="product-title font-size-sm">

                        <a href="shop-single-v1.html?id=${product.id}">
                            ${product.name}
                        </a>

                    </h3>

                    <div class="product-price">

                        ${
        hasDiscount
            ? `
                                    <span class="text-danger font-weight-bold h6">
                                        ${formatPrice(product.discountPrice)}
                                    </span>

                                    <br>

                                    <del class="text-muted small">
                                        ${formatPrice(product.price)}
                                    </del>

                                    <div class="small text-success mt-1">
                                        Tiết kiệm ${formatPrice(saveMoney)}
                                    </div>
                                `
            : `
                                    <span class="text-accent font-weight-bold">
                                        ${formatPrice(product.price)}
                                    </span>
                                `
    }

                    </div>

                </div>

                <div class="card-body card-body-hidden">

                    <button
                        class="btn btn-primary btn-sm btn-block mb-2"
                        onclick="addToCart(${product.id})">

                        <i class="czi-cart font-size-sm mr-1"></i>

                        Add To Cart

                    </button>

                </div>

            </div>

            <hr class="d-sm-none">

        </div>
    `;
}

function calculateDiscount(
    originalPrice,
    discountPrice
) {

    return Math.round(
        ((originalPrice - discountPrice)
            / originalPrice) * 100
    );
}

async function addToWishlist(
    event,
    productId,
    button
) {

    event.preventDefault();

    const icon =
        button.querySelector("i");

    const isWishlisted =
        button.dataset.wishlisted === "true";

    try {

        const response =
            await fetch(
                `http://localhost:8081/api/v1/wishlist/${productId}`,
                {
                    method:
                        isWishlisted
                            ? "DELETE"
                            : "POST",

                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Wishlist request failed"
            );
        }

        button.dataset.wishlisted =
            (!isWishlisted).toString();

        icon.classList.toggle(
            "text-danger"
        );

    } catch(error) {

        console.error(
            "Wishlist error:",
            error
        );

        alert(
            "Không thể cập nhật wishlist"
        );
    }
}
/**
 * ==========================
 * PAGINATION
 * ==========================
 */
function renderPagination() {

    const pagination =
        document.getElementById(
            "pagination"
        );

    if (!pagination) {
        return;
    }

    let html = "";

    for (
        let i = 0;
        i < totalPages;
        i++
    ) {

        html += `
            <li class="page-item ${
                i === currentPage
                    ? "active"
                    : ""
            }">

                <a
                    class="page-link"
                    href="#"
                    onclick="changePage(event, ${i})">

                    ${i + 1}

                </a>

            </li>
        `;
    }

    pagination.innerHTML =
        html;
}

function changePage(
    event,
    page
) {

    event.preventDefault();

    loadProducts(page);
}

function previousPage(
    event
) {

    event.preventDefault();

    if (currentPage > 0) {

        loadProducts(
            currentPage - 1
        );
    }
}

function nextPage(
    event
) {

    event.preventDefault();

    if (
        currentPage <
        totalPages - 1
    ) {

        loadProducts(
            currentPage + 1
        );
    }
}

/**
 * ==========================
 * PAGE INDICATOR
 * ==========================
 */
function updatePageIndicator() {

    const indicator =
        document.getElementById(
            "page-indicator"
        );

    if (!indicator) {
        return;
    }

    indicator.textContent =
        `${currentPage + 1} / ${totalPages}`;
}

/**
 * ==========================
 * CATEGORY FILTER
 * ==========================
 */
function filterByCategory(
    categoryId
) {

    currentFilter.categoryId =
        categoryId || null;

    loadProducts(0);
}

/**
 * ==========================
 * PRICE FILTER
 * ==========================
 */
function filterByPrice(
    minPrice,
    maxPrice
) {

    currentFilter.minPrice =
        minPrice ?? null;

    currentFilter.maxPrice =
        maxPrice ?? null;

    loadProducts(0);
}

/**
 * ==========================
 * SEARCH
 * ==========================
 */
function searchProducts() {

    console.log("Search triggered");

    const keyword =
        document
            .getElementById("search-input")
            ?.value
            ?.trim();

    console.log("Keyword:", keyword);

    currentFilter.keyword =
        keyword || null;

    loadProducts(0);
}

/**
 * ==========================
 * PRODUCT COUNT
 * ==========================
 */
function updateProductCount(
    total
) {

    const countElement =
        document.getElementById(
            "product-count"
        );

    if (countElement) {

        countElement.textContent =
            `of ${total} products`;
    }
}

/**
 * ==========================
 * FORMAT PRICE
 * ==========================
 */
function formatPrice(
    price
) {

    return (
        new Intl.NumberFormat(
            "vi-VN"
        ).format(price) + "₫"
    );
}


/**
 * Add product to cart
 */
async function addToCart(productId) {

    try {

        let cartId;

        // Tạo cart
        const cartResponse = await fetch(
            "http://localhost:8081/api/v1/carts",
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        );

        console.log(cartResponse);

        if (!cartResponse.ok) {
            throw new Error("Cannot create cart");
        }

        const cartData =
            await cartResponse.json();

        cartId = cartData.id;

        // Tạo cart item
        await createCartItem(
            cartId,
            productId
        );

        // Reload mini cart
        loadCart();

    } catch (error) {

        console.error(error);

        alert("Add to cart failed");
    }
}

/**
 * Create cart item
 */
async function createCartItem(
    cartId,
    productId
) {

    const request = {
        cartId,
        productId,
        quantity: 1
    };

    const response = await fetch(
        "http://localhost:8081/api/v1/carts/items",
               {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    },

                    body: JSON.stringify(request)
                }
    );

    if (!response.ok) {
        throw new Error(
            "Cannot create cart item"
        );
    }

    const data =
        await response.json();

    console.log(data);

    return data;
}

/**
 * Initial events
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById("prev-page")
            .addEventListener(
                "click",
                previousPage
            );

        document
            .getElementById("next-page")
            .addEventListener(
                "click",
                nextPage
            );

        loadProducts(0);
    }
);


/**
 * ==========================
 * PRICE RANGE FILTER
 * ==========================
 */
document.addEventListener(
    "DOMContentLoaded",
    initPriceFilter
);

function initPriceFilter() {

    const minInput =
        document.querySelector(
            ".cz-range-slider-value-min"
        );

    const maxInput =
        document.querySelector(
            ".cz-range-slider-value-max"
        );

    if (
        !minInput ||
        !maxInput
    ) {
        return;
    }

    let debounceTimer;

    function applyPriceFilter() {

        clearTimeout(
            debounceTimer
        );

        debounceTimer =
            setTimeout(() => {

                const min =
                    minInput.value
                        ? parseFloat(
                              minInput.value
                          )
                        : null;

                const max =
                    maxInput.value
                        ? parseFloat(
                              maxInput.value
                          )
                        : null;

                currentFilter.minPrice =
                    min;

                currentFilter.maxPrice =
                    max;

                loadProducts(0);

            }, 500);
    }

    minInput.addEventListener(
        "change",
        applyPriceFilter
    );

    maxInput.addEventListener(
        "change",
        applyPriceFilter
    );

    minInput.addEventListener(
        "keyup",
        applyPriceFilter
    );

    maxInput.addEventListener(
        "keyup",
        applyPriceFilter
    );
}

function bindPriceFilter() {

    const button =
        document.getElementById(
            "apply-price-filter"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            const minPrice =
                document.getElementById(
                    "price-min"
                ).value;

            const maxPrice =
                document.getElementById(
                    "price-max"
                ).value;

            currentFilter.minPrice =
                minPrice
                    ? Number(minPrice)
                    : null;

            currentFilter.maxPrice =
                maxPrice
                    ? Number(maxPrice)
                    : null;

            loadProducts(0);
        }
    );
}

function scrollToProducts() {

    const section =
        document.getElementById(
            "scroll-here"
        );

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}