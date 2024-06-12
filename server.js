const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const barcodeRoutes = require('./routes/barcode');
const healthRoutes = require('./routes/health');
const dataRoutes = require('./routes/data');
const db = require('./db_conn');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Handle CORS
app.use(bodyParser.json());
app.use('/api/barcode', barcodeRoutes);
app.use('/api', healthRoutes); // Use the health routes
app.use('/api', dataRoutes); // Use the data routes

db.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  db.close()
    .then(() => {
      console.log('Server stopped');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error stopping server:', err);
      process.exit(1);
    });
});
