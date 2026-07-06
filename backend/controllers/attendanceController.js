const asyncHandler = require('express-async-handler');
const { Parser } = require('json2csv');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

exports.getEventAttendance = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOwner = event.organizer.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view attendance for this event');
  }

  const attendance = await Attendance.find({ event: req.params.eventId })
    .populate('user', 'name email phone')
    .sort('-checkInTime');

  res.status(200).json({
    success: true,
    count: attendance.length,
    totalRegistered: event.maxParticipants - event.availableSeats,
    attendance,
  });
});

exports.exportAttendanceCSV = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOwner = event.organizer.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to export attendance for this event');
  }

  const attendance = await Attendance.find({ event: req.params.eventId })
    .populate('user', 'name email phone')
    .sort('checkInTime');

  const rows = attendance.map((a) => ({
    Name: a.user.name,
    Email: a.user.email,
    Phone: a.user.phone || '-',
    'Check-In Time': new Date(a.checkInTime).toLocaleString(),
  }));

  const parser = new Parser({ fields: ['Name', 'Email', 'Phone', 'Check-In Time'] });
  const csv = parser.parse(rows);

  res.header('Content-Type', 'text/csv');
  res.attachment(`${event.title.replace(/\s+/g, '_')}_attendance.csv`);
  res.send(csv);
});