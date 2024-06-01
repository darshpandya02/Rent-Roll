const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51K8lJeSGkXsHpk6s5rnSzxHsShc9bYWdupt7krPVubHYS06G8zhZj2dyA208tSj86k3RKKsHc3meQsdohlq5V7Po004oYO8LpQ"
);
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
    const bookings = await Booking.find().populate("car").populate("user");
    res.send(bookings);
  } catch (error) {
    return res.status(400).json(error);
  }
};
