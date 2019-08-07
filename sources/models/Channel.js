const mongoose = require("mongoose");
const channelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId]
    },
    deleteTime: {
      type: Number,
      default: 60 // minutes
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Channel", channelSchema);
