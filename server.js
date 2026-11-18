import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';

const app = express();
const PORT = 3000;
const FILE_PATH = './transactions.json';

app.use(cors());
app.use(express.json());

async function readTransactions() {
  try {
    const fileData = await fs.readFile(FILE_PATH, 'utf-8');
    return fileData.trim() ? JSON.parse(fileData) : [];
  } catch {
    return [];
  }
}

// Required for fetchTransactions()
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await readTransactions();
    res.json(transactions);
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

// Required for saveTransaction()
app.post('/api/transactions', async (req, res) => {
  try {
    const transactions = await readTransactions();
    transactions.push(req.body);
    await fs.writeFile(FILE_PATH, JSON.stringify(transactions, null, 2));

    console.log('Saved transaction:', req.body);
    res.status(201).json({ message: 'Transaction saved' });
  } catch (error) {
    console.error('Write error:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});