const Logger = require("../logger/logger");
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("useFindAndModify", false);
const connectToDb = () =>
  mongoose.connect(
    process.env.MONGO_URI,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => {
      Logger.info("connected to database");
    }
  );

module.exports = connectToDb;
