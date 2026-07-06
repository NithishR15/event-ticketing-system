const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');

exports.scanTicket = asyncHandler(async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    res.status(400);
    throw new Error('No QR data provided');
  }

  let parsed;
  try {
    parsed = JSON.parse(qrData);
  } catch (err) {
    return res.status(400).json({
      success: false,
      result: 'invalid',
      message: 'Invalid or unreadable QR code',
    });
  }

  const { ticketId, token } = parsed;

  const booking = await Booking.findOne({ ticketId })
    .populate('event', 'title date time venue organizer')
    .populate('user', 'name email');

  if (!booking || booking.verificationToken !== token) {
    return res.status(404).json({
      success: false,
      result: 'invalid',
      message: 'Ticket not found or QR code is invalid',
    });
  }

  const isOwner = booking.event.organizer.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      result: 'unauthorized',
      message: 'You are not authorized to scan tickets for this event',
    });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      result: 'cancelled',
      message: 'This ticket was cancelled and is not valid for entry',
    });
  }

  if (booking.status === 'checked-in') {
    return res.status(200).json({
      success: false,
      result: 'already-used',
      message: 'Already Checked-In',
      checkedInAt: booking.checkedInAt,
      attendee: booking.user,
    });
  }

  booking.status = 'checked-in';
  booking.checkedInAt = new Date();
  await booking.save();

  await Attendance.create({
    booking: booking._id,
    event: booking.event._id,
    user: booking.user._id,
    scannedBy: req.user.id,
    checkInTime: booking.checkedInAt,
  });

  res.status(200).json({
    success: true,
    result: 'valid',
    message: 'Check-in successful',
    attendee: booking.user,
    event: booking.event,
    checkedInAt: booking.checkedInAt,
  });
});