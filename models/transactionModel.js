const db = require('../database/database');
const { buildDateFilters } = require('../utils/queryFilters');

const Transaction = {
  create: (transaction, callback) => {
    // Add is_recurring field with default value 0 (false)
    const { account_id, date, category, description, amount, is_recurring = 0 } = transaction;
    
    const sql = `
      INSERT INTO transactions (account_id, date, category, description, amount, is_recurring)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // Ensure it's an integer (0 or 1) for SQLite
    const isRecurringValue = is_recurring ? 1 : 0;

    db.run(sql, [account_id, date, category, description, amount, isRecurringValue], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...transaction, is_recurring: isRecurringValue });
    });
  },

  getAll: ({ sort = 'none' } = {}, callback) => {
    let sql = `SELECT * FROM transactions`;
    if (sort === 'asc') sql += ` ORDER BY date ASC`;
    if (sort === 'desc') sql += ` ORDER BY date DESC`;

    db.all(sql, [], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  getById: (id, callback) => {
    const sql = `SELECT * FROM transactions WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    });
  },

  update: (id, fieldsToUpdate, callback) => {
    const keys = Object.keys(fieldsToUpdate);
    if (keys.length === 0) return callback(null, null);

    // Construction dynamique du SQL SET : "field1 = ?, field2 = ?"
    const setString = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => fieldsToUpdate[key]);

    const sql = `UPDATE transactions SET ${setString} WHERE id = ?`;

    db.run(sql, [...values, id], function(err) {
      if (err) return callback(err);
      if (this.changes === 0) return callback(null, null); // id not found
      callback(null, { id, ...fieldsToUpdate });
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM transactions WHERE id = ?`;
    db.run(sql, [id], function(err) {
      if (err) return callback(err);
      if (this.changes === 0) return callback(null, false); // no rows deleted = id not found
      callback(null, true);
    });
  },

  getByAccountId: (accountId, query = {}, callback) => {
    let sql = `SELECT * FROM transactions WHERE account_id = ?`;
    const params = [accountId];

    // Ajout des filtres dynamiques
    const { filters, params: filterParams } = buildDateFilters(query, 'date');
    if (filters.length > 0) {
      sql += ' AND ' + filters.join(' AND ');
      params.push(...filterParams);
    }

    sql += ' ORDER BY date DESC';

    db.all(sql, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // check if a transaction exists for a given recurring, to avoid duplicates (account_id, date, description, amount)
  existsForRecurring: (account_id, date, description, amount, callback) => {
    const sql = `
      SELECT id FROM transactions
      WHERE account_id = ? AND date = ? AND description = ? AND amount = ?
      LIMIT 1
    `;
    db.get(sql, [account_id, date, description, amount], (err, row) => {
      if (err) return callback(err);
      callback(null, !!row);
    });
  },

  getSpentForMonth: (accountId, month, callback) => {
    // month = 'YYYY-MM'
    const like = `${month}-%`;
    const sql = `
      SELECT IFNULL(SUM(CASE WHEN amount < 0 AND (is_recurring IS NULL OR is_recurring = 0) THEN ABS(amount) ELSE 0 END), 0) as spent
      FROM transactions
      WHERE account_id = ? AND date LIKE ?
    `;
    db.get(sql, [accountId, like], (err, row) => {
      if (err) return callback(err);
      callback(null, row?.spent ?? 0);
    });
  },

  getByAccount: (accountId, filter = {}, callback) => {
    const { filters, params } = buildDateFilters(filter, 'date');
    
    let sql = `
      SELECT * FROM transactions
      WHERE account_id = ?
    `;
    const queryParams = [accountId];

    if (filters.length > 0) {
      sql += ` AND ${filters.join(' AND ')}`;
      queryParams.push(...params);
    }

    sql += ` ORDER BY date DESC`;

    db.all(sql, queryParams, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows || []);
    });
  },
};

module.exports = Transaction;



