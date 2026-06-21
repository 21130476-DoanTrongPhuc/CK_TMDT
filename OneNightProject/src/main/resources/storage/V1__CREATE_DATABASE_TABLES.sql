-- =========================
-- 1. USERS & AUTH
-- =========================

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255),
                       full_name VARCHAR(255),
                       phone VARCHAR(20),

                       role ENUM('USER', 'ADMIN', 'SELLER') DEFAULT 'USER',
                       status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',


                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP NULL
);

CREATE TABLE user_profiles (
                               user_id BIGINT PRIMARY KEY,
                               address TEXT,
                               avatar VARCHAR(255),
                               date_of_birth DATE,

                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE email_verifications (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     user_id BIGINT NOT NULL,
                                     token VARCHAR(255) NOT NULL,
                                     expired_at TIMESTAMP,
                                     is_verified BOOLEAN DEFAULT FALSE,

                                     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 user_id BIGINT NOT NULL,
                                 token VARCHAR(255) NOT NULL,
                                 expired_at TIMESTAMP,

                                 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE oauth_accounts (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                user_id BIGINT NOT NULL,
                                provider ENUM('GOOGLE', 'FACEBOOK'),
                                provider_user_id VARCHAR(255) NOT NULL,

                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 2. PRODUCT & CATALOG
-- =========================

CREATE TABLE categories (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            parent_id BIGINT,

                            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE brands (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL
);

CREATE TABLE products (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          price DECIMAL(12,2) NOT NULL,
                          stock INT DEFAULT 0,

                          status ENUM('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED') DEFAULT 'ACTIVE',

                          brand_id BIGINT,
                          category_id BIGINT,
                          seller_id BIGINT NOT NULL,

                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          deleted_at TIMESTAMP NULL,

                          FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
                          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                          FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE product_images (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                product_id BIGINT NOT NULL,
                                image_url VARCHAR(255),

                                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_views (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               product_id BIGINT NOT NULL,
                               user_id BIGINT,
                               viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                               FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- 3. CART
-- =========================

CREATE TABLE carts (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       user_id BIGINT UNIQUE,

                       status ENUM('ACTIVE', 'ABANDONED') DEFAULT 'ACTIVE',

                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                       FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            cart_id BIGINT NOT NULL,
                            product_id BIGINT NOT NULL,
                            quantity INT NOT NULL,

                            FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                            FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- 4. ORDER & PAYMENT
-- =========================

CREATE TABLE orders (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        total_price DECIMAL(12,2),

                        status ENUM('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',

                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        deleted_at TIMESTAMP NULL,

                        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             order_id BIGINT NOT NULL,
                             product_id BIGINT NOT NULL,
                             quantity INT NOT NULL,
                             price DECIMAL(12,2) NOT NULL,

                             FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          order_id BIGINT NOT NULL,

                          method ENUM('ONLINE', 'COD'),
                          status ENUM('PENDING', 'SUCCESS', 'FAILED'),

                          transaction_id VARCHAR(255),
                          paid_at TIMESTAMP,

                          FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =========================
-- 5. REVIEW & COMMENT
-- =========================

CREATE TABLE reviews (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         user_id BIGINT NOT NULL,
                         product_id BIGINT NOT NULL,

                         rating INT,
                         comment TEXT,

                         status ENUM('VISIBLE', 'HIDDEN') DEFAULT 'VISIBLE',

                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         deleted_at TIMESTAMP NULL,

                         FOREIGN KEY (user_id) REFERENCES users(id),
                         FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE comments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          product_id BIGINT NOT NULL,
                          user_id BIGINT NOT NULL,
                          content TEXT,

                          status ENUM('VISIBLE', 'HIDDEN') DEFAULT 'VISIBLE',

                          parent_id BIGINT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          deleted_at TIMESTAMP NULL,

                          FOREIGN KEY (product_id) REFERENCES products(id),
                          FOREIGN KEY (user_id) REFERENCES users(id),
                          FOREIGN KEY (parent_id) REFERENCES comments(id)
);

