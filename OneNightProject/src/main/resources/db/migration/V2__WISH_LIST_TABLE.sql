CREATE TABLE wishlists (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           user_id BIGINT NOT NULL UNIQUE
);

CREATE TABLE wishlist_items (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                wishlist_id BIGINT NOT NULL,
                                product_id BIGINT NOT NULL
);