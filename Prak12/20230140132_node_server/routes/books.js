const express = require('express');
const fs = require('fs');
const router = express.Router();

const DATA_FILE = './books.json';

// Helper untuk baca dan tulis file JSON
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data || '[]');
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET semua buku
router.get('/', (req, res) => {
  const books = readData();
  res.json(books);
});

// GET buku berdasarkan id
router.get('/:id', (req, res) => {
  const books = readData();
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// CREATE buku baru
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const books = readData();
  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author
  };

  books.push(newBook);
  writeData(books);
  res.status(201).json(newBook);
});

// UPDATE buku berdasarkan id
router.put('/:id', (req, res) => {
  const { title, author } = req.body;
  const books = readData();
  const index = books.findIndex(b => b.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  books[index] = { id: books[index].id, title, author };
  writeData(books);
  res.json(books[index]);
});

// DELETE buku berdasarkan id
router.delete('/:id', (req, res) => {
  const books = readData();
  const filtered = books.filter(b => b.id !== parseInt(req.params.id));

  if (filtered.length === books.length) {
    return res.status(404).json({ message: 'Book not found' });
  }

  writeData(filtered);
  res.json({ message: 'Book deleted successfully' });
});

module.exports = router;
