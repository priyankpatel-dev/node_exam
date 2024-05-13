const express = require('express');
const multer = require('multer');
const authController = require('./../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
});

const uploadStorage = multer({ storage: storage });

// Define routes with image upload functionality
router.post(
    '/signup',
    uploadStorage.single('image'), // Image upload middleware
    [
      // Validation middleware using express-validator
      body('email').isEmail().withMessage('Invalid email address'),
      body('password').isStrongPassword({ minLength: 8 }).withMessage('Password must be at least 6 characters long'),
      // Add more validation rules as needed
    ],
    authController.signup
  );
// router.post('/signup', uploadStorage.single('image'), authController.signup);    
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
