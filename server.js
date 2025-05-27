require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// app.use('/api/wallet', walletRoutes) 

app.get('/', (req, res) => {
  res.send('API Wallet opérationnelle 🚀');
})

app.listen(PORT, () => {
  console.log(`Server run  on http://localhost:${PORT}`);
})