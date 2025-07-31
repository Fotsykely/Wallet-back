const db = require('../database/database');
const { getByAccountId } = require('./transactionModel');

const RecurringOperation = {
  create: (data, callback) => {
    const { account_id, type, description, amount, recurrence, recurrence_date} = data;
    const sql = `
      INSERT INTO recurring_operations 
      (account_id, type, description, amount, recurrence, recurrence_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [account_id, type, description, amount, recurrence, recurrence_date], function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...data });
    });
  },

  getAll: (callback) => {
    db.all(`SELECT * FROM recurring_operations`, [], callback);
  },

  getById: (id, callback) => {
    db.get(`SELECT * FROM recurring_operations WHERE id = ?`, [id], callback);
  },

  getByAccountId: (accountId, callback) => {
    db.all(`SELECT * FROM recurring_operations WHERE account_id = ?`, [accountId], callback);
  },

  update: (id, data, callback) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.run(`UPDATE recurring_operations SET ${fields} WHERE id = ?`, [...values, id], function (err) {
      if (err) return callback(err);
      callback(null, { id, ...data });
    });
  },

  delete: (id, callback) => {
    db.run(`DELETE FROM recurring_operations WHERE id = ?`, [id], function (err) {
      if (err) return callback(err);
      callback(null, { deleted: true });
    });
  },
};

module.exports = RecurringOperation;