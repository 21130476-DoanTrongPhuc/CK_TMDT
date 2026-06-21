const CART_API =
    "http://localhost:8081/api/v1/carts";

async function addToCart(
    productId
) {

    try {

        const cartId =
            await createCart();

        await createCartItem(
            cartId,
            productId
        );

        if (
            typeof loadCart ===
            "function"
        ) {

            loadCart();
        }

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

async function createCart() {

    const response =
        await fetch(
            CART_API,
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
            "Cannot create cart"
        );
    }

    const data =
        await response.json();

    return data.id;
}

async function createCartItem(
    cartId,
    productId
) {

    const request = {
        cartId,
        productId,
        quantity: 1
    };

    const response =
        await fetch(
            `${CART_API}/items`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(
                    request
                )
            }
        );

    if (!response.ok) {

        throw new Error(
            "Cannot create cart item"
        );
    }

    return await response.json();
}