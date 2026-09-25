const express = require("express");
const router = express.Router();
const carController = require("../Controllers/carController");
const { requireAdmin } = require("../Middleware/auth");
router.get("/getallcars", carController.getAllcars);
router.post("/addcar", requireAdmin, carController.addCar);
router.put("/editcar", requireAdmin, carController.editCar);
router.post("/deletecar", requireAdmin, carController.deleteCar);
module.exports = router;
