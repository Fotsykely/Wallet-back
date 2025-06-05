const Expense = require('../models/expenseModel');
const Transaction = require('../models/transactionModel');

exports.createExpenseWithTransaction = (expenseData, callback) => {
  Expense.create(expenseData, (err, expense) => {
    if (err) return callback(err);

    // Création de la transaction liée à l'expense
    const transactionData = {
      account_id: expenseData.account_id,
      date: expenseData.date,
      category: 'expense',
      description: expenseData.label,
      amount: -Math.abs(expenseData.amount) // montant négatif pour une dépense
    };
    Transaction.create(transactionData, (err, transaction) => {
      if (err) return callback(err);
      callback(null, { expense, transaction });
    });
  });
};