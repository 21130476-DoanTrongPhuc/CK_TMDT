const TRENDING_PRODUCT_API =
    "http://localhost:8081/api/v1/products/trending";

document.addEventListener(
    "DOMContentLoaded",
    loadTrendingProducts
);

// ==========================
// LOAD TRENDING PRODUCTS
// ==========================

async function loadTrendingProducts() {

    try {

        const response =
            await fetch(
                TRENDING_PRODUCT_API
            );

        if (!response.ok) {

            throw new Error(
                "Cannot load trending products"
            );

        }

        const products =
            await response.json();

        renderTrendingProducts(products);

    } catch (error) {

        console.error(
            "Load trending products error:",
            error
        );

    }

}

// ==========================
// RENDER PRODUCTS
// ==========================

function renderTrendingProducts(products) {

    const container =
        document.getElementById(
            "trending-product-list"
        );

    if (!container) {

        return;

    }

    if (!products || products.length === 0) {

        container.innerHTML = `

            <div class="col-12 text-center">

                <h5>
                    No trending products
                </h5>

            </div>

        `;

        return;

    }

    container.innerHTML =
        products.map(createTrendingProductCard)
            .join("");

}

// ==========================
// PRODUCT CARD
// ==========================

function createTrendingProductCard(product) {

    const imageUrl =
        product.thumbnailUrl ||
        "img/shop/catalog/06.jpg";

    const hasDiscount =
        product.discountPrice &&
        product.discountPrice < product.price;

    return `

        <div class="col-lg-3 col-md-4 col-sm-6 px-2 mb-4">

            <div class="card product-card">

                ${
        hasDiscount
            ?
            `
                        <span class="badge badge-danger badge-shadow">

                            -${calculateDiscount(
                product.price,
                product.discountPrice
            )}%

                        </span>
                    `
            :
            ""
    }

                <button
                    class="btn-wishlist btn-sm"
                    onclick="addToWishlist(event, ${product.id}, this)">

                    <i class="czi-heart"></i>

                </button>

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

                        ${product.categoryName || ""}

                    </a>

                    <h3 class="product-title font-size-sm">

                        <a
                            href="shop-single-v1.html?id=${product.id}">

                            ${product.name}

                        </a>

                    </h3>

                    <div class="d-flex justify-content-between">

                        <div class="product-price">

                            ${
        hasDiscount
            ?
            `
                                    <span class="text-accent">

                                        ${formatPrice(product.discountPrice)}

                                    </span>

                                    <del class="font-size-sm text-muted ml-2">

                                        ${formatPrice(product.price)}

                                    </del>
                                `
            :
            `
                                    <span class="text-accent">

                                        ${formatPrice(product.price)}

                                    </span>
                                `
    }

                        </div>

                    </div>

                </div>

                <div class="card-body card-body-hidden">

                    <button
                        class="btn btn-primary btn-sm btn-block mb-2"
                        onclick="addToCart(${product.id})">

                        <i class="czi-cart font-size-sm mr-1"></i>

                        Add to Cart

                    </button>

                </div>

            </div>

        </div>

    `;

}

// ==========================
// FORMAT PRICE
// ==========================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + " ₫";

}

// ==========================
// DISCOUNT
// ==========================

function calculateDiscount(
    originalPrice,
    discountPrice
) {

    return Math.round(

        (
            (originalPrice - discountPrice)
            /
            originalPrice
        ) * 100

    );

}

