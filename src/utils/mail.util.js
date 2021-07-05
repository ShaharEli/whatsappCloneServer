const nodemailer = require("nodemailer");
const Logger = require("../logger/logger");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (options) => {
  try {
    await transporter.sendMail(options);
    return true;
  } catch ({ message }) {
    Logger.error(message);
    return false;
  }
};

module.exports = {
  sendMail,
  transporter,
};
