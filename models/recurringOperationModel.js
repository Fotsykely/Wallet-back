const db = require('../database/database');
const { buildDateFilters } = require('../utils/queryFilters');

const RecurringOperation = {
  create: (data, callback) => {
    const { account_id, type, description, amount, recurrence, recurrence_date} = data;
    const sql = `
      INSERT INTO recurring_operations 
      (account_id, type, description, amount, recurrence, recurrence_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    db.run(sql, [account_id, type, description, amount, recurrence, recurrence_date], function (err) {
      if (err) return callback(err);
      
      db.get(`SELECT * FROM recurring_operations WHERE id = ?`, [this.lastID], (err, row) => {
        if (err) return callback(err);
        callback(null, row);
      });
    });
  },

  getAll: (callback) => {
    db.all(`SELECT * FROM recurring_operations`, [], callback);
  },

  getById: (id, callback) => {
    db.get(`SELECT * FROM recurring_operations WHERE id = ?`, [id], callback);
  },

  getByAccountId: (accountId, query = {}, callback) => {
    let sql = `SELECT * FROM recurring_operations WHERE account_id = ?`;
    const params = [accountId];

    // Traitement spécial pour maxDate avec datetime
    if (query.maxDate) {
      const maxDate = parseInt(query.maxDate);
      if (!isNaN(maxDate)) {
        // Utilise date() pour extraire seulement la partie date de created_at
        sql += ` AND date(created_at) >= date('now', '-${maxDate} days')`;
      }
    }

    // Autres filtres peuvent être ajoutés ici si nécessaire
    const queryWithoutMaxDate = { ...query };
    delete queryWithoutMaxDate.maxDate;

    // Si vous avez d'autres filtres de date, utilisez buildDateFilters
    if (Object.keys(queryWithoutMaxDate).length > 0) {
      const { filters, params: filterParams } = buildDateFilters(queryWithoutMaxDate, 'date(created_at)');
      if (filters.length > 0) {
        sql += ' AND ' + filters.join(' AND ');
        params.push(...filterParams);
      }
    }

    sql += ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
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