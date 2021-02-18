const express = require("express");
const cors = require("cors");
const articlesRoute = require("./services/articles");
const usersRoute = require("./services/users");
const server = express();
const port = process.env.PORT || 3001;
const helmet = require("helmet");
// const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const {
  badRequestHandler,
  notFoundHandler,
  forbiddenHandler,
  catchAllHandler,
} = require("./middlewares/errorHandling");

const passport = require("passport");
const cookieParser = require("cookie-parser");
const oauth = require("./services/auth/oauth");

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

const whiteList =
  process.env.NODE_ENV === "production"
    ? process.env.FE_URL_PROD
    : process.env.FE_URL_DEV;
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

server.use(helmet());
//TOFIX CORS
server.use(cors(corsOptions));
// server.use(cors({ credentials: true, origin: process.env.FE_URL_PROD }));
server.use(express.json());
server.use(cookieParser());
server.use(passport.initialize());

server.use(loggerMiddleware);

server.use("/articles", articlesRoute);
server.use("/users", usersRoute);
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(forbiddenHandler);
server.use(catchAllHandler);

// console.log(listEndpoints(server))

mongoose
  .connect(
    process.env.MONGO_CONNECTION,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
    { autoIndex: false }
  )
  .then(() =>
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch((err) => console.log(err));
