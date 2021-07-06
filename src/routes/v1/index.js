const { Router } = require("express");
const checkToken = require("../../middelwares/checkToken");
const authRouter = require("./auth");
const router = Router();

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

router.use("/auth", authRouter);

router.use(checkToken);

router.use(unknownEndpoint);

module.exports = router;
