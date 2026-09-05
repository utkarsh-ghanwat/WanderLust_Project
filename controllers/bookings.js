const Booking = require("../models/booking");

module.exports.createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      checkIn,
      checkOut,
      nights,
      totalPrice,
      paymentId,
      orderId,
      paymentStatus,
    } = req.body;

    if (!req.user) {
      if (req.is("application/json")) {
        return res.status(401).json({
          success: false,
          message: "Please login first",
        });
      }

      req.flash("error", "Please login to book a listing!");
      return req.session.save(() => res.redirect("/login"));
    }

    // Prevent overlapping bookings
    const existingBooking = await Booking.findOne({
      listing: id,
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });

    if (existingBooking) {
      if (req.is("application/json")) {
        return res.status(400).json({
          success: false,
          message: "These dates are already booked!",
        });
      }

      req.flash("error", "These dates are already booked!");
      return req.session.save(() => res.redirect(`/listings/${id}`));
    }

    // Save booking
    const booking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      paymentId,
      orderId,
      paymentStatus,
    });

    await booking.save();

    // Razorpay flow
    if (req.is("application/json")) {
      req.flash("success", "Payment successful! Booking confirmed.");

      return req.session.save(() =>
        res.json({
          success: true,
          redirect: `/listings/${id}`,
        })
      );
    }

    // Normal booking flow
    req.flash("success", "Booking created successfully!");
    return req.session.save(() => res.redirect(`/listings/${id}`));

  } catch (err) {
    console.log(err);

    if (req.is("application/json")) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.send(err.message);
  }
};