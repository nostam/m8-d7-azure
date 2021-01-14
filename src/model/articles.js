const { Schema, model } = require("mongoose");

const ArticlesSchema = new Schema(
  {
    headLine: { type: String, required: true },
    subHead: "string",
    content: { type: String, required: true },
    category: {
      name: "string",
      img: "string",
    },
    author: {
      name: "string",
      img: "string",
    },
    cover: "string",
    reviews: [
      { text: { type: String }, user: { type: String } },
      //{ timestamps: true },
    ],
  },
  { timestamps: true }
);

ArticlesSchema.static(
  "getReviewByReviewId",
  async function (articleId, reviewId) {
    const reviews = await this.findById(articleId, {
      _id: 0,
      reviews: { $elemMatch: { _id: reviewId } },
    });
    return reviews.reviews[0];
  }
);

const ArticlesModel = model("articles", ArticlesSchema);
module.exports = ArticlesModel;
