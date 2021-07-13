const mongoose = require("mongoose");

const errorDbSchema = new mongoose.Schema(
  {
    info: { type: String, trim: true },
    error: { type: String, trim: true },
    user: { ref: "User", type: mongoose.Schema.Types.ObjectId },
    platform: { type: String, enum: ["ios", "android"] },
    // add device id?
  },
  { timestamps: true }
);

errorDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const Error = mongoose.model("Error", errorDbSchema);
module.exports = Error;
