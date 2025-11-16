// KeepTrack - Complete Expense Tracker Application
console.log("Starting KeepTrack app...");

// App State
let currentUser = null;
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let currentTab = 'dashboard';

// Categories
const categories = {
    income: ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Other Income'],
    expense: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Rent', 'Bills', 'Other Expense']
};

// DOM Elements
const elements = {
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    logoutBtn: document.getElementById('logoutBtn'),
    addForm: document.getElementById('addForm'),
    transactionType: document.getElementById('transactionType'),
    incomeBtn: document.getElementById('incomeBtn'),
    expenseBtn: document.getElementById('expenseBtn'),
    categorySelect: document.getElementById('category'),
    tabs: document.querySelectorAll('.tab'),
    toast: document.getElementById('toast')
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, setting up app...");
    setupEventListeners();
    setTodayDate();
    updateCategoryOptions('income');
});

// Setup Event Listeners
function setupEventListeners() {
    // Auth events
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    if (elements.showRegister) {
        elements.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('registerScreen').style.display = 'flex';
        });
    }
    
    if (elements.showLogin) {
        elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerScreen').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'flex';
        });
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Transaction events
    if (elements.addForm) {
        elements.addForm.addEventListener('submit', handleAddTransaction);
    }
    
    if (elements.incomeBtn) {
        elements.incomeBtn.addEventListener('click', () => selectTransactionType('income'));
    }
    
    if (elements.expenseBtn) {
        elements.expenseBtn.addEventListener('click', () => selectTransactionType('expense'));
    }
    
    // Tab navigation
    if (elements.tabs) {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
            });
        });
    }
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (!auth) {
        showToast('Firebase not initialized. Running offline.', 'error');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Login successful!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (!auth) {
        showToast('Firebase not initialized. Running offline.', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        if (name && userCredential.user) {
            await userCredential.user.updateProfile({ displayName: name });
        }
        showToast('Registration successful!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleLogout() {
    try {
        if (auth) {
            await auth.signOut();
        }
        currentUser = null;
        transactions = [];
        localStorage.removeItem('transactions');
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Transaction Functions
function selectTransactionType(type) {
    if (!elements.transactionType) return;
    
    elements.transactionType.value = type;
    
    if (type === 'income') {
        elements.incomeBtn?.classList.add('active');
        elements.expenseBtn?.classList.remove('active');
    } else {
        elements.expenseBtn?.classList.add('active');
        elements.incomeBtn?.classList.remove('active');
    }
    
    updateCategoryOptions(type);
}

function updateCategoryOptions(type) {
    if (!elements.categorySelect) return;
    
    const categoryList = categories[type] || [];
    elements.categorySelect.innerHTML = categoryList.map(cat => 
        `<option value="${cat}">${cat}</option>`
    ).join('');
}

async function handleAddTransaction(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount')?.value);
    const category = document.getElementById('category')?.value;
    const description = document.getElementById('description')?.value;
    const date = document.getElementById('date')?.value;
    const type = elements.transactionType?.value;
    
    if (!amount || !category || !date) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const transaction = {
        id: Date.now().toString(),
        type: type,
        amount: amount,
        category: category,
        description: description || '',
        date: date,
        userId: currentUser?.uid || 'offline',
        timestamp: new Date().toISOString()
    };
    
    // Save to local storage
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Save to Firestore if online
    if (db && currentUser) {
        try {
            await db.collection('transactions').add(transaction);
            console.log("Transaction saved to Firestore");
        } catch (error) {
            console.error("Firestore save error:", error);
        }
    }
    
    showToast('Transaction added successfully!', 'success');
    
    // Reset form
    elements.addForm.reset();
    setTodayDate();
    selectTransactionType('income');
    
    // Update dashboard
    updateDashboard();
    
    // Switch to dashboard
    switchTab('dashboard');
}

// Dashboard Functions
function updateDashboard() {
    const userTransactions = transactions.filter(t => 
        !currentUser || t.userId === currentUser.uid || t.userId === 'offline'
    );
    
    // Calculate totals
    const totalIncome = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Update UI
    const totalBalanceEl = document.getElementById('totalBalance');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    
    if (totalBalanceEl) totalBalanceEl.textContent = `৳${balance.toFixed(2)}`;
    if (totalIncomeEl) totalIncomeEl.textContent = `+৳${totalIncome.toFixed(2)}`;
    if (totalExpenseEl) totalExpenseEl.textContent = `-৳${totalExpense.toFixed(2)}`;
    
    // Today's activity
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = userTransactions.filter(t => t.date === today);
    
    const todayIncome = todayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const todayExpense = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const todayIncomeEl = document.getElementById('todayIncome');
    const todayExpenseEl = document.getElementById('todayExpense');
    
    if (todayIncomeEl) todayIncomeEl.textContent = `+৳${todayIncome.toFixed(2)}`;
    if (todayExpenseEl) todayExpenseEl.textContent = `-৳${todayExpense.toFixed(2)}`;
    
    // Month savings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthTransactions = userTransactions.filter(t => t.date >= monthStart);
    
    const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthSavings = monthIncome - monthExpense;
    
    const monthSavingsEl = document.getElementById('monthSavings');
    if (monthSavingsEl) monthSavingsEl.textContent = `৳${monthSavings.toFixed(2)}`;
    
    // Update recent transactions
    updateRecentTransactions();
    
    // Update history
    updateTransactionHistory();
    
    // Update stats
    updateStatistics();
}

function updateRecentTransactions() {
    const recentList = document.getElementById('recentList');
    if (!recentList) return;
    
    const userTransactions = transactions.filter(t => 
        !currentUser || t.userId === currentUser.uid || t.userId === 'offline'
    );
    
    const recent = userTransactions.slice(-5).reverse();
    
    if (recent.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No transactions yet. Add your first transaction!</p>';
        return;
    }
    
    recentList.innerHTML = recent.map(t => `
        <div class="transaction-item">
            <div class="transaction-details">
                <div class="transaction-category">${t.category}</div>
                <div class="transaction-description">${t.description || 'No description'}</div>
                <div class="transaction-date">${t.date}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}৳${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateTransactionHistory() {
    const historyList = document.getElementById('transactionHistory');
    if (!historyList) return;
    
    const userTransactions = transactions.filter(t => 
        !currentUser || t.userId === currentUser.uid || t.userId === 'offline'
    );
    
    const sorted = [...userTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    if (sorted.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No transaction history</p>';
        return;
    }
    
    historyList.innerHTML = sorted.map(t => `
        <div class="transaction-item">
            <div class="transaction-details">
                <div class="transaction-category">${t.category}</div>
                <div class="transaction-description">${t.description || 'No description'}</div>
                <div class="transaction-date">${t.date}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}৳${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateStatistics() {
    const userTransactions = transactions.filter(t => 
        !currentUser || t.userId === currentUser.uid || t.userId === 'offline'
    );
    
    // Income breakdown
    const incomeBreakdown = document.getElementById('incomeBreakdown');
    if (incomeBreakdown) {
        const incomeByCategory = {};
        userTransactions
            .filter(t => t.type === 'income')
            .forEach(t => {
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            });
        
        const entries = Object.entries(incomeByCategory);
        
        if (entries.length === 0) {
            incomeBreakdown.innerHTML = '<p class="empty-state">No income data</p>';
        } else {
            incomeBreakdown.innerHTML = entries.map(([cat, amount]) => `
                <div class="breakdown-item">
                    <span class="breakdown-category">${cat}</span>
                    <span class="breakdown-amount">৳${amount.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }
    
    // Expense breakdown
    const expenseBreakdown = document.getElementById('expenseBreakdown');
    if (expenseBreakdown) {
        const expenseByCategory = {};
        userTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
            });
        
        const entries = Object.entries(expenseByCategory);
        
        if (entries.length === 0) {
            expenseBreakdown.innerHTML = '<p class="empty-state">No expense data</p>';
        } else {
            expenseBreakdown.innerHTML = entries.map(([cat, amount]) => `
                <div class="breakdown-item">
                    <span class="breakdown-category">${cat}</span>
                    <span class="breakdown-amount">৳${amount.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }
}

// Utility Functions
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    elements.tabs?.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update data if needed
    if (tabName === 'dashboard') {
        updateDashboard();
    }
}

function setTodayDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

function showToast(message, type = 'info') {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Load data when user logs in
if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadUserData();
        }
    });
}

async function loadUserData() {
    if (!db || !currentUser) {
        updateDashboard();
        return;
    }
    
    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .get();
        
        transactions = [];
        snapshot.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
    } catch (error) {
        console.error("Error loading data:", error);
        updateDashboard();
    }
}

// Make loadUserData available globally for index.html
window.loadUserData = loadUserData;

console.log("✅ App.js loaded successfully");
