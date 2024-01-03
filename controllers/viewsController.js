const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1.- Get Tour data from Collection
  const tours = await Tour.find();

  // 2.- Render Template using tour data
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
    )
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1.- Get the data for the requested Tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  if (res.locals.user) {
    const bookings = await Booking.find({
      user: res.locals.user.id,
      tour: tour.id,
    });

    res.locals.isBookedTour = bookings.length > 0;
  }

  // 2.- Render the template using the data
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  if (res.locals.user) {
    return res.redirect('/');
  }
  res.status(200).render('signup', {
    title: 'Signup',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1.- Find all Bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2.- Find tours with the return ids
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .select('-user')
    .populate('tour');
  res.status(200).render('review', {
    title: 'My Reviews',
    reviews,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
