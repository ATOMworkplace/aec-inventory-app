const r = require('express').Router();
const c = require('../controllers/inv');

r.get('/items', c.getItems);
r.post('/items', c.addItem);
r.delete('/items/:id', c.deleteItem);

r.get('/stock', c.getStock);

r.get('/txn', c.getTxns); 
r.post('/txn', c.addTxn);

module.exports = r;