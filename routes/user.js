const express = require("express");
const router = express.Router();
const config = require("../config/index");
const auth = require("../auth");
const bcrypt = require("bcrypt");

// models
const User = require("../models/User");

// Routes
router.get("/register", (req, res) => {
  return res.render("register", {
    title: "Register"
  });
});

router.post("/login", async (req, res) => {
  if (req.session.captcha !== req.body.captcha) {
    req.flash("error", "Captcha didn't match");
    return res.redirect("/login");
  }
  const username = req.body.username;
  const password = req.body.password;
  if (req.session.user_id) return res.redirect("/");
  try {
    const user = await User.findOne({ username });
    if (user) {
      bcrypt.compare(password, user.password, (err, chk) => {
        if (err) throw err;
        if (chk) {
          req.session.user_id = user._id;
          // req.flash("success", `Welcome ${user.username}`);
          var url = "/";
          if (req.query.redr) {
            url = Buffer.from(req.query.redr, "base64").toString("ascii");
          }
          return res.redirect(url);
        } else {
          req.flash("error", "Password did not match!");
          return res.redirect("/login");
        }
      });
    } else {
      req.flash("Username doest not exist.");
      return res.redirect("/login");
    }
  } catch (err) {
    console.error(err);
    return res.send("Server Error");
  }
});

router.post("/register", async (req, res) => {
  if (req.session.captcha !== req.body.captcha) {
    req.flash("error", "Captcha didn't match");
    console.log(req.session.captcha);
    return res.redirect("/users/register");
  }
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, config.saltRounds);
  try {
    const u = await User.findOne({ username });
    if (u) {
      req.flash("error", "Username already taken.");
      return res.redirect("/users/register");
    }
    const nw = new User({ username, password });
    nw.save(err => {
      if (err) throw err;
      req.flash(
        "success",
        "Your account was successfuly created! Please login."
      );
      return res.redirect("/login");
    });
  } catch (error) {
    res.send("Server error");
    return console.error(error);
  }
});

router.post("/changePassword", auth.isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    if (user) {
      bcrypt.compare(req.body.cpass, user.password, async (err, chk) => {
        if (err) throw err;
        if (chk) {
          user.password = bcrypt.hashSync(req.body.npass, config.saltRounds);
          await user.save();
          res.send({ changed: true });
        } else {
          res.send({ error: "Current Password did not match!", cpe: true });
        }
      });
    } else {
      throw "User not found";
    }
  } catch (err) {
    res.send("SERVER ERROR");
    console.error(err);
  }
});

router.get("/current", auth.isLoggedIn, async (req, res) => {
  User.findById(req.session.user_id)
    .then(user => {
      return res.send(user);
    })
    .catch(err => {
      res.send("Server Error");
      return console.error(err);
    });
});

router.get("/logout", auth.isLoggedIn, (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

User.countDocuments({ type: "admin" })
  .then(count => {
    if (count === 0) {
      const pw = "123n12-c=2213oomx";
      const u = new User({
        username: "admin",
        password: bcrypt.hashSync(pw, config.saltRounds),
        type: "admin"
      });
      u.save(err => {
        if (err) return console.error(err);
        console.log(`Admin was created username:admin & password:${pw}`);
      });
    }
  })
  .catch(err => {
    if (err) console.error(err);
  });

module.exports = router;
