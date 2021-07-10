const { Router } = require("express");
const checkToken = require("../../middelwares/checkToken");
const authRouter = require("./auth");
const chatRouter = require("./chat");
const contactsRouter = require("./contacts");
const router = Router();

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Error occurred" });
};

router.use("/auth", authRouter);

router.use(checkToken);

router.use("/contacts", contactsRouter);
router.use("/chat", chatRouter);

router.use(unknownEndpoint);

module.exports = router;
