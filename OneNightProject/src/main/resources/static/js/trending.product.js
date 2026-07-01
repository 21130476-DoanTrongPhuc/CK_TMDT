const TRENDING_PRODUCT_API =
    "http://localhost:8081/api/v1/products/trending";

const WISHLIST_API =
    "http://localhost:8081/api/v1/wishlist";

const PROMOTION_API =
    "http://localhost:8081/api/v1/seller/promotions";

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
            await fetch(TRENDING_PRODUCT_API);

        if (!response.ok) {

            throw new Error(
                "Cannot load trending products"
            );

        }

        const products =
            await response.json();

        await renderTrendingProducts(products);

    } catch (error) {

        console.error(
            "Load trending products error:",
            error
        );

    }

}

async function getProductPromotion(productId) {

    try {

        const response = await fetch(
            `${PROMOTION_API}/${productId}/product`
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();

    } catch (e) {

        console.error(e);

        return null;

    }

}

// ==========================
// RENDER PRODUCTS
// ==========================

async function renderTrendingProducts(products) {

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

    const token =
        localStorage.getItem("accessToken");

    let html = "";

    for (const product of products) {

        let checkWishlist = false;

        if (token) {

            try {

                const response =
                    await fetch(

                        `${WISHLIST_API}/${product.id}/check`,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`

                            }

                        }

                    );

                if (response.ok) {

                    checkWishlist =
                        await response.json();

                }

            } catch (error) {

                console.error(
                    error
                );

            }

        }

        const promotion =
            await getProductPromotion(product.id);

        html += createTrendingProductCard(
            product,
            checkWishlist,
            promotion
        );

    }

    container.innerHTML = html;

}



// ==========================
// PRODUCT CARD
// ==========================

function createTrendingProductCard(
    product,
    checkWishlist = false,
    promotion = null
) {

    const imageUrl =
        product.thumbnailUrl ||
        "img/shop/catalog/06.jpg";

    let discountPrice = product.price;
    let hasDiscount = false;

    if (promotion) {

        if (promotion.discountType === "PERCENTAGE") {

            discountPrice =
                product.price -
                product.price *
                promotion.discountValue / 100;

        } else {

            discountPrice =
                product.price -
                promotion.discountValue;

        }

        if (discountPrice < 0) {
            discountPrice = 0;
        }

        hasDiscount =
            discountPrice < product.price;
    }

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
                                discountPrice
                            )}%
            
                                    </span>
                                    `
                        :
                        ""
                }

                <a
                    href="#"
                    class="btn-wishlist btn-sm"
                    data-wishlisted="${checkWishlist}"
                    onclick="toggleWishlist(event, ${product.id}, this)">

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

                                        ${formatPrice(discountPrice)}

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
// TOGGLE WISHLIST
// ==========================

async function toggleWishlist(
    event,
    productId,
    element
) {

    event.preventDefault();

    const token =
        localStorage.getItem("accessToken");

    if (!token) {

        alert("Please login first!");

        return;

    }

    const wishlisted =
        element.dataset.wishlisted === "true";

    try {

        const response =
            await fetch(

                `${WISHLIST_API}/${productId}`,

                {

                    method:
                        wishlisted
                            ? "DELETE"
                            : "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

        if (!response.ok) {

            throw new Error(
                "Wishlist request failed."
            );

        }

        const icon =
            element.querySelector("i");

        if (wishlisted) {

            icon.classList.remove(
                "text-danger"
            );

            element.dataset.wishlisted =
                "false";

        } else {

            icon.classList.add(
                "text-danger"
            );

            element.dataset.wishlisted =
                "true";

        }

    } catch (error) {

        console.error(
            "Wishlist error:",
            error
        );

        alert(
            "Cannot update wishlist!"
        );

    }

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
// CALCULATE DISCOUNT
// ==========================

function calculateDiscount(
    originalPrice,
    discountPrice
) {

    return Math.round(

        (
            (
                originalPrice -
                discountPrice
            )
            /
            originalPrice
        ) * 100

    );

}