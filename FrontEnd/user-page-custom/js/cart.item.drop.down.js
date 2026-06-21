async function loadCart() {

    try {

        const response = await fetch(
            "http://localhost:8081/api/v1/carts",
            {
                method:"GET",
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        );

        const data = await response.json();

        renderCart(data.cartItems);
        renderCartItemCount(data.cartItems.length);

    } catch (error) {

        console.error(error);
    }
}


function renderCartItemCount(count) {
    document.getElementById("number-cart-item").textContent = count;
}

function renderCart(cartItems) {

    const container =
        document.getElementById("cart-items");

    let subtotal = 0;

    container.innerHTML = cartItems.map(item => {

        subtotal += item.priceCustomProduct * item.quantity;

        const customInfo = item.customized && item.customization
            ? `
                <div class="text-muted font-size-xs">
                    Custom: ${item.customization.custom_text}
                </div>
              `
            : "";

        return `
            <div class="widget-cart-item py-2 border-bottom">

                <button
                    class="close text-danger"
                    type="button"
                    onclick="removeCartItem(${item.id})">

                    <span>&times;</span>

                </button>

                <div class="media align-items-center">

                    <a
                        class="d-block mr-2"
                        href="#">

                        <img
                            width="64"
                            src="img/shop/cart/widget/04.jpg"
                            alt="Product">

                    </a>

                    <div class="media-body">

                        <h6 class="widget-product-title">

                            <a href="#">

                                Product #${item.id}

                            </a>

                        </h6>

                        ${customInfo}

                        <div class="widget-product-meta">

                            <span class="text-accent mr-2">

                                ${formatPrice(item.priceCustomProduct)}

                            </span>

                            <span class="text-muted">

                                x ${item.quantity}

                            </span>

                        </div>

                    </div>

                </div>

            </div>
        `;

    }).join("");

    document.getElementById("cart-subtotal").textContent =
        formatPrice(subtotal);
}

function formatPrice(price) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + "₫";
}

loadCart();

// async function removeCartItem(id) {

//     try {

//         await fetch(
//             `http://localhost:8081/api/v1/cart/items/${id}`,
//             {
//                 method: "DELETE",
//                 headers: {
//                     Authorization:
//                         `Bearer ${localStorage.getItem("accessToken")}`
//                 }
//             }
//         );

//         loadCart();

//     } catch (error) {

//         console.error(error);
//     }
// }