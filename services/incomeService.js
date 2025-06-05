const Income = require('../models/incomeModel');
const Transaction = require('../models/transactionModel');

exports.createIncomeWithTransaction = (incomeData, callback) => {
  Income.create(incomeData, (err, income) => {
    if (err) return callback(err);

    // Création de la transaction liée à l'income
    const transactionData = {
      account_id: incomeData.account_id,
      date: new Date().toISOString().slice(0, 10), // ou incomeData.date si tu veux la date de l'income
      category: 'income',
      description: incomeData.label,
      amount: incomeData.amount
    };
    Transaction.create(transactionData, (err, transaction) => {
      if (err) return callback(err);
      callback(null, { income, transaction });
    });
  });
};