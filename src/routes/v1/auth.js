const { Router } = require("express");
const withTryCatch = require("../../utils/withTryCatch.util");
const {
  login,
  getToken,
  register,
  verifyMail,
  loginWithToken,
} = require("../../controllers/auth");

require("dotenv").config();

const authRouter = Router();

authRouter.post("/login", (req, res) => withTryCatch(req, res, login));

authRouter.post("/login-with-token", (req, res) =>
  withTryCatch(req, res, loginWithToken)
);

authRouter.post("/get-token", (req, res) => withTryCatch(req, res, getToken));

authRouter.post("/register", (req, res) => withTryCatch(req, res, register));

authRouter.post("/verify-mail", (req, res) =>
  withTryCatch(req, res, verifyMail)
);

module.exports = authRouter;
