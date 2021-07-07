const mongoose = require("mongoose");

const userDbSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    lastConnected: { type: Date, default: new Date() },
    phone: { type: String, required: true, uniq: true },
    avatar: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const User = mongoose.model("User", userDbSchema);

module.exports = User;
