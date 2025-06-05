const db = require('../database/database');

const Income = {
  create: (income, callback) => {
    const { account_id, label, amount, recurrence_type } = income;
    const sql = `
      INSERT INTO incomes (account_id, label, amount, recurrence_type)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [account_id, label, amount, recurrence_type], function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...income });
    });
  },

  getAll: (callback) => {
    const sql = `SELECT * FROM incomes`;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `SELECT * FROM incomes WHERE id = ?`;
    db.get(sql, [id], callback);
  },

  update: (id, income, callback) => {
    const { label, amount, recurrence_type } = income;
    const sql = `
      UPDATE incomes
      SET label = ?, amount = ?, recurrence_type = ?
      WHERE id = ?
    `;
    db.run(sql, [label, amount, recurrence_type, id], function (err) {
      if (err) return callback(err);
      callback(null, { id, ...income });
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM incomes WHERE id = ?`;
    db.run(sql, [id], function (err) {
      if (err) return callback(err);
      callback(null, { deleted: true });
    });
  },
};

module.exports = Income;
