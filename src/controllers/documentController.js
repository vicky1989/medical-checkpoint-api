const fs = require('fs');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

exports.handleDocumentUpload = async (req, res) => {
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng');
      extractedText = result.data.text;
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

    fs.unlinkSync(filePath); // Clean up uploaded file

    res.json({ success: true, text: extractedText.trim() });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ success: false, message: 'OCR processing failed' });
  }
};
