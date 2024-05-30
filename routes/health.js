const express = require('express');
const router = express.Router();
const db = require('../db_conn');

router.get('/health', async (req, res) => {
  try {
    const result = await db.simpleExecute('SELECT 1 FROM DUAL');
    if (result.rows.length > 0) {
      res.status(200).send('Database connection is healthy');
    } else {
      res.status(500).send('Database connection test failed');
    }
  } catch (err) {
    console.error('Error executing health check query:', err);
    res.status(500).send('Database connection error');
  }
});

module.exports = router;
