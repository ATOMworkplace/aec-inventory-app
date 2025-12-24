const db = require('../config/db');

module.exports = {
    all: () => db.query(`
        SELECT 
            st.*, 
            COALESCE(SUM(s.qty), 0) as occupied
        FROM sites st
        LEFT JOIN stock s ON st.id = s.site_id
        GROUP BY st.id
    `),
    add: (n, t) => db.query('INSERT INTO sites (name, type) VALUES (?, ?)', [n, t])
};