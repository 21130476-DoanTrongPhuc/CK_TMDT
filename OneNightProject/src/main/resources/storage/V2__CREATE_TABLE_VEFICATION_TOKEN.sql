CREATE TABLE verification_token (
                                    id BIGINT PRIMARY KEY AUTO_INCREMENT,

                                    token VARCHAR(255) NOT NULL UNIQUE,

                                    expiry_date DATETIME NOT NULL,

                                    user_id BIGINT NOT NULL UNIQUE,

                                    CONSTRAINT fk_verification_user
                                        FOREIGN KEY (user_id)
                                            REFERENCES users(id)
                                            ON DELETE CASCADE
);