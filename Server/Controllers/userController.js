const User = require("../Models/userModal");
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.send(user);
    } else {
      return res.status(400).json(error);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};
exports.register = async (req, res) => {
  try {
    const mongoose = require('mongoose');

const generateObjectId = () => {
  return mongoose.Types.ObjectId().toString();
};

const id = generateObjectId();

    const newuser = new User({
      ...req.body,
      _id: id,
    });
    await newuser.save();
    res.send("User registered successfully");
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    return res.status(400).json(error);
  }
};
