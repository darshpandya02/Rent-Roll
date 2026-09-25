const { v4: uuidv4 } = require("uuid");
// Payments are mocked below; Stripe is only initialised when a key is provided.
const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;
const Booking = require("../Models/bookingModel");
const Car = require("../Models/carModel");
exports.bookCar = async (req, res) => {
  const { token } = req.body;
  try {
    const fakePaymentResponse = {
      id: uuidv4(),
      source: { id: "fake_card_id" }, // Mocked card ID
    };

    const payment = fakePaymentResponse;

    if (payment) {
      // The booking always belongs to the signed-in user, whatever the client sent.
      req.body.user = req.user.id;
      req.body.transactionId = payment.source.id;
      req.body.token = payment.id;

      const newBooking = new Booking(req.body);
      await newBooking.save();
      const mongoose = require('mongoose');
      const car = await Car.findOne({ _id: req.body.car });
      if (car) {
        car.bookedTimeSlots.push(req.body.bookedTimeSlots);
        await car.save();
      } else {
        return res.status(404).json({ error: "Car not found" });
      }

      res.send("Your booking is successful");
    } else {
      return res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.getAllBookings = async (req, res) => {
  try {
    // Admins see every booking; everyone else sees only their own.
    const filter = req.user.admin ? {} : { user: req.user.id };
    const bookings = await Booking.find(filter).populate("car").populate("user", "username email");
    res.send(bookings);
  } catch (error) {
    return res.status(400).json(error);
  }
};
