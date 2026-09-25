const mongoose = require("mongoose");

// Connection string comes from the environment (set MONGODB_URI in Vercel / .env).
// The promise is cached on `global` so warm serverless invocations reuse one connection.
const uri = process.env.MONGODB_URI || process.env.DB_CONNECTION_STRING;

function connectDb() {
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  if (!global._rentRollMongo) {
    global._rentRollMongo = mongoose
      .connect(uri, { useUnifiedTopology: true, useNewUrlParser: true })
      .then((m) => {
        console.log("connection successfull");
        return m;
      })
      .catch((err) => {
        console.log("connection failed", err.message);
        global._rentRollMongo = null;
        throw err;
      });
  }
  return global._rentRollMongo;
}

connectDb().catch(() => {});
mongoose.connectDb = connectDb;
module.exports = mongoose;
