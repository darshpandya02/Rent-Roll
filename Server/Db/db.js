const mongoose = require("mongoose");

function connectDb() {
  mongoose.connect("MONGODB_URI_REMOVED", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const connection = mongoose.connection;
  connection.on("connected", () => {
    console.log("connection successfull");
  });
  connection.on("error", () => {
    console.log("connection failed");
  });
}

connectDb();
module.exports = mongoose;
