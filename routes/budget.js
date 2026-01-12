const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// GET /api/budgets?account_id=1&month=2025-01
router.get('/', budgetController.getBudget);

// POST /api/budgets (Body: { account_id, month, amount })
router.post('/', budgetController.setBudget);

// GET /api/budgets/summary
router.get('/summary', budgetController.getBudgetSummary);

module.exports = router;