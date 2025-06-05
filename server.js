require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('API Wallet opérationnelle 🚀');
})

app.listen(PORT, () => {
  console.log(`Server run  on http://localhost:${PORT}`);
})