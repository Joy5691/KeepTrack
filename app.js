// KeepTrack - Complete Expense Tracker Application (enhanced)
console.log("Starting KeepTrack app...");

// App State
let currentUser = null;
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
let currentTab = 'dashboard';
let currentCurrency = localStorage.getItem('currency') || '৳';

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

// Extra DOM references
const userNameEl = document.getElementById('userName');
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const mainApp = document.getElementById('mainApp');
const loadingScreen = document.getElementById('loadingScreen');

const cardBalanceEl = document.getElementById('cardBalance');
const cardUserNameEl = document.getElementById('cardUserName');

const searchInput = document.getElementById('searchTransaction');
const filterTypeEl = document.getElementById('filterType');
const filterCatEl = document.getElementById('filterCategory');
const dateFromEl = document.getElementById('dateFrom');
const dateToEl = document.getElementById('dateTo');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportCSVBtn = document.getElementById('exportCSV');
const exportPDFBtn = document.getElementById('exportPDF');

const budgetForm = document.getElementById('budgetForm');
const budgetListEl = document.getElementById('budgetList');

const editTransactionIdEl = document.getElementById('editTransactionId');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const successPopup = document.getElementById('successPopup');
const popupMessage = document.getElementById('popupMessage');

// Charts
let incomeChart = null;
let expenseChart = null;
let trendChart = null;
let ogiveChart = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, setting up app...");
    setupEventListeners();
    setTodayDate();
    updateCategoryOptions('income');
    selectTransactionType('income');
    populateFilterCategories();
    renderBudgets();
    updateDashboard();
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
            loginScreen.style.display = 'none';
            registerScreen.style.display = 'flex';
        });
    }

    if (elements.showLogin) {
        elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerScreen.style.display = 'none';
            loginScreen.style.display = 'flex';
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

    // Filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            updateTransactionHistory();
        });
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterTypeEl) filterTypeEl.value = 'all';
            if (filterCatEl) filterCatEl.value = 'all';
            if (dateFromEl) dateFromEl.value = '';
            if (dateToEl) dateToEl.value = '';
            updateTransactionHistory();
        });
    }

    // Export
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportCSV);
    }
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportPDF);
    }

    // Budgets
    if (budgetForm) {
        budgetForm.addEventListener('submit', handleBudgetSubmit);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEditMode);
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
    const currency = document.getElementById('registerCurrency')?.value || '৳';

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
        if (userCredential.user) {
            const displayName = name ? `${name}|${currency}` : `|${currency}`;
            await userCredential.user.updateProfile({ displayName });
            currentCurrency = currency;
            localStorage.setItem('currency', currentCurrency);
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
        if (mainApp) mainApp.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
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
    elements.categorySelect.innerHTML = categoryList
        .map(cat => `<option value="${cat}">${cat}</option>`)
        .join('');
}

// create/update transaction
async function handleAddTransaction(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount')?.value);
    const category = document.getElementById('category')?.value;
    const description = document.getElementById('description')?.value;
    const date = document.getElementById('date')?.value;
    const type = elements.transactionType?.value;
    const recurring = document.getElementById('recurring')?.value || 'none';
    const editId = editTransactionIdEl?.value || '';

    if (!amount || !category || !date) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    if (editId) {
        // update existing
        const idx = transactions.findIndex(t => t.id === editId);
        if (idx !== -1) {
            const existing = transactions[idx];
            transactions[idx] = {
                ...existing,
                type,
                amount,
                category,
                description: description || '',
                date,
                recurring
            };
        }
        showSuccessPopup('Transaction updated successfully!');
    } else {
        const transaction = {
            id: Date.now().toString(),
            type,
            amount,
            category,
            description: description || '',
            date,
            userId: currentUser?.uid || 'offline',
            timestamp: new Date().toISOString(),
            recurring
        };
        transactions.push(transaction);
        showSuccessPopup('Transaction added successfully!');
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Firestore (only add new, not editing here to keep simple)
    if (db && currentUser && !editId) {
        try {
            await db.collection('transactions').add(
                transactions[transactions.length - 1]
            );
            console.log("Transaction saved to Firestore");
        } catch (error) {
            console.error("Firestore save error:", error);
        }
    }

    elements.addForm.reset();
    setTodayDate();
    selectTransactionType('income');
    if (editTransactionIdEl) editTransactionIdEl.value = '';
    submitBtn.textContent = 'Add Transaction';
    cancelEditBtn.style.display = 'none';

    updateDashboard();
    switchTab('dashboard');
}

// Dashboard Functions
function updateDashboard() {
    const userTransactions = getUserTransactions();

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

    if (totalBalanceEl) totalBalanceEl.textContent = `${currentCurrency}${balance.toFixed(2)}`;
    if (totalIncomeEl) totalIncomeEl.textContent = `+${currentCurrency}${totalIncome.toFixed(2)}`;
    if (totalExpenseEl) totalExpenseEl.textContent = `-${currentCurrency}${totalExpense.toFixed(2)}`;

    // Credit card panel - ONLY BALANCE
    if (cardBalanceEl) cardBalanceEl.textContent = `${currentCurrency}${balance.toFixed(2)}`;

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

    if (todayIncomeEl) todayIncomeEl.textContent = `+${currentCurrency}${todayIncome.toFixed(2)}`;
    if (todayExpenseEl) todayExpenseEl.textContent = `-${currentCurrency}${todayExpense.toFixed(2)}`;

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
    if (monthSavingsEl) monthSavingsEl.textContent = `${currentCurrency}${monthSavings.toFixed(2)}`;

    updateRecentTransactions();
    updateTransactionHistory();
    updateStatistics();
    checkBudgetAlerts();
}

function updateRecentTransactions() {
    const recentList = document.getElementById('recentList');
    if (!recentList) return;

    const userTransactions = getUserTransactions();
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
                ${t.type === 'income' ? '+' : '-'}${currentCurrency}${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// filters applied list
function getFilteredTransactions() {
    const userTransactions = getUserTransactions();

    let result = [...userTransactions];

    const q = (searchInput?.value || '').toLowerCase().trim();
    const fType = filterTypeEl?.value || 'all';
    const fCat = filterCatEl?.value || 'all';
    const from = dateFromEl?.value || '';
    const to = dateToEl?.value || '';

    if (q) {
        result = result.filter(t =>
            (t.category || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
        );
    }

    if (fType !== 'all') {
        result = result.filter(t => t.type === fType);
    }

    if (fCat !== 'all') {
        result = result.filter(t => t.category === fCat);
    }

    if (from) {
        result = result.filter(t => t.date >= from);
    }
    if (to) {
        result = result.filter(t => t.date <= to);
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function updateTransactionHistory() {
    const historyList = document.getElementById('historyList') || document.getElementById('transactionHistory');
    if (!historyList) return;

    const sorted = getFilteredTransactions();

    if (sorted.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No transaction history</p>';
        return;
    }

    historyList.innerHTML = sorted.map(t => `
        <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-details">
                <div class="transaction-category">${t.category}</div>
                <div class="transaction-description">${t.description || 'No description'}</div>
                <div class="transaction-date">${t.date}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}${currentCurrency}${t.amount.toFixed(2)}
            </div>
            <div class="transaction-actions">
                <button class="btn btn-secondary btn-sm edit-transaction">Edit</button>
                <button class="btn btn-secondary btn-sm delete-transaction">Delete</button>
            </div>
        </div>
    `).join('');

    historyList.querySelectorAll('.edit-transaction').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.transaction-item').dataset.id;
            startEditTransaction(id);
        });
    });

    historyList.querySelectorAll('.delete-transaction').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.transaction-item').dataset.id;
            deleteTransaction(id);
        });
    });
}

function startEditTransaction(id) {
    const t = transactions.find(tr => tr.id === id);
    if (!t) return;

    selectTransactionType(t.type);
    document.getElementById('amount').value = t.amount;
    document.getElementById('category').value = t.category;
    document.getElementById('date').value = t.date;
    document.getElementById('description').value = t.description || '';
    document.getElementById('recurring').value = t.recurring || 'none';
    if (editTransactionIdEl) editTransactionIdEl.value = t.id;

    submitBtn.textContent = 'Update Transaction';
    cancelEditBtn.style.display = 'inline-flex';

    switchTab('add');
}

function cancelEditMode() {
    if (editTransactionIdEl) editTransactionIdEl.value = '';
    submitBtn.textContent = 'Add Transaction';
    cancelEditBtn.style.display = 'none';
    elements.addForm.reset();
    setTodayDate();
    selectTransactionType('income');
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
    showToast('Transaction deleted', 'success');
}

// Statistics & Charts
function updateStatistics() {
    const userTransactions = getUserTransactions();

    const incomeBreakdown = document.getElementById('incomeBreakdown');
    const expenseBreakdown = document.getElementById('expenseBreakdown');

    const incomeByCategory = {};
    const expenseByCategory = {};
    const monthly = {}; // { 'YYYY-MM': { income, expense } }

    userTransactions.forEach(t => {
        const monthKey = (t.date || '').slice(0, 7);
        if (!monthly[monthKey]) monthly[monthKey] = { income: 0, expense: 0 };
        monthly[monthKey][t.type] += t.amount;

        if (t.type === 'income') {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        }
    });

    // Breakdown HTML
    if (incomeBreakdown) {
        const entries = Object.entries(incomeByCategory);
        if (entries.length === 0) {
            incomeBreakdown.innerHTML = '<p class="empty-state">No income data</p>';
        } else {
            incomeBreakdown.innerHTML = entries.map(([cat, amount]) => `
                <div class="breakdown-item">
                    <span class="breakdown-category">${cat}</span>
                    <span class="breakdown-amount">${currentCurrency}${amount.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }

    if (expenseBreakdown) {
        const entries = Object.entries(expenseByCategory);
        if (entries.length === 0) {
            expenseBreakdown.innerHTML = '<p class="empty-state">No expense data</p>';
        } else {
            expenseBreakdown.innerHTML = entries.map(([cat, amount]) => `
                <div class="breakdown-item">
                    <span class="breakdown-category">${cat}</span>
                    <span class="breakdown-amount">${currentCurrency}${amount.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }

    // Charts
    const incomeCanvas = document.getElementById('incomeChart');
    const expenseCanvas = document.getElementById('expenseChart');
    const trendCanvas = document.getElementById('trendChart');

    const incomeLabels = Object.keys(incomeByCategory);
    const incomeData = Object.values(incomeByCategory);
    const expenseLabels = Object.keys(expenseByCategory);
    const expenseData = Object.values(expenseByCategory);

    const monthLabels = Object.keys(monthly).sort();
    const monthIncomeData = monthLabels.map(m => monthly[m].income);
    const monthExpenseData = monthLabels.map(m => monthly[m].expense);

    if (incomeCanvas) {
        if (incomeChart) incomeChart.destroy();
        incomeChart = new Chart(incomeCanvas, {
            type: 'doughnut',
            data: {
                labels: incomeLabels,
                datasets: [{
                    data: incomeData,
                    backgroundColor: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }

    if (expenseCanvas) {
        if (expenseChart) expenseChart.destroy();
        expenseChart = new Chart(expenseCanvas, {
            type: 'doughnut',
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseData,
                    backgroundColor: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2']
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }

    if (trendCanvas) {
        if (trendChart) trendChart.destroy();
        trendChart = new Chart(trendCanvas, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthIncomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.15)',
                        tension: 0.3
                    },
                    {
                        label: 'Expense',
                        data: monthExpenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.15)',
                        tension: 0.3
                    }
                ]
            },
            options: {
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Ogive Chart (Cumulative Balance)
    const ogiveCanvas = document.getElementById('ogiveChart');
    if (ogiveCanvas) {
        // Sort transactions by date
        const sortedTransactions = [...userTransactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        // Calculate cumulative balance
        let cumulativeBalance = 0;
        const ogiveData = sortedTransactions.map(t => {
            if (t.type === 'income') {
                cumulativeBalance += t.amount;
            } else {
                cumulativeBalance -= t.amount;
            }
            return {
                date: t.date,
                balance: cumulativeBalance
            };
        });

        const ogiveLabels = ogiveData.map(d => d.date);
        const ogiveValues = ogiveData.map(d => d.balance);

        if (ogiveChart) ogiveChart.destroy();
        ogiveChart = new Chart(ogiveCanvas, {
            type: 'line',
            data: {
                labels: ogiveLabels,
                datasets: [{
                    label: 'Cumulative Balance',
                    data: ogiveValues,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true, position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Balance: ' + currentCurrency + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return currentCurrency + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Budgets
function handleBudgetSubmit(e) {
    e.preventDefault();
    const cat = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const period = document.getElementById('budgetPeriod').value;

    if (!cat || !amount) {
        showToast('Please fill all budget fields', 'error');
        return;
    }

    const existingIndex = budgets.findIndex(b => b.category === cat && b.period === period);
    if (existingIndex !== -1) {
        budgets[existingIndex].amount = amount;
    } else {
        budgets.push({ id: Date.now().toString(), category: cat, amount, period });
    }

    localStorage.setItem('budgets', JSON.stringify(budgets));
    renderBudgets();
    showToast('Budget saved', 'success');
    budgetForm.reset();
}

function renderBudgets() {
    if (!budgetListEl) return;

    if (!budgets.length) {
        budgetListEl.innerHTML = '<p class="empty-state">No budgets set. Create your first budget!</p>';
        return;
    }

    const userTransactions = getUserTransactions();
    budgetListEl.innerHTML = budgets.map(b => {
        const used = userTransactions
            .filter(t => t.type === 'expense' && t.category === b.category)
            .reduce((sum, t) => sum + t.amount, 0);

        const percent = b.amount ? Math.min(100, (used / b.amount) * 100) : 0;
        let barClass = '';
        if (percent >= 100) barClass = 'danger';
        else if (percent >= 75) barClass = 'warning';

        return `
        <div class="budget-item">
            <div class="budget-header">
                <span class="budget-category">${b.category} (${b.period})</span>
                <span class="budget-amount">Limit: ${currentCurrency}${b.amount.toFixed(2)}</span>
            </div>
            <div class="budget-progress">
                <div class="budget-progress-bar ${barClass}" style="width:${percent}%"></div>
            </div>
            <div class="budget-info">
                <span>Used: ${currentCurrency}${used.toFixed(2)}</span>
                <span>${percent.toFixed(1)}%</span>
            </div>
        </div>
        `;
    }).join('');
}

function checkBudgetAlerts() {
    const userTransactions = getUserTransactions();
    budgets.forEach(b => {
        const used = userTransactions
            .filter(t => t.type === 'expense' && t.category === b.category)
            .reduce((sum, t) => sum + t.amount, 0);

        if (used >= b.amount && b.amount > 0) {
            showToast(`Budget exceeded for ${b.category}`, 'error');
        } else if (used >= 0.75 * b.amount && b.amount > 0) {
            showToast(`You are close to budget limit for ${b.category}`, 'info');
        }
    });
}

// Export helpers
function exportCSV() {
    const rows = getFilteredTransactions();
    if (!rows.length) {
        showToast('No data to export', 'error');
        return;
    }

    const header = ['Type', 'Amount', 'Category', 'Description', 'Date'];
    const csvRows = [header.join(',')];

    rows.forEach(t => {
        csvRows.push([
            t.type,
            t.amount,
            `"${t.category}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.date
        ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keeptrack-transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('CSV exported', 'success');
}

function exportPDF() {
    const rows = getFilteredTransactions();
    if (!rows.length) {
        showToast('No data to export', 'error');
        return;
    }

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        showToast('PDF library not loaded', 'error');
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('KeepTrack Transactions', 14, 16);

    let y = 26;
    const lineHeight = 8;

    rows.forEach((t, index) => {
        const line = `${t.date}  |  ${t.type.toUpperCase()}  |  ${t.category}  |  ${currentCurrency}${t.amount.toFixed(2)}  |  ${t.description || ''}`;
        doc.text(line, 10, y);
        y += lineHeight;

        if (y > 280 && index < rows.length - 1) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save('keeptrack-transactions.pdf');
    showToast('PDF exported', 'success');
}

// Success Popup Function
function showSuccessPopup(message) {
    if (!successPopup || !popupMessage) return;

    popupMessage.textContent = message;
    successPopup.classList.add('show');

    setTimeout(() => {
        successPopup.classList.remove('show');
    }, 3000);
}

// Utility Functions
function switchTab(tabName) {
    currentTab = tabName;

    elements.tabs?.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'history') {
        updateTransactionHistory();
    } else if (tabName === 'stats') {
        updateStatistics();
    } else if (tabName === 'budget') {
        renderBudgets();
        checkBudgetAlerts();
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

function getUserTransactions() {
    return transactions.filter(t =>
        !currentUser || t.userId === currentUser.uid || t.userId === 'offline'
    );
}

function populateFilterCategories() {
    if (!filterCatEl) return;
    const allCats = [...categories.income, ...categories.expense];
    filterCatEl.innerHTML = `<option value="all">All Categories</option>` +
        allCats.map(c => `<option value="${c}">${c}</option>`).join('');

    const budgetCatSelect = document.getElementById('budgetCategory');
    if (budgetCatSelect) {
        budgetCatSelect.innerHTML = `<option value="">Select category</option>` +
            categories.expense.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

// Auth state – show username and currency
if (typeof firebase !== 'undefined' && firebase.auth) {
    const auth = firebase.auth();
    
    auth.onAuthStateChanged((user) => {
        currentUser = user || null;

        if (loadingScreen) loadingScreen.style.display = 'none';

        if (user) {
            // parse displayName: "name|currency"
            let displayName = user.displayName || '';
            let name = displayName;
            let currency = currentCurrency;

            if (displayName && displayName.includes('|')) {
                const [n, c] = displayName.split('|');
                name = n || 'User';
                currency = c || '৳';
            }

            currentCurrency = currency;
            localStorage.setItem('currency', currentCurrency);

            if (userNameEl) userNameEl.textContent = name || user.email || 'User';
            if (cardUserNameEl) cardUserNameEl.textContent = name || user.email || 'User';

            if (loginScreen) loginScreen.style.display = 'none';
            if (registerScreen) registerScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'flex';

            loadUserData();
        } else {
            if (mainApp) mainApp.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'flex';
        }
    });
} else {
    // Firebase not loaded - show login screen immediately
    console.log("Firebase not available - showing login screen");
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

// Load data when user logs in
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