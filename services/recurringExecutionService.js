const RecurringOperation = require('../models/recurringOperationModel');
const Transaction = require('../models/transactionModel');

function isTodayRecurring(rec) {
  const today = new Date();
  if (rec.recurrence === 'monthly') {
    return today.getDate() === rec.recurrence_date;
  }
  if (rec.recurrence === 'weekly') {
    return today.getDay() === rec.recurrence_date;
  }
  if (rec.recurrence === 'daily') {
    return true; // Tous les jours
  }
  return false;
}

exports.executeTodayRecurrings = (callback) => {
  RecurringOperation.getAll((err, recurrings) => {
    if (err) return callback(err);

    recurrings.forEach(rec => {
      if (isTodayRecurring(rec)) {
        const transaction = {
          account_id: rec.account_id,
          date: new Date().toISOString().slice(0, 10),
          category: rec.type,
          description: rec.description,
          amount: rec.type === 'income' ? Math.abs(rec.amount) : -Math.abs(rec.amount)
        };
        Transaction.create(transaction, (err) => {
          if (err) console.error('Erreur création transaction récurrente:', err);
        });
      }
    });

    callback(null, { executed: true });
  });
};