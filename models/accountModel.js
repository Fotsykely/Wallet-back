const db = require('../database/database');

exports.getBalances = (callback) => {
  const sql = `
    SELECT a.id, a.name, a.type,
      IFNULL(SUM(t.amount), 0) as balance
    FROM accounts a
    LEFT JOIN transactions t ON a.id = t.account_id
    GROUP BY a.id, a.name, a.type
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

exports.getBalanceByAccountId = (accountId, callback) => {
  const sql = `
    SELECT SUM(amount) as balance
    FROM transactions
    WHERE account_id = ?
  `;
  db.get(sql, [accountId], (err, row) => {
    if (err) return callback(err);
    // row.balance peut être null si pas de transactions, on renvoie 0 dans ce cas
    callback(null, { accountId, balance: row.balance || 0 });
  });
};

exports.create = (account, callback) => {
  const { name, type } = account;
  const sql = `INSERT INTO accounts (name, type) VALUES (?, ?)`;
  db.run(sql, [name, type], function(err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, name, type });
  });
};

exports.getAll = (callback) => {
  const sql = `SELECT * FROM accounts`;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

exports.getById = (id, callback) => {
  const sql = `SELECT * FROM accounts WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
};

exports.update = (id, account, callback) => {
  const { name, type } = account;
  const sql = `UPDATE accounts SET name = ?, type = ? WHERE id = ?`;
  db.run(sql, [name, type, id], function(err) {
    if (err) return callback(err);
    callback(null, { id, name, type });
  });
};

exports.delete = (id, callback) => {
  const sql = `DELETE FROM accounts WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) return callback(err);
    callback(null);
  });
};