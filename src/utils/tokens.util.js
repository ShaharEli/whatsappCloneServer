const jwt = require("jsonwebtoken");
const RefreshToken = require("../db/schemas/refreshToken");
const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
require("dotenv").config();

const generateAccessToken = (id) =>
  jwt.sign(
    {
      data: id,
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
        data: id,
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
    //TODO   throw err 500
    Logger.error(message);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
