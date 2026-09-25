const express = require("express");
const path = require("path");
const app = express();
const dbConnection = require("./Db/db");

var cors = require("cors");
app.use(cors());

app.use(express.json());

// Make sure the (cached) Mongo connection is ready before handling API calls.
app.use(async (req, res, next) => {
  try {
    await dbConnection.connectDb();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.use("/api/cars/", require("./Routes/carsRoutes"));
//refresh error
app.use("/booking/api/cars/", require("./Routes/carsRoutes"));
app.use("/editcar/api/cars/", require("./Routes/carsRoutes"));
app.use("/api/users/", require("./Routes/usersRoutes"));
app.use("/booking/api/bookings/", require("./Routes/bookingsRoute"));
app.use("/api/bookings/", require("./Routes/bookingsRoute"));
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at port: ${port} `);
  });
}

module.exports = app;

