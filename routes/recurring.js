const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringOperationController');

router.post('/', recurringController.createRecurring);
router.get('/', recurringController.getAllRecurrings);
router.get('/:id', recurringController.getRecurringById);
router.get('/account/:accountId', recurringController.getRecurringByAccountId);
router.put('/:id', recurringController.updateRecurring);
router.delete('/:id', recurringController.deleteRecurring);

module.exports = router;