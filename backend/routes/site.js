const r = require('express').Router();
const c = require('../controllers/site');
r.get('/', c.getSites);
module.exports = r;