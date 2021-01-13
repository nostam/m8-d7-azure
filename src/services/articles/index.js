const express = require("express");
const articlesRouter = express.Router();
const ArticlesModel = require("../../model/articles");
const ReviewsModel = require("../../model/reviews");
const { param, body, validationResult } = require("express-validator");
const { err } = require("../../lib");

const validateArticle = [
  body("headLine").notEmpty().isString(),
  body("subHead").isString(),
  body("content").notEmpty().isString(),
  body("category.name").isString(),
  body("category.img").isURL(),
  body("author.name").isString(),
  body("author.img").isURL(),
  body("cover").isURL(),
];

const validateReview = [
  body("text").isString(),
  body("user").notEmpty().isString(),
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
    // if (!article) return next(err(`${req.params.id} not found`, 404));
    res.send(article);
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviews = await ReviewsModel.find({ articleId: req.params.id });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:id/reviews/:reviewID", async (req, res, next) => {
  try {
    const review = await ReviewsModel.findById(req.params.reviewId);
    res.send(review);
  } catch (error) {
    next(error);
  }
});

articlesRouter.post("/", validateArticle, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));
    const newPost = new ArticlesModel(req.body, {
      runValidators: true,
      new: true,
    });
    const { _id } = await newPost.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

articlesRouter.post("/:id", validateReview, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));
    const newReview = new ReviewsModel({
      ...req.body,
      articleID: req.params.id,
    });
    const { _id } = await newReview.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

articlesRouter.put("/:id", validateArticle, async (req, res, next) => {
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
articlesRouter.put(
  "/:id/reviews/:reviewID",
  validateReview,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(err(errors.array(), 400));
      console.log(await ReviewsModel.findById(req.params.reviewID));
      const review = await ReviewsModel.findByIdAndUpdate(
        req.params.reviewID,
        req.body,
        { runValidators: true, new: true }
      );
      res.send(review);
    } catch (error) {
      next(error);
    }
  }
);

articlesRouter.delete("/:id", async (req, res, next) => {
  try {
    const article = await ArticlesModel.findByIdAndDelete(req.params.id);
    // if (!article) return next(err(`${req.params.id} not found`, 404));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

articlesRouter.delete("/:id/reviews/:reviewID", async (req, res, next) => {
  try {
    const review = await ReviewsModel.findByIdAndDelete(req.params.reviewID);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = articlesRouter;
