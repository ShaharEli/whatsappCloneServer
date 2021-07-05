const Logger = require("../logger/logger");

const safeRoute = async (req, res, cb) => {
  try {
    await cb(req, res);
  } catch (e) {
    if (e?.customMessage) {
      return res.status(e.status).json({ error: e.customMessage });
    }
    Logger.error(e.message);
    return res.json({ error: "error occurred" });
  }
};

module.exports = safeRoute;
