const RecurringOperation = require('../models/recurringOperationModel');

exports.createRecurring = (req, res) => {
  RecurringOperation.create(req.body, (err, op) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(op);
  });
};

exports.getAllRecurrings = (req, res) => {
  RecurringOperation.getAll((err, ops) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(ops);
  });
};

exports.getRecurringById = (req, res) => {
  RecurringOperation.getById(req.params.id, (err, op) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!op) return res.status(404).json({ error: 'Not found' });
    res.json(op);
  });
};

exports.getRecurringByAccountId = (req, res) => {
  RecurringOperation.getByAccountId(req.params.accountId, req.query, (err, ops) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(ops);
  });
};

exports.updateRecurring = (req, res) => {
  RecurringOperation.update(req.params.id, req.body, (err, op) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(op);
  });
};

exports.deleteRecurring = (req, res) => {
  RecurringOperation.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};