const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');

exports.getBudget = (req, res) => {
  const { account_id, month } = req.query;

  if (!account_id || !month) {
    return res.status(400).json({ error: 'account_id et month sont requis (ex: ?account_id=1&month=2025-01)' });
  }

  Budget.getByAccountAndMonth(account_id, month, (err, budget) => {
    if (err) return res.status(500).json({ error: err.message });
    // if no budget found, return null
    res.json(budget || null);
  });
};

exports.setBudget = (req, res) => {
  const { account_id, month, amount } = req.body;

  if (!account_id || !month || amount === undefined) {
    return res.status(400).json({ error: 'account_id, month et amount sont requis.' });
  }

  Budget.setBudget({ account_id, month, amount }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.getBudgetSummary = (req, res) => {
  const { account_id, month } = req.query;
  if (!account_id || !month) return res.status(400).json({ error: 'account_id et month requis' });

  Budget.getByAccountAndMonth(account_id, month, (err, budget) => {
    if (err) return res.status(500).json({ error: err.message });
    Transaction.getSpentForMonth(account_id, month, (err2, spent) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const budgetAmount = budget?.amount || 0;
      const remaining = Math.max(budgetAmount - spent, 0);
      const percent = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
      res.json({ budget: budgetAmount, spent, remaining, percent });
    });
  });
};