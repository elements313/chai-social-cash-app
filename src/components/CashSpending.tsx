import React, { useState, useEffect } from 'react';
import './CashSpending.css';

interface CashSpendingProps {
  sessionId: string;
  photoPath: string;
  onComplete: (message: string) => void;
  onBack: () => void;
}

interface User {
  id: number;
  name: string;
  total_cash: number;
}

const CashSpending: React.FC<CashSpendingProps> = ({
  sessionId,
  photoPath,
  onComplete,
  onBack
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = [
    'General',
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Business Expenses',
    'Office Supplies',
    'Maintenance',
    'Other'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user-balances');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedUser) {
      newErrors.selectedUser = 'Please select a user';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Check if user has enough cash
    const user = users.find(u => u.name === selectedUser);
    if (user && parseFloat(amount) > user.total_cash) {
      newErrors.amount = `Insufficient balance. Available: $${user.total_cash.toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cash-spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          photoPath,
          userName: selectedUser,
          amount: parseFloat(amount),
          description: description.trim(),
          category: category || 'General'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record cash spending');
      }

      const data = await response.json();
      onComplete(data.message);
    } catch (error) {
      console.error('Error recording cash spending:', error);
      alert(`Failed to record cash spending: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const selectedUserData = users.find(u => u.name === selectedUser);

  return (
    <div className="cash-spending">
      <div className="header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Record Cash Spending</h2>
      </div>

      <div className="spending-info">
        <p>Record how you spent cash that was previously withdrawn from the till.</p>
      </div>

      <form onSubmit={handleSubmit} className="spending-form">
        <div className="form-group">
          <label htmlFor="selectedUser">Who spent the cash? *</label>
          <select
            id="selectedUser"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className={errors.selectedUser ? 'error' : ''}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name} (Balance: ${user.total_cash.toFixed(2)})
              </option>
            ))}
          </select>
          {errors.selectedUser && <span className="error-text">{errors.selectedUser}</span>}
          {users.length === 0 && (
            <small className="info-text">No users with cash balances found. Complete a cash withdrawal first.</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount Spent (CAD) *</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className={errors.amount ? 'error amount-input' : 'amount-input'}
              placeholder="0.00"
              maxLength={10}
            />
          </div>
          {errors.amount && <span className="error-text">{errors.amount}</span>}
          {selectedUserData && (
            <small className="balance-info">
              Available balance: ${selectedUserData.total_cash.toFixed(2)}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">What was purchased? *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={errors.description ? 'error' : ''}
            placeholder="e.g., Office supplies, lunch for team, taxi fare..."
            rows={3}
            maxLength={500}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
          <small className="char-count">{description.length}/500 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category (Optional)</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="spending-summary">
          <h3>Summary</h3>
          <div className="summary-row">
            <span>User:</span>
            <span>{selectedUser || 'Not selected'}</span>
          </div>
          <div className="summary-row">
            <span>Amount:</span>
            <span className="amount-display">${amount || '0.00'}</span>
          </div>
          <div className="summary-row">
            <span>Description:</span>
            <span>{description || 'Not specified'}</span>
          </div>
          <div className="summary-row">
            <span>Category:</span>
            <span>{category || 'General'}</span>
          </div>
          {selectedUserData && (
            <div className="summary-row">
              <span>Remaining Balance:</span>
              <span className="balance-display">
                ${(selectedUserData.total_cash - parseFloat(amount || '0')).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || users.length === 0}
            className="submit-btn"
          >
            {isSubmitting ? 'Recording...' : 'Record Spending'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CashSpending;