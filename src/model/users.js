const { Schema, model } = require("mongoose");

const UsersModel = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    img: { type: String },
  },
  { timestamps: true }
);

module.exports = model("users", UsersModel);
