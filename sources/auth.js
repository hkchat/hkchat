const C = {};
C.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user_id) return next();
  var redr = Buffer.from(
    req.protocol + "://" + req.get("host") + req.originalUrl
  ).toString("base64");
  res.redirect("/login?redr=" + redr);
};
module.exports = C;
