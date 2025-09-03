import React, { useState, useEffect } from 'react';

// Main App component which contains all the logic and UI
const App = () => {
  // State for all transactions
  const [transactions, setTransactions] = useState([]);
  // State for the current month being viewed
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // State to manage the current view ('dashboard' or 'addTransaction')
  const [view, setView] = useState('dashboard');
  
  // State for the new transaction form
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    type: 'expense',
    description: '',
  });

  // State for displaying user messages
  const [message, setMessage] = useState('');

  // Categories with colors and icons
  const categories = {
    income: {
      'Pension': '💰',
      'Rental Income': '🏠',
      'Money from Children': '👨‍👩‍👧‍👦',
      'Other Income': '📈',
    },
    expense: {
      'Rent/Housing': '🏠',
      'Groceries': '🛒',
      'Medicines': '💊',
      'Hospital/Medical': '🏥',
      'Utilities': '💡',
      'Donations': '🙏',
      'Transport': '🚗',
      'Other Expenses': '🛍️',
    },
  };

  // UseEffect to load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedTransactions = JSON.parse(localStorage.getItem('budgetAppTransactions'));
      if (savedTransactions) {
        setTransactions(savedTransactions);
      }
    } catch (error) {
      console.error("Failed to load transactions from local storage:", error);
    }
  }, []);

  // UseEffect to save data to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem('budgetAppTransactions', JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to local storage:", error);
    }
  }, [transactions]);

  // Handle input changes for the new transaction form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to show a temporary message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle adding a new transaction
  const handleAddTransaction = () => {
    const amount = parseFloat(newTransaction.amount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      showMessage('Please enter a valid amount.');
      return;
    }
    if (!newTransaction.category) {
      showMessage('Please select a category.');
      return;
    }

    const newTransactionWithId = {
      ...newTransaction,
      amount: amount,
      date: new Date().toISOString(),
      id: Date.now(), // Unique ID for each transaction
    };
    setTransactions([...transactions, newTransactionWithId]);
    // Reset form fields
    setNewTransaction({
      amount: '',
      category: '',
      type: 'expense',
      description: '',
    });
    // Navigate back to the dashboard
    setView('dashboard');
  };

  // Handle deleting a transaction
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };
  
  // Filter transactions for the current month
  const getTransactionsForCurrentMonth = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });
  };

  const filteredTransactions = getTransactionsForCurrentMonth();

  // Calculate monthly summary
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Function to navigate months
  const handleMonthChange = (direction) => {
    const newDate = new Date(currentMonth);
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentMonth(newDate);
  };

  // Render the Dashboard view
  const Dashboard = () => (
    <div className="flex flex-col gap-6 p-4">
      {/* Month Picker */}
      <div className="flex items-center justify-between bg-blue-500 text-white rounded-xl p-4 shadow-lg">
        <button
          onClick={() => handleMonthChange('previous')}
          className="text-4xl p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        >
          &larr;
        </button>
        <h2 className="text-3xl font-bold">
          {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => handleMonthChange('next')}
          className="text-4xl p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        >
          &rarr;
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-500 text-center">
          <p className="text-xl font-medium text-gray-500">Income</p>
          <p className="text-4xl font-bold text-green-600 mt-2">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-500 text-center">
          <p className="text-xl font-medium text-gray-500">Expenses</p>
          <p className="text-4xl font-bold text-red-600 mt-2">₹{totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-500 text-center">
          <p className="text-xl font-medium text-gray-500">Balance</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">₹{balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h3 className="text-2xl font-bold">Recent Transactions</h3>
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center text-lg mt-4">No transactions for this month.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
              <div key={t.id} className={`flex items-center justify-between p-4 rounded-xl shadow-md transition-all ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div className="text-3xl flex-shrink-0 mr-3">{categories[t.type][t.category]}</div>
                  <div className="flex-1">
                    <p className="font-bold text-xl">{t.category}</p>
                    <p className="text-gray-600 text-sm">{new Date(t.date).toLocaleDateString()}</p>
                    {t.description && <p className="text-gray-500 text-xs truncate mt-1">{t.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`font-bold text-xl ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toFixed(2)}
                  </span>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-500 text-3xl hover:scale-110 transition-transform">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Button */}
      <button onClick={() => setView('addTransaction')} className="fixed bottom-6 right-6 z-10 bg-blue-600 text-white rounded-full w-20 h-20 text-5xl font-bold shadow-lg hover:scale-110 transition-transform">
        +
      </button>
    </div>
  );

  // Render the Add Transaction view
  const AddTransaction = () => (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-3xl font-bold text-center text-gray-800">New Transaction</h2>
      
      {/* Type Toggle Buttons */}
      <div className="flex bg-gray-200 rounded-xl p-2 mb-4">
        <button
          onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
          className={`flex-1 py-4 text-2xl font-bold rounded-xl transition-all ${
            newTransaction.type === 'income' ? 'bg-green-500 text-white shadow-md' : 'text-gray-600'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
          className={`flex-1 py-4 text-2xl font-bold rounded-xl transition-all ${
            newTransaction.type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600'
          }`}
        >
          Expense
        </button>
      </div>

      {/* Form Inputs */}
      <div className="flex flex-col gap-6">
        <input
          type="text"
          name="amount"
          inputMode="decimal"
          placeholder="Amount in ₹"
          value={newTransaction.amount}
          onChange={handleInputChange}
          className="w-full text-4xl p-6 rounded-xl border-4 border-gray-300 focus:border-blue-500 outline-none text-center"
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={newTransaction.description}
          onChange={handleInputChange}
          className="w-full text-2xl p-6 rounded-xl border-4 border-gray-300 focus:border-blue-500 outline-none"
          rows="3"
        />
      </div>
      
      {/* Message Display */}
      {message && (
        <div className="text-center text-red-600 text-xl font-bold">
          {message}
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.keys(categories[newTransaction.type]).map(cat => (
          <button
            key={cat}
            onClick={() => setNewTransaction(prev => ({ ...prev, category: cat }))}
            className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-md transition-all h-36 ${
              newTransaction.category === cat ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-800'
            }`}
          >
            <span className="text-5xl">{categories[newTransaction.type][cat]}</span>
            <span className="text-xl font-bold mt-2 text-center leading-tight">{cat}</span>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button onClick={() => setView('dashboard')} className="flex-1 py-4 bg-gray-400 text-white text-2xl font-bold rounded-xl shadow-md hover:bg-gray-500 transition-colors">
          Cancel
        </button>
        <button onClick={handleAddTransaction} className="flex-1 py-4 bg-green-500 text-white text-2xl font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors">
          Save Transaction
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Main Container */}
      <div className="max-w-xl mx-auto py-8">
        {view === 'dashboard' ? <Dashboard /> : <AddTransaction />}
      </div>
    </div>
  );
};

export default App;
