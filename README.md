# 💰 Cash Tracker PWA

A Progressive Web Application for tracking cash transactions, daily cash counts, and user balances. Built for small businesses and organizations that handle cash operations.

## 🚀 Features

### Core Functionality
- **📸 Photo Verification**: Camera capture for transaction verification
- **🏪 Daily Closing**: Count cash by denomination (Canadian currency)
- **💰 Cash Withdrawal**: Record cash taken from till with recipient tracking
- **🛒 Cash Spending**: Track how withdrawn cash was spent with categorization
- **📊 Real-time Dashboard**: View recent transactions and current balances

### Technical Features
- **📱 Progressive Web App (PWA)**: Installable, works offline
- **📸 Camera Integration**: Capture verification photos
- **💾 SQLite Database**: Local data storage
- **🔄 Real-time Updates**: Live transaction tracking
- **📱 Responsive Design**: Works on all devices
- **🎯 User Balance Tracking**: Automatic cash balance calculations

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Styling**: CSS3 with responsive design
- **PWA**: Service Worker + Web App Manifest
- **File Upload**: Multer for photo handling
- **UI**: Custom CSS components

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd cash-tracker-pwa

# Install dependencies
npm install

# Start the development server (runs both frontend and backend)
npm run dev

# Or run separately:
# Frontend (port 3000)
npm start

# Backend (port 8000) 
npm run server
```

### Environment Setup
The app uses SQLite database which is automatically created on first run.

## 🎯 Usage

### 1. Daily Closing Process
1. Take verification photo
2. Select "Daily Closing" 
3. Enter your name
4. Count cash by denomination
5. Submit to update till balance

### 2. Cash Withdrawal
1. Take verification photo  
2. Select "Cash Withdrawal"
3. Enter recipient name
4. Enter amount and reason
5. Submit to track withdrawal

### 3. Cash Spending
1. Take verification photo
2. Select "Cash Spending" 
3. Choose user who spent cash
4. Enter amount, description, and category
5. Submit to track expense

### 4. Dashboard
- View recent transactions
- See current user balances
- Monitor cash flow

## 📋 API Endpoints

### Transaction Management
- `POST /api/upload-photo` - Upload verification photos
- `POST /api/daily-closing` - Record daily cash count
- `POST /api/cash-withdrawal` - Record cash withdrawal  
- `POST /api/cash-spending` - Record cash expense
- `GET /api/transactions` - Get all transactions
- `GET /api/user-balances` - Get user cash balances

### Health Check
- `GET /api/health` - API health status

## 🗄️ Database Schema

### Transactions Table
- Complete transaction history
- Photo verification paths
- Denomination breakdowns
- User tracking
- Timestamps

### Users Table  
- User information
- Cash balances
- Balance history

### Cash Balance Table
- Till totals
- Last updated timestamps

## 🔒 Security Features

- Photo verification for all transactions
- Input validation and sanitization
- File upload restrictions
- Error handling and logging

## 🎨 UI/UX Features

- Clean, intuitive interface
- Step-by-step transaction flow
- Real-time balance updates
- Mobile-responsive design
- Progress indicators
- Form validation feedback

## 📱 PWA Features

- **Installable**: Add to home screen
- **Offline Ready**: Service worker caching
- **App-like Experience**: Full-screen mode
- **Fast Loading**: Optimized assets

## 🔄 Cash Flow Tracking

The app maintains accurate cash balances by:
1. Recording daily till counts
2. Tracking who takes cash (withdrawals)
3. Recording how cash is spent
4. Calculating per-user balances
5. Providing audit trails

## 🚀 Future Enhancements

### Phase 2: Clover POS Integration
- Connect to Clover POS system
- Reconcile digital vs cash transactions
- Enhanced reporting capabilities
- Multi-location support

### Planned Features
- Export reports (PDF/Excel)
- Email notifications
- Advanced analytics
- User roles and permissions

## 🤝 Contributing

This is a custom business application. For modifications or improvements, please contact the development team.

## 📄 License

Private business application. All rights reserved.

---

**Built with ❤️ for efficient cash management**

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
