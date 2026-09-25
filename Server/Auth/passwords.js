const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const ROUNDS = 10;
const MIN_LENGTH = 8;

function isHash(stored) {
  return typeof stored === "string" && /^\$2[aby]\$\d{2}\$/.test(stored);
}

function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

function validPassword(plain) {
  return typeof plain === "string" && plain.length >= MIN_LENGTH && plain.length <= 72;
}

// Returns { ok, needsUpgrade }. Accounts created before hashing was added still
// hold plaintext; they are accepted once and re-hashed by the caller.
async function checkPassword(plain, stored) {
  if (typeof plain !== "string" || !stored) return { ok: false, needsUpgrade: false };
  if (isHash(stored)) {
    return { ok: await bcrypt.compare(plain, stored), needsUpgrade: false };
  }
  const a = Buffer.from(plain);
  const b = Buffer.from(String(stored));
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { ok, needsUpgrade: ok };
}

module.exports = { hashPassword, checkPassword, validPassword, isHash, MIN_LENGTH };
