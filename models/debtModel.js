const db = require('../database/database');

const Debt = {
  create: (debt, callback) => {
    const { type, counterparty_name, contact, amount, date_issued, status } = debt;
    const sql = `
      INSERT INTO debts (type, counterparty_name, contact, amount, date_issued, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [type, counterparty_name, contact, amount, date_issued, status], function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...debt });
    });
  },

  getAll: (callback) => {
    const sql = `SELECT * FROM debts`;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `SELECT * FROM debts WHERE id = ?`;
    db.get(sql, [id], callback);
  },

  update: (id, debt, callback) => {
    const { type, counterparty_name, contact, amount, date_issued, status } = debt;
    const sql = `
      UPDATE debts
      SET type = ?, counterparty_name = ?, contact = ?, amount = ?, date_issued = ?, status = ?
      WHERE id = ?
    `;
    db.run(sql, [type, counterparty_name, contact, amount, date_issued, status, id], function (err) {
      if (err) return callback(err);
      callback(null, { id, ...debt });
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM debts WHERE id = ?`;
    db.run(sql, [id], function (err) {
      if (err) return callback(err);
      callback(null, { deleted: true });
    });
  },
};

module.exports = Debt;