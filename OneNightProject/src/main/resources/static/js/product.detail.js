document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProduct();

        document
            .getElementById("add-cart-form")
            .addEventListener(
                "submit",
                handleAddToCart
            );
    }
);

// =========================
// GET PRODUCT ID
// =========================

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}

// =========================
// LOAD PRODUCT
// =========================

async function loadProduct() {

    try {

        const productId =
            getProductId();

        const response =
            await fetch(
                `http://localhost:8081/api/v1/products/${productId}`
            );

        if (!response.ok) {

            throw new Error(
                "Cannot load product"
            );
        }

        const product =
            await response.json();

        renderProduct(product);

    } catch (error) {

        console.error(error);

        alert(
            "Cannot load product"
        );
    }
}

// =========================
// RENDER PRODUCT
// =========================

function renderProduct(product) {

    document.getElementById(
        "product-name"
    ).textContent =
        product.name;

    const priceElement =
        document.getElementById("product-price");

    const hasDiscount =
        product.discountPrice &&
        product.discountPrice < product.price;

    if (hasDiscount) {

        const discountPercent =
            calculateDiscount(
                product.price,
                product.discountPrice
            );

        priceElement.innerHTML = `
        <span class="h4 text-danger font-weight-bold">
            ${formatPrice(product.discountPrice)}
        </span>

        <br>

        <del class="text-muted">
            ${formatPrice(product.price)}
        </del>

        <span class="badge badge-danger ml-2">
            -${discountPercent}%
        </span>
    `;

    } else {

        priceElement.innerHTML = `
        <span class="h4 text-accent font-weight-bold">
            ${formatPrice(product.price)}
        </span>
    `;

    }

    document.getElementById(
        "product-stock"
    ).innerHTML =
        `<i class="czi-security-check"></i>
         Available (${product.stock})`;

    document.getElementById(
        "product-description"
    ).innerHTML =
        `<li>${product.description}</li>`;

    document.getElementById(
        "product-information"
    ).innerHTML =
        `
        <li>Product ID: ${product.id}</li>
        <li>Seller ID: ${product.sellerId}</li>
        <li>Status: ${product.status}</li>
        <li>Stock: ${product.stock}</li>
        `;

    renderQuantity(
        product.stock
    );
}

// =========================
// QUANTITY
// =========================

function renderQuantity(stock) {

    const select =
        document.getElementById(
            "product-quantity"
        );

    let html = "";

    for (
        let i = 1;
        i <= stock;
        i++
    ) {

        html += `
            <option value="${i}">
                ${i}
            </option>
        `;
    }

    select.innerHTML =
        html;
}

// =========================
// FORMAT PRICE
// =========================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + " ₫";
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

// =========================
// ADD TO CART
// =========================

async function handleAddToCart(event) {

    event.preventDefault();

    try {

        const productId =
            getProductId();

        const quantity =
            Number(
                document.getElementById(
                    "product-quantity"
                ).value
            );

        const response =
            await fetch(
                "http://localhost:8081/api/v1/carts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    },
                }
            );

        if (!response.ok) {

            throw new Error(
                "Add cart failed"
            );
        }

        const data =
            await response.json();

        handleCreateCartItem(
            data.id,
            productId,
            quantity
        );

        console.log(
            "Cart item created:",
            data
        );

        alert(
            "Added to cart successfully"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Add to cart failed"
        );
    }
}

async function handleCreateCartItem(
    cartId,
    productId,
    quantity
) {

    const request = {
        cartId,
        productId,
        quantity
    };

    const response = await fetch(
        "http://localhost:8081/api/v1/carts/items",
               {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
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