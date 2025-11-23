import React, { useState } from 'react';
import PhotoCapture from './components/PhotoCapture';
import ActionSelector from './components/ActionSelector';
import DailyClosing from './components/DailyClosing';
import CashWithdrawal from './components/CashWithdrawal';
import CashSpending from './components/CashSpending';
import Dashboard from './components/Dashboard';
import './App.css';

type AppStep = 'dashboard' | 'photo' | 'action' | 'daily_closing' | 'cash_withdrawal' | 'cash_spending' | 'complete';

interface SessionData {
  sessionId?: string;
  photoPath?: string;
  photoUrl?: string;
  action?: 'daily_closing' | 'cash_withdrawal' | 'cash_spending';
}

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('dashboard');
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [completionMessage, setCompletionMessage] = useState('');

  const handleStartNewTransaction = () => {
    setSessionData({});
    setCompletionMessage('');
    setCurrentStep('photo');
  };

  const handlePhotoTaken = async (photoBlob: Blob, photoUrl: string) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoBlob, 'verification.jpg');

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      
      setSessionData({
        sessionId: data.sessionId,
        photoPath: data.photoPath,
        photoUrl: photoUrl
      });
      
      setCurrentStep('action');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    }
  };

  const handlePhotoError = (error: string) => {
    alert(error);
  };

  const handleActionSelect = (action: 'daily_closing' | 'cash_withdrawal' | 'cash_spending') => {
    setSessionData(prev => ({ ...prev, action }));
    setCurrentStep(action);
  };

  const handleTransactionComplete = (message: string) => {
    setCompletionMessage(message);
    setCurrentStep('complete');
    
    // Auto redirect to dashboard after 3 seconds
    setTimeout(() => {
      setCurrentStep('dashboard');
    }, 3000);
  };

  const handleBackToDashboard = () => {
    setCurrentStep('dashboard');
  };

  const handleBackToAction = () => {
    setCurrentStep('action');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return <Dashboard onNewTransaction={handleStartNewTransaction} />;
      
      case 'photo':
        return (
          <div className="step-container">
            <div className="step-header">
              <button onClick={handleBackToDashboard} className="back-btn">
                ← Dashboard
              </button>
              <h2>Verification Photo</h2>
            </div>
            <p>Take a photo to verify who is performing this transaction:</p>
            <PhotoCapture 
              onPhotoTaken={handlePhotoTaken} 
              onError={handlePhotoError}
            />
          </div>
        );
      
      case 'action':
        return (
          <div className="step-container">
            <div className="step-header">
              <button onClick={handleBackToDashboard} className="back-btn">
                ← Dashboard
              </button>
            </div>
            <ActionSelector onActionSelect={handleActionSelect} />
          </div>
        );
      
      case 'daily_closing':
        return (
          <DailyClosing
            sessionId={sessionData.sessionId!}
            photoPath={sessionData.photoPath!}
            onComplete={(amount) => handleTransactionComplete(`Daily closing completed. Total cash: $${amount.toFixed(2)}`)}
            onBack={handleBackToAction}
          />
        );
      
      case 'cash_withdrawal':
        return (
          <CashWithdrawal
            sessionId={sessionData.sessionId!}
            photoPath={sessionData.photoPath!}
            onComplete={handleTransactionComplete}
            onBack={handleBackToAction}
          />
        );
      
      case 'cash_spending':
        return (
          <CashSpending
            sessionId={sessionData.sessionId!}
            photoPath={sessionData.photoPath!}
            onComplete={handleTransactionComplete}
            onBack={handleBackToAction}
          />
        );
      
      case 'complete':
        return (
          <div className="completion-screen">
            <div className="completion-content">
              <div className="success-icon">✅</div>
              <h2>Transaction Complete</h2>
              <p>{completionMessage}</p>
              <div className="completion-actions">
                <button onClick={handleBackToDashboard} className="btn-primary">
                  Back to Dashboard
                </button>
                <button onClick={handleStartNewTransaction} className="btn-secondary">
                  New Transaction
                </button>
              </div>
              <small>Redirecting to dashboard in a few seconds...</small>
            </div>
          </div>
        );
      
      default:
        return <Dashboard onNewTransaction={handleStartNewTransaction} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>💰 Cash Tracker</h1>
        {currentStep !== 'dashboard' && (
          <div className="step-indicator">
            <span className={
              currentStep === 'photo' ? 'active' : 
              (currentStep === 'action' || currentStep === 'daily_closing' || currentStep === 'cash_withdrawal' || currentStep === 'cash_spending' || currentStep === 'complete') ? 'completed' : ''
            }>
              📸 Photo
            </span>
            <span className={
              currentStep === 'action' ? 'active' : 
              (currentStep === 'daily_closing' || currentStep === 'cash_withdrawal' || currentStep === 'cash_spending' || currentStep === 'complete') ? 'completed' : ''
            }>
              ⚡ Action
            </span>
            <span className={
              (currentStep === 'daily_closing' || currentStep === 'cash_withdrawal' || currentStep === 'cash_spending') ? 'active' : 
              currentStep === 'complete' ? 'completed' : ''
            }>
              📝 Record
            </span>
            <span className={currentStep === 'complete' ? 'active' : ''}>
              ✅ Complete
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        {renderCurrentStep()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Cash Tracker PWA</p>
      </footer>
    </div>
  );
}

export default App;
