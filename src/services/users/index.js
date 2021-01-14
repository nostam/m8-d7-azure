const express = require("express");
const usersRouter = express.Router();
const { body, validationResult } = require("express-validator");
const q2m = require("query-to-mongo");

const UserModel = require("../../model/users");
const { err } = require("../../lib");

const validateUsers = [body("firstName").isAlpha(), body("lastName").isAlpha()];

usersRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await UserModel.countDocuments(query.criteria);
    const articles = await UserModel.find(query.criteria, query.optionsfields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort);
    res.send({
      links: query.links(`/articles`, total),
      articles,
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const article = await UserModel.findById(req.params.id);
    res.send(article);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", validateUsers, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));
    const newPost = new UserModel(req.body, {
      runValidators: true,
      new: true,
    });
    const { _id } = await newPost.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:id", validateUsers, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));
    const updatedArticle = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $push: { reviews: req.body } },
      { runValidators: true, new: true }
    );
    const { _id } = await updatedArticle.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", validateUsers, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));

    const article = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!article) return next(err(`${req.params.id} not found`, 404));
    res.send(article);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:id", async (req, res, next) => {
  try {
    const article = await UserModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
