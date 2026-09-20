SELECT SUM(o.total) FROM orders o JOIN items i ON i.orderId=o.id JOIN shipments s ON s.orderId=o.id;
