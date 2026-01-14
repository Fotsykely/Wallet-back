const express = require('express');
const router = express.Router();
const db = require('../database/database');

// 1. GET Settings (Email, etc.)
router.get('/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json(settings);
  });
});

// 2. POST Settings (Save Email)
router.post('/settings', (req, res) => {
  const { key, value } = req.body;
  const sql = `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`;
  db.run(sql, [key, value, value], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Saved', key, value });
  });
});

// 3. GET Export Data (JSON Custom Format)
router.get('/export', async (req, res) => {
  const tables = ['accounts', 'transactions', 'incomes', 'expenses', 'debts', 'recurring_operations', 'budgets', 'settings'];
  const exportData = { version: 1.0, date: new Date().toISOString(), data: {} };

  try {
    const promises = tables.map(table => {
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
          if (err) reject(err);
          else resolve({ table, rows });
        });
      });
    });

    const results = await Promise.all(promises);
    results.forEach(result => {
      exportData.data[result.table] = result.rows;
    });

    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'export: " + err.message });
  }
});

// 4. POST Import Data
router.post('/import', (req, res) => {
  const { data } = req.body; // Structure : { accounts: [], transactions: [], ... }
  
  if (!data) return res.status(400).json({ error: "Format invalide" });

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    try {
      // Désactiver les contraintes FK temporairement
      db.run("PRAGMA foreign_keys = OFF");

      // Pour chaque table présente dans le JSON
      Object.keys(data).forEach(tableName => {
        const rows = data[tableName];
        if (rows.length > 0) {
            // Vider la table
            db.run(`DELETE FROM ${tableName}`);
            
            // Préparer l'insertion
            const columns = Object.keys(rows[0]).join(', ');
            const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
            const stmt = db.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`);

            rows.forEach(row => {
              stmt.run(Object.values(row));
            });
            stmt.finalize();
        }
      });

      db.run("PRAGMA foreign_keys = ON");
      db.run("COMMIT");
      res.json({ message: "Import réussi avec succès" });
    } catch (err) {
      db.run("ROLLBACK");
      res.status(500).json({ error: "Erreur transaction: " + err.message });
    }
  });
});

// 5. DELETE Reset Data
router.delete('/reset', (req, res) => {
  const tables = ['transactions', 'incomes', 'expenses', 'debts', 'recurring_operations', 'budgets'];
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    try {
        tables.forEach(table => db.run(`DELETE FROM ${table}`));
        // On garde le compte principal (ID 1) mais on remet les autres à zéro si besoin
        // db.run("DELETE FROM accounts WHERE id != 1"); 
        
        db.run("COMMIT");
        res.json({ message: "Toutes les données transactionnelles ont été effacées." });
    } catch (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
    }
  });
});

module.exports = router;