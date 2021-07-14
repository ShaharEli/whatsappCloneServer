const Chat = require("../db/schemas/chat");
const Message = require("../db/schemas/message");
const User = require("../db/schemas/user");
const createError = require("../utils/createError.util");
const { getSocketsList } = require("../utils/socket.util");

const getChat = async (req, res) => {
  const { id, type } = req.query;
  if (!id || !type) createError("Missing data", 400);
};

const getAllChats = async (req, res) => {
  const { userId } = req;
  const chats = await Chat.find({
    participants: { $elemMatch: { $eq: userId } },
  })
    .populate("lastMessage")
    .sort({
      createdAt: -1,
    });
  let populatedArr = [];
  let unreadMessages = [];
  for (let chat of chats) {
    populatedArr.push(
      chat
        .populate({
          path: "participants",
          select:
            chat.type === "private"
              ? "avatar _id firstName lastName isActive lastConnected socketId"
              : "socketId",
        })
        .execPopulate()
    );
    unreadMessages.push(
      Message.countDocuments({
        chatId: chat._id,
        seenBy: { $nin: [userId] },
      }).exec()
    );
  }
  populatedArr = await Promise.all(populatedArr);
  unreadMessages = await Promise.all(unreadMessages);
  res.json({
    chats: populatedArr,
    unreadMessages,
  });
};

const getUserActiveState = async (req, res) => {
  const { userId } = req.params;
  if (!userId) createError("userId missing", 400);
  const user = await User.findById(userId);
  if (!user) createError("user not found", 400);
  const { isActive, lastConnected } = user;
  res.json({ isActive, lastConnected });
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
    by: req.userId,
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
  const selectedFieldsToPopulate =
    chat.participants.length < 3
      ? "socketId _id firstName lastName avatar isActive lastConnected"
      : "socketId _id";
  await chat
    .populate({ path: "participants", select: selectedFieldsToPopulate })
    .execPopulate();

  io.to(getSocketsList(chat)).emit("newMessage", {
    message: newMessage,
    chat,
  });
  res.json({ newMessage, chat });
};

module.exports = {
  getChat,
  getAllChats,
  createChat,
  createMsg,
  getMessages,
  getUserActiveState,
};
