const Notification = require('../models/Notification');

const sendNotification = async (io, userId, data) => {
  const notification = await Notification.create({
    user: userId,
    title: data.title,
    message: data.message,
    type: data.type,
    relatedEvent: data.relatedEvent || null,
  });

  if (io && userId) {
    io.to(userId.toString()).emit('notification', notification);
  }

  return notification;
};

module.exports = sendNotification;