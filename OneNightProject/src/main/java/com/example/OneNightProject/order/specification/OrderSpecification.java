package com.example.OneNightProject.order.specification;

import com.example.OneNightProject.order.dto.request.OrderFilterRequest;
import com.example.OneNightProject.order.entity.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
@Component
public class OrderSpecification {

    public static Specification<Order> filter(
            Long userId,
            OrderFilterRequest request
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates =
                    new ArrayList<>();

            predicates.add(
                    cb.equal(
                            root.get("user").get("id"),
                            userId
                    )
            );

            if(request.getOrderCode() != null){

                predicates.add(
                        cb.like(
                                root.get("orderCode"),
                                "%" + request.getOrderCode() + "%"
                        )
                );
            }

            if(request.getStatus() != null){

                predicates.add(
                        cb.equal(
                                root.get("status"),
                                request.getStatus()
                        )
                );
            }

            if(request.getPaymentStatus() != null){

                predicates.add(
                        cb.equal(
                                root.get("paymentStatus"),
                                request.getPaymentStatus()
                        )
                );
            }

            if(request.getFromDate() != null){

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                request.getFromDate()
                        )
                );
            }

            if(request.getToDate() != null){

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("createdAt"),
                                request.getToDate()
                        )
                );
            }

            return cb.and(
                    predicates.toArray(
                            new Predicate[0]
                    )
            );
        };
    }
}