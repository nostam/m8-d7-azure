const express = require("express");
const passport = require("passport");
const usersRouter = express.Router();
// const { body, validationResult } = require("express-validator");
const q2m = require("query-to-mongo");
const { APIError } = require("../../utils");
const UserModel = require("../../models/users");
const { authorize } = require("../auth/middlewares");
const { authenticate, refreshToken } = require("../auth");
// const validateUsers = [
//   body("firstName").isString(),
//   body("lastName").isString(),
// ];

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findByCredentials(username, password);
    // const token = await authenticate(user);

    const { accessToken, refreshToken } = await authenticate(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/users/refreshToken",
    });
    res.status(201).send("Welcome back");
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  // const oldRefreshToken = req.body.refreshToken;
  // const oldRefreshToken = req.header("Authorization").replace("Bearer ", ""); // either body or header only (logout route will need to update too in both fe and be)
  console.log("refresh cookies", req.cookies); //null rf undefined
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    next(new APIError("Refresh token missing", 400));
  } else {
    try {
      //       const newTokens = await refreshToken(oldRefreshToken);
      // res.send(newTokens); // {token, rt}

      // TOFIX  Cannot access 'refreshToken' before initialization
      const { accessToken, refreshToken } = await refreshToken(oldRefreshToken);
      console.log("new gen tokens", rq.users.tokens);
      res.cookie("accessToken", req.user.tokens.accessToken, {
        httpOnly: true,
      });
      res.cookie("refreshToken", req.user.tokens.refreshToken, {
        httpOnly: true,
        path: "/users/refreshToken",
      });
      res.send("renewed");
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 403;
      next(err);
    }
  }
});

usersRouter.post("/logout", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== req.body.refreshToken
    );
    await req.user.save();
    res.send();
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/logoutAll", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res.cookie("accessToken", req.user.tokens.accessToken, {
        httpOnly: true,
      });
      res.cookie("refreshToken", req.user.tokens.refreshToken, {
        httpOnly: true,
        path: "/users/refreshToken",
      });

      res.redirect(`${process.env.FE_URL_PROD}`);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter
  .route("/me")
  .get(authorize, async (req, res, next) => {
    console.log("header>", req.headers, "cookies>", req.cookies);
    try {
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  })
  .put(authorize, async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  })
  .delete(authorize, async (req, res, next) => {
    try {
      await req.user.deleteOne();
      res.status(204).send("Deleted");
    } catch (error) {
      next(error);
    }
  });

usersRouter
  .route("/")
  .get(authorize, async (req, res, next) => {
    try {
      // const query = q2m(req.query);
      // const total = await UserModel.countDocuments(query.criteria);
      // const users = await UserModel.find(query.criteria, query.optionsfields)
      //   .skip(query.options.skip)
      //   .limit(query.options.limit)
      //   .sort(query.options.sort);
      // res.send({
      //   links: query.links(`/users`, total),
      //   users,
      // });
      console.log("User: ", req.user.username);
      const users = await UserModel.find();
      res.send(users);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) return next(err(errors.array(), 400));
      console.log(req.body);
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();
      res.status(201).send(_id);
    } catch (error) {
      next(error);
    }
  });

usersRouter
  .route("/:id")
  .get(async (req, res, next) => {
    try {
      // const user = await UserModel.findById(req.params.id);
      const user = await UserModel.find({ firstName: req.params.id });
      res.send(user);
    } catch (error) {
      next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) return next(new APIError(errors.array(), 400));

      const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true,
      });
      res.send(user);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

module.exports = usersRouter;
