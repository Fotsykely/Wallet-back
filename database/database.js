const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Récupérer le chemin userData depuis la variable d'environnement
const userDataPath = process.env.USER_DATA_PATH;

// Choisir le chemin de la base de données
let dbPath;
if (userDataPath) {
  // Mode production (application buildée)
  dbPath = path.join(userDataPath, 'wallet.db');
  console.log('Production mode - Database at:', dbPath);
} else {
  // Mode développement
  dbPath = './wallet.db';
  console.log('Development mode - Database at:', dbPath);
}

const db = new sqlite3.Database(dbPath);

// Création des tables
db.serialize(() => {
  // Création de la table accounts
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  // Création de la table transactions
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

  //creation de la table income
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

  // Création de la table expenses
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

  // Création de la table debts
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

  // Création de la table recurring_operations
  db.run(`
    CREATE TABLE IF NOT EXISTS recurring_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      type TEXT NOT NULL, -- 'income' ou 'expense'
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      recurrence TEXT NOT NULL, -- 'monthly', 'weekly', etc.
      recurrence_date INTEGER,   -- jour du mois ou de la semaine
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    )
  `);

  db.get("SELECT * FROM accounts WHERE id = 1", (err, row) => {
    if (!err && !row) {
      console.log('Account with ID 1 not found, creating default account...');
      db.run(`
        INSERT INTO accounts (id, name, type) 
        VALUES (1, 'Mon Compte Principal', 'checking')
      `, (err) => {
        if (err) {
          console.error('Error creating default account:', err);
        } else {
          console.log('Default account created successfully with ID 1');
        }
      });
    } else if (!err && row) {
      console.log('Account with ID 1 already exists:', row.name);
    }
  });
});

module.exports = db;