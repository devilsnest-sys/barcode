const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const barcodeRoutes = require('./routes/barcode');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Handle CORS
app.use(bodyParser.json());
app.use('/api/barcode', barcodeRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
