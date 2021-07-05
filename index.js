const app = require("./app");
const Logger = require("./src/logger/logger");

require("dotenv").config();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  Logger.info(`server running on port ${PORT}`);
});
