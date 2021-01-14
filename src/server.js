const express = require("express");
const cors = require("cors");
const articlesRoute = require("./services/articles");
const usersRoute = require("./services/users");
const server = express();
const port = process.env.PORT || 3001;
const helmet = require("helmet");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const {
  badRequestHandler,
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  catchAllHandler,
} = require("./lib/errorHandling");

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

const whiteList =
  process.env.NODE_ENV === "production"
    ? [process.env.FE_URL_PROD, process.env.FE_URL_PROD1]
    : [process.env.FE_URL_DEV];
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("NOT ALLOWED - CORS ISSUES"));
    }
  },
};

server.use(helmet());
server.use(cors(corsOptions));
server.use(express.json());
server.use(loggerMiddleware);

server.use("/articles", articlesRoute);
server.use("/user", usersRoute);
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(catchAllHandler);

// console.log(listEndpoints(server))

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      if (process.env.NODE_ENV === "production") {
        console.log("Running on cloud on port", port);
      } else {
        console.log("Running locally on port", port);
      }
    })
  )
  .catch((err) => console.log(err));
