const db = require('../config/db');

module.exports = {
    all: () => db.query(`
        SELECT 
            s.*, 
            i.name as item, 
            i.sku, 
            i.cost, 
            i.price, 
            st.name as site 
        FROM stock s 
        JOIN items i ON s.item_id = i.id 
        JOIN sites st ON s.site_id = st.id
    `),
    upd: (ii, si, q) => db.query('INSERT INTO stock (item_id, site_id, qty) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = qty + ?', [ii, si, q, q])
};