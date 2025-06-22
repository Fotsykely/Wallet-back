const Transaction = require('../models/transactionModel');

exports.createTransaction = (req, res) => {
  const { account_id, date, category, description, amount } = req.body;
  if (!account_id || !date || amount === undefined) {
    return res.status(400).json({ error: 'account_id, date et amount sont requis.' });
  }
  Transaction.create({ account_id, date, category, description, amount }, (err, transaction) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(transaction);
  });
};

exports.getAllTransactions = (req, res) => {
  const sort = req.query.sort || 'none';

  Transaction.getAll({ sort }, (err, transactions) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(transactions);
  });
};

exports.getTransactionById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de la transaction requis.' });
    }
    
    Transaction.getById(id, (err, transaction) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!transaction) return res.status(404).json({ error: 'Transaction non trouvée.' });
        res.json(transaction);
    });
};

exports.updateTransaction = (req, res) => {
  const id = req.params.id;
  const fieldsToUpdate = req.body;

  if (!id || Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'ID de la transaction et champs à mettre à jour requis.' });
  }

  Transaction.update(id, fieldsToUpdate, (err, updatedTransaction) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!updatedTransaction) return res.status(404).json({ error: 'Transaction non trouvée.' });
    res.json(updatedTransaction);
  });
};

exports.deleteTransaction = (req, res) => {
  const id = req.params.id;

  Transaction.delete(id, (err, success) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!success) return res.status(404).json({ error: 'Transaction non trouvée' });
    res.json({ message: `Transaction ${id} supprimée avec succès.` });
  });
};

exports.getTransactionsByAccountId = (req, res) => {
  const accountId = req.params.accountId;
  if (!accountId) {
    return res.status(400).json({ error: 'accountId requis.' });
  }
  // Passe les query params au modèle
  Transaction.getByAccountId(accountId, req.query, (err, transactions) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(transactions);
  });
};