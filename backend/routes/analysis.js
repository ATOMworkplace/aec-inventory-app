const router = require('express').Router();
const controller = require('../controllers/analysis');

router.get('/', controller.getInsights);

module.exports = router;