const Chat = require("../db/schemas/chat");
const Message = require("../db/schemas/message");
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

const getMessages = async (req, res) => {
  const { chatId } = req.params;
  if (!chatId) createError("Error occurred", 400);
  const messages = await Message.find({ chatId }).sort({
    createdAt: -1,
  });
  res.json(messages);
};

const createMsg = async (req, res) => {
  const io = req.app.get("socketio");
  const { message = "", type, chatId, media = null } = req.body;
  if (!media && !message) createError("Error occurred", 400);
  if (!type || !chatId) createError("Error occurred", 400);

  const payload = {
    type,
    chatId,
    seenBy: [req.user],
    by: req.user,
    media,
    content: message,
  };

  if (!message) {
    delete payload.message;
  }
  if (!media) {
    delete payload.media;
  }
  const messageToCreate = new Message(payload);
  const newMessage = await messageToCreate.save();
  const chat = await Chat.findByIdAndUpdate(chatId, {
    lastMessage: newMessage._id,
  });
  io.to(chatId).emit("newMessage", { newMessage, chat });
  res.json({ newMessage, chat });
};

module.exports = {
  getChat,
  getAllChats,
  createChat,
  createMsg,
  getMessages,
};
