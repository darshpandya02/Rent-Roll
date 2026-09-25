const express = require("express");
const router = express.Router();
const bookingController = require("../Controllers/bookingController");
const { requireAuth } = require("../Middleware/auth");
router.post("/bookcar", requireAuth, bookingController.bookCar);
router.get("/getallbookings", requireAuth, bookingController.getAllBookings);
module.exports = router;
