const express = require("express");
const router = express.Router();
const config = require("../config/index");
const auth = require("../auth");

// models
const User = require("../models/User");
const Channel = require("../models/Channel");

router.get("/all", auth.isLoggedIn, async (req, res) => {
  try {
    const channels = await Channel.find().lean();
    res.send(channels);
  } catch (err) {
    res.send("SERVER ERROR");
    console.error(err);
  }
});

router.post("/create", auth.isLoggedIn, async (req, res) => {
  if (req.session.captcha !== req.body.captcha) {
    return res.send({ error: "Captcha error", captchaError: true });
  }
  const ch = new Channel({
    name: req.body.name,
    deleteTime: req.body.deleteTime,
    creator_id: req.session.user_id,
    members: [req.session.user_id]
  });
  ch.save(err => {
    if (err) {
      res.send("SERVER ERROR");
      return console.error(err);
    }
    res.send(ch);
  });
});

router.post("/:id", auth.isLoggedIn, async (req, res) => {
  const ch = await Channel.findById(req.params.id);
  const user = await User.findById(req.session.user_id);
  if (ch.creator_id === user._id || user.type === "admin") {
    ch.name = req.body.name;
    ch.deleteTime = req.body.deleteTime;
    ch.save(err => {
      if (err) {
        console.error(err);
        return res.send("SERVER ERROR");
      }
      res.send({ updated: true });
    });
  } else {
    res.send({
      error: "You can not edit this channel.",
      f1: ch.creator_id === user._id,
      ut: user.type
    });
  }
});

router.delete("/:id", auth.isLoggedIn, async (req, res) => {
  try {
    const ch = await Channel.findById(req.params.id);
    const user = await User.findById(req.session.user_id);
    if (ch.creator_id === user._id || user.type === "admin") {
      await ch.remove();
      return res.send({ deleted: true });
    } else {
      return res.send({
        error: "You don't have right to delete it.",
        cidto: String(ch.creator_id)
      });
    }
  } catch (err) {
    console.error(err);
    return res.send("SERVER ERROR");
  }
  // return;
  // Channel.findById(req.params.id)
  //   .then(channel => {
  //     if (String(channel.creator_id) !== req.session.user_id) {
  //       return res.send({
  //         error: "You don't have right to delete it.",
  //         cidto: String(channel.creator_id)
  //       });
  //     }
  //     channel.remove(err => {
  //       if (err) {
  //         console.error(err);
  //         return res.send("Server Error");
  //       }
  //       return res.send({ deleted: true });
  //     });
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     return res.send("Server Error");
  //   });
});

router.post("/:id/join", auth.isLoggedIn, async (req, res) => {
  Channel.findById(req.params.id)
    .then(channel => {
      if (!channel.members.includes(req.session.user_id)) {
        channel.members.push(req.session.user_id);
      }
      channel.save(err => {
        if (err) {
          console.error(err);
          return res.send("Server Error");
        }
        return res.send({ joined: true });
      });
    })
    .catch(err => {
      console.error(err);
      return res.send("Server Error");
    });
});

module.exports = router;
