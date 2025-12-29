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
          category: rec.type, // ex: 'expense' or 'income'
          description: rec.description,
          // Gestion du signe selon le type
          amount: rec.type === 'income' ? Math.abs(rec.amount) : -Math.abs(rec.amount),
          is_recurring: 1 // Marked transaction as recurring
        };
        
        Transaction.create(transaction, (err) => {
          if (err) console.error('Erreur création transaction récurrente:', err);
        });
      }
    });

    callback(null, { executed: true });
  });
};