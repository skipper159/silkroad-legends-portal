// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Test route to verify the upload route is working
router.get('/test', (req, res) => {
  const dirExists = fs.existsSync(uploadsDir);

  res.json({
    success: true,
    message: 'Upload route is working!',
    debug: {
      uploadsDir,
      dirExists,
      currentDir: __dirname,
      resolvedPath: path.resolve(uploadsDir),
    },
  });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/images/news');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname);
    const filename = `news_${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilddateien sind erlaubt (JPG, PNG, WebP, GIF)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload single image
router.post('/image', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Keine Datei hochgeladen',
      });
    }

    // Return the URL path that can be used in the frontend
    const imageUrl = `/images/news/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Bild erfolgreich hochgeladen',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Hochladen des Bildes',
      error: error.message,
    });
  }
});

// Upload multiple images
router.post('/images', verifyToken, verifyAdmin, upload.array('images', 10), (req, res) => {
  try {
    console.log('📁 Upload request received');
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Upload directory:', uploadsDir);
    console.log('Directory exists:', fs.existsSync(uploadsDir));

    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({
        success: false,
        message: 'Keine Dateien hochgeladen',
      });
    }

    const uploadedFiles = req.files.map((file) => {
      console.log('📎 Uploaded file:', {
        filename: file.filename,
        path: file.path,
        size: file.size,
      });

      return {
        filename: file.filename,
        originalName: file.originalname,
        url: `/images/news/${file.filename}`,
        size: file.size,
      };
    });

    console.log('✅ Upload successful:', uploadedFiles.length, 'files');

    res.json({
      success: true,
      message: `${req.files.length} Bild(er) erfolgreich hochgeladen`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Hochladen der Bilder',
      error: error.message,
    });
  }
});

// Delete image
router.delete('/image/:filename', verifyToken, verifyAdmin, (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    // Security check - ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger Dateiname',
      });
    }

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Datei nicht gefunden',
      });
    }

    // Delete file
    fs.unlinkSync(filepath);

    res.json({
      success: true,
      message: 'Bild erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen des Bildes',
      error: error.message,
    });
  }
});

// Get list of uploaded images
router.get('/images', verifyToken, verifyAdmin, (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map((file) => {
        const filepath = path.join(uploadsDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          url: `/images/news/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Latest first

    res.json({
      success: true,
      data: imageFiles,
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Bilder',
      error: error.message,
    });
  }
});

module.exports = router;
