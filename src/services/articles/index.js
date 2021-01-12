const express = require("express");
const articlesRouter = express.Router();
const ArticlesModel = require("./articlesModel");
const { body, validationResult } = require("express-validator");
const { err } = require("../../lib");

const validateReq = [
  body("headline").notEmpty().isString(),
  body("subHead").isString(),
  body("content").notEmpty().isString(),
  body("category.*.name").isString(),
  body("category.*.img").isURL(),
  body("author.*.name").isString(),
  body("author.*.img").isURL(),
  body("cover").isURL,
];

articlesRouter.get("/", async (req, res, next) => {
  try {
    const articles = await ArticlesModel.find();
    res.send(articles);
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:id", async (req, res, next) => {
  try {
    const article = await ArticlesModel.findById(req.params.id);
    if (!article) return next(err(`${req.params.id} not found`, 404));
    res.send(article);
  } catch (error) {
    next(error);
  }
});

articlesRouter.post("/", validateReq, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));

    const newPost = new ArticlesModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

articlesRouter.put("/:id", validateReq, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));

    const article = await ArticlesModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    if (!article) return next(err(`${req.params.id} not found`, 404));
    res.send(article);
  } catch (error) {
    next(error);
  }
});

articlesRouter.delete("/:id", async (req, res, next) => {
  try {
    const articles = await ArticlesModel.findByIdAndDelete(req.params.id);
    if (!articles) return next(err(`${req.params.id} not found`, 404));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = articlesRouter;
