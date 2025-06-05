const Account = require('../models/accountModel');

exports.getAccountsBalance = (req, res) => {
  Account.getBalances((err, balances) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(balances);
  });
};

exports.getAccountBalanceById = (req, res) => {
  const accountId = req.params.id;

  Account.getBalanceByAccountId(accountId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.createAccount = (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Le nom et le type sont requis.' });
  }
  Account.create({ name, type }, (err, account) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(account);
  });
};

exports.getAllAccounts = (req, res) => {
  Account.getAll((err, accounts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(accounts);
  });
};

exports.getAccountById = (req, res) => {
  const id = req.params.id;
  Account.getById(id, (err, account) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!account) return res.status(404).json({ error: 'Compte non trouvé.' });
    res.json(account);
  });
};

exports.updateAccount = (req, res) => {
  const id = req.params.id;
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Le nom et le type sont requis.' });
  }
  Account.update(id, { name, type }, (err, account) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(account);
  });
};

exports.deleteAccount = (req, res) => {
  const id = req.params.id;
  Account.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Compte ${id} supprimé avec succès.` });
  });
};