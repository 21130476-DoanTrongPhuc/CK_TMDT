package com.example.OneNightProject.product.repository;

import com.example.OneNightProject.product.dto.request.ProductFilterRequest;
import com.example.OneNightProject.product.entity.Product;
import com.example.OneNightProject.review.entity.Review;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProductSpecification {

    public static Specification<Product> filter(
            ProductFilterRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if(request.getKeyword() != null &&
                    !request.getKeyword().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("name")),
                                "%" +
                                        request.getKeyword().toLowerCase()
                                        + "%"
                        )
                );
            }

            if(request.getCategoryId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("category").get("id"),
                                request.getCategoryId()
                        )
                );
            }

            if(request.getBrandId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("brand").get("id"),
                                request.getBrandId()
                        )
                );
            }

            if(request.getSellerId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("seller").get("id"),
                                request.getSellerId()
                        )
                );
            }

            if(request.getMinPrice() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("price"),
                                request.getMinPrice()
                        )
                );
            }

            if(request.getMaxPrice() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("price"),
                                request.getMaxPrice()
                        )
                );
            }

            if(request.getStatus() != null) {

                predicates.add(
                        cb.equal(
                                root.get("status"),
                                request.getStatus()
                        )
                );
            }

            if(request.getAllowCustomization() != null) {

                predicates.add(
                        cb.equal(
                                root.get("allowCustomization"),
                                request.getAllowCustomization()
                        )
                );
            }

            if(request.getMinRating() != null){

                Join<Product, Review> reviewJoin =
                        root.join("reviews", JoinType.LEFT);

                query.groupBy(root.get("id"));

                query.having(
                        cb.greaterThanOrEqualTo(
                                cb.avg(reviewJoin.get("rating")),
                                request.getMinRating()
                        )
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0]));
        };
    }
}