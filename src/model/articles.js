const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ArticlesModel = new Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("articles", ArticlesModel);
