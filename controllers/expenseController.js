const Expense = require('../models/expenseModel');
const expenseService = require('../services/expenseService');

exports.createExpense = (req, res) => {
  expenseService.createExpenseWithTransaction(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(result);
  });
};

exports.getAllExpenses = (req, res) => {
  Expense.getAll((err, expenses) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(expenses);
  });
};

exports.getExpenseById = (req, res) => {
  const id = req.params.id;
  Expense.getById(id, (err, expense) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  });
};

exports.updateExpense = (req, res) => {
  const id = req.params.id;
  Expense.update(id, req.body, (err, expense) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(expense);
  });
};

exports.deleteExpense = (req, res) => {
  const id = req.params.id;
  Expense.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};