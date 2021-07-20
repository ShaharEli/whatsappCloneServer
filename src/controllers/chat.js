const Chat = require("../db/schemas/chat");
const Message = require("../db/schemas/message");
const User = require("../db/schemas/user");
const createError = require("../utils/createError.util");
const { sendMessage, getTokensList } = require("../utils/firebase.util");
const { getSocketsList } = require("../utils/socket.util");
const { userValidationSchema } = require("../validations/user");

const getChat = async (req, res) => {
  const { id } = req.params;
  if (!id) createError("Missing data", 400);
  const chat = await Chat.findById(id)
    .populate({ path: "participants", select: "firstName _id lastName avatar" })
    .populate({
      path: "lastMessage",
      populate: {
        path: "by",
        select: "_id firstName lastName",
      },
    });
  res.json(chat);
};

const getAllChats = async (req, res) => {
  const { userId } = req;
  const chats = await Chat.find({
    participants: { $elemMatch: { $eq: userId } },
  })
    .populate({
      path: "lastMessage",
      populate: {
        path: "by",
        select: "_id firstName lastName",
      },
    })
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
              : "socketId firstName lastName _id",
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

const createGroupChat = async (
  req,
  res,
  participants,
  type,
  userId,
  image,
  name,
  userFullName
) => {
  const payload = {
    participants: [...participants, userId],
    mainAdmin: userId,
    type,
    name,
    image,
    admins: [userId],
  };
  if (!image) delete payload.image;
  const chatToBeSaved = new Chat(payload);
  const newChat = await chatToBeSaved.save();
  await newChat
    .populate({ path: "participants", select: "-password -email -avatar" })
    .execPopulate();
  const io = req.app.get("socketio");
  io.to(getSocketsList(newChat, userId)).emit("newMessage", {
    message: `${userFullName} added you`, //TODO create real message doc
    chat: newChat,
  });
  res.json({ newChat });
};

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
  const { participants, type, image, name, userFullName } = req.body;
  const { userId } = req;
  const argsArr = [
    req,
    res,
    participants,
    type,
    userId,
    image,
    name,
    userFullName,
  ];
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
  let { chatId, isGroup, limit = 30, from = new Date().valueOf() } = req.query;
  if (!chatId || !isGroup) createError("Error occurred", 400);
  if (typeof limit !== "number") {
    try {
      limit = parseInt(limit);
    } catch {
      limit = 30;
    }
  }
  isGroup = isGroup === "true";
  let messages;
  if (isGroup) {
    messages = await Message.find({
      chatId,
      createdAt: {
        $lt: from,
      },
    })
      .populate({ path: "by", select: "firstName _id lastName" })
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  } else {
    messages = await Message.find({
      chatId,
      createdAt: {
        $lte: from,
      },
    })
      .sort({
        createdAt: -1,
      })
      .limit(30);
  }

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
    seenBy: [req.userId],
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
    chat.type === "private"
      ? "socketId _id firstName lastName avatar isActive lastConnected firebaseToken"
      : "socketId _id firebaseToken firstName lastName";
  await chat
    .populate({ path: "participants", select: selectedFieldsToPopulate })
    .execPopulate();

  if (chat.type === "group") {
    await newMessage
      .populate({ path: "by", select: "_id firstName lastName" })
      .execPopulate();
  }

  io.to(getSocketsList(chat)).emit("newMessage", {
    message: newMessage,
    chat,
  });
  const sender = chat.participants.find(({ _id }) => _id == req.userId);
  const senderName = `${sender.firstName} ${sender.lastName}`;
  const title = chat.name ? chat.name : senderName;
  const body =
    chat.type === "group"
      ? `${senderName}: ${newMessage.content}`
      : newMessage.content;

  await sendMessage(
    getTokensList(chat, req.userId),
    {
      chatId,
      type: "newMessage",
      title,
      body,
    },
    {
      title,
      body,
    }
  );
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
