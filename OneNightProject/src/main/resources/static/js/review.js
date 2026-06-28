
const REVIEW_API =
    "http://localhost:8081/api/v1/reviews";

let currentReviewPage = 0;
const reviewPageSize = 5;

let editingReviewId = null;

const params =
    new URLSearchParams(window.location.search);

const currentProductId =
    params.get("id");

function getStoredUser() {

    const storageKeys = [
        "user",
        "currentUser",
        "current_user",
        "account",
        "authUser"
    ];

    for (const key of storageKeys) {

        const rawValue =
            localStorage.getItem(key);

        if (!rawValue) {
            continue;
        }

        try {

            const parsedValue =
                JSON.parse(rawValue);

            if (
                parsedValue &&
                typeof parsedValue === "object"
            ) {

                return parsedValue;

            }

        } catch (e) {
            // ignore and continue
        }

    }

    const token =
        localStorage.getItem("accessToken");

    if (!token) {
        return null;
    }

    try {

        const base64Payload =
            token.split(".")[1];

        const decodedPayload =
            JSON.parse(
                atob(base64Payload)
            );

        return decodedPayload;

    } catch (e) {

        return null;

    }

}

function getUserId(user) {

    if (!user || typeof user !== "object") {
        return null;
    }

    const possibleKeys = [
        "id",
        "userId",
        "user_id",
        "_id",
        "sub"
    ];

    for (const key of possibleKeys) {

        if (user[key] != null) {
            return String(user[key]);
        }

    }

    return null;

}

function getUserIdentityValues(user) {

    if (!user || typeof user !== "object") {
        return [];
    }

    const values = [];

    const possibleKeys = [
        "id",
        "userId",
        "user_id",
        "_id",
        "sub",
        "email",
        "username",
        "userName",
        "name"
    ];

    for (const key of possibleKeys) {

        if (user[key] != null) {
            const value = String(user[key]).trim().toLowerCase();

            if (value) {
                values.push(value);
            }
        }

    }

    return values;

}

function getReviewIdentityValues(review) {

    if (!review || typeof review !== "object") {
        return [];
    }

    const values = [];

    const candidates = [
        review.userId,
        review.user_id,
        review.id,
        review._id,
        review.userName,
        review.username,
        review.email,
        review.name,
        review.user?.id,
        review.user?.userId,
        review.user?.user_id,
        review.user?.username,
        review.user?.userName,
        review.user?.email,
        review.user?.name,
        review.author?.id,
        review.author?.userId,
        review.author?.user_id,
        review.author?.username,
        review.author?.userName,
        review.author?.email,
        review.author?.name
    ];

    candidates.forEach((value) => {

        if (value != null) {
            const normalized = String(value).trim().toLowerCase();

            if (normalized) {
                values.push(normalized);
            }
        }

    });

    return values;

}

function getCurrentUserId() {

    const storedUser = getStoredUser();

    return getUserId(storedUser);

}

function getReviewOwnerId(review) {

    if (!review || typeof review !== "object") {
        return null;
    }

    if (review.userId != null) {
        return String(review.userId);
    }

    if (review.user_id != null) {
        return String(review.user_id);
    }

    if (review.user && typeof review.user === "object") {

        const nestedUserId =
            getUserId(review.user);

        if (nestedUserId) {
            return nestedUserId;
        }

    }

    if (review.author && typeof review.author === "object") {

        const authorId =
            getUserId(review.author);

        if (authorId) {
            return authorId;
        }

    }

    return null;

}

function reviewBelongsToCurrentUser(review) {

    const currentUserId = getCurrentUserId();

    if (currentUserId) {
        const reviewOwnerId = getReviewOwnerId(review);

        if (reviewOwnerId) {
            return String(currentUserId) === String(reviewOwnerId);
        }
    }

    const currentUserValues = getUserIdentityValues(getStoredUser());
    const reviewValues = getReviewIdentityValues(review);

    return reviewValues.some((value) => currentUserValues.includes(value));

}

async function findCurrentUserReview() {

    if (!currentProductId) {
        return null;
    }

    try {

        const response =
            await fetch(
                `http://localhost:8081/api/v1/reviews/product/${currentProductId}/me`,
                {

                    method: "GET",

                        headers: {

                    "Content-Type":
                    "application/json",

                        Authorization:
                    `Bearer ${token}`

                },

                }

            );

        if (!response.ok) {
            return null;
        }

        const pageData = await response.json();

        console.log(pageData);

        return (
            pageData);

    } catch (e) {

        return null;

    }

}

// =========================
// INIT
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!currentProductId) {

            console.error(
                "Product ID not found"
            );

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

        document
            .getElementById(
                "sort-reviews"
            )
            ?.addEventListener(
                "change",
                () => loadReviews(0)
            );

        document
            .getElementById(
                "filter-rating"
            )
            ?.addEventListener(
                "change",
                () => loadReviews(0)
            );

        document
            .getElementById(
                "cancel-edit-review"
            )
            ?.addEventListener(
                "click",
                cancelEditReview
            );

    }
);

// =========================
// LOAD RATING
// =========================

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

        const ratingSummary =
            document.getElementById(
                "rating-summary"
            );

        if (!ratingSummary) {

            return;

        }

        ratingSummary.innerHTML = `

            <div class="card border-0 bg-light">

                <div class="card-body text-center">

                    <h2 class="mb-2">

                        ${
            rating.averageRating
                ? rating.averageRating.toFixed(1)
                : "0.0"
        }

                    </h2>

                    ${renderStars(
            Math.round(
                rating.averageRating || 0
            )
        )}

                    <div class="mt-2 text-muted">

                        ${
            rating.totalReviews || 0
        } reviews

                    </div>

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

// =========================
// LOAD REVIEWS
// =========================

async function loadReviews(
    page = 0,
    onLoaded = null
) {

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

        currentReviewPage =
            pageData.number;

        renderReviews(
            pageData.content || []
        );

        renderReviewPagination(
            pageData
        );

        if (typeof onLoaded === "function") {

            onLoaded(
                pageData.content || [],
                pageData
            );

        }

    } catch (e) {

        console.error(
            "Load reviews error",
            e
        );

    }

}

// =========================
// RENDER REVIEWS
// =========================

function renderReviews(
    reviews
) {

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

                No reviews yet.

            </div>

        `;

        return;

    }

    container.innerHTML =
        reviews.map(review => {

            const safeComment =
                JSON.stringify(
                    review.comment || ""
                );

            return `

                <div class="product-review pb-4 mb-4 border-bottom">

                    <div class="d-flex justify-content-between">

                        <div class="media">

                            <img
                                class="rounded-circle"
                                width="50"
                                src="img/default-avatar.png">

                            <div class="media-body pl-3">

                                <h6 class="mb-1">

                                    ${
                review.userName ||
                "Anonymous User"
            }

                                </h6>

                                <small class="text-muted">

                                    ${formatDate(
                review.createdAt
            )}

                                </small>

                                <div class="mt-1">

                                    ${renderStars(
                review.rating
            )}

                                </div>

                            </div>

                        </div>

                    </div>

                    <p class="mt-3 mb-2">

                        ${
                review.comment ||
                ""
            }

                    </p>

                    ${renderReviewActions(
                review,
                safeComment
            )}

                </div>

            `;

        }).join("");

}

// =========================
// STARS
// =========================

function renderStars(
    rating
) {

    let html =
        `<div class="star-rating">`;

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html +=

            i <= rating

                ?

                `<i class="sr-star czi-star-filled active"></i>`

                :

                `<i class="sr-star czi-star"></i>`;

    }

    html +=
        `</div>`;

    return html;

}

// =========================
// PAGINATION
// =========================

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

    if (
        pageData.totalPages <= 1
    ) {

        return;

    }

    for (
        let i = 0;
        i < pageData.totalPages;
        i++
    ) {

        container.innerHTML += `

            <li class="page-item
                ${
            i === pageData.number
                ? "active"
                : ""
        }">

                <a
                    class="page-link"
                    href="#"
                    onclick="loadReviews(${i});return false;">

                    ${i + 1}

                </a>

            </li>

        `;

    }

}

// =========================
// SUBMIT REVIEW
// =========================

async function submitReview(e) {

    e.preventDefault();

    if (editingReviewId) {

        return updateReview();

    }

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
                Number(currentProductId),

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

        const existingReview =
            await findCurrentUserReview();

        if (existingReview) {

            editReview(
                existingReview.id,
                existingReview.rating,
                existingReview.comment || ""
            );

            alert(
                "Bạn đã đăng review cho sản phẩm này rồi. Đang mở chế độ chỉnh sửa."
            );

            return;

        }

        const response =
            await fetch(
                REVIEW_API,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(body)

                }
            );

        let result = {};

        try {

            result =
                await response.json();

        } catch (e) {

            result = {};

        }

        if (!response.ok) {

            const message =
                result.message ||
                "Review failed";

            const isDuplicateReview =
                response.status === 409 ||
                /already|exist|reviewed/i.test(message);


            if (isDuplicateReview) {

                const existingReview =
                    await findCurrentUserReview();

                if (existingReview) {

                    editReview(
                        existingReview.id,
                        existingReview.rating,
                        existingReview.comment || ""
                    );

                    alert(
                        "Bạn đã đăng review cho sản phẩm này rồi. Đang mở chế độ chỉnh sửa."
                    );

                } else {

                    alert(
                        "Bạn đã đăng review cho sản phẩm này rồi."
                    );

                }

                return;

            }

            alert(message);

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

// =========================
// REVIEW ACTIONS
// =========================

function renderReviewActions(
    review,
    safeComment
) {

    if (!reviewBelongsToCurrentUser(review)) {

        return "";

    }

    return `

<div class="mt-2">

    <button
        class="btn btn-sm btn-warning mr-2"
        onclick='editReview(
            ${review.id},
            ${review.rating},
            ${safeComment}
        )'>

        Edit

    </button>

    <button
        class="btn btn-sm btn-danger"
        onclick="deleteReview(${review.id})">

        Delete

    </button>

</div>

`;

}

// =========================
// EDIT REVIEW
// =========================

function editReview(
    id,
    rating,
    comment
) {


    editingReviewId = id;

    document.getElementById(
        "review-rating"
    ).value = rating;

    document.getElementById(
        "review-text"
    ).value = comment;

    document.getElementById(
        "submit-review-btn"
    ).textContent =
        "Update Review";

    document
        .getElementById(
            "cancel-edit-review"
        )
        .classList.remove(
        "d-none"
    );

    document
        .getElementById(
            "review-form"
        )
        .scrollIntoView({

            behavior:
                "smooth"

        });

}

// =========================
// UPDATE REVIEW
// =========================

async function updateReview() {

    try {

        const token =
            localStorage.getItem(
                "accessToken"
            );

        const body = {

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
                `${REVIEW_API}/${editingReviewId}`,
                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(body)

                }
            );

        if (!response.ok) {

            throw new Error();

        }

        alert(
            "Review updated successfully"
        );

        cancelEditReview();

        loadProductRating();

        loadReviews(
            currentReviewPage
        );

    } catch (e) {

        console.error(e);

        alert(
            "Update review failed"
        );

    }

}

// =========================
// CANCEL EDIT
// =========================

function cancelEditReview() {

    editingReviewId = null;

    document
        .getElementById(
            "review-form"
        )
        .reset();

    document
        .getElementById(
            "submit-review-btn"
        )
        .textContent =
        "Submit Review";

    document
        .getElementById(
            "cancel-edit-review"
        )
        .classList.add(
        "d-none"
    );

}

// =========================
// DELETE REVIEW
// =========================

async function deleteReview(
    id
) {

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

                    method:
                        "DELETE",

                    headers: {

                        Authorization:
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

// =========================
// FORMAT DATE
// =========================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }

    return new Date(
        dateString
    ).toLocaleDateString(
        "vi-VN",
        {

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"

        }
    );

}