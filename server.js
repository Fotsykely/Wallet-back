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

// Execute missed recurrings since last run date stored in a file
{
  const fs = require('fs');
  const path = require('path');

  const userData = process.env.USER_DATA_PATH || process.cwd();
  const lastRunFile = path.join(userData, 'last_recurrence_run.txt');

  const lastRunDate = fs.existsSync(lastRunFile) ? fs.readFileSync(lastRunFile, 'utf8').trim() : null;

  recurringExecutionService.executeMissedRecurrings(lastRunDate, (err, res) => {
    if (err) console.error('Erreur exécution récurrences manquées au démarrage:', err);
    else {
      console.log('Récurrences manquées exécutées au démarrage:', res);
      try {
        fs.writeFileSync(lastRunFile, new Date().toISOString().slice(0,10));
      } catch (e) {
        console.error('Impossible d\'écrire last_recurrence_run:', e);
      }
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server run  on http://localhost:${PORT}`);
})