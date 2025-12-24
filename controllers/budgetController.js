const Budget = require('../models/budgetModel');

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