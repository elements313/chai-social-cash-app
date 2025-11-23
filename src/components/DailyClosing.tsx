import React, { useState, useEffect, useMemo } from 'react';
import './DailyClosing.css';

interface DailyClosingProps {
  sessionId: string;
  photoPath: string;
  onComplete: (totalAmount: number) => void;
  onBack: () => void;
}

interface CashCounts {
  bills_100: number;
  bills_50: number;
  bills_20: number;
  bills_10: number;
  bills_5: number;
  coins_toonies: number;
  coins_loonies: number;
  coins_quarters: number;
  coins_dimes: number;
  coins_nickels: number;
  coins_pennies: number;
}

const DailyClosing: React.FC<DailyClosingProps> = ({
  sessionId,
  photoPath,
  onComplete,
  onBack
}) => {
  const [counts, setCounts] = useState<CashCounts>({
    bills_100: 0,
    bills_50: 0,
    bills_20: 0,
    bills_10: 0,
    bills_5: 0,
    coins_toonies: 0,
    coins_loonies: 0,
    coins_quarters: 0,
    coins_dimes: 0,
    coins_nickels: 0,
    coins_pennies: 0
  });

  const [personName, setPersonName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const denominations = useMemo(() => [
    { key: 'bills_100', label: '$100 Bills', value: 100, type: 'bill' },
    { key: 'bills_50', label: '$50 Bills', value: 50, type: 'bill' },
    { key: 'bills_20', label: '$20 Bills', value: 20, type: 'bill' },
    { key: 'bills_10', label: '$10 Bills', value: 10, type: 'bill' },
    { key: 'bills_5', label: '$5 Bills', value: 5, type: 'bill' },
    { key: 'coins_toonies', label: 'Toonies ($2)', value: 2, type: 'coin' },
    { key: 'coins_loonies', label: 'Loonies ($1)', value: 1, type: 'coin' },
    { key: 'coins_quarters', label: 'Quarters ($0.25)', value: 0.25, type: 'coin' },
    { key: 'coins_dimes', label: 'Dimes ($0.10)', value: 0.10, type: 'coin' },
    { key: 'coins_nickels', label: 'Nickels ($0.05)', value: 0.05, type: 'coin' },
    { key: 'coins_pennies', label: 'Pennies ($0.01)', value: 0.01, type: 'coin' }
  ], []);

  useEffect(() => {
    const total = denominations.reduce((sum, denom) => {
      const count = counts[denom.key as keyof CashCounts];
      return sum + (count * denom.value);
    }, 0);
    setTotalAmount(Math.round(total * 100) / 100);
  }, [counts, denominations]);

  const updateCount = (key: keyof CashCounts, value: number) => {
    setCounts(prev => ({
      ...prev,
      [key]: Math.max(0, value)
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!personName.trim()) {
      newErrors.personName = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/daily-closing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          photoPath,
          personName: personName.trim(),
          ...counts
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit daily closing');
      }

      const data = await response.json();
      onComplete(data.totalAmount);
    } catch (error) {
      console.error('Error submitting daily closing:', error);
      alert('Failed to submit daily closing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="daily-closing">
      <div className="header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Daily Cash Count</h2>
      </div>

      <div className="form-group">
        <label htmlFor="personName">Who is doing the cash count? *</label>
        <input
          type="text"
          id="personName"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          className={errors.personName ? 'error' : ''}
          placeholder="Enter name"
          maxLength={100}
        />
        {errors.personName && <span className="error-text">{errors.personName}</span>}
      </div>

      <div className="total-display">
        <h3>Total Cash: ${totalAmount.toFixed(2)}</h3>
      </div>

      <div className="denomination-sections">
        <div className="section">
          <h4>💵 Bills</h4>
          <div className="denomination-grid">
            {denominations
              .filter(d => d.type === 'bill')
              .map(denom => (
                <div key={denom.key} className="denomination-item">
                  <label>{denom.label}</label>
                  <div className="counter">
                    <button
                      type="button"
                      onClick={() => updateCount(denom.key as keyof CashCounts, counts[denom.key as keyof CashCounts] - 1)}
                      className="counter-btn"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={counts[denom.key as keyof CashCounts]}
                      onChange={(e) => updateCount(denom.key as keyof CashCounts, parseInt(e.target.value) || 0)}
                      className="counter-input"
                    />
                    <button
                      type="button"
                      onClick={() => updateCount(denom.key as keyof CashCounts, counts[denom.key as keyof CashCounts] + 1)}
                      className="counter-btn"
                    >
                      +
                    </button>
                  </div>
                  <div className="subtotal">
                    ${(counts[denom.key as keyof CashCounts] * denom.value).toFixed(2)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="section">
          <h4>🪙 Coins</h4>
          <div className="denomination-grid">
            {denominations
              .filter(d => d.type === 'coin')
              .map(denom => (
                <div key={denom.key} className="denomination-item">
                  <label>{denom.label}</label>
                  <div className="counter">
                    <button
                      type="button"
                      onClick={() => updateCount(denom.key as keyof CashCounts, counts[denom.key as keyof CashCounts] - 1)}
                      className="counter-btn"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={counts[denom.key as keyof CashCounts]}
                      onChange={(e) => updateCount(denom.key as keyof CashCounts, parseInt(e.target.value) || 0)}
                      className="counter-input"
                    />
                    <button
                      type="button"
                      onClick={() => updateCount(denom.key as keyof CashCounts, counts[denom.key as keyof CashCounts] + 1)}
                      className="counter-btn"
                    >
                      +
                    </button>
                  </div>
                  <div className="subtotal">
                    ${(counts[denom.key as keyof CashCounts] * denom.value).toFixed(2)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="submit-section">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Complete Daily Closing'}
        </button>
      </div>
    </div>
  );
};

export default DailyClosing;