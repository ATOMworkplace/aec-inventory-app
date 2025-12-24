const Site = require('../models/Site');
exports.getSites = async (req, res) => { const [r] = await Site.all(); res.json(r); };