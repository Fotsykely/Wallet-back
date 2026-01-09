const RecurringOperation = require('../models/recurringOperationModel');
const Transaction = require('../models/transactionModel');

exports.createRecurring = (req, res) => {
  RecurringOperation.create(req.body, (err, op) => {
    if (err) return res.status(500).json({ error: err.message });

    // if the recurring is due today, create the transaction immediately
    const todayStr = new Date().toISOString().slice(0,10);
    function isTodayRecurring(rec) {
      const today = new Date();
      if (rec.recurrence === 'daily') return true;
      if (rec.recurrence === 'weekly') {
        const wd = Number(rec.recurrence_date);
        if (!isNaN(wd)) return today.getDay() === wd;
        const d = new Date(rec.recurrence_date); if (!isNaN(d)) return today.getDay() === d.getDay();
      }
      if (rec.recurrence === 'monthly') {
        const dm = Number(rec.recurrence_date);
        if (!isNaN(dm)) return today.getDate() === dm;
        const d = new Date(rec.recurrence_date); if (!isNaN(d)) return today.getDate() === d.getDate();
      }
      if (rec.recurrence === 'yearly') {
        const d = new Date(rec.recurrence_date);
        if (!isNaN(d)) return today.getMonth() === d.getMonth() && today.getDate() === d.getDate();
      }
      return false;
    }

    if (isTodayRecurring(op)) {
      const amount = op.type === 'income' ? Math.abs(op.amount) : -Math.abs(op.amount);
      Transaction.existsForRecurring(op.account_id, todayStr, op.description, amount, (errExist, exists) => {
        if (!errExist && !exists) {
          Transaction.create({
            account_id: op.account_id,
            date: todayStr,
            category: op.type,
            description: op.description,
            amount,
            is_recurring: 1
          }, (errCreate) => {
            if (errCreate) console.error('Erreur création transaction immédiate:', errCreate);
          });
        }
      });
    }

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