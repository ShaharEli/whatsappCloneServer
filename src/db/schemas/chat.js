const mongoose = require("mongoose");

const chatDbSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "private",
      enum: ["private", "group", "broadcast"],
    },
    mainAdmin: { ref: "User", type: mongoose.Schema.Types.ObjectId },
    admins: { ref: "User", type: [mongoose.Schema.Types.ObjectId] },
    lastMessage: { ref: "Message", type: mongoose.Schema.Types.ObjectId },
    participants: { ref: "User", type: [mongoose.Schema.Types.ObjectId] },
    deletedAt: { type: Date },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
  },
  { timestamps: true }
);

chatDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const Chat = mongoose.model("Chat", chatDbSchema);
module.exports = Chat;
