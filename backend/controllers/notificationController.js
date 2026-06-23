const NotificationModel = require('../models/NotificationModel');
const { respondData, respondMessage, respondNotFound } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const notifications = await NotificationModel.findByUserId(req.user.user_id);
    respondData(res, notifications);
  } catch (error) {
    next(error);
  }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const count = await NotificationModel.findUnreadCount(req.user.user_id);
    respondData(res, { count });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const ok = await NotificationModel.markAsRead(req.params.id, req.user.user_id);
    if (!ok) return respondNotFound(res, 'Notification introuvable');
    respondMessage(res, 'Notification marquée comme lue');
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await NotificationModel.markAllAsRead(req.user.user_id);
    respondMessage(res, 'Toutes les notifications ont été marquées comme lues');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const ok = await NotificationModel.delete(req.params.id, req.user.user_id);
    if (!ok) return respondNotFound(res, 'Notification introuvable');
    respondMessage(res, 'Notification supprimée');
  } catch (error) {
    next(error);
  }
};
