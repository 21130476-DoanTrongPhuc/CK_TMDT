-- ======================================================
-- Bảng users (bảng cơ bản, không phụ thuộc bảng nào)
-- ======================================================
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT NOT NULL AUTO_INCREMENT,
                                     email VARCHAR(255) NOT NULL,
                                     password VARCHAR(255) DEFAULT NULL,
                                     full_name VARCHAR(255) DEFAULT NULL,
                                     phone VARCHAR(255) DEFAULT NULL,
                                     role ENUM('USER', 'SELLER', 'ADMIN'),
                                     status ENUM('ACTIVE', 'INACTIVE', 'BANNED'),
                                     created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                     deleted_at TIMESTAMP NULL DEFAULT NULL,
                                     PRIMARY KEY (id),
                                     UNIQUE KEY email (email)
);

-- ======================================================
-- Bảng brands (không phụ thuộc bảng nào)
-- ======================================================
CREATE TABLE IF NOT EXISTS brands (
                                      id BIGINT NOT NULL AUTO_INCREMENT,
                                      name VARCHAR(255) NOT NULL,
                                      PRIMARY KEY (id)
);

-- ======================================================
-- Bảng categories (tự tham chiếu, nhưng không phụ thuộc bảng khác)
-- ======================================================
CREATE TABLE IF NOT EXISTS categories (
                                          id BIGINT NOT NULL AUTO_INCREMENT,
                                          name VARCHAR(255) NOT NULL,
                                          parent_id BIGINT DEFAULT NULL,
                                          PRIMARY KEY (id),
                                          CONSTRAINT categories_ibfk_1 FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ======================================================
-- Bảng products (phụ thuộc brands, categories, users)
-- ======================================================
CREATE TABLE IF NOT EXISTS products (
                                        id BIGINT NOT NULL AUTO_INCREMENT,
                                        name VARCHAR(255) NOT NULL,
                                        description VARCHAR(255) DEFAULT NULL,
                                        price DECIMAL(38,2) NOT NULL,
                                        stock INT DEFAULT '0',
                                        status ENUM('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'),
                                        brand_id BIGINT DEFAULT NULL,
                                        category_id BIGINT DEFAULT NULL,
                                        seller_id BIGINT NOT NULL,
                                        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        deleted_at TIMESTAMP NULL DEFAULT NULL,
                                        allow_customization TINYINT DEFAULT NULL,
                                        PRIMARY KEY (id),
                                        CONSTRAINT products_ibfk_1 FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
                                        CONSTRAINT products_ibfk_2 FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                                        CONSTRAINT products_ibfk_3 FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- ======================================================
-- Bảng carts (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS carts (
                                     id BIGINT NOT NULL AUTO_INCREMENT,
                                     user_id BIGINT DEFAULT NULL,
                                     status ENUM('ACTIVE','ABANDONED') DEFAULT 'ACTIVE',
                                     created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                     PRIMARY KEY (id),
                                     UNIQUE KEY user_id (user_id),
                                     CONSTRAINT carts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================
-- Bảng cart_items (phụ thuộc carts, products)
-- ======================================================
CREATE TABLE IF NOT EXISTS cart_items (
                                          id BIGINT NOT NULL AUTO_INCREMENT,
                                          cart_id BIGINT NOT NULL,
                                          product_id BIGINT NOT NULL,
                                          quantity INT NOT NULL,
                                          is_customized BIT(1) DEFAULT NULL,
                                          customization_price DECIMAL(38,2) DEFAULT NULL,
                                          PRIMARY KEY (id),
                                          CONSTRAINT cart_items_ibfk_1 FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                                          CONSTRAINT cart_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ======================================================
-- Bảng cart_item_customizations (phụ thuộc cart_items)
-- ======================================================
CREATE TABLE IF NOT EXISTS cart_item_customizations (
                                                        id BIGINT NOT NULL AUTO_INCREMENT,
                                                        cart_item_id BIGINT NOT NULL,
                                                        custom_text VARCHAR(255) DEFAULT NULL,
                                                        custom_note VARCHAR(255) DEFAULT NULL,
                                                        custom_image VARCHAR(255) DEFAULT NULL,
                                                        PRIMARY KEY (id),
                                                        CONSTRAINT fk_cart_item_customizations_cart_item
                                                            FOREIGN KEY (cart_item_id) REFERENCES cart_items(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng orders (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS orders (
                                      id BIGINT NOT NULL AUTO_INCREMENT,
                                      order_code VARCHAR(50) NOT NULL UNIQUE,
                                      user_id BIGINT NOT NULL,
                                      total_price DECIMAL(18,2) NOT NULL,
                                      status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'),
                                      payment_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',
                                      paid_amount DECIMAL(18,2) DEFAULT 0,
                                      remaining_amount DECIMAL(18,2) DEFAULT 0,
                                      shipping_address TEXT NOT NULL,
                                      receiver_name VARCHAR(255) NOT NULL,
                                      receiver_phone VARCHAR(20) NOT NULL,
                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                      deleted_at TIMESTAMP NULL,
                                      PRIMARY KEY (id),
                                      CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================
-- Bảng order_items (phụ thuộc orders, products)
-- ======================================================
CREATE TABLE IF NOT EXISTS order_items (
                                           id BIGINT NOT NULL AUTO_INCREMENT,
                                           order_id BIGINT NOT NULL,
                                           product_id BIGINT NOT NULL,
                                           quantity INT NOT NULL,
                                           price DECIMAL(38,2) NOT NULL,
                                           is_customized BIT(1) DEFAULT NULL,
                                           customization_price DECIMAL(38,2) DEFAULT NULL,
                                           PRIMARY KEY (id),
                                           CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                                           CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ======================================================
-- Bảng order_item_customizations (phụ thuộc order_items)
-- ======================================================
CREATE TABLE IF NOT EXISTS order_item_customizations (
                                                         id BIGINT NOT NULL AUTO_INCREMENT,
                                                         order_item_id BIGINT NOT NULL,
                                                         custom_text VARCHAR(255) DEFAULT NULL,
                                                         custom_note VARCHAR(255) DEFAULT NULL,
                                                         custom_image VARCHAR(255) DEFAULT NULL,
                                                         PRIMARY KEY (id),
                                                         CONSTRAINT fk_order_item_customizations_order_item
                                                             FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng order_status_history (phụ thuộc orders)
-- ======================================================
CREATE TABLE IF NOT EXISTS order_status_history (
                                                    id BIGINT NOT NULL AUTO_INCREMENT,
                                                    order_id BIGINT NOT NULL,
                                                    old_status VARCHAR(50),
                                                    new_status VARCHAR(50),
                                                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                    PRIMARY KEY (id),
                                                    CONSTRAINT fk_order_status_history_order
                                                        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng payments (phụ thuộc orders)
-- ======================================================
CREATE TABLE IF NOT EXISTS payments (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,

                                        order_id BIGINT NOT NULL,

                                        payment_code VARCHAR(100) UNIQUE,

                                        method ENUM( 'VNPAY', 'MOMO', 'ZALOPAY', 'COD'),

                                        status ENUM ('PENDING' ,'SUCCESS', 'FAIL', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND', 'EXPIRED'),

                                        transaction_id VARCHAR(255),

                                        amount DECIMAL(18,2),

                                        paid_at DATETIME,

                                        created_at DATETIME,

                                        updated_at DATETIME,

                                        CONSTRAINT fk_payment_order
                                            FOREIGN KEY(order_id)
                                                REFERENCES orders(id)
);

CREATE TABLE payment_history (

                                 id BIGINT PRIMARY KEY AUTO_INCREMENT,

                                 payment_id BIGINT NOT NULL,

                                 action VARCHAR(50) NOT NULL,

                                 description TEXT,

                                 created_at DATETIME,

                                 CONSTRAINT fk_payment_history_payment
                                     FOREIGN KEY(payment_id)
                                         REFERENCES payments(id)
);

-- ======================================================
-- Bảng comments (phụ thuộc products, users)
-- ======================================================
CREATE TABLE IF NOT EXISTS comments (
                                        id BIGINT NOT NULL AUTO_INCREMENT,
                                        product_id BIGINT NOT NULL,
                                        user_id BIGINT NOT NULL,
                                        content TEXT,
                                        status ENUM('VISIBLE','HIDDEN') DEFAULT 'VISIBLE',
                                        parent_id BIGINT DEFAULT NULL,
                                        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                        deleted_at TIMESTAMP NULL DEFAULT NULL,
                                        PRIMARY KEY (id),
                                        CONSTRAINT comments_ibfk_1 FOREIGN KEY (product_id) REFERENCES products(id),
                                        CONSTRAINT comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id),
                                        CONSTRAINT comments_ibfk_3 FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- ======================================================
-- Bảng email_verifications (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS email_verifications (
                                                   id BIGINT NOT NULL AUTO_INCREMENT,
                                                   user_id BIGINT NOT NULL,
                                                   token VARCHAR(255) NOT NULL,
                                                   expired_at TIMESTAMP NULL DEFAULT NULL,
                                                   is_verified TINYINT(1) DEFAULT '0',
                                                   PRIMARY KEY (id),
                                                   CONSTRAINT email_verifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng oauth_accounts (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS oauth_accounts (
                                              id BIGINT NOT NULL AUTO_INCREMENT,
                                              user_id BIGINT NOT NULL,
                                              provider ENUM('GOOGLE', 'FACEBOOK'),
                                              provider_user_id VARCHAR(255) DEFAULT NULL,
                                              PRIMARY KEY (id),
                                              CONSTRAINT oauth_accounts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng password_resets (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS password_resets (
                                               id BIGINT NOT NULL AUTO_INCREMENT,
                                               user_id BIGINT NOT NULL,
                                               token VARCHAR(255) NOT NULL,
                                               expired_at TIMESTAMP NULL DEFAULT NULL,
                                               PRIMARY KEY (id),
                                               CONSTRAINT password_resets_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng product_images (phụ thuộc products)
-- ======================================================
CREATE TABLE IF NOT EXISTS product_images (
                                              id BIGINT NOT NULL AUTO_INCREMENT,
                                              product_id BIGINT DEFAULT NULL,
                                              image_url VARCHAR(255) DEFAULT NULL,
                                              PRIMARY KEY (id),
                                              CONSTRAINT product_images_ibfk_1 FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ======================================================
-- Bảng product_views (phụ thuộc products, users)
-- ======================================================
CREATE TABLE IF NOT EXISTS product_views (
                                             id BIGINT NOT NULL AUTO_INCREMENT,
                                             product_id BIGINT NOT NULL,
                                             user_id BIGINT DEFAULT NULL,
                                             viewed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                             PRIMARY KEY (id),
                                             CONSTRAINT product_views_ibfk_1 FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                                             CONSTRAINT product_views_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================================
-- Bảng reviews (phụ thuộc users, products)
-- ======================================================
CREATE TABLE IF NOT EXISTS reviews (
                                       id BIGINT NOT NULL AUTO_INCREMENT,
                                       user_id BIGINT NOT NULL,
                                       product_id BIGINT NOT NULL,
                                       rating INT NOT NULL,
                                       comment TEXT,
                                       status ENUM('VISIBLE', 'HIDDEN') DEFAULT 'VISIBLE',
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       deleted_at TIMESTAMP NULL,
                                       PRIMARY KEY (id),
                                       UNIQUE KEY uk_review_user_product (user_id, product_id),
                                       CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
                                       CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ======================================================
-- Bảng user_addresses (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS user_addresses (
                                              id BIGINT NOT NULL AUTO_INCREMENT,
                                              user_id BIGINT NOT NULL,
                                              receiver_name VARCHAR(255) NOT NULL,
                                              receiver_phone VARCHAR(20) NOT NULL,
                                              address TEXT NOT NULL,
                                              is_default BOOLEAN DEFAULT FALSE,
                                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                              PRIMARY KEY (id),
                                              CONSTRAINT fk_user_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_address_user ON user_addresses(user_id);

-- ======================================================
-- Bảng user_profiles (phụ thuộc users)
-- ======================================================
CREATE TABLE IF NOT EXISTS user_profiles (
                                             user_id BIGINT NOT NULL,
                                             avatar VARCHAR(255),
                                             date_of_birth DATE,
                                             PRIMARY KEY (user_id),
                                             CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);