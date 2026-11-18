const categoriesByType = {
  Expense: [
    'Rent',
    'Fuel',
    'Groceries',
    'Health',
    'Power',
    'Gas',
    'Water',
    'Phone',
    'Internet',
  ],
  Income: [
    'Acer Property Managment',
    'Top Shelf Home Cleaning',
    'AllClean Xperts',
    'MartinZeta',
    'Tips',
  ],
};

const WATCHED_FIELDS = ['amount', 'category', 'description', 'dateInput'];
const touchedFields = new Set();

export function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCategoryOptions(type) {
  const list = categoriesByType[type] || [];
  const options = list
    .map((item) => `<option value="${item}">${item}</option>`)
    .join('');

  return `<option value="" disabled selected>Select a category</option>${options}`;
}

export function updateCategoryOptions(type) {
  const isIncome = type === 'Income';
  const categorySelect = document.getElementById('category');
  const submitBtn = document.querySelector('.submitBtn');
  const incomeLabel = document.getElementById('labelIncome');
  const expenseLabel = document.getElementById('labelExpense');
  const fieldset = document.getElementById('transaction-type');
  const form = document.getElementById('expenseForm');
  const inputs = document.querySelectorAll('.input');

  if (categorySelect) {
    categorySelect.innerHTML = buildCategoryOptions(type);
  }

  if (submitBtn) {
    submitBtn.textContent = `Add ${type}`;
    submitBtn.classList.toggle('income', isIncome);
  }

  if (incomeLabel && expenseLabel && fieldset && form) {
    incomeLabel.classList.toggle('selected', isIncome);
    expenseLabel.classList.toggle('selected', !isIncome);
    fieldset.classList.toggle('income', isIncome);
    form.classList.toggle('income', isIncome);
    inputs.forEach((input) => input.classList.toggle('income', isIncome));
  }
}

export function renderApp(container) {
  container.innerHTML = `
    <header class="header">
      <div class="header-content">
        <nav class="nav-content">
          <div class="navbar-content">
            <img src="./assets/logo-150x150.png" class="logo" alt="logo MartinZeta">
          </div>
          <ul class="nav-links"></ul>
        </nav>
      </div>
    </header>

    <main class="main-section">
      <form id="expenseForm" class="transactions-form" novalidate>
        <fieldset class="transactionType" id="transaction-type">
          <legend class="transactionTypeField">Choose transaction type</legend>
          
          <label for="income" class="label labelIncome" id="labelIncome">
            <input class="chkBox" type="radio" id="income" name="type" value="Income">
            INCOME
          </label>
        
          <label for="expense" class="label labelExpense selected" id="labelExpense">
            <input class="chkBox" type="radio" id="expense" name="type" value="Expense" checked>
            EXPENSE
          </label>
        </fieldset>

        <label for="amount">Amount:</label>  
        <div class="currency-input input"><input class="input inputAmount" type="number" name="amount" step="0.01" id="amount" required placeholder="0.00"></div>
        <p id="amountError" class="error-msg"></p>
        
        <label for="category">Category:</label>  
        <select class="input inputCategory" id="category" name="category" required>
          ${buildCategoryOptions('Expense')}
        </select>
        <p id="categoryError" class="error-msg"></p>
        
        <label for="description">Description:</label>  
        <input class="input inputDescription" type="text" id="description" name="description" required placeholder="Description">
        <p id="descriptionError" class="error-msg"></p>
        
        <label for="dateInput">Date:</label>  
        <input class="input inputDate" type="date" id="dateInput" name="dateInput" value="${getTodayDate()}" required>
        <p id="dateInputError" class="error-msg"></p>
        
        <button type="submit" class="submitBtn disabled">
          Add Expense
        </button>
      </form>

      <section class="transactions-section">
        <div class="balance-summary">
          <div class="summary-card income">
            <span class="summary-label">Income</span>
            <span id="totalIncome" class="summary-value">$0.00</span>
          </div>
          <div class="summary-card expense">
            <span class="summary-label">Expenses</span>
            <span id="totalExpense" class="summary-value">$0.00</span>
          </div>
          <div class="summary-card net">
            <span class="summary-label">Net Balance</span>
            <span id="netBalance" class="summary-value">$0.00</span>
          </div>
        </div>

        <h2 class="history-title">Transaction History</h2>
        <ul id="transactionsList" class="transactions-list">
          <li class="empty-state">Loading transactions...</li>
        </ul>
      </section>
    </main>
  `;
}

export function renderTransactions(transactions) {
  const listEl = document.getElementById('transactionsList');
  const incomeEl = document.getElementById('totalIncome');
  const expenseEl = document.getElementById('totalExpense');
  const netEl = document.getElementById('netBalance');
  if (!listEl || !incomeEl || !expenseEl || !netEl) return;

  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of transactions) {
    const amount = Number(item.Amount) || 0;
    if (item.Type === 'Income') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const formattedNet =
    netBalance < 0
      ? `-$${Math.abs(netBalance).toFixed(2)}`
      : `$${netBalance.toFixed(2)}`;

  incomeEl.textContent = `$${totalIncome.toFixed(2)}`;
  expenseEl.textContent = `$${totalExpense.toFixed(2)}`;
  netEl.textContent = formattedNet;
  netEl.classList.toggle('negative', netBalance < 0);
  netEl.classList.toggle('positive', netBalance > 0);

  if (transactions.length === 0) {
    listEl.innerHTML = `<li class="empty-state">No transactions recorded yet.</li>`;
    return;
  }

  listEl.innerHTML = [...transactions]
    .reverse()
    .map((item) => {
      const isIncome = item.Type === 'Income';
      const typeClass = isIncome ? 'income' : 'expense';
      const sign = isIncome ? '+' : '-';
      const amount = Number(item.Amount || 0).toFixed(2);

      return `
        <li class="transaction-item ${typeClass}">
          <div class="transaction-details">
            <p class="transaction-desc">${escapeHTML(item.Description)}</p>
            <p class="transaction-meta">${escapeHTML(item.Category)} &bull; ${escapeHTML(item.Date)}</p>
          </div>
          <span class="transaction-amount ${typeClass}">${sign}$${amount}</span>
        </li>
      `;
    })
    .join('');
}

export function renderTransactionLoadError() {
  const listEl = document.getElementById('transactionsList');
  if (listEl) {
    listEl.innerHTML = `<li class="empty-state error">Could not load transactions from server.</li>`;
  }
}

export function markFieldTouched(fieldId) {
  if (WATCHED_FIELDS.includes(fieldId)) {
    touchedFields.add(fieldId);
  }
}

export function markAllFieldsTouched() {
  for (const fieldId of WATCHED_FIELDS) {
    touchedFields.add(fieldId);
  }
}

function setFieldError(fieldId, errorMessage, shouldDisplay) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (!inputEl || !errorEl) return;

  const showError = shouldDisplay && Boolean(errorMessage);

  inputEl.classList.toggle('error', showError);
  errorEl.textContent = showError ? errorMessage : '';
  errorEl.classList.toggle('visible', showError);
}

export function getTransactionFormData() {
  const selectedType = document.querySelector('input[name="type"]:checked');

  return {
    Type: selectedType ? selectedType.value : 'Expense',
    Amount: Number(document.getElementById('amount').value),
    Category: document.getElementById('category').value,
    Description: document.getElementById('description').value.trim(),
    Date: document.getElementById('dateInput').value,
  };
}

export function validateFormData(data) {
  const errors = {
    amount:
      Number.isNaN(data.Amount) || data.Amount <= 0
        ? 'Enter an amount greater than $0.00'
        : '',
    category: !data.Category ? 'Please select a category' : '',
    description: !data.Description ? 'Description cannot be blank' : '',
    dateInput: !data.Date ? 'Please select a valid date' : '',
  };

  for (const fieldId of WATCHED_FIELDS) {
    setFieldError(fieldId, errors[fieldId], touchedFields.has(fieldId));
  }

  const isFormValid = Object.values(errors).every((msg) => msg === '');

  const submitBtn = document.querySelector('.submitBtn');
  if (submitBtn) {
    submitBtn.disabled = !isFormValid;
    submitBtn.classList.toggle('disabled', !isFormValid);
  }

  return isFormValid;
}

export function resetTransactionForm(form) {
  touchedFields.clear();
  form.reset();
  updateCategoryOptions('Expense');
  document.getElementById('dateInput').value = getTodayDate();
  validateFormData(getTransactionFormData());
}