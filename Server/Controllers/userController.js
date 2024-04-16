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
      subscriber: false,
    });
    await newuser.save();
    res.send("User registered successfully");
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const username = req.params.username;
    const { email, password, phone } = req.body;
    const updatedUser = await User.findOneAndUpdate({ username }, { email, password, phone }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

exports.getDetails = async (req, res) => {
  try {
    const username = req.params.username;
    
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    
    const users = await User.find();
    res.send(users);
  } catch (error) {
    return res.status(400).json(error);
  }
};


