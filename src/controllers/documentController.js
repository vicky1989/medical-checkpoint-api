const fs = require("fs");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const axios = require("axios");
const fileType = require("file-type");

exports.handleDocumentUpload = async (req, res) => {
  const file = req.file;
  const remoteUrl = req.body.url;

  try {
    let filePath = "";
    let mimeType = "";
    let tempDownloaded = false;

    // Case 1: File uploaded via form
    if (file) {
      filePath = file.path;
      mimeType = file.mimetype;
    }

    // Case 2: File via URL
    else if (remoteUrl) {
      console.log("Remote URL:", remoteUrl);

      const response = await axios({
        url: remoteUrl,
        method: "GET",
        responseType: "stream",
      });

      const fileName = `temp_${Date.now()}`;
      filePath = path.join(__dirname, `../../temp/${fileName}`);
      tempDownloaded = true;

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 🧠 Detect file type from content
      const detected = await fileType.fromFile(filePath);
      if (!detected) {
        return res
          .status(400)
          .json({ success: false, message: "Could not detect file type" });
      }

      const { ext, mime } = detected;
      mimeType = mime;

      // Rename the file with proper extension
      const newFilePath = `${filePath}.${ext}`;
      fs.renameSync(filePath, newFilePath);
      filePath = newFilePath;
    }

    // Ensure we have a file path
    if (!filePath) {
      return res
        .status(400)
        .json({ success: false, message: "No file or URL provided" });
    }

    // Extract text
    let extractedText = "";
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.startsWith("image/")) {
      const result = await Tesseract.recognize(filePath, "eng");
      extractedText = result.data.text;
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type for processing",
      });
    }

    // Upload only if it was a local file upload
    let uploadResult = null;
    if (file) {
      uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
      });
    }

    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Response
    res.json({
      success: true,
      text: extractedText.trim(),
      fileUrl: uploadResult?.secure_url || remoteUrl,
      public_id: uploadResult?.public_id || "",
    });
  } catch (error) {
    console.error("OCR or Upload error:", error);
    res.status(500).json({ success: false, message: "Processing failed" });
  }
};

exports.getAllUploadedFiles = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression("resource_type:image OR resource_type:raw") // includes PDFs + images
      .sort_by("created_at", "desc")
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch documents" });
  }
};
