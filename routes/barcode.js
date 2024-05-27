const express = require('express');
const bwipjs = require('bwip-js');
const PDFDocument = require('pdfkit');

const router = express.Router();

router.post('/generate', (req, res) => {
    const { text, format } = req.body;

    // Define an array of supported formats
    const supportedFormats = ['code128', 'qrcode', 'ean13', 'upca'];

    // Check if the provided format is supported
    if (!supportedFormats.includes(format)) {
        return res.status(400).send('Unsupported barcode format');
    }

    bwipjs.toBuffer({
        bcid: format,
        text: text,
        scale: 3,  // Adjust scale as needed for the text size
        height: 9.7,  // Height of the barcode in millimeters
        width: 34,
        includetext: true,
        textxalign: 'center'
    }, (err, png) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                res.writeHead(200, {
                    'Content-Length': Buffer.byteLength(pdfData),
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment;filename=barcode.pdf',
                }).end(pdfData);
            });

            doc.image(png, {
                fit: [250, 250],
                align: 'center',
                valign: 'center'
            });
            doc.end();
        }
    });
});


module.exports = router;
