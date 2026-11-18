import './style.css';
import { fetchTransactions, saveTransaction } from './api.js';
import {
  renderApp,
  renderTransactions,
  renderTransactionLoadError,
  getTransactionFormData,
  resetTransactionForm,
  updateCategoryOptions,
  validateFormData,
  markFieldTouched,
  markAllFieldsTouched,
} from './ui.js';

const appContainer = document.querySelector('#app');
renderApp(appContainer);

const expenseForm = document.getElementById('expenseForm');
validateFormData(getTransactionFormData());

async function refreshTransactions() {
  try {
    const transactions = await fetchTransactions();
    renderTransactions(transactions);
  } catch (error) {
    console.error('Failed to load transactions:', error);
    renderTransactionLoadError();
  }
}

expenseForm.addEventListener('focusout', (event) => {
  markFieldTouched(event.target.id);
  validateFormData(getTransactionFormData());
});

expenseForm.addEventListener('input', () => {
  validateFormData(getTransactionFormData());
});

expenseForm.addEventListener('change', (event) => {
  if (event.target.name === 'type') {
    updateCategoryOptions(event.target.value);
  }
  validateFormData(getTransactionFormData());
});

expenseForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  markAllFieldsTouched();
  const newTransaction = getTransactionFormData();

  if (!validateFormData(newTransaction)) return;

  try {
    await saveTransaction(newTransaction);
    resetTransactionForm(expenseForm);
    await refreshTransactions();
  } catch (error) {
    console.error('Failed to save transaction:', error);
    alert('Could not connect to the server. Make sure node server.js is running.');
  }
});

refreshTransactions();