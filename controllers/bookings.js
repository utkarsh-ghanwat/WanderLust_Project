const Booking = require("../models/booking");

module.exports.createBooking = async (req, res) => {
  try {
    console.log("User:", req.user); 

    const { id } = req.params;
    const { checkIn, checkOut, nights, totalPrice } = req.body;

    if (!req.user) {
      req.flash("error", "Please login to book a listing!");
      return res.redirect("/login");
    }

    const existingBooking = await Booking.findOne({
      listing: id,
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });

    if (existingBooking) {
      req.flash("error", "These dates are already booked!");
      return res.redirect(`/listings/${id}`);
    }

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn,
      checkOut,
      nights,
      totalPrice,
    });

    await booking.save();
    console.log("Saved:", booking);

    req.flash("success", "Booking created successfully!");
    return res.redirect(`/listings/${id}`);

  } catch (err) {
    console.log(err);
    return res.send(err.message);
  }
};