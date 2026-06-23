const NotificationModel = require('../models/NotificationModel');
const { getIO } = require('../config/socket');

async function createNotification(userId, titre, message, type = 'info') {
  const notification = await NotificationModel.create({ user_id: userId, titre, message, type });

  try {
    const io = getIO();
    io.to(`user_${userId}`).emit('notification', notification);
  } catch {
    // Socket.IO pas encore initialisé
  }

  return notification;
}

module.exports = { createNotification };
