async function loadCart() {

    const token = localStorage.getItem("accessToken");

    if (!token) {

        renderEmptyCart();

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8081/api/v1/carts",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Cannot load cart");
        }

        const data = await response.json();

        renderCart(data);

    } catch (error) {

        console.error("Load cart error:", error);

        renderEmptyCart();
    }

}

function renderCart(cart) {

    const container = document.getElementById("cart-items");

    const subtotal = document.getElementById("cart-subtotal");

    const count = document.getElementById("number-cart-item");

    const cartPrice = document.getElementById("out-cart-price");

    if (!container || !subtotal || !count || !cartPrice) {
        return;
    }

    // Hiển thị số lượng
    count.textContent = cart.totalItems;

    // Hiển thị subtotal trong dropdown
    subtotal.textContent = formatPrice(cart.totalPrice);

    // Hiển thị giá ngoài navbar
    cartPrice.innerHTML = `
        <small>My Cart</small>
        ${formatPrice(cart.totalPrice)}
    `;

    // Render danh sách sản phẩm
    container.innerHTML = cart.cartItems.map(item => {

        const product = item.product;

        const image =
            product.images && product.images.length > 0
                ? product.images[0].image_url
                : "img/shop/cart/widget/04.jpg";

        return `
            <div class="widget-cart-item pb-2 border-bottom">

                <div class="media align-items-center">

                    <a class="d-block mr-2"
                       href="shop-single-v1.html?id=${product.id}">

                        <img
                            width="64"
                            src="${image}"
                            alt="${product.name}">

                    </a>

                    <div class="media-body">

                        <h6 class="widget-product-title">

                            <a href="shop-single-v1.html?id=${product.id}">
                                ${product.name}
                            </a>

                        </h6>

                        <div class="widget-product-meta">

                            <span class="text-accent">

                                ${formatPrice(item.itemTotal)}

                            </span>

                            <span class="text-muted">

                                × ${item.quantity}

                            </span>

                        </div>

                    </div>

                </div>

            </div>
        `;

    }).join("");

}

function renderEmptyCart() {

    const priceOutCart = document.getElementById(" out-cart-price");

    const container = document.getElementById("cart-items");

    const subtotal = document.getElementById("cart-subtotal");

    const count = document.getElementById("number-cart-item");

    if (container) {

        container.innerHTML = `
            <div class="text-center py-4 text-muted">

                Your cart is empty

            </div>
          
        `;
    }

    if (subtotal) {

        subtotal.textContent = "0₫";
    }

    if (count) {

        count.textContent = "0";
    }

}

function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN").format(price) + "₫";

}

loadCart();

/*
async function removeCartItem(id) {

    try {

        await fetch(
            `http://localhost:8081/api/v1/carts/items/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        );

        loadCart();

    } catch (error) {

        console.error(error);

    }

}
*/