const crypto = require("crypto");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const User = require("../Models/userModal");
const { signSession, signOAuthState, verifyOAuthState } = require("../Auth/tokens");

// Google sign-in: OAuth 2.0 authorization code flow with PKCE (S256), a state
// parameter against CSRF, and an OpenID Connect nonce checked inside the ID token.
const STATE_COOKIE = "rr_oauth";
const COOKIE_PATH = "/api/auth";

function appUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return `${req.protocol}://${req.get("host")}`;
}

function googleEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function client(req) {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${appUrl(req)}/api/auth/google/callback`,
  });
}

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: COOKIE_PATH };
}

const randomToken = () => crypto.randomBytes(24).toString("base64url");

function sameString(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}

function fail(req, res, reason) {
  res.clearCookie(STATE_COOKIE, cookieOptions());
  res.redirect(`${appUrl(req)}/login?oauth_error=${encodeURIComponent(reason)}`);
}

async function uniqueUsername(base) {
  const clean = String(base || "user").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
  let name = clean;
  for (let n = 1; await User.exists({ username: name }); n++) name = `${clean}${n}`;
  return name;
}

// Find the account for a verified Google identity. Match on the stable Google
// subject first, then link an existing account with the same verified email,
// otherwise create a new password-less account.
async function findOrCreateUser(profile) {
  let user = await User.findOne({ googleId: profile.sub });
  if (user) return user;

  const email = profile.email.toLowerCase();
  user = await User.findOne({ email });
  if (user) {
    user.googleId = profile.sub;
    await user.save();
    return user;
  }

  user = new User({
    _id: new mongoose.Types.ObjectId().toString(),
    username: await uniqueUsername(email.split("@")[0]),
    email,
    googleId: profile.sub,
  });
  await user.save();
  return user;
}

exports.providers = (req, res) => {
  res.json({ google: googleEnabled() });
};

exports.start = async (req, res) => {
  if (!googleEnabled()) return res.status(404).json({ error: "Google sign-in is not configured" });

  const oauth = client(req);
  const { codeVerifier, codeChallenge } = await oauth.generateCodeVerifierAsync();
  const state = randomToken();
  const nonce = randomToken();

  res.cookie(STATE_COOKIE, signOAuthState({ state, nonce, codeVerifier }), { ...cookieOptions(), maxAge: 10 * 60 * 1000 });
  res.redirect(
    oauth.generateAuthUrl({
      scope: ["openid", "email", "profile"],
      state,
      nonce,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      prompt: "select_account",
    })
  );
};

exports.callback = async (req, res) => {
  if (!googleEnabled()) return res.status(404).json({ error: "Google sign-in is not configured" });
  if (req.query.error) return fail(req, res, "access_denied");

  let saved;
  try {
    saved = verifyOAuthState(readCookie(req, STATE_COOKIE));
  } catch (err) {
    return fail(req, res, "session_expired");
  }
  if (!sameString(saved.state, req.query.state)) return fail(req, res, "state_mismatch");
  if (!req.query.code) return fail(req, res, "missing_code");

  try {
    const oauth = client(req);
    const { tokens } = await oauth.getToken({ code: req.query.code, codeVerifier: saved.codeVerifier });
    const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const profile = ticket.getPayload();

    if (!sameString(profile.nonce, saved.nonce)) return fail(req, res, "nonce_mismatch");
    if (!profile.email || profile.email_verified !== true) return fail(req, res, "email_not_verified");

    const user = await findOrCreateUser(profile);
    res.clearCookie(STATE_COOKIE, cookieOptions());
    // Token goes in the URL fragment so it never reaches server or proxy logs.
    res.redirect(`${appUrl(req)}/oauth/callback#token=${encodeURIComponent(signSession(user))}`);
  } catch (err) {
    console.error("Google sign-in failed:", err.message);
    return fail(req, res, "google_error");
  }
};
