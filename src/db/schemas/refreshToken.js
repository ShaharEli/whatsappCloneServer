const mongoose = require("mongoose");

const refreshTokenDbSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
});

refreshTokenDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenDbSchema);

module.exports = RefreshToken;
