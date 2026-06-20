const ORDER_DETAIL_API = "http://localhost:8081/api/v1/orders";

const ORDER_API = "http://localhost:8081/api/v1/orders/my-orders";

let currentPage = 0;
let pageSize = 10;

let currentFilter = {
    status: null,
    paymentStatus: null,
    fromDate: null,
    toDate: null
};

document.addEventListener("DOMContentLoaded", () => {

    loadOrders(0);

    document
        .getElementById("order-sort")
        .addEventListener("change", handleStatusFilter);

});

async function loadOrders(page = 0) {

    try {

        const token =
            localStorage.getItem("accessToken");

        const response = await fetch(
            `${ORDER_API}?page=${page}&size=${pageSize}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(currentFilter)
            }
        );

        console.log(response);

        if (!response.ok) {
            throw new Error("Cannot load orders");
        }

        const pageData =
            await response.json();

        renderOrders(pageData.content);

        renderPagination(pageData);

        currentPage = page;

    } catch (error) {

        console.error(error);

        document.getElementById("order-list").innerHTML =
            `
            <tr>
                <td colspan="5" class="text-center">
                    Cannot load orders
                </td>
            </tr>
            `;
    }
}

function renderOrders(orders) {

    const tbody =
        document.getElementById("order-list");

    if (!orders || orders.length === 0) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="5" class="text-center">
                    No orders found
                </td>
            </tr>
            `;

        return;
    }

    tbody.innerHTML = orders.map(order => `

        <tr>
            
             <td class="py-3">
                ${order.orderCode}
            </td>
            
            <td class="py-3">
                ${formatDate(order.createdAt)}
            </td>

            <td class="py-3">
                ${renderStatusBadge(order.status)}
            </td>

            <td class="py-3">
                ${formatCurrency(order.totalPrice)}
            </td>

            <td class="py-3">

                <button
                    class="btn btn-primary btn-sm"
                    onclick="viewOrderDetail(${order.id})">

                    Detail

                </button>

            </td>

        </tr>

    `).join("");
}

function renderStatusBadge(status) {

    const map = {

        PENDING:
            {
                text: "Pending",
                class: "badge-warning"
            },

        CONFIRMED:
            {
                text: "Confirmed",
                class: "badge-info"
            },

        SHIPPING:
            {
                text: "Shipping",
                class: "badge-primary"
            },

        DELIVERED:
            {
                text: "Delivered",
                class: "badge-success"
            },

        CANCELLED:
            {
                text: "Cancelled",
                class: "badge-danger"
            }
    };

    const item =
        map[status] ||
        {
            text: status,
            class: "badge-secondary"
        };

    return `
        <span class="badge ${item.class} m-0">
            ${item.text}
        </span>
    `;
}

function renderPagination(pageData) {

    const pageContainer =
        document.getElementById("page-pagination");

    const prevContainer =
        document.getElementById("prev-pagination");

    const nextContainer =
        document.getElementById("next-pagination");

    pageContainer.innerHTML = "";

    for(let i = 0; i < pageData.totalPages; i++) {

        pageContainer.innerHTML += `
            <li class="page-item ${i === pageData.number ? 'active' : ''}">
                <a
                    class="page-link"
                    href="#"
                    onclick="loadOrders(${i})">

                    ${i + 1}

                </a>
            </li>
        `;
    }

    prevContainer.innerHTML = `
        <li class="page-item ${pageData.first ? 'disabled' : ''}">
            <a
                class="page-link"
                href="#"
                onclick="loadOrders(${pageData.number - 1})">

                <i class="czi-arrow-left mr-2"></i>
                Prev

            </a>
        </li>
    `;

    nextContainer.innerHTML = `
        <li class="page-item ${pageData.last ? 'disabled' : ''}">
            <a
                class="page-link"
                href="#"
                onclick="loadOrders(${pageData.number + 1})">

                Next

                <i class="czi-arrow-right ml-2"></i>

            </a>
        </li>
    `;
}

function handleStatusFilter() {

    const status =
        document.getElementById("order-sort").value;

    currentFilter.status =
        status || null;

    loadOrders(0);
}

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function formatCurrency(value) {

    return Number(value)
        .toLocaleString(
            "vi-VN",
            {
                style: "currency",
                currency: "VND"
            }
        );
}

/* Order Detail  */

async function viewOrderDetail(orderId) {

    try {

        const token =
            localStorage.getItem("accessToken");

        const response =
            await fetch(
                `${ORDER_DETAIL_API}/${orderId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {
            throw new Error("Cannot load order detail");
        }

        const order =
            await response.json();

        renderOrderDetail(order);

        $("#order-details").modal("show");

    } catch (error) {

        console.error(error);

        alert("Cannot load order detail");
    }
}

function renderOrderDetail(order) {

    document.getElementById(
        "order-detail-title"
    ).innerHTML =
        `Order No - ${order.orderCode}`;

    renderOrderItems(order.items);

    renderOrderFooter(order);
}

function renderOrderItems(items) {

    const container =
        document.getElementById(
            "order-detail-items"
        );

    if (!items || items.length === 0) {

        container.innerHTML =
            `
            <div class="text-center py-4">
                No products found
            </div>
            `;

        return;
    }

    container.innerHTML =
        items.map(item => {

            const subtotal =
                item.price * item.quantity;

            return `

            <div
                class="d-sm-flex justify-content-between mb-4 pb-3 border-bottom">

                <div
                    class="media d-block d-sm-flex text-center text-sm-left">

                    <a
                        class="d-inline-block mx-auto mr-sm-4"
                        href="#"
                        style="width:10rem;">

                        <img
                            src="${item.customImage || 'img/no-image.png'}"
                            alt="Product">

                    </a>

                    <div class="media-body pt-2">

                        <h3
                            class="product-title font-size-base mb-2">

                            ${item.productName || `Product #${item.productId}`}

                            ${item.customized
                ? `
                                <span
                                    class="badge badge-warning ml-2">
                                    Custom Product
                                </span>
                                `
                : ""
            }

                        </h3>

                        <div class="font-size-sm">
                            Product ID:
                            ${item.productId}
                        </div>

                        <div class="font-size-lg text-accent pt-2">
                            ${formatCurrency(item.price)}
                        </div>

                        ${
                item.customized
                    ? renderCustomization(item)
                    : ""
            }

                    </div>

                </div>

                <div
                    class="pt-2 pl-sm-3 mx-auto mx-sm-0 text-center">

                    <div class="text-muted mb-2">
                        Quantity
                    </div>

                    ${item.quantity}

                </div>

                <div
                    class="pt-2 pl-sm-3 mx-auto mx-sm-0 text-center">

                    <div class="text-muted mb-2">
                        Subtotal
                    </div>

                    ${formatCurrency(subtotal)}

                </div>

            </div>

            `;

        }).join("");
}

function renderCustomization(item) {

    return `

        <button
            class="btn btn-outline-primary btn-sm mt-2"
            type="button"
            data-toggle="collapse"
            data-target="#custom-${item.id}">

            View Custom Detail

        </button>

        <div
            class="collapse mt-3"
            id="custom-${item.id}">

            <div
                class="card card-body bg-light border">

                <div class="mb-2">

                    <strong>Custom Text:</strong>

                    ${item.customText || "-"}

                </div>

                <div class="mb-2">

                    <strong>Customer Note:</strong>

                    ${item.customNote || "-"}

                </div>

                ${
        item.customImage
            ? `
                    <div>

                        <strong>Custom Image:</strong>

                        <div class="mt-2">

                            <img
                                src="${item.customImage}"
                                class="img-fluid rounded">

                        </div>

                    </div>
                    `
            : ""
    }

            </div>

        </div>

    `;
}

function renderOrderFooter(order) {

    document.getElementById(
        "order-detail-footer"
    ).innerHTML = `

        <div class="px-2 py-1">

            <span class="text-muted">
                Status:
            </span>

            <span>
                ${order.status}
            </span>

        </div>

        <div class="px-2 py-1">

            <span class="text-muted">
                Payment:
            </span>

            <span>
                ${order.paymentStatus}
            </span>

        </div>

        <div class="px-2 py-1">

            <span class="text-muted">
                Paid:
            </span>

            <span>
                ${formatCurrency(order.paidAmount)}
            </span>

        </div>

        <div class="px-2 py-1">

            <span class="text-muted">
                Remaining:
            </span>

            <span>
                ${formatCurrency(order.remainingAmount)}
            </span>

        </div>

        <div class="px-2 py-1">

            <span class="text-muted">
                Total:
            </span>

            <span class="font-size-lg">

                ${formatCurrency(order.totalPrice)}

            </span>

        </div>

    `;
}

document
    .getElementById("btn-search")
    .addEventListener("click", () => {

        currentFilter = {

            status:
                document.getElementById("order-sort").value || null,

            paymentStatus:
                document.getElementById("payment-status").value || null,

            fromDate:
                document.getElementById("from-date").value
                    ? document.getElementById("from-date").value + "T00:00:00"
                    : null,

            toDate:
                document.getElementById("to-date").value
                    ? document.getElementById("to-date").value + "T23:59:59"
                    : null
        };

        loadOrders(0);
    });