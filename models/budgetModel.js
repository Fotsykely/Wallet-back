const db = require('../database/database');

const Budget = {
  // Get budget by account ID and month
  getByAccountAndMonth: (accountId, month, callback) => {
    const sql = `SELECT * FROM budgets WHERE account_id = ? AND month = ?`;
    db.get(sql, [accountId, month], callback);
  },

  // Create or update a budget
  setBudget: (data, callback) => {
    const { account_id, month, amount } = data;
    
    // Check if budget exists
    const checkSql = `SELECT id FROM budgets WHERE account_id = ? AND month = ?`;
    
    db.get(checkSql, [account_id, month], (err, row) => {
      if (err) return callback(err);

      if (row) {
        // Update existing budget
        const updateSql = `UPDATE budgets SET amount = ? WHERE id = ?`;
        db.run(updateSql, [amount, row.id], function(err) {
          if (err) return callback(err);
          callback(null, { id: row.id, ...data });
        });
      } else {
        // Insert new budget
        const insertSql = `INSERT INTO budgets (account_id, month, amount) VALUES (?, ?, ?)`;
        db.run(insertSql, [account_id, month, amount], function(err) {
          if (err) return callback(err);
          callback(null, { id: this.lastID, ...data });
        });
      }
    });
  }
};

module.exports = Budget;