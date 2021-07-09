const Chat = require("../db/schemas/chat");
const createError = require("../utils/createError.util");

const getChat = async (req, res) => {
  const { id, type } = req.query;
  if (!id || !type) createError("Missing data", 400);
};

const getAllChats = async (req, res) => {
  const { userId } = req;
  const chats = await Chat.find({
    participants: { $elemMatch: { $eq: userId } },
  }).populate("lastMessage");

  res.json({ chats });
};

module.exports = {
  getChat,
  getAllChats,
};
