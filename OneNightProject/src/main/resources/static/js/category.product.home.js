/**
 * Load sản phẩm theo danh mục
 */
async function loadProductsByCategory() {

    try {

        const response = await fetch(
            `http://localhost:8081/api/v1/products/5/category?page=0&size=10`
        );

        if (!response.ok) {
            throw new Error("Không thể tải sản phẩm");
        }

        const data = await response.json();

        console.log("API:", data);

        renderProducts(data.content);

    } catch (e) {
        console.error(e);
    }

}


/**
 * Render sản phẩm
 */
function renderProducts(products) {

    const carousel = document.getElementById("home-category-carousel");

    if (!carousel) {
        console.error("Không tìm thấy #home-category-carousel");
        return;
    }

    let html = "";

    // Nhóm sản phẩm thành các slide (mỗi slide 9 sản phẩm = 3x3)
    const productsPerSlide = 6;
    const slides = [];

    for (let i = 0; i < products.length; i += productsPerSlide) {
        slides.push(products.slice(i, i + productsPerSlide));
    }

    // Render từng slide
    slides.forEach(slideProducts => {

        html += `
            <div>
                <div class="row mx-n2">
        `;

        slideProducts.forEach(product => {

            // const image =
            //     product.images && product.images.length > 0
            //         ? product.images[0].image_url
            //         : "img/no-image.png";

            const image = "img/shop/catalog/06.jpg";

            html += `
                <div class="col-lg-4 col-6 px-2 mb-4">

                    <div class="card product-card card-static">

                        <button
                            class="btn-wishlist btn-sm"
                            type="button"
                            data-toggle="tooltip"
                            title="Add to wishlist">

                            <i class="czi-heart"></i>

                        </button>

                        <a
                            class="card-img-top d-block overflow-hidden"
                            href="shop-single-v1.html?id=${product.id}">

                            <img src="${image}" alt="${product.name}">

                        </a>

                        <div class="card-body py-2">

                            <a class="product-meta d-block font-size-xs pb-1" href="#">
                                ${product.categoryName}
                            </a>

                            <h3 class="product-title font-size-sm">
                                <a href="shop-single-v1.html?id=${product.id}">
                                    ${product.name}
                                </a>
                            </h3>

                            <div class="d-flex justify-content-between">

                                <div class="product-price">
                                    <span class="text-accent">
                                        ${formatPrice(product.price)}
                                    </span>
                                </div>

                                <div class="star-rating">
                                    ${renderStars(product.averageRating)}
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    carousel.innerHTML = html;

    console.log("Render xong");
    console.log(carousel.innerHTML);

    // ===========================
    // Re-init Cartzilla Carousel
    // ===========================
    setTimeout(() => {

        if (window.tns) {

            const oldOuter = carousel.closest(".tns-outer");

            if (oldOuter) {

                const parent = oldOuter.parentNode;

                parent.insertBefore(carousel, oldOuter);

                oldOuter.remove();
            }

            tns({
                container: "#home-category-carousel",
                items: 1,
                slideBy: 1,
                nav: false,
                controls: true,
                autoHeight: true
            });

            console.log("Carousel initialized");
        }

    }, 100);

}


/**
 * Render số sao
 */
function renderStars(rating = 0) {

    let html = "";

    const full = Math.round(rating);

    for (let i = 1; i <= 5; i++) {

        html += i <= full
            ? `<i class="sr-star czi-star-filled active"></i>`
            : `<i class="sr-star czi-star"></i>`;

    }

    return html;
}


/**
 * Format tiền
 */
function formatPrice(price) {

    return Number(price).toLocaleString("vi-VN") + " đ";

}


/**
 * Load khi mở trang
 */
document.addEventListener("DOMContentLoaded", () => {

    loadProductsByCategory(5);

});