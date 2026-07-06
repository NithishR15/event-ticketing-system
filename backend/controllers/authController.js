const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isApprovedOrganizer: user.isApprovedOrganizer,
      createdAt: user.createdAt,
    },
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, organizationName, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const assignedRole = role === 'organizer' ? 'organizer' : 'student';

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: assignedRole,
    organizationName: assignedRole === 'organizer' ? organizationName : '',
  });

  if (assignedRole === 'organizer') {
    await sendNotification(req.app.get('io'), user._id, {
      title: 'Organizer Account Pending Approval',
      message:
        'Your organizer account has been created and is pending admin approval before you can publish events.',
      type: 'organizer-approval',
    });
  }

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact admin.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const userObj = user.toObject();
  userObj.id = userObj._id;
  res.status(200).json({ success: true, user: userObj });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with this email');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    resetToken:
      process.env.NODE_ENV === 'production' ? undefined : resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    organizationName: req.body.organizationName,
    dob: req.body.dob || null,
    gender: req.body.gender,
    city: req.body.city,
    country: req.body.country,
  };

  if (req.body.notificationPreferences) {
    fieldsToUpdate.notificationPreferences =
      typeof req.body.notificationPreferences === 'string'
        ? JSON.parse(req.body.notificationPreferences)
        : req.body.notificationPreferences;
  }

  if (req.file) {
    fieldsToUpdate.avatar = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  const userObj = user.toObject();
  userObj.id = userObj._id;

  res.status(200).json({ success: true, user: userObj });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});