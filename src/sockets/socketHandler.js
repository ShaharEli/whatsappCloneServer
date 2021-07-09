const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
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
      await User.findOneAndUpdate({ _id: socket.userId }, { isActive: true });
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

    socket.on("type", async (socket) => {
      console.log(socket);
    });
  });
};

module.exports = socketHandler;
