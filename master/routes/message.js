const express = require("express");
const router = express.Router();
const config = require("../config/index");
const auth = require("../auth");
const slowDown = require("express-slow-down");

// models
const User = require("../models/User");
const Message = require("../models/Message");
const Channel = require("../models/Channel");

router.get("/:channel_id/all", auth.isLoggedIn, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channel_id);
    if (channel && channel.members.includes(req.session.user_id)) {
      let messages = await Message.find({
        channel_id: channel._id
      })
        .populate({
          path: "user_id",
          select: "_id username",
          options: { lean: true }
        })
        .lean();
      // messages = messages.map(e => {
      //   return { ...e._doc, user: e.user_id };
      // });
      return res.send({ messages });
    } else {
      return res.send({
        error: "This channel does not exist or you are not a member.",
        channel
      });
    }
  } catch (err) {}
});

const messageLimit = slowDown({
  windowMs: 5 * 60 * 1000,
  delayAfter: 5,
  delayMs: 100
});

module.exports = io => {
  router.post("/send", auth.isLoggedIn, messageLimit, async (req, res) => {
    const channel = await Channel.findById(req.body.channel_id);
    var message = {
      body: req.body.message,
      user_id: req.session.user_id,
      channel_id: req.body.channel_id,
      deleteIn: channel.deleteTime
    };
    const M = new Message(message);
    M.save(async err => {
      if (err) {
        console.error(err);
        return res.send(err);
      }
      const nM = await Message.populate(M, {
        path: "user_id",
        select: "_id username"
      });
      io.emit("message-" + req.body.channel_id, nM);
      return res.send(nM);
    });
  });
  return router;
};
