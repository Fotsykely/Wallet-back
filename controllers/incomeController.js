const Income = require('../models/incomeModel');
const incomeService = require('../services/incomeService');

exports.createIncome = (req, res) => {
  incomeService.createIncomeWithTransaction(req.body, (err, income) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(income);
  });
};

exports.getAllIncomes = (req, res) => {
  Income.getAll((err, incomes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(incomes);
  });
};

exports.getIncomeById = (req, res) => {
  const id = req.params.id;
  Income.getById(id, (err, income) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!income) return res.status(404).json({ error: 'Income not found' });
    res.json(income);
  });
};

exports.updateIncome = (req, res) => {
  const id = req.params.id;
  Income.update(id, req.body, (err, income) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(income);
  });
};

exports.deleteIncome = (req, res) => {
  const id = req.params.id;
  Income.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};
