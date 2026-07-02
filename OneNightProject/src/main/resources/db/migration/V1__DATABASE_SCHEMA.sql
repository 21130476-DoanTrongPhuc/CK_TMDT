-- ======================================================
-- DATABASE SCHEMA - PART 1
-- Base Tables + Product + Customization
-- ======================================================

-- ======================================================
-- USERS
-- ======================================================
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT NOT NULL AUTO_INCREMENT,
                                     email VARCHAR(255) NOT NULL,
                                     password VARCHAR(255) DEFAULT NULL,
                                     full_name VARCHAR(255) DEFAULT NULL,
                                     phone VARCHAR(255) DEFAULT NULL,
                                     role ENUM('USER','SELLER','ADMIN') NOT NULL,
                                     status ENUM('ACTIVE','INACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE',
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,
                                     deleted_at TIMESTAMP NULL DEFAULT NULL,

                                     PRIMARY KEY (id),
                                     UNIQUE KEY uk_user_email (email)
);

-- ======================================================
-- BRANDS
-- ======================================================
CREATE TABLE IF NOT EXISTS brands (
                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      name VARCHAR(255) NOT NULL
);

-- ======================================================
-- CATEGORIES
-- ======================================================
CREATE TABLE IF NOT EXISTS categories (
                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                          name VARCHAR(255) NOT NULL,

                                          parent_id BIGINT DEFAULT NULL,

                                          CONSTRAINT fk_category_parent
                                              FOREIGN KEY (parent_id)
                                                  REFERENCES categories(id)
                                                  ON DELETE SET NULL
);

-- ======================================================
-- PRODUCTS
-- ======================================================
CREATE TABLE IF NOT EXISTS products (

                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                        name VARCHAR(255) NOT NULL,

                                        description TEXT,

                                        price DECIMAL(18,2) NOT NULL,

                                        stock INT NOT NULL DEFAULT 0,

                                        status ENUM(
                                            'ACTIVE',
                                            'OUT_OF_STOCK',
                                            'DISCONTINUED'
                                            ) NOT NULL DEFAULT 'ACTIVE',

                                        allow_customization BOOLEAN NOT NULL DEFAULT FALSE,

                                        brand_id BIGINT,

                                        category_id BIGINT,

                                        seller_id BIGINT NOT NULL,

                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,

                                        deleted_at TIMESTAMP NULL,

                                        CONSTRAINT fk_product_brand
                                            FOREIGN KEY (brand_id)
                                                REFERENCES brands(id)
                                                ON DELETE SET NULL,

                                        CONSTRAINT fk_product_category
                                            FOREIGN KEY (category_id)
                                                REFERENCES categories(id)
                                                ON DELETE SET NULL,

                                        CONSTRAINT fk_product_seller
                                            FOREIGN KEY (seller_id)
                                                REFERENCES users(id)
);

CREATE INDEX idx_product_brand
    ON products(brand_id);

CREATE INDEX idx_product_category
    ON products(category_id);

CREATE INDEX idx_product_seller
    ON products(seller_id);

-- ======================================================
-- PRODUCT IMAGES
-- ======================================================
CREATE TABLE IF NOT EXISTS product_images (

                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                              product_id BIGINT NOT NULL,

                                              image_url VARCHAR(500) NOT NULL,

                                              CONSTRAINT fk_product_image
                                                  FOREIGN KEY(product_id)
                                                      REFERENCES products(id)
                                                      ON DELETE CASCADE
);

CREATE INDEX idx_product_image_product
    ON product_images(product_id);

-- ======================================================
-- PRODUCT CUSTOM FIELDS
-- ======================================================
CREATE TABLE IF NOT EXISTS custom_fields (

                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                             product_id BIGINT NOT NULL,

                                             name VARCHAR(255) NOT NULL,

                                             description TEXT,

                                             field_type ENUM(
                                                 'TEXT',
                                                 'TEXTAREA',
                                                 'SELECT',
                                                 'CHECKBOX',
                                                 'RADIO'
                                                 ) NOT NULL,

                                             required BOOLEAN NOT NULL DEFAULT FALSE,

                                             placeholder VARCHAR(255),

                                             min_length INT,

                                             max_length INT,

                                             sort_order INT NOT NULL DEFAULT 0,

                                             active BOOLEAN NOT NULL DEFAULT TRUE,

                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                                 ON UPDATE CURRENT_TIMESTAMP,

                                             CONSTRAINT fk_custom_field_product
                                                 FOREIGN KEY(product_id)
                                                     REFERENCES products(id)
                                                     ON DELETE CASCADE
);

CREATE INDEX idx_custom_field_product
    ON custom_fields(product_id);

-- ======================================================
-- CUSTOM FIELD OPTIONS
-- ======================================================
CREATE TABLE IF NOT EXISTS custom_field_options (

                                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                                    field_id BIGINT NOT NULL,

                                                    label VARCHAR(255) NOT NULL,

                                                    value VARCHAR(255) NOT NULL,

                                                    extra_price DECIMAL(18,2) NOT NULL DEFAULT 0,

                                                    image_url VARCHAR(500),

                                                    sort_order INT NOT NULL DEFAULT 0,

                                                    active BOOLEAN NOT NULL DEFAULT TRUE,

                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                                        ON UPDATE CURRENT_TIMESTAMP,

                                                    CONSTRAINT fk_custom_option_field
                                                        FOREIGN KEY(field_id)
                                                            REFERENCES custom_fields(id)
                                                            ON DELETE CASCADE
);

CREATE INDEX idx_custom_option_field
    ON custom_field_options(field_id);

-- ======================================================
-- PRODUCT VIEWS
-- ======================================================
CREATE TABLE IF NOT EXISTS product_views (

                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                             product_id BIGINT NOT NULL,

                                             user_id BIGINT,

                                             viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                             CONSTRAINT fk_product_view_product
                                                 FOREIGN KEY(product_id)
                                                     REFERENCES products(id)
                                                     ON DELETE CASCADE,

                                             CONSTRAINT fk_product_view_user
                                                 FOREIGN KEY(user_id)
                                                     REFERENCES users(id)
                                                     ON DELETE SET NULL
);

CREATE INDEX idx_product_view_product
    ON product_views(product_id);

CREATE INDEX idx_product_view_user
    ON product_views(user_id);

-- ======================================================
-- WISHLISTS
-- ======================================================
CREATE TABLE IF NOT EXISTS wishlists (

                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                         user_id BIGINT NOT NULL UNIQUE,

                                         CONSTRAINT fk_wishlist_user
                                             FOREIGN KEY(user_id)
                                                 REFERENCES users(id)
                                                 ON DELETE CASCADE
);

-- ======================================================
-- WISHLIST ITEMS
-- ======================================================
CREATE TABLE IF NOT EXISTS wishlist_items (

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

                                              UNIQUE KEY uk_wishlist_product (
                                                                              wishlist_id,
                                                                              product_id
                                                  )
);

-- ======================================================
-- DATABASE SCHEMA - PART 2
-- Cart + Order + Payment
-- ======================================================

-- ======================================================
-- CARTS
-- ======================================================
CREATE TABLE IF NOT EXISTS carts (

                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                     user_id BIGINT NOT NULL,

                                     status ENUM(
                                         'ACTIVE',
                                         'ABANDONED'
                                         ) NOT NULL DEFAULT 'ACTIVE',

                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

                                     CONSTRAINT fk_cart_user
                                         FOREIGN KEY(user_id)
                                             REFERENCES users(id)
                                             ON DELETE CASCADE,

                                     UNIQUE KEY uk_cart_user(user_id)
);

CREATE INDEX idx_cart_user
    ON carts(user_id);

-- ======================================================
-- CART ITEMS
-- ======================================================
CREATE TABLE IF NOT EXISTS cart_items (

                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                          cart_id BIGINT NOT NULL,

                                          product_id BIGINT NOT NULL,

                                          quantity INT NOT NULL DEFAULT 1,

                                          is_customized BOOLEAN NOT NULL DEFAULT FALSE,

                                          customization_price DECIMAL(18,2) NOT NULL DEFAULT 0,

                                          CONSTRAINT fk_cart_item_cart
                                              FOREIGN KEY(cart_id)
                                                  REFERENCES carts(id)
                                                  ON DELETE CASCADE,

                                          CONSTRAINT fk_cart_item_product
                                              FOREIGN KEY(product_id)
                                                  REFERENCES products(id)
);

CREATE INDEX idx_cart_item_cart
    ON cart_items(cart_id);

CREATE INDEX idx_cart_item_product
    ON cart_items(product_id);

-- ======================================================
-- CART ITEM CUSTOMIZATIONS
-- ======================================================
CREATE TABLE IF NOT EXISTS cart_item_customizations (

                                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                                        cart_item_id BIGINT NOT NULL,

                                                        field_id BIGINT NOT NULL,

                                                        option_id BIGINT DEFAULT NULL,

                                                        text_value TEXT,

                                                        extra_price DECIMAL(18,2) NOT NULL DEFAULT 0,

                                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                                        CONSTRAINT fk_cart_customize_item
                                                            FOREIGN KEY(cart_item_id)
                                                                REFERENCES cart_items(id)
                                                                ON DELETE CASCADE,

                                                        CONSTRAINT fk_cart_customize_field
                                                            FOREIGN KEY(field_id)
                                                                REFERENCES custom_fields(id),

                                                        CONSTRAINT fk_cart_customize_option
                                                            FOREIGN KEY(option_id)
                                                                REFERENCES custom_field_options(id)
);

CREATE INDEX idx_cart_customize_item
    ON cart_item_customizations(cart_item_id);

-- ======================================================
-- ORDERS
-- ======================================================
CREATE TABLE IF NOT EXISTS orders (

                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                      order_code VARCHAR(50) NOT NULL UNIQUE,

                                      user_id BIGINT NOT NULL,

                                      total_price DECIMAL(18,2) NOT NULL,

                                      status ENUM(
                                          'PENDING',
                                          'CONFIRMED',
                                          'SHIPPED',
                                          'COMPLETED',
                                          'CANCELLED'
                                          ) NOT NULL DEFAULT 'PENDING',

                                      payment_status ENUM(
                                          'UNPAID',
                                          'PARTIALLY_PAID',
                                          'PAID',
                                          'REFUNDED'
                                          ) NOT NULL DEFAULT 'UNPAID',

                                      paid_amount DECIMAL(18,2) NOT NULL DEFAULT 0,

                                      remaining_amount DECIMAL(18,2) NOT NULL DEFAULT 0,

                                      shipping_address TEXT NOT NULL,

                                      receiver_name VARCHAR(255) NOT NULL,

                                      receiver_phone VARCHAR(20) NOT NULL,

                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

                                      deleted_at TIMESTAMP NULL,

                                      CONSTRAINT fk_order_user
                                          FOREIGN KEY(user_id)
                                              REFERENCES users(id)
);

CREATE INDEX idx_order_user
    ON orders(user_id);

-- ======================================================
-- ORDER ITEMS
-- ======================================================
CREATE TABLE IF NOT EXISTS order_items (

                                           id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                           order_id BIGINT NOT NULL,

                                           product_id BIGINT NOT NULL,

                                           quantity INT NOT NULL,

                                           price DECIMAL(18,2) NOT NULL,

                                           is_customized BOOLEAN NOT NULL DEFAULT FALSE,

                                           customization_price DECIMAL(18,2) NOT NULL DEFAULT 0,

                                           CONSTRAINT fk_order_item_order
                                               FOREIGN KEY(order_id)
                                                   REFERENCES orders(id)
                                                   ON DELETE CASCADE,

                                           CONSTRAINT fk_order_item_product
                                               FOREIGN KEY(product_id)
                                                   REFERENCES products(id)
);

CREATE INDEX idx_order_item_order
    ON order_items(order_id);

CREATE INDEX idx_order_item_product
    ON order_items(product_id);

-- ======================================================
-- ORDER ITEM CUSTOMIZATIONS
-- ======================================================
CREATE TABLE IF NOT EXISTS order_item_customizations (

                                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                                         order_item_id BIGINT NOT NULL,

                                                         field_id BIGINT NOT NULL,

                                                         option_id BIGINT DEFAULT NULL,

                                                         text_value TEXT,

                                                         extra_price DECIMAL(18,2) NOT NULL DEFAULT 0,

                                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                                         CONSTRAINT fk_order_customize_item
                                                             FOREIGN KEY(order_item_id)
                                                                 REFERENCES order_items(id)
                                                                 ON DELETE CASCADE,

                                                         CONSTRAINT fk_order_customize_field
                                                             FOREIGN KEY(field_id)
                                                                 REFERENCES custom_fields(id),

                                                         CONSTRAINT fk_order_customize_option
                                                             FOREIGN KEY(option_id)
                                                                 REFERENCES custom_field_options(id)
);

CREATE INDEX idx_order_customize_item
    ON order_item_customizations(order_item_id);

-- ======================================================
-- ORDER STATUS HISTORY
-- ======================================================
CREATE TABLE IF NOT EXISTS order_status_history (

                                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                                    order_id BIGINT NOT NULL,

                                                    old_status VARCHAR(50),

                                                    new_status VARCHAR(50),

                                                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                                    CONSTRAINT fk_order_status_history
                                                        FOREIGN KEY(order_id)
                                                            REFERENCES orders(id)
                                                            ON DELETE CASCADE
);

CREATE INDEX idx_order_status_history_order
    ON order_status_history(order_id);

-- ======================================================
-- PAYMENTS
-- ======================================================
CREATE TABLE IF NOT EXISTS payments (

                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                        order_id BIGINT NOT NULL,

                                        payment_code VARCHAR(100) UNIQUE,

                                        method ENUM(
                                            'VNPAY',
                                            'MOMO',
                                            'ZALOPAY',
                                            'COD'
                                            ),

                                        status ENUM(
                                            'PENDING',
                                            'SUCCESS',
                                            'FAIL',
                                            'CANCELLED',
                                            'REFUNDED',
                                            'PARTIAL_REFUND',
                                            'EXPIRED'
                                            ),

                                        transaction_id VARCHAR(255),

                                        amount DECIMAL(18,2),

                                        paid_at DATETIME,

                                        created_at DATETIME,

                                        updated_at DATETIME,

                                        CONSTRAINT fk_payment_order
                                            FOREIGN KEY(order_id)
                                                REFERENCES orders(id)
);

CREATE INDEX idx_payment_order
    ON payments(order_id);

-- ======================================================
-- PAYMENT HISTORY
-- ======================================================
CREATE TABLE IF NOT EXISTS payment_history (

                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                               payment_id BIGINT NOT NULL,

                                               action VARCHAR(50) NOT NULL,

                                               description TEXT,

                                               created_at DATETIME,

                                               CONSTRAINT fk_payment_history
                                                   FOREIGN KEY(payment_id)
                                                       REFERENCES payments(id)
                                                       ON DELETE CASCADE
);

CREATE INDEX idx_payment_history_payment
    ON payment_history(payment_id);

-- ======================================================
-- DATABASE SCHEMA - PART 3
-- Review + Comment + User Profile + Authentication
-- ======================================================

-- ======================================================
-- COMMENTS
-- ======================================================
CREATE TABLE IF NOT EXISTS comments (

                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                        product_id BIGINT NOT NULL,

                                        user_id BIGINT NOT NULL,

                                        parent_id BIGINT DEFAULT NULL,

                                        content TEXT,

                                        status ENUM(
                                            'VISIBLE',
                                            'HIDDEN'
                                            ) NOT NULL DEFAULT 'VISIBLE',

                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                        deleted_at TIMESTAMP NULL,

                                        CONSTRAINT fk_comment_product
                                            FOREIGN KEY(product_id)
                                                REFERENCES products(id)
                                                ON DELETE CASCADE,

                                        CONSTRAINT fk_comment_user
                                            FOREIGN KEY(user_id)
                                                REFERENCES users(id)
                                                ON DELETE CASCADE,

                                        CONSTRAINT fk_comment_parent
                                            FOREIGN KEY(parent_id)
                                                REFERENCES comments(id)
                                                ON DELETE CASCADE
);

CREATE INDEX idx_comment_product
    ON comments(product_id);

CREATE INDEX idx_comment_user
    ON comments(user_id);

CREATE INDEX idx_comment_parent
    ON comments(parent_id);

-- ======================================================
-- REVIEWS
-- ======================================================
CREATE TABLE IF NOT EXISTS reviews (

                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                       user_id BIGINT NOT NULL,

                                       product_id BIGINT NOT NULL,

                                       rating INT NOT NULL,

                                       comment TEXT,

                                       status ENUM(
                                           'VISIBLE',
                                           'HIDDEN'
                                           ) NOT NULL DEFAULT 'VISIBLE',

                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                       deleted_at TIMESTAMP NULL,

                                       CONSTRAINT fk_review_user
                                           FOREIGN KEY(user_id)
                                               REFERENCES users(id)
                                               ON DELETE CASCADE,

                                       CONSTRAINT fk_review_product
                                           FOREIGN KEY(product_id)
                                               REFERENCES products(id)
                                               ON DELETE CASCADE,

                                       CONSTRAINT uk_review
                                           UNIQUE(user_id, product_id)
);

CREATE INDEX idx_review_product
    ON reviews(product_id);

CREATE INDEX idx_review_user
    ON reviews(user_id);

-- ======================================================
-- USER ADDRESSES
-- ======================================================
CREATE TABLE IF NOT EXISTS user_addresses (

                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                              user_id BIGINT NOT NULL,

                                              receiver_name VARCHAR(255) NOT NULL,

                                              receiver_phone VARCHAR(20) NOT NULL,

                                              address TEXT NOT NULL,

                                              is_default BOOLEAN NOT NULL DEFAULT FALSE,

                                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                                  ON UPDATE CURRENT_TIMESTAMP,

                                              CONSTRAINT fk_address_user
                                                  FOREIGN KEY(user_id)
                                                      REFERENCES users(id)
                                                      ON DELETE CASCADE
);

CREATE INDEX idx_address_user
    ON user_addresses(user_id);

-- ======================================================
-- USER PROFILE
-- ======================================================
CREATE TABLE IF NOT EXISTS user_profiles (

                                             user_id BIGINT PRIMARY KEY,

                                             avatar VARCHAR(500),

                                             date_of_birth DATE,

                                             CONSTRAINT fk_profile_user
                                                 FOREIGN KEY(user_id)
                                                     REFERENCES users(id)
                                                     ON DELETE CASCADE
);

-- ======================================================
-- EMAIL VERIFICATIONS
-- ======================================================
CREATE TABLE IF NOT EXISTS email_verifications (

                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                                   user_id BIGINT NOT NULL,

                                                   token VARCHAR(255) NOT NULL,

                                                   expired_at TIMESTAMP,

                                                   is_verified BOOLEAN NOT NULL DEFAULT FALSE,

                                                   CONSTRAINT fk_email_verification_user
                                                       FOREIGN KEY(user_id)
                                                           REFERENCES users(id)
                                                           ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_user
    ON email_verifications(user_id);

-- ======================================================
-- OAUTH ACCOUNTS
-- ======================================================
CREATE TABLE IF NOT EXISTS oauth_accounts (

                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                              user_id BIGINT NOT NULL,

                                              provider ENUM(
                                                  'GOOGLE',
                                                  'FACEBOOK'
                                                  ) NOT NULL,

                                              provider_user_id VARCHAR(255),

                                              CONSTRAINT fk_oauth_user
                                                  FOREIGN KEY(user_id)
                                                      REFERENCES users(id)
                                                      ON DELETE CASCADE
);

CREATE INDEX idx_oauth_user
    ON oauth_accounts(user_id);

-- ======================================================
-- PASSWORD RESETS
-- ======================================================
CREATE TABLE IF NOT EXISTS password_resets (

                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                               user_id BIGINT NOT NULL,

                                               token VARCHAR(255) NOT NULL,

                                               expired_at TIMESTAMP,

                                               CONSTRAINT fk_password_reset_user
                                                   FOREIGN KEY(user_id)
                                                       REFERENCES users(id)
                                                       ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_user
    ON password_resets(user_id);