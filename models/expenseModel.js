const db = require('../database/database');

const Expense = {
  create: (expense, callback) => {
    const { account_id, label, amount, date } = expense;
    const sql = `
      INSERT INTO expenses (account_id, label, amount, date)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [account_id, label, amount, date], function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...expense });
    });
  },

  getAll: (callback) => {
    const sql = `SELECT * FROM expenses`;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `SELECT * FROM expenses WHERE id = ?`;
    db.get(sql, [id], callback);
  },

  update: (id, expense, callback) => {
    const { label, amount, date } = expense;
    const sql = `
      UPDATE expenses
      SET label = ?, amount = ?, date = ?
      WHERE id = ?
    `;
    db.run(sql, [label, amount, date, id], function (err) {
      if (err) return callback(err);
      callback(null, { id, ...expense });
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM expenses WHERE id = ?`;
    db.run(sql, [id], function (err) {
      if (err) return callback(err);
      callback(null, { deleted: true });
    });
  },
};

module.exports = Expense;