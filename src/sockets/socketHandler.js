const Chat = require("../db/schemas/chat");
const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const { getSocketsList } = require("../utils/socket.util");
const { verifyAccessToken } = require("../utils/tokens.util");
const socketHandler = (io) => {
  io.use(async (socket, next) => {
    const isAuthenticated = verifyAccessToken(socket.handshake.auth?.token);
    const userId = isAuthenticated.userId?.userId;
    if (isAuthenticated && userId) {
      socket["userId"] = userId;
      return next();
    }
    next(new Error("not authorized"));
  });

  io.on("connection", async (socket) => {
    try {
      await User.findOneAndUpdate(
        { _id: socket.userId },
        { isActive: true, socketId: socket.id }
      );
    } catch ({ message }) {
      Logger.error(message);
    }

    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { _id: socket.userId },
          { isActive: false, lastConnected: new Date() }
        );
      } catch ({ message }) {
        Logger.error(message);
      }
    });

    socket.on("leftChat", async ({ chatId = null }) => {
      if (!chatId) return; //TODO error response
      socket.leave(chatId);
    });

    socket.on("joinedChat", async ({ chatId = null }) => {
      if (!chatId) return; //TODO error response
      socket.join(chatId);
    });

    socket.on("type", async ({ chatId, typing: isTyping }) => {
      const chat = await Chat.findById(chatId).populate({
        path: "participants",
        select: "socketId",
      });
      getSocketsList(chat, socket.userId).forEach((socketToSend) =>
        io
          .to(socketToSend)
          .emit("type", { chatId, userId: socket.userId, isTyping })
      );
    });
  });
};

module.exports = socketHandler;
