const mongoose = require("mongoose");

const userDbSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  lastConnected: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  createdAt: { type: Date, default: new Date() },
  phone: { type: String, required: true },
  avatar: String,
  email: { type: String, required: true },
});

userDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const User = mongoose.model("User", userDbSchema);

module.exports = User;
