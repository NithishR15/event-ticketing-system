const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Category = require('../models/Category');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalStudents, totalOrganizers, totalEvents,
    pendingEvents, approvedEvents, totalBookings, totalCategories,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'organizer' }),
    Event.countDocuments(),
    Event.countDocuments({ status: 'pending' }),
    Event.countDocuments({ status: 'approved' }),
    Booking.countDocuments({ status: { $ne: 'cancelled' } }),
    Category.countDocuments(),
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRegistrations = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const eventsByCategory = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', count: 1, _id: 0 } },
  ]);

  res.status(200).json({
    success: true,
    stats: { totalUsers, totalStudents, totalOrganizers, totalEvents, pendingEvents, approvedEvents, totalBookings, totalCategories },
    monthlyRegistrations,
    eventsByCategory,
  });
});

exports.getPendingOrganizers = asyncHandler(async (req, res) => {
  const organizers = await User.find({ role: 'organizer', isApprovedOrganizer: false }).sort('-createdAt');
  res.status(200).json({ success: true, count: organizers.length, organizers });
});

exports.getPendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'pending' })
    .populate('category', 'name')
    .populate('organizer', 'name organizationName email')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: events.length, events });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title date venue')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(),
  ]);

  res.status(200).json({ success: true, count: bookings.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), bookings });
});