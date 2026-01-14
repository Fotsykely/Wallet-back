const db = require('../database/database');
const { buildDateFilters } = require('../utils/queryFilters');
const { format, subDays, addDays } = require('date-fns');

exports.getBalances = (callback) => {
  const sql = `
    SELECT a.id, a.name, a.type,
      IFNULL(SUM(t.amount), 0) as balance
    FROM accounts a
    LEFT JOIN transactions t ON a.id = t.account_id
    GROUP BY a.id, a.name, a.type
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

exports.getBalanceByAccountId = (accountId, callback) => {
  const sql = `
    SELECT SUM(amount) as balance
    FROM transactions
    WHERE account_id = ?
  `;
  db.get(sql, [accountId], (err, row) => {
    if (err) return callback(err);
    // row.balance peut être null si pas de transactions, on renvoie 0 dans ce cas
    callback(null, { accountId, balance: row.balance || 0 });
  });
};

exports.create = (account, callback) => {
  const { name, type, email } = account;
  const sql = `INSERT INTO accounts (name, type, email) VALUES (?, ?, ?)`;
  db.run(sql, [name, type, email || null], function(err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, name, type, email: email || null });
  });
};

exports.getAll = (callback) => {
  const sql = `SELECT * FROM accounts`;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

exports.getById = (id, callback) => {
  const sql = `SELECT * FROM accounts WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
};

exports.update = (id, account, callback) => {
  const { name, type, email } = account;
  const sql = `UPDATE accounts SET name = ?, type = ?, email = ? WHERE id = ?`;
  db.run(sql, [name, type, email || null, id], function(err) {
    if (err) return callback(err);
    callback(null, { id, name, type, email: email || null });
  });
};

exports.delete = (id, callback) => {
  const sql = `DELETE FROM accounts WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) return callback(err);
    callback(null);
  });
};

exports.getAccountDetailsById = (id, callback) => {
  const sql = `
    SELECT 
      a.*, 
      -- Revenus : On prend tout (Salaires inclus)
      IFNULL(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as income,
      
      -- Dépenses : On EXCLUT les récurrences (Loyer, Spotify...) pour le calcul du budget variable
      IFNULL(SUM(CASE 
        WHEN t.amount < 0 AND (t.is_recurring IS NULL OR t.is_recurring = 0) 
        THEN t.amount 
        ELSE 0 
      END), 0) as expense,
      
      -- Solde : On prend TOUT pour avoir le vrai montant disponible sur le compte
      IFNULL(SUM(t.amount), 0) as balance
    FROM accounts a
    LEFT JOIN transactions t ON a.id = t.account_id
    WHERE a.id = ?
    GROUP BY a.id
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(null, null);
    callback(null, {
      account: {
        id: row.id,
        name: row.name,
        type: row.type
      },
      balance: row.balance,
      income: row.income,
      expense: row.expense
    });
  });
};

exports.getAnalysis = (accountId, query, callback) => {
  // 1. Générer les filtres dynamiques pour la période
  const { filters, params } = buildDateFilters(query, 'date');
  let sql = `
    SELECT 
      date,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as Revenus,
      SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) as Dépenses
    FROM transactions
    WHERE account_id = ?
  `;
  const sqlParams = [accountId, ...params];
  if (filters.length > 0) {
    sql += ' AND ' + filters.join(' AND ');
  }
  sql += ' GROUP BY date ORDER BY date ASC';

  // 2. Déterminer la période demandée
  let maxDate = parseInt(query.maxDate, 10) || 6;
  const today = new Date();
  const start = subDays(today, maxDate);
  const startDateStr = format(start, 'yyyy-MM-dd');

  // 3. Calculer le solde initial avant la période
  const balanceSql = `
    SELECT IFNULL(SUM(amount), 0) as initialBalance
    FROM transactions
    WHERE account_id = ?
      AND date < ?
  `;
  db.get(balanceSql, [accountId, startDateStr], (err, balanceRow) => {
    if (err) return callback(err);

    const initialBalance = balanceRow.initialBalance || 0;

    // 4. Récupérer les transactions agrégées par jour sur la période
    db.all(sql, sqlParams, (err, rows) => {
      if (err) return callback(err);

      // 5. Générer tous les jours de la période (pour les jours sans transaction)
      const days = [];
      for (let i = 0; i <= maxDate; i++) {
        days.push(format(addDays(start, i), 'yyyy-MM-dd'));
      }

      // 6. Calcul du solde cumulé
      let balance = initialBalance;
      const result = days.map(day => {
        const found = rows.find(r => r.date === day);
        const revenus = found ? found.Revenus : 0;
        const depenses = found ? found.Dépenses : 0;
        balance += revenus - depenses;
        return {
          day: format(new Date(day), 'dd MMM'),
          Revenus: revenus,
          Dépenses: depenses,
          Balance: balance
        };
      });

      callback(null, result);
    });
  });
};

exports.getAccountDetailsWithPercentages = (accountId, comparisonDays, callback) => {
  // console.log(`Calcul KPIs pour le compte ${accountId} avec ${comparisonDays} jours de comparaison`);
  
  // D'abord, récupérer les détails de base
  this.getAccountDetailsById(accountId, (err, accountDetails) => {
    if (err) return callback(err);
    if (!accountDetails) return callback(null, null);

    // Ensuite, calculer les pourcentages
    const today = new Date();
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - comparisonDays);
    
    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setDate(periodStart.getDate() - comparisonDays);
    
    const formatDate = (date) => date.toISOString().slice(0, 10);
    
    // console.log('Période actuelle:', formatDate(periodStart), 'à', formatDate(today));
    // console.log('Période précédente:', formatDate(previousPeriodStart), 'à', formatDate(periodStart));
    
    // Requête pour période actuelle
    const currentPeriodSql = `
      SELECT 
        IFNULL(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as currentIncome,
        IFNULL(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as currentExpense
      FROM transactions
      WHERE account_id = ? AND date >= ? AND date <= ?
    `;
    
    // Requête pour période précédente
    const previousPeriodSql = `
      SELECT 
        IFNULL(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as previousIncome,
        IFNULL(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as previousExpense
      FROM transactions
      WHERE account_id = ? AND date >= ? AND date < ?
    `;
    
    db.get(currentPeriodSql, [accountId, formatDate(periodStart), formatDate(today)], (err, currentData) => {
      if (err) {
        // console.error('Erreur requête période actuelle:', err);
        return callback(err);
      }
      
      // console.log('Données période actuelle:', currentData);
      
      db.get(previousPeriodSql, [accountId, formatDate(previousPeriodStart), formatDate(periodStart)], (err, previousData) => {
        if (err) {
          // console.error('Erreur requête période précédente:', err);
          return callback(err);
        }
        
        // console.log('Données période précédente:', previousData);
        
        // Calculer les pourcentages
        const calculatePercentage = (current, previous) => {
          if (!previous || previous === 0) {
            return current > 0 ? '+100.0%' : '+0.0%';
          }
          const change = ((current - previous) / previous) * 100;
          const sign = change >= 0 ? '+' : '';
          return `${sign}${change.toFixed(1)}%`;
        };
        
        const incomePercentage = calculatePercentage(
          currentData.currentIncome, 
          previousData.previousIncome
        );
        
        const expensePercentage = calculatePercentage(
          currentData.currentExpense, 
          previousData.previousExpense
        );
        
        // Enrichir les données existantes avec les pourcentages
        const enrichedData = {
          ...accountDetails,
          incomePercentage,
          expensePercentage,
          kpiDetails: {
            currentPeriod: {
              income: currentData.currentIncome,
              expense: currentData.currentExpense
            },
            previousPeriod: {
              income: previousData.previousIncome,
              expense: previousData.previousExpense
            },
            periodInfo: {
              comparisonDays,
              currentPeriod: { start: formatDate(periodStart), end: formatDate(today) },
              previousPeriod: { start: formatDate(previousPeriodStart), end: formatDate(periodStart) }
            }
          }
        };
        
        // console.log('Données enrichies avec pourcentages:', enrichedData);
        callback(null, enrichedData);
      });
    });
  });
};