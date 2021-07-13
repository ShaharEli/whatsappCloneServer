const mongoose = require("mongoose");

const userDbSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: false },
    lastConnected: { type: Date, default: new Date() },
    socketId: { type: String },
    phone: { type: String, required: true, index: true, unique: true },
    avatar: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["admin", "user"] },
    status: { type: String, default: "" },
    lastConnectedAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const User = mongoose.model("User", userDbSchema);
User.createIndexes();
module.exports = User;
