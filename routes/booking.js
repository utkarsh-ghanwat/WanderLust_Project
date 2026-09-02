const express = require("express");
const router = express.Router({ mergeParams: true });
const bookingController = require("../controllers/bookings");


const { isLoggedIn } = require("../middleware");


router.post("/", bookingController.createBooking);

module.exports = router;