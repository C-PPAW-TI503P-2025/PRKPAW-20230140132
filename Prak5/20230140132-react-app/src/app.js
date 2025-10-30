const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Middleware logging
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}`;
  console.log(log);
  fs.appendFileSync('server.log', log + '\n');
  next();
});

// Import dan gunakan router presensi
const presensiRoutes = require('../routes/presensi');
app.use('/api/presensi', presensiRoutes);

// Middleware 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({ message: '404 Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
