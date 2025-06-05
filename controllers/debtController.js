const Debt = require('../models/debtModel');

exports.createDebt = (req, res) => {
  Debt.create(req.body, (err, debt) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(debt);
  });
};

exports.getAllDebts = (req, res) => {
  Debt.getAll((err, debts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(debts);
  });
};

exports.getDebtById = (req, res) => {
  const id = req.params.id;
  Debt.getById(id, (err, debt) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    res.json(debt);
  });
};

exports.updateDebt = (req, res) => {
  const id = req.params.id;
  Debt.update(id, req.body, (err, debt) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(debt);
  });
};

exports.deleteDebt = (req, res) => {
  const id = req.params.id;
  Debt.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};