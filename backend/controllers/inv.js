const Item = require('../models/Item');
const Stock = require('../models/Stock');
const Txn = require('../models/Txn');

exports.getItems = async (q, s) => { const [r] = await Item.all(); s.json(r); };
exports.getStock = async (q, s) => { const [r] = await Stock.all(); s.json(r); };

exports.addItem = async (q, s) => {
    try {
        const { sku, name, brand, category, cost, price, unit } = q.body;
        await Item.add(sku, name, brand, category, cost, price, unit);
        s.json({ ok: true });
    } catch (e) {
        console.error(e);
        s.status(500).json({ error: e.message });
    }
};

exports.deleteItem = async (q, s) => {
    try {
        await Item.del(q.params.id);
        s.json({ ok: true });
    } catch (e) {
        console.error(e);
        s.status(500).json({ error: e.message });
    }
};

exports.getTxns = async (q, s) => { 
    const [r] = await Txn.all(); 
    s.json(r); 
};

exports.addTxn = async (q, s) => {
    const { itemId, from, to, qty, type } = q.body;
    await Txn.add(itemId, from, to, qty, type);
    
    if (type === 'IN') await Stock.upd(itemId, to, qty);
    if (type === 'OUT') await Stock.upd(itemId, from, -qty);
    if (type === 'DAMAGE') await Stock.upd(itemId, from, -qty);
    if (type === 'MOVE') { 
        await Stock.upd(itemId, from, -qty); 
        await Stock.upd(itemId, to, qty); 
    }
    s.json({ ok: true });
};