import React from 'react';
import './ActionSelector.css';

interface ActionSelectorProps {
  onActionSelect: (action: 'daily_closing' | 'cash_withdrawal' | 'cash_spending') => void;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({ onActionSelect }) => {
  return (
    <div className="action-selector">
      <h2>Select Action</h2>
      <p>What would you like to do?</p>
      
      <div className="action-buttons">
        <button
          onClick={() => onActionSelect('daily_closing')}
          className="action-btn daily-closing-btn"
        >
          <div className="btn-icon">🏪</div>
          <div className="btn-content">
            <h3>Daily Closing</h3>
            <p>Count cash in till and record daily closing</p>
          </div>
        </button>

        <button
          onClick={() => onActionSelect('cash_withdrawal')}
          className="action-btn cash-withdrawal-btn"
        >
          <div className="btn-icon">💰</div>
          <div className="btn-content">
            <h3>Cash Withdrawal</h3>
            <p>Record cash taken from till</p>
          </div>
        </button>

        <button
          onClick={() => onActionSelect('cash_spending')}
          className="action-btn cash-spending-btn"
        >
          <div className="btn-icon">🛒</div>
          <div className="btn-content">
            <h3>Cash Spending</h3>
            <p>Record how you spent withdrawn cash</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActionSelector;