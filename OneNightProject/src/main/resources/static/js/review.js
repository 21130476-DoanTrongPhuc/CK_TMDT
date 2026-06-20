const REVIEW_API =
    "http://localhost:8081/api/v1/reviews";

let currentReviewPage = 0;
const reviewPageSize = 5;

const params =
    new URLSearchParams(window.location.search);

const currentProductId =
    params.get("id");

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!currentProductId) {
            console.error("Product ID not found");
            return;
        }

        const hiddenProductId =
            document.getElementById(
                "review-product-id"
            );

        if (hiddenProductId) {
            hiddenProductId.value =
                currentProductId;
        }

        loadProductRating();

        loadReviews();

        const reviewForm =
            document.getElementById(
                "review-form"
            );

        if (reviewForm) {
            reviewForm.addEventListener(
                "submit",
                submitReview
            );
        }

        const sortSelect =
            document.getElementById(
                "sort-reviews"
            );

        if (sortSelect) {
            sortSelect.addEventListener(
                "change",
                () => loadReviews(0)
            );
        }

        const ratingFilter =
            document.getElementById(
                "filter-rating"
            );

        if (ratingFilter) {
            ratingFilter.addEventListener(
                "change",
                () => loadReviews(0)
            );
        }
    }
);

async function loadProductRating() {

    try {

        const response =
            await fetch(
                `${REVIEW_API}/product/${currentProductId}/rating`
            );

        if (!response.ok) {
            throw new Error();
        }

        const rating =
            await response.json();

        document.getElementById(
            "rating-summary"
        ).innerHTML = `

            <div class="card border-0 bg-light">

                <div class="card-body">

                    <h4 class="mb-1">
                        ${rating.averageRating
            ? rating.averageRating.toFixed(1)
            : "0.0"}
                        / 5
                    </h4>

                    <small class="text-muted">
                        ${rating.totalReviews || 0}
                        reviews
                    </small>

                </div>

            </div>

        `;

    } catch (e) {

        console.error(
            "Load rating error",
            e
        );

    }
}

async function loadReviews(page = 0) {

    try {

        const rating =
            document.getElementById(
                "filter-rating"
            )?.value;

        const sortType =
            document.getElementById(
                "sort-reviews"
            )?.value || "NEWEST";

        let url =
            `${REVIEW_API}/product/${currentProductId}` +
            `?page=${page}` +
            `&size=${reviewPageSize}` +
            `&sortType=${sortType}`;

        if (rating) {
            url += `&rating=${rating}`;
        }

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Cannot load reviews"
            );
        }

        const pageData =
            await response.json();

        console.log(
            "Review page:",
            pageData
        );

        renderReviews(
            pageData.content || []
        );

        renderReviewPagination(
            pageData
        );

        currentReviewPage = page;

    } catch (e) {

        console.error(
            "Load reviews error",
            e
        );

    }
}

function renderReviews(reviews) {

    const container =
        document.getElementById(
            "review-list"
        );

    if (!container) {
        return;
    }

    if (!reviews.length) {

        container.innerHTML = `

            <div class="alert alert-info">

                No reviews yet

            </div>

        `;

        return;
    }

    container.innerHTML =
        reviews.map(review => `

            <div
                class="product-review pb-4 mb-4 border-bottom">

                <div class="d-flex mb-3">

                    <div
                        class="media media-ie-fix
                        align-items-center
                        mr-4 pr-2">

                        <img
                            class="rounded-circle"
                            width="50"
                            src="img/default-avatar.png"
                            alt="Avatar">

                        <div class="media-body pl-3">

                            <h6
                                class="font-size-sm mb-0">

                                ${review.userName || "Anonymous User"}

                            </h6>

                            <span
                                class="font-size-ms text-muted">

                                ${formatDate(
            review.createdAt
        )}

                            </span>

                        </div>

                    </div>

                    <div>

                        ${renderStars(
            review.rating
        )}

                    </div>

                </div>

                <p class="font-size-md mb-2">

                    ${review.comment || ""}

                </p>

                ${renderReviewActions(
            review
        )}

            </div>

        `).join("");
}

function renderStars(rating) {

    let html =
        `<div class="star-rating">`;

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html += i <= rating
            ? `<i class="sr-star czi-star-filled active"></i>`
            : `<i class="sr-star czi-star"></i>`;
    }

    html += `</div>`;

    return html;
}

function renderReviewPagination(
    pageData
) {

    const container =
        document.getElementById(
            "review-pagination"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (pageData.totalPages <= 1) {
        return;
    }

    for (
        let i = 0;
        i < pageData.totalPages;
        i++
    ) {

        container.innerHTML += `

            <li class="page-item
                ${i === pageData.number
            ? "active"
            : ""}">

                <a
                    class="page-link"
                    href="#"
                    onclick="loadReviews(${i}); return false;">

                    ${i + 1}

                </a>

            </li>

        `;
    }
}

async function submitReview(e) {

    e.preventDefault();

    try {

        const token =
            localStorage.getItem(
                "accessToken"
            );

        if (!token) {

            alert(
                "Please login first"
            );

            return;
        }

        const body = {

            productId:
                Number(
                    currentProductId
                ),

            rating:
                Number(
                    document.getElementById(
                        "review-rating"
                    ).value
                ),

            comment:
                document.getElementById(
                    "review-text"
                ).value.trim()
        };

        const response =
            await fetch(
                REVIEW_API,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Authorization":
                            `Bearer ${token}`
                    },
                    body:
                        JSON.stringify(
                            body
                        )
                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            alert(
                result.message ||
                "Review failed"
            );

            return;
        }

        alert(
            "Review submitted successfully"
        );

        document
            .getElementById(
                "review-form"
            )
            .reset();

        loadProductRating();

        loadReviews(0);

    } catch (e) {

        console.error(e);

        alert(
            "Cannot submit review"
        );

    }
}

function renderReviewActions(
    review
) {

    const currentUserId =
        Number(
            localStorage.getItem(
                "userId"
            )
        );

    if (
        !currentUserId ||
        currentUserId !== review.userId
    ) {

        return "";
    }

    return `

        <div class="mt-2">

            <button
                class="btn btn-sm btn-danger"
                onclick="deleteReview(${review.id})">

                Delete

            </button>

        </div>

    `;
}

async function deleteReview(id) {

    if (
        !confirm(
            "Delete this review?"
        )
    ) {
        return;
    }

    try {

        const token =
            localStorage.getItem(
                "accessToken"
            );

        const response =
            await fetch(
                `${REVIEW_API}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error();

        }

        alert(
            "Review deleted"
        );

        loadProductRating();

        loadReviews(
            currentReviewPage
        );

    } catch (e) {

        console.error(e);

        alert(
            "Delete failed"
        );

    }
}

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    return new Date(
        dateString
    ).toLocaleDateString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}