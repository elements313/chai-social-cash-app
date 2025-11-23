const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test data endpoints
app.get('/api/user-balances', (req, res) => {
  console.log('User balances requested');
  res.json([]);
});

app.get('/api/transactions', (req, res) => {
  console.log('Transactions requested');
  res.json([]);
});

app.get('/api/cash-balance', (req, res) => {
  console.log('Cash balance requested');
  res.json({ total_till_cash: 0, last_updated: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

console.log('Starting test server...');