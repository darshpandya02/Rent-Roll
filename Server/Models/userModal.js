const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true },
  // bcrypt hash. Not required for accounts created through Google sign-in,
  // and never returned by queries unless explicitly selected.
  password: {
    type: String,
    select: false,
    required: function () {
      return !this.googleId;
    },
  },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String },
  googleId: { type: String, index: { unique: true, sparse: true } },
  admin: {
    type: Boolean,
    default: false,
  },
  subscriber: {
    type: Boolean,
    default: false,
  },
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.googleId;
    return ret;
  },
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
