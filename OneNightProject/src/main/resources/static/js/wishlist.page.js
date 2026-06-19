const WISHLIST_API =
    "http://localhost:8081/api/v1/wishlist";

let currentPage = 0;
let totalPages = 0;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadWishlist(0);
    }
);

/**
 * ==========================
 * LOAD WISHLIST
 * ==========================
 */
async function loadWishlist(page = 0) {

    try {

        const response =
            await fetch(
                `${WISHLIST_API}?page=${page}&size=5`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Cannot load wishlist"
            );
        }

        const data =
            await response.json();

        currentPage =
            data.number;

        totalPages =
            data.totalPages;

        renderWishlist(
            data.content
        );

        renderPagination();

    } catch(error) {

        console.error(
            error
        );
    }
}

/**
 * ==========================
 * RENDER WISHLIST
 * ==========================
 */
function renderWishlist(items) {

    const container =
        document.getElementById(
            "wishlist-container"
        );

    if(!container) {
        return;
    }

    if(
        !items ||
        items.length === 0
    ) {

        container.innerHTML = `
            <div class="text-center py-5">

                <h5>
                    Wishlist trống
                </h5>

            </div>
        `;

        return;
    }

    container.innerHTML =
        items
            .map(
                item =>
                    createWishlistItem(
                        item
                    )
            )
            .join("");
}

/**
 * ==========================
 * ITEM
 * ==========================
 */
function createWishlistItem(
    item
) {

    return `

        <div
            class="d-sm-flex justify-content-between mt-lg-4 mb-4 pb-3 pb-sm-2 border-bottom">

            <div
                class="media media-ie-fix d-block d-sm-flex text-center text-sm-left">

                <a
                    class="d-inline-block mx-auto mr-sm-4"
                    href="shop-single-v1.html?id=${item.productId}"
                    style="width: 10rem;">

                    <img
                        src="${item.imageUrl}"
                        alt="${item.name}">
                </a>

                <div
                    class="media-body pt-2">

                    <h3
                        class="product-title font-size-base mb-2">

                        <a
                            href="shop-single-v1.html?id=${item.productId}">

                            ${item.name}

                        </a>

                    </h3>

                    <div class="font-size-sm">

                        <span
                            class="text-muted mr-2">

                            Brand:

                        </span>

<!--                        ${item.brand ?? "N/A"}-->

                    </div>

                    <div class="font-size-sm">

                        <span
                            class="text-muted mr-2">

                            Color:

                        </span>

<!--                        ${item.color ?? "N/A"}-->

                    </div>

                    <div
                        class="font-size-lg text-accent pt-2">

                        ${
                        item.discountPrice
                            ? `
                                <span>
                                    ${formatPrice(item.discountPrice)}
                                </span>

                                <del
                                    class="font-size-sm text-muted ml-2">

                                    ${formatPrice(item.price)}

                                </del>
                                `
            : `
                                <span>
                                    ${formatPrice(item.price)}
                                </span>
                                `
    }

                    </div>

                </div>

            </div>

            <div
                class="pt-2 pl-sm-3 mx-auto mx-sm-0 text-center">

                <button
                    class="btn btn-outline-primary btn-sm mb-2"
                    onclick="addToCart(${item.productId})">

                    Add To Cart

                </button>

                <br>

                <button
                    class="btn btn-outline-danger btn-sm"
                    onclick="removeWishlist(${item.productId})">

                    <i
                        class="czi-trash mr-2">

                    </i>

                    Remove

                </button>

            </div>

        </div>
    `;
}

/**
 * ==========================
 * REMOVE
 * ==========================
 */
async function removeWishlist(
    productId
) {

    try {

        const response =
            await fetch(
                `${WISHLIST_API}/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
            );

        if(!response.ok) {

            throw new Error(
                "Cannot remove wishlist"
            );
        }

        loadWishlist(
            currentPage
        );

    } catch(error) {

        console.error(
            error
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
            "wishlist-pagination"
        );

    if(!pagination) {
        return;
    }

    let html = "";

    for(
        let i = 0;
        i < totalPages;
        i++
    ) {

        html += `
            <li
                class="page-item ${
            i === currentPage
                ? "active"
                : ""
        }">

                <a
                    href="#"
                    class="page-link"
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

    loadWishlist(
        page
    );
}

/**
 * ==========================
 * FORMAT PRICE
 * ==========================
 */
function formatPrice(
    price
) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + "₫";
}