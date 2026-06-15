document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById("create-order-btn")
            .addEventListener(
                "click",
                createOrder
            );
    }
);

// =====================
// CREATE ORDER
// =====================

async function createOrder() {

    try {

        const fullName =
            document
                .getElementById("checkout-fn")
                .value
                .trim();

        const phoneNumber =
            document
                .getElementById("checkout-phone")
                .value
                .trim();

        const shippingAddress =
            document
                .getElementById("checkout-address")
                .value
                .trim();

        const sameAddress =
            document
                .getElementById("same-address")
                .checked;

        // Validate

        if (
            !fullName ||
            !phoneNumber ||
            !shippingAddress
        ) {

            alert(
                "Please fill all required fields"
            );

            return;
        }

        const request = {

            fullName,
            phoneNumber,
            shippingAddress
        };


        const response =
            await fetch(
                "http://localhost:8081/api/v1/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${localStorage.getItem("accessToken")}`
                    },

                    body:
                        JSON.stringify(
                            request
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Create order failed"
            );
        }

        const order =
            await response.json();

        console.log(
            "Order created:",
            order
        );

        alert(
            "Order created successfully"
        );

        // chuyển sang trang thanh toán
        window.location.href =
            `checkout-payment.html?orderId=${order.id}`;

    } catch (error) {

        console.error(error);

        alert(
            "Cannot create order"
        );
    }
}
