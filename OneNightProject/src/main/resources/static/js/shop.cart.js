document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCart();

        document
            .getElementById(
                "update-cart-btn"
            )
            ?.addEventListener(
                "click",
                updateCart
            );
    }
);

// ======================
// LOAD CART
// ======================

async function loadCart() {

    try {

        const response =
            await fetch(
                "http://localhost:8081/api/v1/carts",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Cannot load cart"
            );
        }

        const cart =
            await response.json();

        renderCart(cart);

    } catch (error) {

        console.error(error);

        alert(
            "Cannot load cart"
        );
    }
}

// ======================
// RENDER CART
// ======================

function renderCart(cart) {

    const container =
        document.getElementById(
            "cart-items"
        );

    let html = "";

    cart.cartItems.forEach(
        item => {

            const product =
                item.product;

            const imageUrl =
                product.productImage
                    ? product.productImage.image_url
                    : "img/no-image.png";

            html += `
                <div
                    class="d-sm-flex justify-content-between align-items-center my-4 pb-3 border-bottom">

                    <div
                        class="media media-ie-fix d-block d-sm-flex align-items-center text-center text-sm-left">

                        <a
                            class="d-inline-block mx-auto mr-sm-4"
                            href="shop-single-v1.html?id=${product.id}"
                            style="width: 10rem;">

                            <img
                                src="${imageUrl}"
                                alt="${product.name}">
                        </a>

                        <div class="media-body pt-2">

                            <h3
                                class="product-title font-size-base mb-2">

                                <a href="shop-single-v1.html?id=${product.id}">
                                    ${product.name}
                                </a>

                            </h3>

                            <div class="font-size-sm">
                                <span class="text-muted mr-2">
                                    Product ID:
                                </span>

                                ${product.id}
                            </div>

                            <div class="font-size-sm">
                                <span class="text-muted mr-2">
                                    Stock:
                                </span>

                                ${product.stock}
                            </div>

                            <div class="font-size-lg text-accent pt-2">
                                ${formatPrice(product.price)}
                            </div>

                            ${
                                item.customized
                                    ? `
                                        <span class="badge badge-info">
                                            Customized
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    </div>

                    <div
                        class="pt-2 pt-sm-0 pl-sm-3 mx-auto mx-sm-0 text-center text-sm-left"
                        style="max-width: 9rem;">

                        <div class="form-group mb-0">

                            <label class="font-weight-medium">
                                Quantity
                            </label>

                           <input
                                class="form-control quantity-input"
                                type="number"
                                min="1"
                                max="${product.stock}"
                                value="${item.quantity}"
                                data-cart-item-id="${item.id}"
                                data-price="${product.price}"
                                oninput="updateSubtotal()">

                        </div>

                        <button
                            class="btn btn-link px-0 text-danger"
                            type="button"
                            onclick="removeCartItem(${item.id})">

                            <i class="czi-close-circle mr-2"></i>

                            <span class="font-size-sm">
                                Remove
                            </span>

                        </button>

                    </div>

                </div>
            `;
        }
    );


    container.innerHTML =
        html;

    updateSubtotal();
}

function updateSubtotal() {

    let subtotal = 0;

    document
        .querySelectorAll(".quantity-input")
        .forEach(input => {

            const price =
                Number(
                    input.dataset.price
                );

            const quantity =
                Number(
                    input.value
                );

            subtotal +=
                price * quantity;
        });

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );

    if (subtotalElement) {

        subtotalElement
            .querySelector("h3")
            .textContent =
            formatPrice(
                subtotal
            );
    }
}

// ======================
// UPDATE QUANTITY
// ======================
async function updateCart() {

    try {

        const inputs =
            document.querySelectorAll(
                ".quantity-input"
            );

        for (const input of inputs) {

            const cartItemId =
                input.dataset.cartItemId;

            const quantity =
                Number(
                    input.value
                );

            const response =
                await fetch(
                    `http://localhost:8081/api/v1/carts/items/${cartItemId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${localStorage.getItem("accessToken")}`
                        },
                        body: JSON.stringify({
                            quantity
                        })
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Update failed"
                );
            }
        }

        alert(
            "Cart updated successfully"
        );

        loadCart();

    } catch (error) {

        console.error(error);

        alert(
            "Cannot update cart"
        );
    }
}

// ======================
// REMOVE CART ITEM
// ======================

async function removeCartItem(
    cartItemId
) {

    const confirmed =
        confirm(
            "Remove this item?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `http://localhost:8081/api/v1/carts/items/${cartItemId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
            );

        console.log(response);

        if (!response.ok) {
            throw new Error(
                "Delete failed"
            );
        }

        loadCart();

    } catch (error) {

        console.error(error);

        alert(
            "Cannot remove item"
        );
    }
}

// ======================
// FORMAT PRICE
// ======================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + " ₫";
}