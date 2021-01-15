const express = require("express");
const usersRouter = express.Router();
const { body, validationResult } = require("express-validator");
const q2m = require("query-to-mongo");

const UserModel = require("../../model/users");
const { err, mongoErr } = require("../../lib");

const validateUsers = [
  body("firstName").isString(),
  body("lastName").isString(),
];

usersRouter.get("/", async (req, res, next) => {
  try {
    // const query = q2m(req.query);
    // const total = await UserModel.countDocuments(query.criteria);
    // const articles = await UserModel.find(query.criteria, query.optionsfields)
    //   .skip(query.options.skip)
    //   .limit(query.options.limit)
    //   .sort(query.options.sort);
    // res.send({
    //   links: query.links(`/articles`, total),
    //   articles,
    // });
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    // const user = await UserModel.findById(req.params.id);
    const user = await UserModel.find({ firstName: req.params.id });
    res.send(user);
  } catch (error) {
    next(mongoErr(error));
  }
});

usersRouter.post("/", async (req, res, next) => {
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

usersRouter.put("/:id", validateUsers, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));

    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.send(user);
  } catch (error) {
    next(mongoErr(error));
  }
});

usersRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
