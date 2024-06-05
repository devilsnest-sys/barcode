const express = require('express');
const router = express.Router();
const db = require('../db_conn');

router.get('/data', async (req, res) => {
  const { unit, doc, prodCode } = req.query;

  if (!unit || !doc || !prodCode) {
    return res.status(400).send('Missing required query parameters: unit, doc, prodCode');
  }

  try {
    console.log(`Fetching data with unit: ${unit}, doc: ${doc}, prodCode: ${prodCode}`);
    const data = await db.executeQuery(unit, doc, prodCode);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching data', err);
    res.status(500).send('Error fetching data: ' + err.message);
  }
});

router.get('/barcode/data', async (req, res) => {
  const { unit } = req.query;

  if (!unit) {
    return res.status(400).send('Missing required query parameter: unit');
  }

  try {
    console.log(`Fetching PRODN_SLIP_NO data with unit: ${unit}`);
    const data = await db.executeSlipNoQuery(unit);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching PRODN_SLIP_NO data', err);
    res.status(500).send('Error fetching PRODN_SLIP_NO data: ' + err.message);
  }
});

module.exports = router;
