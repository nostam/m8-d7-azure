const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ReviewsModel = new Schema(
  {
    text: { type: String, required: true },
    user: { type: String, required: true },
    articleID: { type: String, required: true, minimum: 24 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reviews", ReviewsModel);
