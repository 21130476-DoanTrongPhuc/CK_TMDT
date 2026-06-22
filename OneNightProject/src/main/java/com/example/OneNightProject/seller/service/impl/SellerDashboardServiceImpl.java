package com.example.OneNightProject.seller.service.impl;

import com.example.OneNightProject.auth.service.JwtService;
import com.example.OneNightProject.order.entity.Order;
import com.example.OneNightProject.order.entity.OrderItem;
import com.example.OneNightProject.order.enums.OrderStatus;
import com.example.OneNightProject.order.repository.OrderRepository;
import com.example.OneNightProject.product.repository.ProductRepository;
import com.example.OneNightProject.review.repository.ReviewRepository;
import com.example.OneNightProject.seller.dto.DashboardResponse;
import com.example.OneNightProject.seller.service.SellerDashboardService;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerDashboardServiceImpl implements SellerDashboardService {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public DashboardResponse getDashboard(String authHeader) {
        String token = authHeader.substring(7);
        Users seller = customerRepository.findByEmail(jwtService.extractUsername(token));

        List<Order> orders = orderRepository.findAllBySellerId(seller.getId());

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        BigDecimal revenueThisMonth = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED
                        && o.getCreatedAt() != null
                        && o.getCreatedAt().isAfter(startOfMonth))
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();

        long todayOrders = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfDay))
                .count();

        long totalProducts = productRepository.countBySellerId(seller.getId());
        long totalReviews = reviewRepository.countBySellerId(seller.getId());
        long newReviews = reviewRepository.countNewBySellerId(seller.getId(), thirtyDaysAgo);

        // Order status counts
        Map<OrderStatus, Long> statusMap = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        List<DashboardResponse.OrderStatusCount> orderStatusCounts = statusMap.entrySet().stream()
                .map(e -> new DashboardResponse.OrderStatusCount(e.getKey().name(), e.getValue()))
                .collect(Collectors.toList());

        // Recent orders (last 5, already sorted DESC by query)
        DateTimeFormatter dtFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        List<DashboardResponse.RecentOrder> recentOrders = orders.stream()
                .limit(5)
                .map(o -> new DashboardResponse.RecentOrder(
                        o.getOrderCode(),
                        o.getReceiverName(),
                        o.getTotalPrice(),
                        o.getStatus().name(),
                        o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "UNPAID",
                        o.getCreatedAt() != null ? o.getCreatedAt().format(dtFmt) : ""
                ))
                .collect(Collectors.toList());

        // Top products by total quantity sold
        Map<String, Long> productQtyMap = new LinkedHashMap<>();
        for (Order order : orders) {
            if (order.getOrderItems() == null) continue;
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProductId() == null) continue;
                if (!seller.getId().equals(item.getProductId().getSeller().getId())) continue;
                String name = item.getProductId().getName();
                long qty = item.getQuantity() != null ? item.getQuantity() : 0L;
                productQtyMap.merge(name, qty, Long::sum);
            }
        }
        List<DashboardResponse.TopProduct> topProducts = productQtyMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new DashboardResponse.TopProduct(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Revenue by day (last 30 days, COMPLETED orders only)
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, BigDecimal> revenueMap = new TreeMap<>();
        for (Order order : orders) {
            if (order.getStatus() != OrderStatus.COMPLETED) continue;
            if (order.getCreatedAt() == null || order.getCreatedAt().isBefore(thirtyDaysAgo)) continue;
            String day = order.getCreatedAt().format(dayFmt);
            BigDecimal amount = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
            revenueMap.merge(day, amount, BigDecimal::add);
        }
        List<DashboardResponse.RevenuePoint> revenueByDay = revenueMap.entrySet().stream()
                .map(e -> new DashboardResponse.RevenuePoint(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .revenueThisMonth(revenueThisMonth)
                .totalOrders(totalOrders)
                .todayOrders(todayOrders)
                .totalProducts(totalProducts)
                .totalReviews(totalReviews)
                .newReviews(newReviews)
                .orderStatusCounts(orderStatusCounts)
                .recentOrders(recentOrders)
                .topProducts(topProducts)
                .revenueByDay(revenueByDay)
                .build();
    }

    @Override
    public List<DashboardResponse.RevenuePoint> getRevenue(String authHeader, String period) {
        String token = authHeader.substring(7);
        Users seller = customerRepository.findByEmail(jwtService.extractUsername(token));
        List<Order> orders = orderRepository.findAllBySellerId(seller.getId());

        List<Order> completed = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getCreatedAt() != null)
                .collect(Collectors.toList());

        Map<String, BigDecimal> map = new TreeMap<>();

        switch (period) {
            case "month" -> {
                LocalDateTime since = LocalDateTime.now().minusMonths(12);
                completed.stream()
                        .filter(o -> o.getCreatedAt().isAfter(since))
                        .forEach(o -> {
                            String key = o.getCreatedAt().getYear() + "-"
                                    + String.format("%02d", o.getCreatedAt().getMonthValue());
                            map.merge(key, o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO, BigDecimal::add);
                        });
            }
            case "quarter" -> {
                LocalDateTime since = LocalDateTime.now().minusMonths(24);
                completed.stream()
                        .filter(o -> o.getCreatedAt().isAfter(since))
                        .forEach(o -> {
                            int q = o.getCreatedAt().get(IsoFields.QUARTER_OF_YEAR);
                            String key = o.getCreatedAt().getYear() + "-Q" + q;
                            map.merge(key, o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO, BigDecimal::add);
                        });
            }
            case "year" -> {
                completed.forEach(o -> {
                    String key = String.valueOf(o.getCreatedAt().getYear());
                    map.merge(key, o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO, BigDecimal::add);
                });
            }
            default -> {
                // day — last 30 days
                LocalDateTime since = LocalDateTime.now().minusDays(30);
                DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                completed.stream()
                        .filter(o -> o.getCreatedAt().isAfter(since))
                        .forEach(o -> {
                            String key = o.getCreatedAt().format(dayFmt);
                            map.merge(key, o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO, BigDecimal::add);
                        });
            }
        }

        return map.entrySet().stream()
                .map(e -> new DashboardResponse.RevenuePoint(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }
}
