document.addEventListener(
    "DOMContentLoaded",
    () => {

        const completeBtn =
            document.getElementById(
                "complete-order-btn"
            );

        if (completeBtn) {

            completeBtn.addEventListener(
                "click",
                completeOrder
            );
        }
    }
);

// ======================
// GET ORDER ID
// ======================

function getOrderId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "orderId"
    );
}

// ======================
// CREATE VNPAY URL
// ======================

async function createVNPayPayment(
    orderId
) {

    const response =
        await fetch(
            `http://localhost:8081/api/v1/payment/vn-pay?orderId=${orderId}&bankCode=NCB`,
            {
                method: "GET"
            }
        );

    if (!response.ok) {

        throw new Error(
            "Cannot create VNPay payment"
        );
    }

    const result =
        await response.json();

    if (
        !result.data ||
        !result.data.paymentUrl
    ) {

        throw new Error(
            "VNPay URL not found"
        );
    }

    return result.data.paymentUrl;
}

// ======================
// COMPLETE ORDER
// ======================

async function completeOrder() {

    const button =
        document.getElementById(
            "complete-order-btn"
        );

    try {

        if (button) {

            button.disabled = true;
        }

        const orderId =
            getOrderId();

        if (!orderId) {

            alert(
                "Không tìm thấy đơn hàng"
            );

            return;
        }

        // ======================
        // GET PAYMENT
        // ======================

        const paymentResponse =
            await fetch(
                "http://localhost:8081/api/v1/payment/get",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        orderId:
                            Number(orderId)
                    })
                }
            );

        console.log(paymentResponse);

        if (!paymentResponse.ok) {

            throw new Error(
                "Cannot load payment"
            );
        }

        const payment =
            await paymentResponse.json();

        console.log(
            "Payment:",
            payment
        );

        // ======================
        // CHECK CUSTOMIZED
        // ======================

        const customResponse =
            await fetch(
                `http://localhost:8081/api/v1/payment/${orderId}/customized`
            );

    

        if (!customResponse.ok) {

            throw new Error(
                "Cannot check customized order"
            );
        }

        const isCustomized =
            await customResponse.json();

        console.log(
            "Customized:",
            isCustomized
        );

        // ======================
        // COD
        // ======================

        if (
            payment.paymentMethod ===
            "COD"
        ) {

            // ------------------
            // CUSTOM + COD
            // ------------------

            if (isCustomized) {

                const confirmed =
                    confirm(
                        "Đơn hàng của bạn có sản phẩm tùy chỉnh.\n\n" +
                        "Bạn cần thanh toán trước 30% giá trị sản phẩm tùy chỉnh để bắt đầu sản xuất.\n\n" +
                        "Nhấn OK để chuyển sang VNPay."
                    );

                if (!confirmed) {

                    return;
                }

                const paymentUrl =
                    await createVNPayPayment(
                        orderId
                    );

                window.location.href =
                    paymentUrl;

                return;
            }

            // ------------------
            // NORMAL COD
            // ------------------

            const codResponse =
                await fetch(
                    `http://localhost:8081/api/v1/payment/cod/${orderId}`,
                    {
                        method: "POST"
                    }
                );

            console.log(codResponse);

            if (!codResponse.ok) {

                throw new Error(
                    "COD payment failed"
                );
            }

            alert(
                "Đặt hàng COD thành công"
            );

            window.location.href =
                `checkout-complete.html`;

            return;
        }

        // ======================
        // ONLINE PAYMENT
        // ======================

        const paymentUrl =
            await createVNPayPayment(
                orderId
            );

        window.location.href =
            paymentUrl;

    }
    catch (error) {

        console.error(
            error
        );

        alert(
            error.message ||
            "Không thể hoàn tất thanh toán"
        );
    }
    finally {

        if (button) {

            button.disabled = false;
        }
    }
}