const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const recalculateEventRating = async (eventId) => {
  const stats = await Review.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);

  await Event.findByIdAndUpdate(eventId, {
    avgRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
  });
};

exports.createReview = asyncHandler(async (req, res) => {
  const { eventId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const booking = await Booking.findOne({
    user: req.user.id,
    event: eventId,
    status: { $in: ['confirmed', 'checked-in'] },
  });

  if (!booking) {
    res.status(403);
    throw new Error('You can only review events you have booked');
  }

  const existingReview = await Review.findOne({ user: req.user.id, event: eventId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this event');
  }

  const review = await Review.create({ user: req.user.id, event: eventId, rating, comment });
  await recalculateEventRating(eventId);

  res.status(201).json({ success: true, review });
});

exports.getEventReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ event: req.params.eventId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reviews.length, reviews });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }
  const { rating, comment } = req.body;
  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();
  await recalculateEventRating(review.event);
  res.status(200).json({ success: true, review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }
  const eventId = review.event;
  await review.deleteOne();
  await recalculateEventRating(eventId);
  res.status(200).json({ success: true, message: 'Review deleted' });
});