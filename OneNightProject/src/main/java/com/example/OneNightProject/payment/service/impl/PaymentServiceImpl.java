package com.example.OneNightProject.payment.service.impl;

import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.repository.CartItemRepository;
import com.example.OneNightProject.cart.repository.CartRepository;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.payment.config.VNPayConfig;
import com.example.OneNightProject.payment.dto.PaymentDTO;
import com.example.OneNightProject.payment.dto.PaymentRequest;
import com.example.OneNightProject.payment.dto.PaymentResponse;
import com.example.OneNightProject.payment.entity.Payment;
import com.example.OneNightProject.payment.enums.PaymentMethod;
import com.example.OneNightProject.payment.enums.PaymentStatus;
import com.example.OneNightProject.payment.enums.PaymentType;
import com.example.OneNightProject.payment.repository.PaymentRepository;
import com.example.OneNightProject.payment.util.PaymentCodeGenerator;
import com.example.OneNightProject.payment.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl {

    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final PaymentCodeGenerator paymentCodeGenerator;

    @Transactional
    public PaymentResponse createPayment(
            HttpServletRequest request,
            PaymentRequest paymentRequest
    ) {
        Long orderId = Long.parseLong(request.getParameter("orderId"));
        Order order = orderRepository.findById(orderId).orElseThrow(
                () -> new RuntimeException("Order not found"));

        Payment checkPaymentExist = paymentRepository.findByOrder(order.getId());

        if (checkPaymentExist == null) {

            checkPaymentExist = Payment.builder()
                    .order(order)
                    .paymentCode(paymentCodeGenerator.generate())
                    .method(paymentRequest.getPaymentMethod())
                    .status(PaymentStatus.PENDING)
                    .transactionId(null)
                    .amount(BigDecimal.ZERO)
                    .build();

            order.setPaymentStatus(PaymentStatusOrder.UNPAID);

            order.setStatus(OrderStatus.PENDING);

            orderRepository.save(order);

        } else {

            checkPaymentExist.setMethod(paymentRequest.getPaymentMethod());

        }

        paymentRepository.save(checkPaymentExist);

        PaymentResponse response = new PaymentResponse();

        response.setOrderId(order.getId());

        response.setPaymentMethod(checkPaymentExist.getMethod());

        response.setPaymentStatus(checkPaymentExist.getStatus());

        response.setTransactionId(checkPaymentExist.getTransactionId());

        response.setAmount(checkPaymentExist.getAmount());

        return response;
    }

    @Transactional
    public PaymentDTO.VNPayResponse createVnPayPayment(
            HttpServletRequest request
    ) {

        Long orderId = Long.parseLong(
                request.getParameter("orderId")
        );

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order.getId());

        boolean isCustomized =
                order.getOrderItems()
                        .stream()
                        .anyMatch(OrderItem::isCustomized);

        BigDecimal amountToPay;

        /*
         * Custom + COD
         * => đặt cọc 30%
         */
        if (isCustomized
                && payment.getMethod() == PaymentMethod.COD) {

            BigDecimal customAmount =
                    calculateCustomAmount(
                            order.getOrderItems()
                    );

            amountToPay = customAmount.multiply(
                    BigDecimal.valueOf(0.6)
            );

        } else {

            /*
             * Thanh toán toàn bộ
             */
            amountToPay = order.getTotalPrice();
        }

        payment.setAmount(amountToPay);

        paymentRepository.save(payment);

        String bankCode =
                request.getParameter("bankCode");

        Map<String, String> vnpParamsMap =
                vnPayConfig.getVNPayConfig();

        /*
         * VNPay dùng amount * 100
         */
        String vnpAmount =
                amountToPay.multiply(
                                BigDecimal.valueOf(100)
                        )
                        .toBigInteger()
                        .toString();

        vnpParamsMap.put(
                "vnp_Amount",
                vnpAmount
        );

        /*
         * TxnRef phải unique
         */
        String txnRef =
                payment.getId()
                        + "_"
                        + System.currentTimeMillis();

        vnpParamsMap.put(
                "vnp_TxnRef",
                txnRef
        );

        if (bankCode != null
                && !bankCode.isBlank()) {

            vnpParamsMap.put(
                    "vnp_BankCode",
                    bankCode
            );
        }

        vnpParamsMap.put(
                "vnp_IpAddr",
                VNPayUtil.getIpAddress(request)
        );

        String queryUrl =
                VNPayUtil.getPaymentURL(
                        vnpParamsMap,
                        true
                );

        String hashData =
                VNPayUtil.getPaymentURL(
                        vnpParamsMap,
                        false
                );

        String secureHash =
                VNPayUtil.hmacSHA512(
                        vnPayConfig.getSecretKey(),
                        hashData
                );

        queryUrl +=
                "&vnp_SecureHash="
                        + secureHash;

        String paymentUrl =
                vnPayConfig.getVnp_PayUrl()
                        + "?"
                        + queryUrl;

        return PaymentDTO.VNPayResponse.builder()
                .code("00")
                .message("Success")
                .paymentUrl(paymentUrl)
                .build();
    }

    private BigDecimal calculateCustomAmount(
            List<OrderItem> orderItems
    ) {

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItem item : orderItems) {

            if (!item.isCustomized()) {
                continue;
            }

            BigDecimal customPrice =
                    item.getPriceCustomProduct() == null
                            ? BigDecimal.ZERO
                            : item.getPriceCustomProduct();

            total = total.add(
                    customPrice.multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    )
            );
        }

        return total;
    }


    @Transactional
    public void callBackHandler(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        String responseCode =
                request.getParameter(
                        "vnp_ResponseCode"
                );

        /*
         * VD:
         * 15_1780650289670
         */
        String txnRef =
                request.getParameter(
                        "vnp_TxnRef"
                );

        Long paymentId =
                Long.parseLong(
                        txnRef.split("_")[0]
                );

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                ));

        Order order =
                payment.getOrder();

        /*
         * Thanh toán thành công
         */
        if ("00".equals(responseCode)) {

            payment.setStatus(
                    PaymentStatus.SUCCESS
            );

            payment.setPaidAt(
                    LocalDateTime.now()
            );

            boolean isCustomized =
                    order.getOrderItems()
                            .stream()
                            .anyMatch(OrderItem::isCustomized);

            /*
             * Custom + COD
             * => thanh toán cọc
             */
            if (isCustomized
                    && payment.getMethod() == PaymentMethod.COD) {

                order.setPaidAmount(
                        payment.getAmount()
                );

                order.setRemainingAmount(
                        order.getTotalPrice()
                                .subtract(
                                        payment.getAmount()
                                )
                );

                order.setPaymentStatus(
                        PaymentStatusOrder.PARTIALLY_PAID
                );

                order.setStatus(
                        OrderStatus.CONFIRMED
                );

            } else {

                /*
                 * Thanh toán full
                 */
                order.setPaidAmount(
                        order.getTotalPrice()
                );

                order.setRemainingAmount(
                        BigDecimal.ZERO
                );

                order.setPaymentStatus(
                        PaymentStatusOrder.PAID
                );

                order.setStatus(
                        OrderStatus.CONFIRMED
                );
            }

            paymentRepository.save(payment);
            orderRepository.save(order);

            /*
             * Xóa cart
             */
            Cart cart =
                    cartRepository.findByUserId(
                            order.getUser().getId()
                    ).orElseThrow();

            if (cart != null) {

                cart.getCartItems().clear();

                cartRepository.save(cart);
            }

            response.sendRedirect(
                    "http://localhost:5500/checkout-complete.html?orderId="
                            + order.getId()
            );

            return;
        }

        /*
         * Thanh toán thất bại
         */
        payment.setStatus(
                PaymentStatus.FAIL
        );

        order.setPaymentStatus(
                PaymentStatusOrder.UNPAID
        );

        order.setStatus(
                OrderStatus.PENDING
        );

        paymentRepository.save(payment);
        orderRepository.save(order);

        response.sendRedirect(
                "http://localhost:5500/payment-failed.html?orderId="
                        + order.getId()
                        + "&errorCode="
                        + responseCode
        );
    }

    public PaymentResponse getPayment(
            PaymentRequest request
    ) {

        Order order = orderRepository.findById(
                request.getOrderId()
        ).orElseThrow(
                () -> new RuntimeException("Order not found")
        );

        Payment payment = paymentRepository
                .findByOrder(order.getId());

        PaymentResponse response =
                new PaymentResponse();

        response.setOrderId(
                order.getId()
        );

        response.setPaymentMethod(
                payment.getMethod()
        );

        response.setPaymentStatus(
                payment.getStatus()
        );

        response.setTransactionId(
                payment.getTransactionId()
        );

        response.setAmount(
                payment.getAmount()
        );

        return response;
    }

    @Transactional
    public PaymentResponse confirmCOD(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        boolean isCustomized =
                order.getOrderItems()
                        .stream()
                        .anyMatch(OrderItem::isCustomized);

        /*
         * Không cho COD nếu có custom
         */
        if (isCustomized) {
            throw new RuntimeException(
                    "Customized orders cannot use COD"
            );
        }

        Payment payment = paymentRepository
                .findByOrder(order.getId());

        /*
         * Bắt buộc phương thức phải là COD
         */
        if (payment.getMethod() != PaymentMethod.COD) {
            throw new RuntimeException(
                    "Payment method is not COD"
            );
        }

        /*
         * COD => chưa thanh toán
         */
        payment.setStatus(
                PaymentStatus.PENDING
        );

        payment.setAmount(
                order.getTotalPrice()
        );

        paymentRepository.save(payment);

        /*
         * Đơn được xác nhận để shop xử lý
         */
        order.setStatus(
                OrderStatus.CONFIRMED
        );

        order.setPaymentStatus(
                PaymentStatusOrder.UNPAID
        );

        order.setPaidAmount(
                BigDecimal.ZERO
        );

        order.setRemainingAmount(
                order.getTotalPrice()
        );

        orderRepository.save(order);

        /*
         * Xóa giỏ hàng
         */
        Cart cart = cartRepository.findByUserId(
                order.getUser().getId()).orElseThrow();

        if (cart != null) {

            cart.getCartItems().clear();

            cartRepository.save(cart);
        }

        return getPaymentResponse(payment, order);
    }

    private static PaymentResponse getPaymentResponse(Payment payment, Order order) {
        PaymentResponse response = new PaymentResponse();

        response.setId(payment.getId());
        response.setOrderId(order.getId());
        response.setPaymentMethod(payment.getMethod());
        response.setPaymentStatus(payment.getStatus());
        response.setCustomized(
                order.getOrderItems()
                        .stream()
                        .anyMatch(OrderItem::isCustomized)
        );
        response.setTransactionId(
                payment.getTransactionId()
        );
        response.setAmount(order.getTotalPrice());
        response.setOrderStatus(order.getStatus());
        response.setOrderPaymentStatus(order.getPaymentStatus());
        response.setAmount(order.getTotalPrice());
        return response;
    }

    @Transactional
    public PaymentResponse completeCODPayment(
            Long orderId
    ) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        Payment payment = paymentRepository
                .findByOrder(order.getId());

        /*
         * Chỉ áp dụng cho COD
         */
        if (payment.getMethod() != PaymentMethod.COD) {

            throw new RuntimeException(
                    "This order is not COD"
            );
        }

        /*
         * Tránh xác nhận nhiều lần
         */
        if (payment.getStatus() == PaymentStatus.SUCCESS) {

            throw new RuntimeException(
                    "COD payment already completed"
            );
        }

        /*
         * Payment
         */
        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        payment.setAmount(
                order.getTotalPrice()
        );

        /*
         * Order
         */
        order.setPaidAmount(
                order.getTotalPrice()
        );

        order.setRemainingAmount(
                BigDecimal.ZERO
        );

        order.setPaymentStatus(
                PaymentStatusOrder.PAID
        );

        order.setStatus(
                OrderStatus.COMPLETED
        );

        paymentRepository.save(payment);
        orderRepository.save(order);

        PaymentResponse response =
                new PaymentResponse();

        response.setOrderId(
                order.getId()
        );

        response.setPaymentMethod(
                payment.getMethod()
        );

        response.setPaymentStatus(
                payment.getStatus()
        );

        response.setTransactionId(
                payment.getTransactionId()
        );

        response.setAmount(
                payment.getAmount()
        );

        return response;
    }
}
