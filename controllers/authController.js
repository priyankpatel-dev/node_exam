const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Customer = require('./../models/customerModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// var multer = require('multer');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/")
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname)
//   },
// })
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
// const uploadStorage = multer({ storage: storage })

const createSendToken = (customer, statusCode, res) => {
  const token = signToken(customer._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  customer.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      customer
    }
  });
};

// Signup functionlity
exports.signup = catchAsync(async (req, res, next) => {

  const newCustomer = await Customer.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    gender:req.body.gender,
    address:req.body.address,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo:req.file.filename
  });
// uploadStorage.single('image');
  createSendToken(newCustomer, 201, res);
});

// Login functionlity
exports.login = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // Check if customer exists && password is correct
  const customer = await Customer.findOne({ email }).select('+password');

  if (!customer || !(await customer.correctPassword(password, customer.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // send token
  createSendToken(customer, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // fetch and check token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Authentication error.', 401)
    );
  }

  // verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if customer is exists
  const currentCustomer = await Customer.findById(decoded.id);
  if (!currentCustomer) {
    return next(
      new AppError(
        'Invalid token.',
        401
      )
    );
  }

  // Check if customer changed password after the token was issued
  if (currentCustomer.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Invalid token.', 401)
    );
  }

  req.customer = currentCustomer;
  next();
});

// Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get customer based on request email
  const customer = await Customer.findOne({ email: req.body.email });
  if (!customer) {
    return next(new AppError('Invalid email address.', 404));
  }

  // Generate the reset token
  const resetToken = customer.createPasswordResetToken();
  await customer.save({ validateBeforeSave: false });
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get customer based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const customer = await Customer.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If token has valid token and is customer then set the new password
  if (!customer) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  customer.password = req.body.password;
  customer.passwordConfirm = req.body.passwordConfirm;
  customer.passwordResetToken = undefined;
  customer.passwordResetExpires = undefined;
  await customer.save();

  // Send token to response
  createSendToken(customer, 200, res);
});

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // fetch customer data
  const customer = await Customer.findById(req.customer.id).select('+password');

  // Validate requested current password
  if (!(await customer.correctPassword(req.body.passwordCurrent, customer.password))) {
    return next(new AppError('Invalid password.', 401));
  }

  // If valid password then update password
  customer.password = req.body.password;
  customer.passwordConfirm = req.body.passwordConfirm;
  await customer.save();

  // Send token to response
  createSendToken(customer, 200, res);
});
