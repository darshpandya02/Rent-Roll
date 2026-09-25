const jwt = require("jsonwebtoken");

// Session tokens are short-lived HS256 JWTs. JWT_SECRET must be set in production;
// local development and tests fall back to a fixed secret so the app still boots.
const DEV_SECRET = "rent-roll-dev-secret-change-me";
const SESSION_TTL = process.env.JWT_TTL || "2h";

function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set");
  }
  return DEV_SECRET;
}

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    admin: Boolean(user.admin),
    subscriber: Boolean(user.subscriber),
    authProvider: user.googleId ? "google" : "password",
  };
}

function signSession(user) {
  return jwt.sign(
    { username: user.username, admin: Boolean(user.admin) },
    secret(),
    { algorithm: "HS256", expiresIn: SESSION_TTL, subject: String(user._id), issuer: "rent-roll" }
  );
}

function verifySession(token) {
  return jwt.verify(token, secret(), { algorithms: ["HS256"], issuer: "rent-roll" });
}

// Short-lived token carrying the OAuth state, nonce and PKCE verifier between
// the redirect to Google and the callback. Kept in an httpOnly cookie so no
// server-side session store is needed on serverless.
function signOAuthState(payload) {
  return jwt.sign(payload, secret(), { algorithm: "HS256", expiresIn: "10m", audience: "rent-roll-oauth" });
}

function verifyOAuthState(token) {
  return jwt.verify(token, secret(), { algorithms: ["HS256"], audience: "rent-roll-oauth" });
}

module.exports = { publicUser, signSession, verifySession, signOAuthState, verifyOAuthState };
