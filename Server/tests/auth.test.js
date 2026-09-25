const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { OAuth2Client } = require("google-auth-library");

let mongo, app, mongoose, User, Car, Booking;

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("rentroll-test");
  process.env.GOOGLE_CLIENT_ID = "test-client.apps.googleusercontent.com";
  process.env.GOOGLE_CLIENT_SECRET = "test-secret";
  process.env.APP_URL = "http://localhost:3000";
  app = require("../server");
  mongoose = require("../Db/db");
  await mongoose.connectDb();
  User = require("../Models/userModal");
  Car = require("../Models/carModel");
  Booking = require("../Models/bookingModel");
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Car.deleteMany({}), Booking.deleteMany({})]);
});

const oid = () => new mongoose.Types.ObjectId().toString();

async function register(username, email, password = "correct-horse") {
  await request(app).post("/api/users/register").send({ username, email, password, phone: "123456789012" }).expect(201);
}

async function login(email, password = "correct-horse") {
  const res = await request(app).post("/api/users/login").send({ email, password }).expect(200);
  return res.body.token;
}

async function makeAdmin(email) {
  await User.updateOne({ email }, { admin: true });
  return login(email);
}

test("register stores a bcrypt hash and login never returns it", async () => {
  await register("alice", "Alice@Example.com");
  const stored = await User.findOne({ email: "alice@example.com" }).select("+password").lean();
  assert.match(stored.password, /^\$2[aby]\$10\$/);

  const res = await request(app).post("/api/users/login").send({ email: "alice@example.com", password: "correct-horse" }).expect(200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.username, "alice");
  assert.equal(res.body.user.password, undefined);
});

test("wrong password and unknown email both get the same 401", async () => {
  await register("alice", "alice@example.com");
  const a = await request(app).post("/api/users/login").send({ email: "alice@example.com", password: "nope-nope" });
  const b = await request(app).post("/api/users/login").send({ email: "ghost@example.com", password: "nope-nope" });
  assert.equal(a.status, 401);
  assert.equal(b.status, 401);
  assert.deepEqual(a.body, b.body);
});

test("duplicate email and short passwords are rejected", async () => {
  await register("alice", "alice@example.com");
  await request(app).post("/api/users/register").send({ username: "al2", email: "ALICE@example.com", password: "long-enough" }).expect(409);
  await request(app).post("/api/users/register").send({ username: "bob", email: "bob@example.com", password: "short" }).expect(400);
});

test("a legacy plaintext account logs in once and is upgraded to a hash", async () => {
  await User.collection.insertOne({ _id: oid(), username: "legacy", email: "legacy@example.com", password: "demo1234" });
  await login("legacy@example.com", "demo1234");
  const stored = await User.findOne({ email: "legacy@example.com" }).select("+password").lean();
  assert.match(stored.password, /^\$2[aby]\$/);
  await login("legacy@example.com", "demo1234");
});

test("user listing requires an admin and hides credentials", async () => {
  await register("alice", "alice@example.com");
  await register("root", "root@example.com");
  const userToken = await login("alice@example.com");
  const adminToken = await makeAdmin("root@example.com");

  await request(app).get("/api/users/getallusers").expect(401);
  await request(app).get("/api/users/getallusers").set("Authorization", `Bearer ${userToken}`).expect(403);
  await request(app).get("/api/users/getallusers").set("Authorization", "Bearer not-a-jwt").expect(401);
  const res = await request(app).get("/api/users/getallusers").set("Authorization", `Bearer ${adminToken}`).expect(200);
  assert.equal(res.body.length, 2);
  for (const u of res.body) assert.equal(u.password, undefined);
});

test("users can read and edit only their own profile", async () => {
  await register("alice", "alice@example.com");
  await register("bob", "bob@example.com");
  const alice = await login("alice@example.com");

  await request(app).get("/api/users/profile/alice").set("Authorization", `Bearer ${alice}`).expect(200);
  await request(app).get("/api/users/profile/bob").set("Authorization", `Bearer ${alice}`).expect(403);
  await request(app).put("/api/users/profile/bob").set("Authorization", `Bearer ${alice}`).send({ phone: "0" }).expect(403);
  await request(app).get("/api/users/profile/.*").set("Authorization", `Bearer ${alice}`).expect(404);

  await request(app).put("/api/users/profile/alice").set("Authorization", `Bearer ${alice}`).send({ password: "brand-new-pass" }).expect(200);
  await login("alice@example.com", "brand-new-pass");
});

test("only admins can change the car fleet", async () => {
  await register("alice", "alice@example.com");
  await register("root", "root@example.com");
  const user = await login("alice@example.com");
  const admin = await makeAdmin("root@example.com");
  const car = { name: "Civic", image: "x.png", capacity: 4, fuelType: "Petrol", rentPerHour: 20 };

  await request(app).post("/api/cars/addcar").send(car).expect(401);
  await request(app).post("/api/cars/addcar").set("Authorization", `Bearer ${user}`).send(car).expect(403);
  await request(app).post("/api/cars/addcar").set("Authorization", `Bearer ${admin}`).send(car).expect(200);
  await request(app).get("/api/cars/getallcars").expect(200);
});

test("bookings belong to the token holder and users only see their own", async () => {
  await register("alice", "alice@example.com");
  await register("bob", "bob@example.com");
  await register("root", "root@example.com");
  const alice = await login("alice@example.com");
  const bob = await login("bob@example.com");
  const admin = await makeAdmin("root@example.com");
  const bobUser = await User.findOne({ email: "bob@example.com" });
  const carId = oid();
  await Car.create({ _id: carId, name: "Civic", image: "x.png", capacity: 4, fuelType: "Petrol", rentPerHour: 20 });

  // Alice tries to book in Bob's name; the server ignores the client-supplied user.
  const slot = { from: "2026-10-01 10:00", to: "2026-10-01 12:00" };
  await request(app).post("/api/bookings/bookcar").send({ car: carId, bookedTimeSlots: slot }).expect(401);
  await request(app).post("/api/bookings/bookcar").set("Authorization", `Bearer ${alice}`)
    .send({ car: carId, user: bobUser._id, bookedTimeSlots: slot, totalMins: 120, totalAmount: 40 }).expect(200);

  const mine = await request(app).get("/api/bookings/getallbookings").set("Authorization", `Bearer ${alice}`).expect(200);
  const theirs = await request(app).get("/api/bookings/getallbookings").set("Authorization", `Bearer ${bob}`).expect(200);
  const all = await request(app).get("/api/bookings/getallbookings").set("Authorization", `Bearer ${admin}`).expect(200);
  assert.equal(mine.body.length, 1);
  assert.equal(theirs.body.length, 0);
  assert.equal(all.body.length, 1);
  assert.equal(mine.body[0].user.password, undefined);
});

// ---- Google OAuth 2.0 / OpenID Connect ----

function cookieFrom(res) {
  return res.headers["set-cookie"].find((c) => c.startsWith("rr_oauth=")).split(";")[0];
}

async function startGoogle() {
  const res = await request(app).get("/api/auth/google").expect(302);
  const url = new URL(res.headers.location);
  return { url, cookie: cookieFrom(res) };
}

function stubGoogle(t, claims, capture = {}) {
  t.mock.method(OAuth2Client.prototype, "getToken", async (opts) => {
    capture.codeVerifier = opts.codeVerifier;
    return { tokens: { id_token: "signed.id.token" } };
  });
  t.mock.method(OAuth2Client.prototype, "verifyIdToken", async (opts) => {
    capture.audience = opts.audience;
    return { getPayload: () => claims };
  });
}

test("google start redirects with PKCE S256, state and nonce", async () => {
  const { url, cookie } = await startGoogle();
  assert.equal(url.host, "accounts.google.com");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.ok(url.searchParams.get("code_challenge"));
  assert.ok(url.searchParams.get("state"));
  assert.ok(url.searchParams.get("nonce"));
  assert.equal(url.searchParams.get("redirect_uri"), "http://localhost:3000/api/auth/google/callback");
  assert.match(url.searchParams.get("scope"), /openid/);
  assert.ok(cookie);
});

test("google callback creates an account, verifies the ID token, and returns a session", async (t) => {
  const { url, cookie } = await startGoogle();
  const capture = {};
  stubGoogle(t, { sub: "g-123", email: "Carol@Gmail.com", email_verified: true, nonce: url.searchParams.get("nonce") }, capture);

  const res = await request(app).get("/api/auth/google/callback")
    .query({ code: "auth-code", state: url.searchParams.get("state") }).set("Cookie", cookie).expect(302);
  const loc = new URL(res.headers.location);
  assert.equal(loc.pathname, "/oauth/callback");
  const token = decodeURIComponent(loc.hash.replace("#token=", ""));

  assert.ok(capture.codeVerifier, "PKCE verifier sent on token exchange");
  assert.equal(capture.audience, process.env.GOOGLE_CLIENT_ID);

  const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(me.body.email, "carol@gmail.com");
  assert.equal(me.body.username, "carol");
  assert.equal(me.body.authProvider, "google");
  assert.equal(await User.countDocuments({ googleId: "g-123" }), 1);
});

test("google sign-in links an existing account with the same verified email", async (t) => {
  await register("dave", "dave@example.com");
  const { url, cookie } = await startGoogle();
  stubGoogle(t, { sub: "g-dave", email: "dave@example.com", email_verified: true, nonce: url.searchParams.get("nonce") });
  await request(app).get("/api/auth/google/callback")
    .query({ code: "c", state: url.searchParams.get("state") }).set("Cookie", cookie).expect(302);
  assert.equal(await User.countDocuments({}), 1);
  assert.equal((await User.findOne({ email: "dave@example.com" })).googleId, "g-dave");
  await login("dave@example.com");
});

test("google callback rejects bad state, missing cookie, bad nonce and unverified email", async (t) => {
  const reason = (res) => new URL(res.headers.location).searchParams.get("oauth_error");

  let { url, cookie } = await startGoogle();
  let res = await request(app).get("/api/auth/google/callback").query({ code: "c", state: "forged" }).set("Cookie", cookie);
  assert.equal(reason(res), "state_mismatch");

  res = await request(app).get("/api/auth/google/callback").query({ code: "c", state: url.searchParams.get("state") });
  assert.equal(reason(res), "session_expired");

  ({ url, cookie } = await startGoogle());
  stubGoogle(t, { sub: "g-x", email: "x@example.com", email_verified: true, nonce: "replayed" });
  res = await request(app).get("/api/auth/google/callback").query({ code: "c", state: url.searchParams.get("state") }).set("Cookie", cookie);
  assert.equal(reason(res), "nonce_mismatch");
  t.mock.restoreAll();

  ({ url, cookie } = await startGoogle());
  stubGoogle(t, { sub: "g-y", email: "y@example.com", email_verified: false, nonce: url.searchParams.get("nonce") });
  res = await request(app).get("/api/auth/google/callback").query({ code: "c", state: url.searchParams.get("state") }).set("Cookie", cookie);
  assert.equal(reason(res), "email_not_verified");

  assert.equal(await User.countDocuments({}), 0);
});

test("providers endpoint reports whether Google sign-in is configured", async () => {
  const res = await request(app).get("/api/auth/providers").expect(200);
  assert.deepEqual(res.body, { google: true });
});
