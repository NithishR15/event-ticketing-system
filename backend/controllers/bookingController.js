const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const sendNotification = require('../utils/sendNotification');

const generateTicketId = () => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `EVT-${random}`;
};

exports.createBooking = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.status !== 'approved') {
    res.status(400);
    throw new Error('This event is not open for booking');
  }

  if (new Date() > new Date(event.registrationDeadline)) {
    res.status(400);
    throw new Error('Registration deadline for this event has passed');
  }

  if (event.availableSeats <= 0) {
    res.status(400);
    throw new Error('This event is fully booked. No seats available.');
  }

  const alreadyBooked = await Booking.findOne({
    user: req.user.id,
    event: eventId,
    status: { $ne: 'cancelled' },
  });
  if (alreadyBooked) {
    res.status(400);
    throw new Error('You have already booked a ticket for this event');
  }

  // If a cancelled booking already exists for this user+event, remove it first
  // so a fresh booking can be created (the unique index blocks duplicate inserts otherwise)
  await Booking.deleteOne({
    user: req.user.id,
    event: eventId,
    status: 'cancelled',
  });

  let ticketId;
  let isUnique = false;
  while (!isUnique) {
    ticketId = generateTicketId();
    const exists = await Booking.findOne({ ticketId });
    if (!exists) isUnique = true;
  }

  const verificationToken = uuidv4();
  const qrPayload = JSON.stringify({ ticketId, token: verificationToken });

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  });

  const booking = await Booking.create({
    user: req.user.id,
    event: eventId,
    ticketId,
    verificationToken,
    qrCode: qrCodeDataUrl,
  });

  event.availableSeats -= 1;
  await event.save();

  await sendNotification(req.app.get('io'), req.user.id, {
    title: 'Booking Confirmed',
    message: `Your ticket for "${event.title}" is confirmed. Ticket ID: ${ticketId}`,
    type: 'booking',
    relatedEvent: event._id,
  });

  const populatedBooking = await Booking.findById(booking._id).populate(
    'event',
    'title date time venue banner'
  );

  res.status(201).json({ success: true, booking: populatedBooking });
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('event', 'title date time venue banner status')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(
    'event',
    'title date time venue banner organizer'
  );

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isOwner = booking.user.toString() === req.user.id;
  if (!isOwner && req.user.role === 'student') {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.status(200).json({ success: true, booking });
});

exports.getEventBookings = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOwner = event.organizer.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view registrations for this event');
  }

  const bookings = await Booking.find({ event: req.params.eventId })
    .populate('user', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status === 'checked-in') {
    res.status(400);
    throw new Error('Cannot cancel a booking that has already been checked in');
  }

  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('This booking is already cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  await Event.findByIdAndUpdate(booking.event, { $inc: { availableSeats: 1 } });

  res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
});