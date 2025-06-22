const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/balance', accountController.getAccountsBalance);
router.get('/:id/balance', accountController.getAccountBalanceById);
router.post('/', accountController.createAccount);
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);
router.get('/:id/details', accountController.getAccountDetailsById);
router.get('/:id/analysis', accountController.getAnalysis);

module.exports = router;
