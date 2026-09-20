BEGIN;
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_customer ON orders(customer_id);
COMMIT;
