const db = require('../database/database');

exports.create = (transaction, callback) => {
  const { account_id, date, category, description, amount } = transaction;
  const sql = `
    INSERT INTO transactions (account_id, date, category, description, amount)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [account_id, date, category, description, amount], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...transaction });
  });
};

exports.getAll = ({ sort = 'none' } = {}, callback) => {
  let sql = `SELECT * FROM transactions`;
  if (sort === 'asc') sql += ` ORDER BY date ASC`;
  if (sort === 'desc') sql += ` ORDER BY date DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

exports.getById = (id, callback) => {
  const sql = `SELECT * FROM transactions WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
};

exports.update = (id, fieldsToUpdate, callback) => {
  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) return callback(null, null); // rien à modifier

  // Construction dynamique du SQL SET : "field1 = ?, field2 = ?"
  const setString = keys.map(key => `${key} = ?`).join(', ');
  const values = keys.map(key => fieldsToUpdate[key]);

  const sql = `UPDATE transactions SET ${setString} WHERE id = ?`;

  db.run(sql, [...values, id], function(err) {
    if (err) return callback(err);
    if (this.changes === 0) return callback(null, null); // id non trouvé
    callback(null, { id, ...fieldsToUpdate });
  });
};

exports.delete = (id, callback) => {
  const sql = `DELETE FROM transactions WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) return callback(err);
    if (this.changes === 0) return callback(null, false); // pas de ligne supprimée = id non trouvé
    callback(null, true);
  });
};




