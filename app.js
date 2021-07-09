const helmet = require("helmet");
const express = require("express");
const routes = require("./src/routes");
const connectToDb = require("./src/db/connection");
const loggerMiddleWare = require("./src/logger/morgan");
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./src/sockets/socketHandler");
connectToDb();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(helmet());
app.use(loggerMiddleWare);
app.use("/api", routes);

socketHandler(io);

module.exports = server;
