require('dotenv').config();
const express = require('express');
const cors = require('cors');
const recurringExecutionService = require('./services/recurringExecutionService');
const cron = require('node-cron');
// Récupérer le userDataPath passé par Electron
const userDataPath = process.argv[2];


console.log('Server started with userDataPath:', userDataPath);

// Passer le userDataPath à la base de données via une variable d'environnement
if (userDataPath) {
  process.env.USER_DATA_PATH = userDataPath;
}

const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Exécute tous les jours à 09:00
cron.schedule('0 9 * * *', () => {
  recurringExecutionService.executeTodayRecurrings((err, res) => {
    if (err) console.error('Erreur exécution récurrences:', err);
    else console.log('Récurrences exécutées:', res);
  });
});

//routes
const transactionsRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionsRoutes);

const accountRoutes = require('./routes/account');
app.use('/api/accounts', accountRoutes);

const incomeRoutes = require('./routes/income');
app.use('/api/incomes', incomeRoutes);

const expenseRoutes = require('./routes/expense');
app.use('/api/expenses', expenseRoutes);

const debtRoutes = require('./routes/debt');
app.use('/api/debts', debtRoutes);

const recurringRoutes = require('./routes/recurring');
app.use('/api/recurrings', recurringRoutes);

const budgetRoutes = require('./routes/budget');
app.use('/api/budgets', budgetRoutes);

app.get('/', (req, res) => {
  res.send('API Wallet opérationnelle 🚀');
})

// Execute missed recurrings using DB-stored last run (instead of file)
{
  const key = 'last_recurrence_run';

  db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
    if (err) {
      console.error('Erreur lecture settings:', err);
      // fallback: call with null to use default lookback
      recurringExecutionService.executeMissedRecurrings(null, () => {});
      return;
    }

    const lastRun = row ? row.value : null;

    recurringExecutionService.executeMissedRecurrings(lastRun, (err2, res) => {
      if (err2) console.error('Erreur exécution récurrences manquées au démarrage:', err2);
      else {
        console.log('Récurrences manquées exécutées au démarrage:', res);
        const nowIso = new Date().toISOString();
        // upsert last run
        db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, nowIso], (e) => {
          if (e) console.error('Impossible de sauvegarder last_recurrence_run dans settings:', e);
        });
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server run  on http://localhost:${PORT}`);
})