const jwt = require("jsonwebtoken");
const RefreshToken = require("../db/schemas/refreshToken");
const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const createError = require("./createError.util");
require("dotenv").config();

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return false;
    }
    return decoded;
  });

const generateAccessToken = (id) =>
  jwt.sign(
    {
      userId: id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return false;
    }
    return decoded;
  });

const generateRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("user not found");
    await RefreshToken.deleteMany({ userId: id });

    const token = jwt.sign(
      {
        userId: id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1y" }
    );

    const newRefreshToken = new RefreshToken({
      userId: id,
      token,
    });
    await newRefreshToken.save();
    return token;
  } catch ({ message }) {
    createMessage(message, 402);
    //TODO  change status
    Logger.error(message);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
