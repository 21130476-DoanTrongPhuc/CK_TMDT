CREATE TABLE order_item_customizations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_item_id BIGINT NOT NULL,
    custom_text TEXT,
    custom_note TEXT,
    custom_image VARCHAR(255),

    CONSTRAINT fk_order_item_customizations_order_item
       FOREIGN KEY (order_item_id)
           REFERENCES order_items(id)
           ON DELETE CASCADE
);