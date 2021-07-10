const mongoose = require("mongoose");

const messageDbSchema = new mongoose.Schema(
  {
    by: { ref: "User", type: mongoose.Schema.Types.ObjectId },
    deletedAt: { type: Date },
    forwarded: { type: Boolean, default: false },
    forwordsCount: { type: Number, default: 0 },
    content: { type: String, required: true },
    type: {
      type: String,
      default: "text",
      enum: ["text", "voice", "video", "image"],
    },
    seenBy: { ref: "User", type: [mongoose.Schema.Types.ObjectId] },
    chatId: { ref: "Chat", type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

messageDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const Message = mongoose.model("Message", messageDbSchema);
module.exports = Message;
