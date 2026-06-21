ALTER TABLE orders ADD payment_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUND');
ALTER TABLE orders ADD paid_amount DECIMAL(12,2);
ALTER TABLE orders ADD remaining_amount DECIMAL(12,2);