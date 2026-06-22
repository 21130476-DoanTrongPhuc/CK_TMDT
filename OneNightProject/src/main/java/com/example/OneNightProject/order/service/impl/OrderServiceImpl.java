package com.example.OneNightProject.order.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.cart.entity.Cart;
import com.example.OneNightProject.cart.entity.CartItem;
import com.example.OneNightProject.cart.repository.CartItemRepository;
import com.example.OneNightProject.cart.repository.CartRepository;
import com.example.OneNightProject.order.dto.request.OrderFilterRequest;
import com.example.OneNightProject.order.dto.request.OrderRequest;
import com.example.OneNightProject.order.dto.response.OrderDetailResponse;
import com.example.OneNightProject.order.dto.response.OrderListResponse;
import com.example.OneNightProject.order.dto.response.OrderResponse;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.enums.PaymentStatusOrder;
import com.example.OneNightProject.order.mapper.OrderMapper;
import com.example.OneNightProject.order.repository.OrderItemRepository;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.order.service.OrderService;
import com.example.OneNightProject.order.specification.OrderSpecification;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.user.entity.ShippingAddress;
import com.example.OneNightProject.user.entity.UserProfile;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerProfileRepository;
import com.example.OneNightProject.user.repository.CustomerRepository;
import com.example.OneNightProject.user.repository.ShippingAddressRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final JwtService jwtService;

    @Override
    public OrderResponse create(String authHeader, OrderRequest request) {

        String token = authHeader.substring(7);

        Users user = customerRepository.findByEmail(
                jwtService.extractUsername(token)
        );

        Cart cart = cartRepository.findByUserId(user.getId()).orElseThrow();

        if (cart == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = orderRepository
                .findFirstByUserAndStatus(user, OrderStatus.PENDING)
                .orElse(null);

        if (order != null) {
            return updatePendingOrder(order, cart, request);
        }

        Order newOrder = createNewOrder(user, cart, request);

        return orderMapper.toOrderResponse(newOrder);
    }

    private Order createNewOrder(Users user, Cart cart, OrderRequest request) {

        BigDecimal total = calculateTotal(cart.getCartItems());

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatusOrder.UNPAID)
                .receiverName(request.getFullName())
                .receiverPhone(request.getPhoneNumber())
                .shippingAddress(request.getShippingAddress())
                .orderCode(generateOrderCode())
                .totalPrice(total)
                .paidAmount(BigDecimal.ZERO)
                .remainingAmount(total)
                .build();

        order = orderRepository.save(order);

        List<OrderItem> items = buildOrderItems(cart.getCartItems(), order);
        orderItemRepository.saveAll(items);

        order.setOrderItems(items);

        return order;
    }

    private OrderResponse updatePendingOrder(
            Order order,
            Cart cart,
            OrderRequest request
    ) {

        order.getOrderItems().clear();

        List<OrderItem> items =
                buildOrderItems(
                        cart.getCartItems(),
                        order
                );

        for (OrderItem item : items) {
            order.addOrderItem(item);
        }

        order.setReceiverName(
                request.getFullName()
        );

        order.setReceiverPhone(
                request.getPhoneNumber()
        );

        order.setShippingAddress(
                request.getShippingAddress()
        );

        BigDecimal total =
                calculateTotal(
                        cart.getCartItems()
                );

        order.setTotalPrice(total);

        order.setRemainingAmount(
                total.subtract(
                        order.getPaidAmount()
                )
        );

        orderRepository.save(order);

        return orderMapper.toOrderResponse(order);
    }

    private List<OrderItem> buildOrderItems(
            List<CartItem> cartItems,
            Order order
    ) {

        List<OrderItem> items = new ArrayList<>();

        for (CartItem ci : cartItems) {

            OrderItem item = new OrderItem();

            item.setOrder(order);
            item.setProductId(ci.getProduct());
            item.setQuantity(ci.getQuantity());
            item.setCustomized(ci.isCustomized());
            item.setPrice(ci.getProduct().getPrice());

            if (ci.isCustomized()) {
                item.setPriceCustomProduct(
                        ci.getProduct().getPrice()
                                .multiply(BigDecimal.valueOf(ci.getQuantity()))
                );
            }

            items.add(item);
        }

        return items;
    }

    private BigDecimal calculateTotal(List<CartItem> cartItems) {

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem ci : cartItems) {

            BigDecimal itemTotal =
                    ci.getProduct().getPrice()
                            .multiply(BigDecimal.valueOf(ci.getQuantity()));

            if (ci.isCustomized()) {
                itemTotal = itemTotal.add(ci.getPriceCustomProduct());
            }

            total = total.add(itemTotal);
        }

        return total;
    }

    private String generateOrderCode() {

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));

        int random = (int) (Math.random() * 10000);

        return String.format("ORD%s%04d", timestamp, random);
    }

    @Override
    @Transactional
    public Page<OrderListResponse> getMyOrders(
            String authHeader,
            OrderFilterRequest request,
            Pageable pageable
    ) {

        String token =
                authHeader.substring(7);

        Users user =
                customerRepository.findByEmail(
                        jwtService.extractUsername(token)
                );

        Specification<Order> spec =
                OrderSpecification.filter(
                        user.getId(),
                        request
                );

        return orderRepository
                .findAll(spec, pageable)
                .map(orderMapper::toListResponse);
    }

    @Override
    @Transactional
    public Page<OrderListResponse> getSellerOrders(
            String authHeader,
            OrderFilterRequest request,
            Pageable pageable
    ) {

        String token = authHeader.substring(7);

        Users seller = customerRepository.findByEmail(
                jwtService.extractUsername(token)
        );

        Specification<Order> spec = (root, query, cb) -> {
            query.distinct(true);

            var orderItems = root.join("orderItems");
            var product = orderItems.join("productId");

            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(product.get("seller").get("id"), seller.getId()));

            if (request != null) {
                if (request.getOrderCode() != null) {
                    predicates.add(cb.like(root.get("orderCode"), "%" + request.getOrderCode() + "%"));
                }
                if (request.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), request.getStatus()));
                }
                if (request.getPaymentStatus() != null) {
                    predicates.add(cb.equal(root.get("paymentStatus"), request.getPaymentStatus()));
                }
                if (request.getFromDate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFromDate()));
                }
                if (request.getToDate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), request.getToDate()));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return orderRepository
                .findAll(spec, pageable)
                .map(orderMapper::toListResponse);
    }

    @Override
    @Transactional
    public OrderDetailResponse getOrderDetail(
            String authHeader,
            Long orderId
    ) {

        String token =
                authHeader.substring(7);

        Users user =
                customerRepository.findByEmail(
                        jwtService.extractUsername(token)
                );

        Order order =
                orderRepository
                        .findByIdAndUserId(
                                orderId,
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Order not found"
                                )
                        );

        return orderMapper.toDetailResponse(order);
    }
}
