const { Router } = require("express");
const withTryCatch = require("../../utils/withTryCatch.util");
const { getChat, getAllChats, createChat } = require("../../controllers/chat");

require("dotenv").config();

const chatRouter = Router();

chatRouter.get("/chat", (req, res) => withTryCatch(req, res, getChat));
chatRouter.post("/new", (req, res) => withTryCatch(req, res, createChat));
chatRouter.get("/all-chats", (req, res) => withTryCatch(req, res, getAllChats));

module.exports = chatRouter;
