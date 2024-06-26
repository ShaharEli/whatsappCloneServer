const bcrypt = require("bcryptjs");
const Error = require("../db/schemas/error");
const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const createError = require("../utils/createError.util");
const {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens.util");
const { userValidationSchema } = require("../validations/user");

const logErrorToService = async (req, res) => {
  const { info, platform, user, error } = req.body;
  const payload = {
    info: JSON.stringify(error),
    platform,
    user,
    error: JSON.stringify(error),
  };
  if (!user) delete payload.user;
  if (!user && !info && !error) createError("not enough data provided", 400);
  // TODO validation
  const newError = new Error(payload);
  const savedError = await newError.save();
  res.json({ created: savedError });
};

const login = async (req, res) => {
  const { password, phone } = req.body;
  if (!password || !phone) createError("content missing", 400);
  const user = await User.findOne({ phone });
  if (!user) createError("error occurred", 500);
  const isPassOk = bcrypt.compareSync(password, user.password);
  if (!isPassOk) createError("One of the fields incorrect", 500); //TODO better response
  delete user.password;
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);
  res.json({ accessToken, refreshToken, user });
};

const loginWithToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) createError("token missing", 400);
  const userId = verifyRefreshToken(refreshToken);
  if (!userId) createError("invalid token", 400);
  const user = await User.findById(userId.userId).lean();
  if (!user) createError("error occurred", 500);
  delete user.password;
  const accessToken = generateAccessToken(userId);
  res.json({ user, accessToken });
};

const verifyMail = async () => {};

const register = async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    avatar = null,
    email,
    password,
    publicKey,
  } = req.body;
  const payload = {
    firstName,
    lastName,
    phone,
    avatar,
    email,
    password,
    publicKey,
  };
  if (!avatar) delete payload.avatar;
  try {
    await userValidationSchema.validateAsync(payload);
    const passwordHash = bcrypt.hashSync(payload.password, 8);
    payload.password = passwordHash;
    const newUser = new User(payload);
    const user = await newUser.save();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    delete user.password;
    // TODO send mail
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    Logger.error(err);
    createError("error occurred", 400);
  }
};

const getToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) createError("token missing", 400);
  const userId = verifyRefreshToken(refreshToken);
  if (!userId) createError("invalid token", 400);
  const accessToken = generateAccessToken(userId);
  res.json({ accessToken });
};

module.exports = {
  login,
  verifyMail,
  register,
  getToken,
  loginWithToken,
  logErrorToService,
};
