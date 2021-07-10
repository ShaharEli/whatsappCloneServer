const { Router } = require("express");
const withTryCatch = require("../../utils/withTryCatch.util");
const {
  getChat,
  getAllChats,
  createChat,
  createMsg,
  getMessages,
} = require("../../controllers/chat");

require("dotenv").config();

const chatRouter = Router();

chatRouter.get("/chat", (req, res) => withTryCatch(req, res, getChat));
chatRouter.get("/messages/:chatId", (req, res) =>
  withTryCatch(req, res, getMessages)
);
chatRouter.post("/new", (req, res) => withTryCatch(req, res, createChat));
chatRouter.post("/new-message", (req, res) =>
  withTryCatch(req, res, createMsg)
);
chatRouter.get("/all-chats", (req, res) => withTryCatch(req, res, getAllChats));

module.exports = chatRouter;
