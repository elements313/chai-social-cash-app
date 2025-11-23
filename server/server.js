const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'cashapp.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

function initDatabase() {
  // Users table for tracking who has cash
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    total_cash REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Transactions table for all cash activities
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('daily_closing', 'cash_withdrawal', 'cash_deposit', 'cash_spending')),
    user_id INTEGER,
    photo_path TEXT NOT NULL,
    amount REAL NOT NULL,
    
    -- Daily closing specific fields
    bills_100 INTEGER DEFAULT 0,
    bills_50 INTEGER DEFAULT 0,
    bills_20 INTEGER DEFAULT 0,
    bills_10 INTEGER DEFAULT 0,
    bills_5 INTEGER DEFAULT 0,
    coins_toonies INTEGER DEFAULT 0,
    coins_loonies INTEGER DEFAULT 0,
    coins_quarters INTEGER DEFAULT 0,
    coins_dimes INTEGER DEFAULT 0,
    coins_nickels INTEGER DEFAULT 0,
    coins_pennies INTEGER DEFAULT 0,
    
    -- Cash withdrawal specific fields
    recipient_name TEXT,
    withdrawal_reason TEXT,
    
    -- Cash spending specific fields
    spending_description TEXT,
    spending_category TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Cash balance tracking
  db.run(`CREATE TABLE IF NOT EXISTS cash_balance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_till_cash REAL NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    FOREIGN KEY (updated_by) REFERENCES users (id)
  )`);

  // Initialize cash balance if empty
  db.get("SELECT COUNT(*) as count FROM cash_balance", (err, row) => {
    if (!err && row.count === 0) {
      db.run("INSERT INTO cash_balance (total_till_cash) VALUES (0)");
    }
  });
}

// API Routes

// Upload photo and create user session
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }
  
  const sessionId = uuidv4();
  res.json({
    success: true,
    sessionId: sessionId,
    photoPath: req.file.filename
  });
});

// Get current cash balance
app.get('/api/cash-balance', (req, res) => {
  db.get("SELECT * FROM cash_balance ORDER BY last_updated DESC LIMIT 1", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || { total_till_cash: 0 });
  });
});

// Record daily closing
app.post('/api/daily-closing', (req, res) => {
  const {
    sessionId,
    photoPath,
    personName,
    bills_100, bills_50, bills_20, bills_10, bills_5,
    coins_toonies, coins_loonies, coins_quarters, coins_dimes, coins_nickels, coins_pennies
  } = req.body;

  // Calculate total amount
  const totalAmount = (bills_100 * 100) + (bills_50 * 50) + (bills_20 * 20) + (bills_10 * 10) + (bills_5 * 5) +
                     (coins_toonies * 2) + (coins_loonies * 1) + (coins_quarters * 0.25) + 
                     (coins_dimes * 0.10) + (coins_nickels * 0.05) + (coins_pennies * 0.01);

  const transactionId = uuidv4();

  db.run(`INSERT INTO transactions (
    transaction_id, type, photo_path, amount, recipient_name,
    bills_100, bills_50, bills_20, bills_10, bills_5,
    coins_toonies, coins_loonies, coins_quarters, coins_dimes, coins_nickels, coins_pennies
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [transactionId, 'daily_closing', photoPath, totalAmount, personName,
   bills_100, bills_50, bills_20, bills_10, bills_5,
   coins_toonies, coins_loonies, coins_quarters, coins_dimes, coins_nickels, coins_pennies],
  function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Update cash balance
    db.run("UPDATE cash_balance SET total_till_cash = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1",
      [totalAmount], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          success: true,
          transactionId: transactionId,
          totalAmount: totalAmount
        });
      });
  });
});

// Record cash withdrawal
app.post('/api/cash-withdrawal', (req, res) => {
  const { sessionId, photoPath, recipientName, amount, reason } = req.body;

  if (!recipientName || !amount || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transactionId = uuidv4();

  // First, get or create user
  db.get("SELECT * FROM users WHERE name = ?", [recipientName], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const handleTransaction = (userId) => {
      db.run(`INSERT INTO transactions (
        transaction_id, type, user_id, photo_path, amount, recipient_name, withdrawal_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, 'cash_withdrawal', userId, photoPath, amount, recipientName, reason],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Update user's cash balance
        db.run("UPDATE users SET total_cash = total_cash + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [amount, userId], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Update till balance
            db.run("UPDATE cash_balance SET total_till_cash = total_till_cash - ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1",
              [amount], (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.json({
                  success: true,
                  transactionId: transactionId,
                  message: `${recipientName} now has $${amount} additional cash`
                });
              });
          });
      });
    };

    if (user) {
      handleTransaction(user.id);
    } else {
      // Create new user
      db.run("INSERT INTO users (name) VALUES (?)", [recipientName], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        handleTransaction(this.lastID);
      });
    }
  });
});

// Record cash spending
app.post('/api/cash-spending', (req, res) => {
  const { sessionId, photoPath, userName, amount, description, category } = req.body;

  if (!userName || !amount || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transactionId = uuidv4();

  // First, get the user
  db.get("SELECT * FROM users WHERE name = ?", [userName], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough cash
    if (user.total_cash < amount) {
      return res.status(400).json({ error: 'Insufficient cash balance' });
    }

    // Record the transaction
    db.run(`INSERT INTO transactions (
      transaction_id, type, user_id, photo_path, amount, spending_description, spending_category
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [transactionId, 'cash_spending', user.id, photoPath, amount, description, category || 'General'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update user's cash balance
      db.run("UPDATE users SET total_cash = total_cash - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [amount, user.id], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            success: true,
            transactionId: transactionId,
            message: `Recorded $${amount} spending for ${userName}. Remaining balance: $${user.total_cash - amount}`,
            newBalance: user.total_cash - amount
          });
        });
    });
  });
});

// Get user balances
app.get('/api/user-balances', (req, res) => {
  db.all("SELECT * FROM users WHERE total_cash > 0 ORDER BY name", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get recent transactions
app.get('/api/transactions', (req, res) => {
  const limit = req.query.limit || 50;
  
  db.all(`SELECT t.*, u.name as user_name 
          FROM transactions t 
          LEFT JOIN users u ON t.user_id = u.id 
          ORDER BY t.created_at DESC 
          LIMIT ?`, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for any non-API routes (remove this in development)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;