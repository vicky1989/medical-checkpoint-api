const fs = require('fs');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const cloudinary = require('../utils/cloudinary');

exports.handleDocumentUpload = async (req, res) => {
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    let extractedText = '';

    // ⬇️ Step 1: Extract text
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

    // ⬇️ Step 2: Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });

    // ⬇️ Step 3: Clean up local file
    fs.unlinkSync(filePath);

    // ⬇️ Step 4: Return both extracted text and file URL
    res.json({
      success: true,
      text: extractedText.trim(),
      fileUrl: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error('OCR or Upload error:', error);
    res.status(500).json({ success: false, message: 'Processing failed' });
  }
};

exports.getAllUploadedFiles = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('resource_type:image OR resource_type:raw') // includes PDFs + images
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const files = result.resources.map((file) => ({
      url: file.secure_url,
      publicId: file.public_id,
      type: file.resource_type,
      format: file.format,
      createdAt: file.created_at,
    }));

    res.json({ success: true, data: files });
  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};
