const helmet = require("helmet");
const express = require("express");
const routes = require("./src/routes");
const connectToDb = require("./src/db/connection");
const loggerMiddleWare = require("./src/logger/morgan");

connectToDb();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(loggerMiddleWare);
app.use("/api", routes);

module.exports = app;
