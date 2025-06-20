const express = require("express");
const multer = require("multer");
const {
  handleDocumentUpload,
  getAllUploadedFiles,
} = require("../controllers/documentController");

const router = express.Router();
const upload = multer({ dest: "src/uploads/" }); // make sure this folder exists

router.post("/upload", upload.single("file"), handleDocumentUpload);
router.get('/all', getAllUploadedFiles);

module.exports = router;
