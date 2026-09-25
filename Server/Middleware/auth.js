const { verifySession } = require("../Auth/tokens");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const claims = verifySession(token);
    req.user = { id: claims.sub, username: claims.username, admin: Boolean(claims.admin) };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.admin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
