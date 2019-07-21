const express = require("express");
const router = express.Router();
const auth = require("../auth");
const svgCaptcha = require("svg-captcha");

// models
const User = require("../models/User");

router.get("/", auth.isLoggedIn, async (req, res) => {
  return res.render("index", {
    user: await User.findById(req.session.user_id)
  });
});

router.get("/login", (req, res) => {
  if (req.session.user_id) return res.redirect("/");
  return res.render("login", {
    title: "Login!",
    redr: req.query.redr || null
  });
});

router.get("/register", (req, res) => {
  return res.redirect("/users/register");
});

// generating captchas
router.get("/captcha", function(req, res) {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type("svg");
  res.status(200).send(captcha.data);
});

module.exports = router;
