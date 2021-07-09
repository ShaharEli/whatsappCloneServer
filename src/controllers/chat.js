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
  const populatedArr = [];

  for (let chat of chats) {
    if (chat.type === "private") {
      populatedArr.push(
        chat
          .populate({
            path: "participants",
            select: "avatar _id firstName lastName",
          })
          .execPopulate()
      );
    } else {
      populatedArr.push(chat);
    }
  }
  res.json({ chats: await Promise.all(populatedArr) });
};

const createGroupChat = async (req, res, participants, type, userId) => {}; //TODO implement
const createBroadcastChat = async (req, res, participants, type, userId) => {}; //TODO implement

const createPrivateChat = async (req, res, participants, type, userId) => {
  const chatToBeSaved = new Chat({
    type,
    participants: [...participants, userId], //TODO add validation
  });
  const newChat = await chatToBeSaved.save();
  await newChat
    .populate({ path: "participants", select: "-password -email" })
    .execPopulate();
  res.json({ newChat });
};

const createChat = async (req, res) => {
  const { participants, type } = req.body;
  const { userId } = req;
  const argsArr = [req, res, participants, type, userId];
  switch (type) {
    case "private":
      createPrivateChat(...argsArr);
      break;
    case "group":
      createGroupChat(...argsArr);
      break;
    case "broadcast":
      createBroadcastChat(...argsArr);
      break;
    default:
      createError("invalid type", 400);
  }
};

module.exports = {
  getChat,
  getAllChats,
  createChat,
};
