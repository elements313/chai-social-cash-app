import React, { useState } from 'react';
import './CashWithdrawal.css';

interface CashWithdrawalProps {
  sessionId: string;
  photoPath: string;
  onComplete: (message: string) => void;
  onBack: () => void;
}

const CashWithdrawal: React.FC<CashWithdrawalProps> = ({
  sessionId,
  photoPath,
  onComplete,
  onBack
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason for withdrawal is required';
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
      const response = await fetch('/api/cash-withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          photoPath,
          recipientName: recipientName.trim(),
          amount: parseFloat(amount),
          reason: reason.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record cash withdrawal');
      }

      const data = await response.json();
      onComplete(data.message);
    } catch (error) {
      console.error('Error recording cash withdrawal:', error);
      alert('Failed to record cash withdrawal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="cash-withdrawal">
      <div className="header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Cash Withdrawal</h2>
      </div>

      <div className="withdrawal-info">
        <p>Record cash being taken from the till. This will track who has the cash and reduce the till balance.</p>
      </div>

      <form onSubmit={handleSubmit} className="withdrawal-form">
        <div className="form-group">
          <label htmlFor="recipientName">Who is taking the cash? *</label>
          <input
            type="text"
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className={errors.recipientName ? 'error' : ''}
            placeholder="Enter name"
            maxLength={100}
          />
          {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (CAD) *</label>
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
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for withdrawal *</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={errors.reason ? 'error' : ''}
            placeholder="e.g., Bank deposit, petty cash, supplier payment..."
            rows={3}
            maxLength={500}
          />
          {errors.reason && <span className="error-text">{errors.reason}</span>}
          <small className="char-count">{reason.length}/500 characters</small>
        </div>

        <div className="withdrawal-summary">
          <h3>Summary</h3>
          <div className="summary-row">
            <span>Recipient:</span>
            <span>{recipientName || 'Not specified'}</span>
          </div>
          <div className="summary-row">
            <span>Amount:</span>
            <span className="amount-display">${amount || '0.00'}</span>
          </div>
          <div className="summary-row">
            <span>Reason:</span>
            <span>{reason || 'Not specified'}</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? 'Recording...' : 'Record Withdrawal'}
          </button>
        </div>
      </form>

      <div className="important-note">
        <h4>📋 Important</h4>
        <p>After recording this withdrawal, continue to use the app to track any transactions made with this cash. This helps maintain accurate cash balances for each person.</p>
      </div>
    </div>
  );
};

export default CashWithdrawal;