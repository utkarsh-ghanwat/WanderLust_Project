const express = require("express");
const router = express.Router({ mergeParams: true });
const crypto = require("crypto");


const Listing = require("../models/listing");
const bookingController = require("../controllers/bookings");
const razorpay = require("../utils/razorpay");
const { isLoggedIn } = require("../middleware");

// Create booking
router.post("/", bookingController.createBooking);

// Create Razorpay Order
router.post("/create-order", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut } = req.body;

        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({
                error: "Listing not found",
            });
        }

        const nights = Math.ceil(
            (new Date(checkOut) - new Date(checkIn)) /
            (1000 * 60 * 60 * 24)
        );

        if (nights <= 0) {
            return res.status(400).json({
                error: "Invalid booking dates",
            });
        }

        const amount = listing.price * nights;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        res.status(200).json({
            order,
            amount,
            key: process.env.RAZORPAY_KEY_ID,
        });

    } catch (err) {
        console.error("Razorpay Error:", err);
        res.status(500).json({
            error: err.message,
        });
    }
});

router.post("/verify", isLoggedIn, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            checkIn,
            checkOut,
        } = req.body;


        console.log("VERIFY HIT");
        console.log(req.body);

        

        // Verify signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // Calculate booking details
        const listing = await Listing.findById(req.params.id);

        const nights = Math.ceil(
            (new Date(checkOut) - new Date(checkIn)) /
            (1000 * 60 * 60 * 24)
        );

        // Pass data to controller
        req.body.nights = nights;
        req.body.totalPrice = listing.price * nights;
        req.body.paymentId = razorpay_payment_id;
        req.body.orderId = razorpay_order_id;
        req.body.paymentStatus = "Paid";

        return bookingController.createBooking(req, res);

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;