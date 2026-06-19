CREATE TABLE discounts (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           code VARCHAR(50) UNIQUE NULL,
                           name VARCHAR(255) NOT NULL,
                           discount_type ENUM('PERCENT', 'FIXED') NOT NULL,
                           discount_value DECIMAL(18,2) NOT NULL,
                           apply_type ENUM('COUPON', 'PRODUCT') NOT NULL,
                           start_date DATETIME NULL,
                           end_date DATETIME NULL,
                           status ENUM('ACTIVE', 'INACTIVE')
                                                DEFAULT 'ACTIVE',

                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE product_discounts (
                                   product_id BIGINT NOT NULL,
                                   discount_id BIGINT NOT NULL,

                                   PRIMARY KEY(product_id, discount_id),

                                   FOREIGN KEY(product_id)
                                       REFERENCES products(id)
                                       ON DELETE CASCADE,

                                   FOREIGN KEY(discount_id)
                                       REFERENCES discounts(id)
                                       ON DELETE CASCADE
);

ALTER TABLE orders
    ADD COLUMN discount_id BIGINT NULL,
    ADD CONSTRAINT fk_order_discount
        FOREIGN KEY (discount_id)
            REFERENCES discounts(id);