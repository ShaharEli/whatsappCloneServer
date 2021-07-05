const bcrypt = require("bcryptjs");
const User = require("../db/schemas/user");
const createError = require("../utils/createError.util");
const {
  verifyRefreshToken,
  generateAccessToken,
} = require("../utils/tokens.util");

const login = async () => {};

const loginWithToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) createError("token missing", 400);
  const userId = verifyRefreshToken(refreshToken);
  if (!userId) createError("invalid token", 400);
  const user = await User.findById(userId);
  if (!user) createError("error occurred", 500);
  const accessToken = generateAccessToken(userId);
  res.json({ user, accessToken });
};

const verifyMail = async () => {};

const register = async () => {};

const getToken = async () => {};

module.exports = {
  login,
  verifyMail,
  register,
  getToken,
  loginWithToken,
};
