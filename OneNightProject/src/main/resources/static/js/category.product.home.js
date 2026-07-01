async function getProductPromotion(productId) {

    try {

        const response =
            await fetch(
                `http://localhost:8081/api/v1/seller/promotions/${productId}/product`
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

/**
 * Load sản phẩm theo danh mục
 */
async function loadProductsByCategory() {

    try {

        const response =
            await fetch( "http://localhost:8081/api/v1/products/5/category?page=0&size=10");

        if (!response.ok) {

            throw new Error(
                "Không thể tải sản phẩm"
            );

        }

        const data =
            await response.json();

        console.log("API:", data);

        await renderProducts(
            data.content
        );

    } catch (e) {

        console.error(e);

    }

}

/**
 * Render sản phẩm
 */
async function renderProducts(products) {

    const carousel =
        document.getElementById(
            "home-category-carousel"
        );

    if (!carousel) {

        console.error(
            "Không tìm thấy carousel"
        );

        return;

    }

    let html = "";

    const productsPerSlide = 6;

    const slides = [];

    for (
        let i = 0;
        i < products.length;
        i += productsPerSlide
    ) {

        slides.push(

            products.slice(
                i,
                i + productsPerSlide
            )

        );

    }

    const token =
        localStorage.getItem(
            "accessToken"
        );

    // Render từng slide

    for (const slideProducts of slides) {

        html += `

            <div>

                <div class="row mx-n2">

        `;

        // Render từng sản phẩm

        for (const product of slideProducts) {

            let checkWishlist = false;

            const promotion =
                await getProductPromotion(product.id);

            if (token) {

                try {

                    const response =
                        await fetch(

                            `http://localhost:8081/api/v1/wishlist/${product.id}/check`,

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

                } catch (e) {

                    console.error(e);

                }

            }

            const image =
                "img/shop/catalog/06.jpg";

            let discountPrice = product.price;

            let hasDiscount = false;

            if (promotion) {

                if (promotion.discountType === "PERCENTAGE") {

                    discountPrice =
                        product.price -
                        (
                            product.price *
                            promotion.discountValue / 100
                        );

                } else {

                    discountPrice =
                        product.price -
                        promotion.discountValue;

                }

                if (promotion.maxDiscountAmount != null) {

                    const maxDiscount =
                        promotion.maxDiscountAmount;

                    const actualDiscount =
                        product.price - discountPrice;

                    if (actualDiscount > maxDiscount) {

                        discountPrice =
                            product.price - maxDiscount;

                    }

                }

                if (discountPrice < 0) {

                    discountPrice = 0;

                }

                hasDiscount =
                    discountPrice < product.price;

            }

            html += `

                <div class="col-lg-4 col-6 px-2 mb-4">

                    <div class="card product-card card-static">
                    
                    ${hasDiscount
                            ? `
                    <span class="badge badge-danger badge-shadow">
            
                        -${calculateDiscount(
                                product.price,
                                discountPrice
                            )}%
            
                    </span>
                `
                            : ""
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
                                src="${image}"
                                alt="${product.name}">

                        </a>

                        <div class="card-body py-2">

                            <a
                                class="product-meta d-block font-size-xs pb-1"
                                href="#">

                                ${product.categoryName}

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
                            
                                        <del
                                            class="font-size-sm text-muted ml-2">
                            
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

                                <div class="star-rating">

                                    ${renderStars(product.averageRating)}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }

        html += `

                </div>

            </div>

        `;

    }

    carousel.innerHTML = html;

    setTimeout(() => {

        if (window.tns) {

            const oldOuter =
                carousel.closest(".tns-outer");

            if (oldOuter) {

                const parent =
                    oldOuter.parentNode;

                parent.insertBefore(
                    carousel,
                    oldOuter
                );

                oldOuter.remove();

            }

            tns({

                container:
                    "#home-category-carousel",

                items: 1,

                slideBy: 1,

                nav: false,

                controls: true,

                autoHeight: true

            });

        }

    }, 100);

}

/**
 * Toggle Wishlist
 */
async function toggleWishlist(
    event,
    productId,
    element
) {

    event.preventDefault();

    const token =
        localStorage.getItem("accessToken");

    if (!token) {

        alert("Vui lòng đăng nhập!");

        return;

    }

    const wishlisted =
        element.dataset.wishlisted === "true";

    try {

        const response =
            await fetch(

                `http://localhost:8081/api/v1/wishlist/${productId}`,

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
            "Wishlist Error:",
            error
        );

    }

}

/**
 * Render số sao
 */
function renderStars(rating = 0) {

    let html = "";

    const full =
        Math.round(rating);

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html +=
            i <= full
                ? `<i class="sr-star czi-star-filled active"></i>`
                : `<i class="sr-star czi-star"></i>`;

    }

    return html;

}

function calculateDiscount(
    originalPrice,
    discountPrice
) {

    return Math.round(

        (
            (
                originalPrice -
                discountPrice
            ) /
            originalPrice
        ) * 100

    );

}

/**
 * Format tiền
 */
function formatPrice(price) {

    return Number(price)
        .toLocaleString("vi-VN") + " đ";

}

/**
 * Load khi mở trang
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProductsByCategory();

    }
);