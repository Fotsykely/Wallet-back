const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintenanceController');

router.get('/settings', controller.getSettings);
router.post('/settings', controller.saveSetting);
router.get('/export', controller.exportData);
router.post('/import', controller.importData);
router.delete('/reset', controller.resetData);

module.exports = router;