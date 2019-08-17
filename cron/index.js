const CronJob = require("cron").CronJob;
const moment = require("moment");
const Message = require("../models/Message");
new CronJob(
  "* * * * *",
  async () => {
    const msgs = await Message.find({})
      .sort("_id")
      .limit(50);
    msgs.forEach(message => {
      const duration = moment.duration(
        moment(new Date()).diff(moment(new Date(message.createdAt)))
      );
      if (duration.asMinutes() >= Number(message.deleteIn)) message.remove();
    });
  },
  null,
  true,
  "America/Los_Angeles"
);
