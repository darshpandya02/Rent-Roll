const mongoose = require("mongoose");
const User = require("../Models/userModal");
const { hashPassword, checkPassword, validPassword, MIN_LENGTH } = require("../Auth/passwords");
const { publicUser, signSession } = require("../Auth/tokens");

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byUsername = (username) => ({ username: { $regex: new RegExp(`^${escapeRegex(username)}$`, "i") } });
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.7f1hbGKcqvSOtGkQdoA7cKqN7a3e";
const normEmail = (email) => String(email || "").trim().toLowerCase();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: normEmail(email) }).select("+password");
    // Compare against a dummy hash for unknown emails so response time does not reveal which accounts exist.
    const { ok, needsUpgrade } = await checkPassword(password, user ? user.password : DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (needsUpgrade) {
      user.password = await hashPassword(password);
      await user.save();
    }
    res.json({ token: signSession(user), user: publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }
    if (!validPassword(password)) {
      return res.status(400).json({ error: `Password must be ${MIN_LENGTH} to 72 characters` });
    }
    const taken = await User.findOne({ $or: [{ email: normEmail(email) }, byUsername(username)] });
    if (taken) {
      return res.status(409).json({ error: "An account with that email or username already exists" });
    }

    const newuser = new User({
      _id: new mongoose.Types.ObjectId().toString(),
      username,
      email: normEmail(email),
      phone,
      password: await hashPassword(password),
      admin: false,
      subscriber: false,
    });
    await newuser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    return res.status(400).json({ error: "Registration failed" });
  }
};

// Users may only read or edit their own profile; admins may read or edit any.
function canAccess(req, user) {
  return req.user.admin || String(user._id) === String(req.user.id);
}

exports.updateDetails = async (req, res) => {
  try {
    const user = await User.findOne(byUsername(req.params.username));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canAccess(req, user)) {
      return res.status(403).json({ error: "You can only edit your own profile" });
    }

    const { email, password, phone } = req.body;
    if (email) user.email = normEmail(email);
    if (phone !== undefined) user.phone = phone;
    if (password) {
      if (!validPassword(password)) {
        return res.status(400).json({ error: `Password must be ${MIN_LENGTH} to 72 characters` });
      }
      user.password = await hashPassword(password);
    }
    await user.save();
    res.json(publicUser(user));
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const user = await User.findOne(byUsername(req.params.username));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canAccess(req, user)) {
      return res.status(403).json({ error: "You can only view your own profile" });
    }
    res.json(publicUser(user));
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: "Account no longer exists" });
  res.json(publicUser(user));
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users.map(publicUser));
  } catch (error) {
    return res.status(400).json(error);
  }
};
