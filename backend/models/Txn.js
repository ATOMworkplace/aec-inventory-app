const db = require('../config/db');

module.exports = {
    add: (ii, fs, ts, q, t) => db.query('INSERT INTO txns (item_id, from_site, to_site, qty, type, date) VALUES (?, ?, ?, ?, ?, NOW())', [ii, fs, ts, q, t]),
    all: () => db.query(`
        SELECT 
            id, item_id, from_site, to_site, qty, type, 
            DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as date 
        FROM txns 
        ORDER BY date DESC
    `)
};