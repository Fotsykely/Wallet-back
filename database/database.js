const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./wallet.db');

// Création des tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      date TEXT NOT NULL,
      category TEXT,
      description TEXT,
      amount REAL NOT NULL,
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      label TEXT NOT NULL,
      amount REAL NOT NULL,
      recurrence_type TEXT,
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      label TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      counterparty_name TEXT,
      contact TEXT,
      amount REAL NOT NULL,
      date_issued TEXT NOT NULL,
      status TEXT
    )
  `);
});

module.exports = db;