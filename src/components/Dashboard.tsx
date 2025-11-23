import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface UserBalance {
  id: number;
  name: string;
  total_cash: number;
  updated_at: string;
}

interface Transaction {
  id: number;
  transaction_id: string;
  type: string;
  user_name?: string;
  amount: number;
  recipient_name?: string;
  withdrawal_reason?: string;
  spending_description?: string;
  spending_category?: string;
  created_at: string;
}

interface CashBalance {
  total_till_cash: number;
  last_updated: string;
}

interface DashboardProps {
  onNewTransaction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewTransaction }) => {
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [tillBalance, setTillBalance] = useState<CashBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      setError('');
      
      const [balancesResponse, transactionsResponse, tillResponse] = await Promise.all([
        fetch('/api/user-balances'),
        fetch('/api/transactions?limit=10'),
        fetch('/api/cash-balance')
      ]);

      if (!balancesResponse.ok || !transactionsResponse.ok || !tillResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [balances, transactions, till] = await Promise.all([
        balancesResponse.json(),
        transactionsResponse.json(),
        tillResponse.json()
      ]);

      setUserBalances(balances);
      setRecentTransactions(transactions);
      setTillBalance(till);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'daily_closing':
        return '🏪';
      case 'cash_withdrawal':
        return '💰';
      case 'cash_deposit':
        return '💳';
      case 'cash_spending':
        return '🛒';
      default:
        return '📝';
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'daily_closing':
        return 'Daily Closing';
      case 'cash_withdrawal':
        return `Cash Withdrawal - ${transaction.recipient_name}`;
      case 'cash_deposit':
        return 'Cash Deposit';
      case 'cash_spending':
        return `Cash Spending - ${transaction.user_name}`;
      default:
        return 'Transaction';
    }
  };

  const totalUserCash = userBalances.reduce((sum, user) => sum + user.total_cash, 0);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Cash Tracking Dashboard</h1>
        <button onClick={onNewTransaction} className="new-transaction-btn">
          + New Transaction
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card till-balance">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Till Balance</h3>
            <p className="stat-value">{tillBalance ? formatCurrency(tillBalance.total_till_cash) : '$0.00'}</p>
            <small>Last updated: {tillBalance ? formatDate(tillBalance.last_updated) : 'Never'}</small>
          </div>
        </div>

        <div className="stat-card user-cash">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Cash with Users</h3>
            <p className="stat-value">{formatCurrency(totalUserCash)}</p>
            <small>{userBalances.length} users have cash</small>
          </div>
        </div>

        <div className="stat-card total-cash">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Cash</h3>
            <p className="stat-value">
              {formatCurrency((tillBalance?.total_till_cash || 0) + totalUserCash)}
            </p>
            <small>Till + User cash</small>
          </div>
        </div>
      </div>

      {userBalances.length > 0 && (
        <div className="section">
          <h2>User Cash Balances</h2>
          <div className="user-balances">
            {userBalances.map((user) => (
              <div key={user.id} className="user-balance-card">
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p className="balance">{formatCurrency(user.total_cash)}</p>
                </div>
                <div className="last-updated">
                  <small>Updated: {formatDate(user.updated_at)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <button onClick={fetchData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions yet. Start by taking a photo to begin a new transaction.</p>
          </div>
        ) : (
          <div className="transactions-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-icon">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="transaction-content">
                  <h4>{getTransactionTitle(transaction)}</h4>
                  <p className="transaction-amount">{formatCurrency(transaction.amount)}</p>
                  {transaction.withdrawal_reason && (
                    <p className="transaction-reason">{transaction.withdrawal_reason}</p>
                  )}
                  {transaction.spending_description && (
                    <p className="transaction-reason">
                      {transaction.spending_description}
                      {transaction.spending_category && ` (${transaction.spending_category})`}
                    </p>
                  )}
                  <small className="transaction-date">{formatDate(transaction.created_at)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;