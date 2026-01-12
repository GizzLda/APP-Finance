const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const clearButton = document.getElementById("clear-transactions");
const transactionList = document.getElementById("transaction-list");
const transactionCount = document.getElementById("transaction-count");
const balanceText = document.getElementById("balance");
const incomeText = document.getElementById("income");
const expensesText = document.getElementById("expenses");
const netText = document.getElementById("net");

const storageKey = "app-finance-transactions";
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

let transactions = [];

const normalizeAmount = (type, amount) => {
  const parsedAmount = Number.parseFloat(amount);
  if (Number.isNaN(parsedAmount)) {
    return null;
  }
  const absolute = Math.abs(parsedAmount);
  return type === "despesa" ? -absolute : absolute;
};

const loadTransactions = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    transactions = [];
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    transactions = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    transactions = [];
  }
};

const saveTransactions = () => {
  localStorage.setItem(storageKey, JSON.stringify(transactions));
};

const calculateTotals = () => {
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const net = income + expenses;

  return { income, expenses, net };
};

const updateSummary = () => {
  const { income, expenses, net } = calculateTotals();
  incomeText.textContent = currencyFormatter.format(income);
  expensesText.textContent = currencyFormatter.format(Math.abs(expenses));
  netText.textContent = currencyFormatter.format(net);
  balanceText.textContent = currencyFormatter.format(net);
};

const renderTransactions = () => {
  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-state");
    emptyItem.textContent =
      "Nenhuma movimentação registrada ainda. Comece adicionando uma nova.";
    transactionList.appendChild(emptyItem);
    transactionCount.textContent = "0 registros";
    return;
  }

  transactions.forEach((transaction) => {
    const item = document.createElement("li");
    item.className = `transaction transaction--${
      transaction.amount < 0 ? "expense" : "income"
    }`;

    const info = document.createElement("div");
    info.className = "transaction__info";

    const title = document.createElement("strong");
    title.textContent = transaction.description;

    const meta = document.createElement("span");
    meta.className = "transaction__meta";
    meta.textContent = transaction.category;

    info.appendChild(title);
    info.appendChild(meta);

    const amount = document.createElement("span");
    amount.className = "transaction__amount";
    amount.textContent = currencyFormatter.format(transaction.amount);

    const actions = document.createElement("div");
    actions.className = "transaction__actions";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remover";
    removeButton.setAttribute("aria-label", "Remover movimentação");
    removeButton.addEventListener("click", () => removeTransaction(transaction.id));

    actions.appendChild(removeButton);

    item.appendChild(info);
    item.appendChild(amount);
    item.appendChild(actions);

    transactionList.appendChild(item);
  });

  transactionCount.textContent = `${transactions.length} registros`;
};

const addTransaction = (event) => {
  event.preventDefault();
  const description = descriptionInput.value.trim();
  const category = categoryInput.value.trim();
  const type = typeInput.value;
  const amount = normalizeAmount(type, amountInput.value);

  if (!description || !category || amount === null) {
    return;
  }

  const transaction = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description,
    category,
    amount,
  };

  transactions.unshift(transaction);
  saveTransactions();
  renderTransactions();
  updateSummary();
  form.reset();
  descriptionInput.focus();
};

const removeTransaction = (id) => {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  renderTransactions();
  updateSummary();
};

const clearTransactions = () => {
  transactions = [];
  saveTransactions();
  renderTransactions();
  updateSummary();
};

form.addEventListener("submit", addTransaction);
clearButton.addEventListener("click", clearTransactions);

loadTransactions();
renderTransactions();
updateSummary();
