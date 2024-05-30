const jwt = require("jsonwebtoken");

require("dotenv").config();

const checkToken = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || Array.isArray(token))
    return res.status(400).json({ error: "No token sent" });
  token = token.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: err });
    }
    req.userId =
      typeof decoded.userId === "object"
        ? decoded.userId?.userId
        : decoded.userId;
    next();
  });
};

module.exports = checkToken;
