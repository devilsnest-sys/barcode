const express = require('express');
const router = express.Router();
const db = require('../db_conn');

router.get('/data', async (req, res) => {
  const { unit, doc, prodCode } = req.query;

  if (!unit) {
    return res.status(400).send('Missing required query parameter: unit');
  }

  try {
    const data = await db.executeQuery({ unit, doc, prodCode });
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching data', err);
    res.status(500).send('Error fetching data: ' + err.message);
  }
});

module.exports = router;
