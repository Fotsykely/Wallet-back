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
  // Récupérer l'existant puis merger les champs fournis (permet update partiel)
  Account.getById(id, (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: 'Compte non trouvé.' });

    const name = req.body.name ?? existing.name;
    const type = req.body.type ?? existing.type;
    const email = req.body.email ?? existing.email;

    Account.update(id, { name, type, email }, (err, account) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(account);
    });
  });
};

exports.deleteAccount = (req, res) => {
  const id = req.params.id;
  Account.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Compte ${id} supprimé avec succès.` });
  });
};

exports.getAccountDetailsById = (req, res) => {
  const id = req.params.id;
  const includePercentages = req.query.includePercentages === 'true';
  const comparisonDays = parseInt(req.query.comparisonDays, 10) || 30;

  if (includePercentages) {
    // Nouvelle logique avec pourcentages
    Account.getAccountDetailsWithPercentages(id, comparisonDays, (err, details) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!details) return res.status(404).json({ error: 'Compte non trouvé.' });
      res.json(details);
    });
  } else {
    // Logique existante (pour compatibilité)
    Account.getAccountDetailsById(id, (err, details) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!details) return res.status(404).json({ error: 'Compte non trouvé.' });
      res.json(details);
    });
  }
};

exports.getAnalysis = (req, res) => {
  const accountId = req.params.id;
  Account.getAnalysis(accountId, req.query, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
};