const express = require("express");
const articlesRouter = express.Router();
const { body, validationResult } = require("express-validator");
const q2m = require("query-to-mongo");

const ArticlesModel = require("../../model/articles");
const ReviewsModel = require("../../model/reviews");
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
    // const articles = await ArticlesModel.find();
    // res.send(articles);
    const query = q2m(req.query);
    const total = await ArticlesModel.countDocuments(query.criteria);
    const articles = await ArticlesModel.find(
      query.criteria,
      query.optionsfields
    )
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

articlesRouter.get("/:id", async (req, res, next) => {
  try {
    const article = await ArticlesModel.findById(req.params.id);
    res.send(article);
  } catch (error) {
    next(error);
  }
});

articlesRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await ReviewsModel.countDocuments(query.criteria);
    const reviews = await ReviewsModel.find(
      { articleId: req.params.id },
      query.optionsfields
    )
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort);
    res.send({
      links: query.links(`/articles/${req.params.id}/reviews`, total),
      reviews,
    });
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
      articleId: req.params.id,
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
      const review = await ReviewsModel.findByIdAndUpdate(
        req.params.reviewID,
        { ...req.body, articleId: req.params.id },
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
