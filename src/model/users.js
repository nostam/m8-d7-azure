const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    img: { type: String },
    articles: [{ type: Schema.Types.ObjectId, ref: "articles" }],
  },
  { timestamps: true }
);

const UserModel = model("users", UserSchema);
module.exports = UserModel;
