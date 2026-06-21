CREATE TABLE wishlists (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           user_id BIGINT NOT NULL UNIQUE,

                           CONSTRAINT fk_wishlist_user
                               FOREIGN KEY(user_id)
                                   REFERENCES users(id)
                                   ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                wishlist_id BIGINT NOT NULL,
                                product_id BIGINT NOT NULL,

                                CONSTRAINT fk_wishlist_item_wishlist
                                    FOREIGN KEY(wishlist_id)
                                        REFERENCES wishlists(id)
                                        ON DELETE CASCADE,

                                CONSTRAINT fk_wishlist_item_product
                                    FOREIGN KEY(product_id)
                                        REFERENCES products(id)
                                        ON DELETE CASCADE,

                                UNIQUE (wishlist_id, product_id)
);