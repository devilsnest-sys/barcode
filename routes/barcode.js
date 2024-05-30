const express = require('express');
const bwipjs = require('bwip-js');
const PDFDocument = require('pdfkit');
const db = require('../db_conn');

const router = express.Router();

router.post('/generate', (req, res) => {
    const { text, format } = req.body;

    const supportedFormats = ['code128', 'qrcode', 'ean13', 'upca'];
    if (!supportedFormats.includes(format)) {
        return res.status(400).send('Unsupported barcode format');
    }

    bwipjs.toBuffer({
        bcid: format,
        text: text,
        scale: 3,
        height: 9.7,
        width: 34,
        includetext: true,
        textxalign: 'center'
    }, (err, png) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const pngBase64 = png.toString('base64');
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                const pdfBase64 = pdfData.toString('base64');
                res.json({ pngBase64, pdfBase64 });
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
