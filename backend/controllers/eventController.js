const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const sendNotification = require('../utils/sendNotification');
const User = require('../models/User');

exports.getEvents = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 9, sort = '-createdAt' } = req.query;
  const query = {};
  query.status = status || 'approved';
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('category', 'name')
      .populate('organizer', 'name organizationName')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Event.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: events.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    events,
  });
});

exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('category', 'name')
    .populate('organizer', 'name organizationName email');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  res.status(200).json({ success: true, event });
});

exports.createEvent = asyncHandler(async (req, res) => {
  if (!req.user.isApprovedOrganizer) {
    res.status(403);
    throw new Error('Your organizer account is pending admin approval. You cannot create events yet.');
  }

  const {
    title, description, category, venue, date, time,
    registrationDeadline, maxParticipants, rules, contactEmail, contactPhone,
  } = req.body;

  const event = await Event.create({
    title, description, category, venue, date, time,
    registrationDeadline, maxParticipants,
    availableSeats: maxParticipants,
    organizer: req.user.id,
    rules: rules ? (Array.isArray(rules) ? rules : rules.split(',').map((r) => r.trim())) : [],
    contactEmail, contactPhone,
    banner: req.file ? `/uploads/${req.file.filename}` : '',
    status: 'pending',
  });

  const admins = await User.find({ role: 'admin' });
  const io = req.app.get('io');
  await Promise.all(
    admins.map((admin) =>
      sendNotification(io, admin._id, {
        title: 'New Event Pending Approval',
        message: `"${event.title}" was submitted by an organizer and needs your approval.`,
        type: 'event-update',
        relatedEvent: event._id,
      })
    )
  );

  res.status(201).json({ success: true, event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOwner = event.organizer.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }

  const updates = { ...req.body };
  if (isOwner && req.user.role !== 'admin') {
    updates.status = 'pending';
  }
  if (req.file) {
    updates.banner = `/uploads/${req.file.filename}`;
  }
  if (updates.maxParticipants) {
    const bookedCount = await Booking.countDocuments({
      event: event._id,
      status: { $ne: 'cancelled' },
    });
    updates.availableSeats = Math.max(0, Number(updates.maxParticipants) - bookedCount);
  }

  event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, event });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOwner = event.organizer.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }

  await event.deleteOne();
  await Booking.deleteMany({ event: event._id });
  res.status(200).json({ success: true, message: 'Event deleted successfully' });
});

exports.getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user.id })
    .populate('category', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: events.length, events });
});

exports.setEventApproval = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be either approved or rejected');
  }

  const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  await sendNotification(req.app.get('io'), event.organizer, {
    title: `Event ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Your event "${event.title}" has been ${status} by the admin.`,
    type: 'event-update',
    relatedEvent: event._id,
  });

  res.status(200).json({ success: true, event });
});