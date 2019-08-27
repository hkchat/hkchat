const express = require("express");
const app = express();
const http = require("http").createServer(app);
const config = require("./config/index");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const io = require("socket.io")(http);
const flash = require("express-flash-messages");

// io.on("connection", socket => {
//   // console.log("a user connected");
//   // socket.on("disconnect", () => {
//   //   console.log("user disconnected");
//   // });
// });

app.use(
  session({
    secret: "hkchat",
    resave: false,
    saveUninitialized: true,
    cookie: {}
  })
);

app.use(flash());

app.use(express.static("public"));

app.set("view engine", "pug");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(config.database.url, config.database.options);
let db = mongoose.connection;
db.once("open", () => console.log("Connected with Database!"));
db.on("error", error => console.log("DB Error: ", error));

app.use("/", require("./routes/index"));
app.use("/channels", require("./routes/channel"));
app.use("/users", require("./routes/user"));
app.use("/messages", require("./routes/message")(io));

// register cron
require("./cron/index");

http.listen(config.port, () => {
  console.log(`App started on port ${config.port}`);
});
