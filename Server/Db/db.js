const mongoose = require("mongoose");

function connectDb() {
  mongoose.connect(
    "mongodb+srv://meetgandhi:meetgandhi@roomies.1ngsyr0.mongodb.net/roomies?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
  );
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
