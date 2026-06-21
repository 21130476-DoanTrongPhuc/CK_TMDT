CREATE TABLE cart_item_customizations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_item_id BIGINT NOT NULL,
    custom_text TEXT,
    custom_note TEXT,
    custom_image VARCHAR(255),

    CONSTRAINT fk_cart_item_customizations_cart_item
       FOREIGN KEY (cart_item_id)
           REFERENCES cart_items(id)
           ON DELETE CASCADE
);