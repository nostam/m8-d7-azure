const express = require("express");
const articlesRouter = express.Router();
const { body, validationResult } = require("express-validator");
const q2m = require("query-to-mongo");

const ArticlesModel = require("../../model/articles");
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

articlesRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const review = await ArticlesModel.getReviewByReviewId(
      req.params.id,
      req.params.reviewId
    );
    res.send(review);
  } catch (error) {
    next(err("article ID or review ID not found", 404));
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
    const updatedArticle = await ArticlesModel.findByIdAndUpdate(
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

articlesRouter.put("/:id", validateArticle, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(err(errors.array(), 400));

    const article = await ArticlesModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    res.send(article);
  } catch (error) {
    next(error);
  }
});
articlesRouter.put(
  "/:articleId/reviews/:reviewId",
  validateReview,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(err(errors.array(), 400));
      const { articleId, reviewId } = req.params;
      const review = await ArticlesModel.getReviewByReviewId(
        articleId,
        reviewId
      );
      const modifiedReview = { ...review.toObject(), ...req.body };
      const updatedReview = await ArticlesModel.findOneAndUpdate(
        { _id: articleId, "reviews._id": reviewId },
        { $set: { "reviews.$": modifiedReview } },
        { runValidators: true, new: true }
      );
      res.status(201).send(updatedReview);
    } catch (error) {
      next(error);
    }
  }
);

articlesRouter.delete("/:id", async (req, res, next) => {
  try {
    const article = await ArticlesModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

articlesRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedReview = await ArticlesModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          reviews: {
            _id: req.params.reviewID,
          },
        },
      },
      { new: true }
    );
    res.status(204).send(modifiedReview);
  } catch (error) {
    next(error);
  }
});

module.exports = articlesRouter;
