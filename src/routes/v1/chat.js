const { Router } = require("express");
const withTryCatch = require("../../utils/withTryCatch.util");
const {
  getChat,
  getAllChats,
  createChat,
  createMsg,
  getMessages,
  getUserActiveState,
  modifyChat,
  getStarredMessages,
  getParticipants,
  getUser,
} = require("../../controllers/chat");

require("dotenv").config();

const chatRouter = Router();

chatRouter.get("/chat/:id", (req, res) => withTryCatch(req, res, getChat));
chatRouter.get("/participants/:id", (req, res) =>
  withTryCatch(req, res, getParticipants)
);
chatRouter.get("/user/:id", (req, res) => withTryCatch(req, res, getUser));
chatRouter.get("/starred-messages", (req, res) =>
  withTryCatch(req, res, getStarredMessages)
);
chatRouter.put("/chat/:id", (req, res) => withTryCatch(req, res, modifyChat));
chatRouter.get("/messages", (req, res) => withTryCatch(req, res, getMessages));
chatRouter.post("/new", (req, res) => withTryCatch(req, res, createChat));
chatRouter.post("/new-message", (req, res) =>
  withTryCatch(req, res, createMsg)
);
chatRouter.get("/get-user-active-state/:userId", (req, res) =>
  withTryCatch(req, res, getUserActiveState)
);
chatRouter.get("/all-chats", (req, res) => withTryCatch(req, res, getAllChats));

module.exports = chatRouter;
