module.exports = {
  port: 3000,
  database: {
    url: "mongodb://localhost:27017/hk_chat",
    options: {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },
  saltRounds: 10
};
