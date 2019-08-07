const mongoose = require("mongoose");
const messageSchema = mongoose.Schema(
  {
    body: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    channel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Channel"
    },
    deleteIn: {
      type: Number,
      default: 60
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Message", messageSchema);
