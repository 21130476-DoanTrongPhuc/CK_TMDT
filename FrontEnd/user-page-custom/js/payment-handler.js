document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "review-order-btn"
        ).addEventListener(
            "click",
            submitPaymentMethod
        );
    }
);

// =======================
// GET ORDER ID
// =======================

function getOrderId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("orderId");
}

// =======================
// SUBMIT PAYMENT
// =======================

async function submitPaymentMethod() {

    try {

        const selected =
            document.querySelector(
                'input[name="payment_method"]:checked'
            );

        if (!selected) {

            alert(
                "Vui lòng chọn phương thức thanh toán"
            );

            return;
        }

        const orderId =
            getOrderId();

        if (!orderId) {

            alert(
                "Không tìm thấy Order ID"
            );

            return;
        }

        // convert sang enum backend
        let paymentMethod;

        switch (selected.value) {

            case "cod":
                paymentMethod = "COD";
                break;

            case "momo":
                paymentMethod = "MOMO";
                break;

            case "zalopay":
                paymentMethod = "ZALOPAY";
                break;

            case "vnpay":
                paymentMethod = "VNPAY";
                break;

            default:
                throw new Error(
                    "Payment method invalid"
                );
        }

        const request = {
            paymentMethod
        };

        const response =
            await fetch(
                `http://localhost:8081/api/v1/payment?orderId=${orderId}`,
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

        console.log(response);

        if (!response.ok) {

            throw new Error(
                "Cannot create payment"
            );
        }

        const payment =
            await response.json();

        console.log(
            "Payment created:",
            payment
        );

        /*
        Response:

        {
            orderId: 1,
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            transactionId: null,
            amount: 0
        }
        */

        localStorage.setItem(
            "paymentInfo",
            JSON.stringify(payment)
        );

        window.location.href =
            `checkout-review.html?orderId=${orderId}`;

    } catch (error) {

        console.error(error);

        alert(
            "Không thể lưu phương thức thanh toán"
        );
    }
}