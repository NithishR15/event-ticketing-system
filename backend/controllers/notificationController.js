const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  res.status(200).json({ success: true, count: notifications.length, unreadCount, notifications });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  if (notification.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, notification });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  if (notification.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }
  await notification.deleteOne();
  res.status(200).json({ success: true, message: 'Notification deleted' });
});