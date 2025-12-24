const db = require('../config/db');

module.exports = {
    all: () => db.query(`
        SELECT 
            i.*, 
            COALESCE(SUM(s.qty), 0) as stock, 
            COALESCE(GROUP_CONCAT(DISTINCT st.name SEPARATOR ', '), 'No Stock') as location
        FROM items i 
        LEFT JOIN stock s ON i.id = s.item_id 
        LEFT JOIN sites st ON s.site_id = st.id
        GROUP BY i.id
    `),
    add: (sku, name, brand, category, cost, price, unit) => 
        db.query(
            'INSERT INTO items (sku, name, brand, category, cost, price, unit) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [sku, name, brand, category, cost, price, unit]
        ),
    del: (id) => db.query('DELETE FROM items WHERE id = ?', [id])
};